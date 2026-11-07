import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { RestaurantPlace } from "../types/food";
import { calculateDistanceKm, formatDistance, isCurrentlyOpen } from "../utils/geo";
import { FoodVisual } from "./FoodVisual";
import {
  Navigation,
  Crosshair,
  Layers,
  Star,
  Phone,
  ExternalLink,
  Search,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  X,
  Compass
} from "lucide-react";

interface InteractiveMapProps {
  places: RestaurantPlace[];
  userLat: number;
  userLng: number;
  onSelectPlace: (place: RestaurantPlace) => void;
  selectedPlaceId?: number | null;
  activeFilter?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Restaurant: "#e8590c",
  "Fast-food": "#d9a400",
  Goûter: "#c2255c",
  Marché: "#2a9d8f",
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Restaurant: "🍽️",
  "Fast-food": "🍔",
  Goûter: "🥐",
  Marché: "🧺",
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  places,
  userLat,
  userLng,
  onSelectPlace,
  selectedPlaceId = null,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);

  const [mapType, setMapType] = useState<"streets" | "satellite">("streets");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [onlyOpen, setOnlyOpen] = useState<boolean>(false);
  const [onlyDeals, setOnlyDeals] = useState<boolean>(false);
  const [onlyViral, setOnlyViral] = useState<boolean>(false);
  const [radius500m, setRadius500m] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activePlace, setActivePlace] = useState<RestaurantPlace | null>(null);

  // Filter places based on active criteria
  const filteredPlaces = places.filter((p) => {
    if (activeCategory !== "all") {
      if (activeCategory === "Brunch") {
        const text = (p.subCategory + " " + p.name + " " + p.summary).toLowerCase();
        if (!/brunch|petit-déj|pancake|café/.test(text)) return false;
      } else if (p.category !== activeCategory) {
        return false;
      }
    }
    if (onlyOpen && !isCurrentlyOpen(p)) return false;
    if (onlyDeals && !p.isBoxDeal && p.priceLevel > 1) return false;
    if (onlyViral && !p.tiktokViral) return false;
    if (radius500m) {
      const dist = calculateDistanceKm(userLat, userLng, p.lat, p.lng);
      if (dist > 0.6) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.subCategory.toLowerCase().includes(q) ||
        p.zone.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Keep activePlace synced if selectedPlaceId prop changes
  useEffect(() => {
    if (selectedPlaceId != null) {
      const found = places.find((p) => p.id === selectedPlaceId);
      if (found) {
        setActivePlace(found);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([found.lat, found.lng], 16, { duration: 0.8 });
        }
      }
    }
  }, [selectedPlaceId, places]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = [userLat || 48.86, userLng || 2.34];
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 14,
        zoomControl: false,
      });

      // CartoDB Voyager tiles (Google Maps / modern style)
      const streetLayer = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
          subdomains: "abcd",
        }
      );

      streetLayer.addTo(map);
      mapInstanceRef.current = map;

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;

      // Add user location blue beacon
      const userIcon = L.divIcon({
        className: "custom-user-marker",
        html: `
          <div class="relative flex items-center justify-center w-7 h-7">
            <span class="absolute inline-flex w-full h-full rounded-full bg-blue-500 opacity-75 animate-ping"></span>
            <span class="relative inline-flex w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg"></span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const userMarker = L.marker([userLat, userLng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
      userMarkerRef.current = userMarker;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Map Type (Street vs Satellite)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (mapType === "satellite") {
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "&copy; Esri World Imagery",
          maxZoom: 19,
        }
      ).addTo(map);
    } else {
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
          subdomains: "abcd",
        }
      ).addTo(map);
    }
  }, [mapType]);

  // Update user marker and 500m circle
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLat, userLng]);
    }

    if (radius500m) {
      if (radiusCircleRef.current) {
        radiusCircleRef.current.remove();
      }
      radiusCircleRef.current = L.circle([userLat, userLng], {
        radius: 500,
        color: "#2563eb",
        fillColor: "#3b82f6",
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: "4, 6",
      }).addTo(mapInstanceRef.current);

      mapInstanceRef.current.flyTo([userLat, userLng], 15, { duration: 0.6 });
    } else {
      if (radiusCircleRef.current) {
        radiusCircleRef.current.remove();
        radiusCircleRef.current = null;
      }
    }
  }, [userLat, userLng, radius500m]);

  // Update Markers when filteredPlaces or activePlace changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    filteredPlaces.forEach((place) => {
      const isSelected = activePlace?.id === place.id;
      const color = CATEGORY_COLORS[place.category] || "#e8590c";
      const emoji = CATEGORY_EMOJIS[place.category] || "🍴";

      const iconHtml = `
        <div class="relative group cursor-pointer transition-transform duration-200 ${
          isSelected ? "scale-125 z-50" : "hover:scale-110"
        }">
          <div class="flex items-center gap-1 px-2 py-0.5 rounded-full text-white font-bold text-xs shadow-md border-2 ${
            isSelected ? "border-white ring-4 ring-orange-500/50 shadow-xl" : "border-white"
          }" style="background-color: ${color}">
            <span>${emoji}</span>
            <span>★${place.rating.toFixed(1)}</span>
          </div>
          <div class="w-2 h-2 mx-auto rotate-45 -mt-1 shadow-sm" style="background-color: ${color}"></div>
        </div>
      `;

      const markerIcon = L.divIcon({
        className: "custom-food-marker",
        html: iconHtml,
        iconSize: [60, 32],
        iconAnchor: [30, 28],
      });

      const marker = L.marker([place.lat, place.lng], { icon: markerIcon });
      marker.on("click", () => {
        setActivePlace(place);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([place.lat, place.lng], 16, { duration: 0.5 });
        }
      });

      markersGroup.addLayer(marker);
    });
  }, [filteredPlaces, activePlace]);

  // Recenter on user
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLat, userLng], 15, { duration: 0.7 });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-170px)] sm:h-[680px] rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900">
      {/* Search & Quick Filter Pills on top of Map */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-none">
        {/* Search bar inside map */}
        <div className="pointer-events-auto bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl shadow-lg border border-stone-200/80 dark:border-stone-800 px-3 py-2 flex items-center gap-2">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher sur la carte (KFB, brunch, pizza, 18e...)"
            className="w-full text-xs sm:text-sm bg-transparent outline-none text-stone-800 dark:text-stone-100 placeholder-stone-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 shrink-0 px-2 py-0.5 bg-orange-50 dark:bg-orange-950/60 rounded-full border border-orange-200/60 dark:border-orange-800/60">
            {filteredPlaces.length} spots
          </span>
        </div>

        {/* Filter categories pills */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              activeCategory === "all"
                ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                : "bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            🗺️ Tout
          </button>
          <button
            onClick={() => setActiveCategory(activeCategory === "Restaurant" ? "all" : "Restaurant")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              activeCategory === "Restaurant"
                ? "bg-orange-600 text-white"
                : "bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            🍽️ Restos
          </button>
          <button
            onClick={() => setActiveCategory(activeCategory === "Fast-food" ? "all" : "Fast-food")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              activeCategory === "Fast-food"
                ? "bg-amber-500 text-white"
                : "bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            🍔 Fast-food
          </button>
          <button
            onClick={() => setActiveCategory(activeCategory === "Goûter" ? "all" : "Goûter")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              activeCategory === "Goûter"
                ? "bg-pink-600 text-white"
                : "bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            🥐 Goûter
          </button>
          <button
            onClick={() => setActiveCategory(activeCategory === "Marché" ? "all" : "Marché")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              activeCategory === "Marché"
                ? "bg-emerald-600 text-white"
                : "bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            🧺 Marchés
          </button>
          <button
            onClick={() => setActiveCategory(activeCategory === "Brunch" ? "all" : "Brunch")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              activeCategory === "Brunch"
                ? "bg-amber-600 text-white"
                : "bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            🥞 Brunch
          </button>
          <button
            onClick={() => setOnlyOpen(!onlyOpen)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              onlyOpen
                ? "bg-emerald-600 text-white"
                : "bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-300"
            }`}
          >
            🟢 Ouvert
          </button>
          <button
            onClick={() => setOnlyDeals(!onlyDeals)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              onlyDeals
                ? "bg-cyan-600 text-white"
                : "bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-300"
            }`}
          >
            💸 ≤ 10 €
          </button>
          <button
            onClick={() => setOnlyViral(!onlyViral)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              onlyViral
                ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                : "bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-300"
            }`}
          >
            🔥 TikTok
          </button>
        </div>
      </div>

      {/* Floating Action Controls on Right */}
      <div className="absolute right-3 top-28 z-[1000] flex flex-col gap-2">
        {/* Recenter GPS */}
        <button
          onClick={handleRecenter}
          className="w-10 h-10 rounded-2xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-lg border border-stone-200 dark:border-stone-800 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:scale-105 active:scale-95 transition-all"
          title="Centrer sur ma position"
        >
          <Crosshair className="w-5 h-5" />
        </button>

        {/* 500m Radar Circle Mode */}
        <button
          onClick={() => setRadius500m(!radius500m)}
          className={`w-10 h-10 rounded-2xl backdrop-blur-md shadow-lg border flex items-center justify-center transition-all ${
            radius500m
              ? "bg-blue-600 text-white border-blue-500 ring-2 ring-blue-400/50"
              : "bg-white/95 dark:bg-stone-900/95 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:scale-105"
          }`}
          title="Mode 'Autour de moi' (500m)"
        >
          <Navigation className="w-5 h-5" />
        </button>

        {/* Map style toggle (Streets vs Satellite) */}
        <button
          onClick={() => setMapType(mapType === "streets" ? "satellite" : "streets")}
          className={`w-10 h-10 rounded-2xl backdrop-blur-md shadow-lg border flex items-center justify-center transition-all ${
            mapType === "satellite"
              ? "bg-purple-600 text-white border-purple-500 ring-2 ring-purple-400/50"
              : "bg-white/95 dark:bg-stone-900/95 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:scale-105"
          }`}
          title="Basculer Plan / Satellite"
        >
          <Layers className="w-5 h-5" />
        </button>
      </div>

      {/* Actual Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Bottom Card Preview when a Place is Selected */}
      {activePlace && (
        <div className="absolute bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-[1000] bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl rounded-3xl p-4 shadow-2xl border border-stone-200/90 dark:border-stone-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={() => setActivePlace(null)}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-700"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex gap-3">
            <div className="w-20 h-20 shrink-0">
              <FoodVisual place={activePlace} size="sm" className="w-20 h-20 !rounded-2xl" />
            </div>

            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300">
                  {activePlace.subCategory}
                </span>
                <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {activePlace.rating.toFixed(1)} ({activePlace.reviewCount})
                </span>
              </div>

              <h4 className="font-bold text-stone-900 dark:text-white text-base truncate mt-1">
                {activePlace.name}
              </h4>

              <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">
                📍 {activePlace.address}
              </p>

              <div className="flex items-center gap-2 text-xs font-medium text-stone-600 dark:text-stone-300 mt-1">
                <span>{"€".repeat(activePlace.priceLevel)}</span>
                <span>•</span>
                <span>
                  {formatDistance(calculateDistanceKm(userLat, userLng, activePlace.lat, activePlace.lng))}
                </span>
                <span>•</span>
                <span
                  className={
                    isCurrentlyOpen(activePlace)
                      ? "text-emerald-600 dark:text-emerald-400 font-bold"
                      : "text-red-500"
                  }
                >
                  {isCurrentlyOpen(activePlace) ? "🟢 Ouvert" : "🔴 Fermé"}
                </span>
              </div>
            </div>
          </div>

          {activePlace.tiktokViral && (
            <div className="mt-2.5 px-2.5 py-1 rounded-xl bg-pink-50 dark:bg-pink-950/50 border border-pink-200/60 dark:border-pink-900/60 flex items-center gap-1.5 text-xs text-pink-700 dark:text-pink-300">
              <Flame className="w-3.5 h-3.5 text-pink-500 shrink-0" />
              <span className="truncate">{activePlace.tiktokTrendNote || "Pépite virale sur TikTok"}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-stone-100 dark:border-stone-800">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${activePlace.lat},${activePlace.lng}&travelmode=walking`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all text-center"
            >
              <Navigation className="w-3.5 h-3.5" />
              Itinéraire
            </a>

            <button
              onClick={() => onSelectPlace(activePlace)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs active:scale-95 transition-all text-center"
            >
              Fiche complète
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
