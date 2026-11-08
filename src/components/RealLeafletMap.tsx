import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { RawPlace } from "../data/rawDatabase";
import { calculateDistanceKm, formatDistance, isCurrentlyOpen } from "../utils/geo";
import { Navigation, Clock, Euro, Flame, Compass, Layers, Phone, ExternalLink, ShieldCheck } from "lucide-react";

interface RealLeafletMapProps {
  places: RawPlace[];
  userLat: number;
  userLng: number;
  onSelectPlace: (place: RawPlace) => void;
  selectedPlaceId?: number | null;
  onRecenterGPS: () => void;
  isDark: boolean;
}

const TILE_LAYERS = {
  cartoVoyager: {
    name: "Plan Épuré (Style Maps)",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  cartoDark: {
    name: "Plan Sombre",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  osm: {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    name: "Vue Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  },
};

export const RealLeafletMap: React.FC<RealLeafletMapProps> = ({
  places,
  userLat,
  userLng,
  onSelectPlace,
  selectedPlaceId,
  onRecenterGPS,
  isDark,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);

  const [radiusFilter, setRadiusFilter] = useState<number | null>(null); // null = all, 0.5 = 500m, 1 = 1km, 2 = 2km
  const [openOnly, setOpenOnly] = useState(false);
  const [halalOnly, setHalalOnly] = useState(false);
  const [dealsOnly, setDealsOnly] = useState(false);
  const [tiktokOnly, setTiktokOnly] = useState(false);
  const [currentTileKey, setCurrentTileKey] = useState<keyof typeof TILE_LAYERS>("osm");
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Initialize Leaflet Map with OpenStreetMap by default
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLat, userLng],
        zoom: 14,
        zoomControl: false,
      });

      // Default tiles: OpenStreetMap standard with crisp street names, avenues, metros and parks
      const selectedTile = TILE_LAYERS.osm;
      const tileLayer = L.tileLayer(selectedTile.url, {
        attribution: selectedTile.attribution,
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Add Zoom Control top right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Markers Layer Group
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update user GPS pulsing blue marker & radius circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Custom Blue Pulsing GPS Icon
    const userGpsIcon = L.divIcon({
      className: "gps-user-marker",
      html: `
        <div style="position:relative;width:24px;height:24px;">
          <div style="position:absolute;inset:-6px;border-radius:50%;background:rgba(37,99,235,0.35);animation:gps-pulse 2s infinite;"></div>
          <div style="position:absolute;inset:0;border-radius:50%;background:#2563EB;border:3px solid #FFFFFF;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
          <div style="position:absolute;top:7px;left:7px;width:6px;height:6px;border-radius:50%;background:#FFFFFF;"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLat, userLng]);
    } else {
      userMarkerRef.current = L.marker([userLat, userLng], { icon: userGpsIcon, zIndexOffset: 1000 }).addTo(map);
    }

    // Radius circle
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }

    if (radiusFilter !== null) {
      radiusCircleRef.current = L.circle([userLat, userLng], {
        radius: radiusFilter * 1000,
        color: "#2563EB",
        fillColor: "#3B82F6",
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: "6, 6",
      }).addTo(map);

      map.fitBounds(radiusCircleRef.current.getBounds(), { padding: [30, 30] });
    }
  }, [userLat, userLng, radiusFilter]);

  // Filter places based on active map controls with useMemo for high performance
  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      if (radiusFilter !== null) {
        const dist = calculateDistanceKm(userLat, userLng, p.la, p.lo);
        if (dist > radiusFilter) return false;
      }
      if (openOnly && !isCurrentlyOpen(p.h)) return false;
      if (halalOnly && !p.isHalal) return false;
      if (dealsOnly && p.pr > 1 && !p.isBoxDeal) return false;
      if (tiktokOnly && !p.tiktokViral) return false;
      return true;
    });
  }, [places, radiusFilter, userLat, userLng, openOnly, halalOnly, dealsOnly, tiktokOnly]);

  const halalCount = useMemo(() => places.filter((p) => p.isHalal).length, [places]);

  // Render restaurant markers on map (takes 350 nearest to user/view for silky smooth rendering)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    const candidates = filteredPlaces.length > 350
      ? [...filteredPlaces]
          .sort((a, b) => {
            const da = (a.la - userLat) ** 2 + ((a.lo - userLng) * 0.65) ** 2;
            const db = (b.la - userLat) ** 2 + ((b.lo - userLng) * 0.65) ** 2;
            return da - db;
          })
          .slice(0, 350)
      : filteredPlaces;

    candidates.forEach((place) => {
      const isSelected = place.id === selectedPlaceId;
      const isOpen = isCurrentlyOpen(place.h);

      const color = place.tiktokViral
        ? "#FF0050"
        : place.cat === "Fast-food"
        ? "#D97706"
        : place.cat === "Goûter"
        ? "#EC4899"
        : place.cat === "Marché"
        ? "#059669"
        : "#EA580C";

      const pinIcon = L.divIcon({
        className: "custom-food-pin",
        html: `
          <div style="
            background:${color};
            color:#fff;
            padding:3px 7px;
            border-radius:14px;
            font-size:11px;
            font-weight:800;
            display:flex;
            align-items:center;
            gap:3px;
            box-shadow:0 3px 8px rgba(0,0,0,0.3);
            border:2px solid ${isSelected ? "#FFD700" : "#FFFFFF"};
            transform:scale(${isSelected ? 1.25 : 1});
            transition:transform 0.15s ease-out;
            cursor:pointer;
            white-space:nowrap;
          ">
            <span>★${place.r.toFixed(1)}</span>
            <span style="font-size:10px;opacity:0.95;">${place.n.slice(0, 12)}</span>
            ${place.isHalal ? '<span style="font-size:9px;" title="Halal">🕌</span>' : ''}
            <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${isOpen ? "#10B981" : "#EF4444"};margin-left:2px;"></span>
          </div>
        `,
        iconSize: [85, 26],
        iconAnchor: [42, 13],
      });

      const marker = L.marker([place.la, place.lo], { icon: pinIcon });
      marker.on("click", () => {
        onSelectPlace(place);
        map.panTo([place.la, place.lo], { animate: true });
      });

      markersLayer.addLayer(marker);
    });
  }, [filteredPlaces, selectedPlaceId]);

  const selectedPlace = places.find((p) => p.id === selectedPlaceId);

  return (
    <div className="w-full flex flex-col">
      {/* Top Filter Chips */}
      <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto no-scrollbar bg-[#08080C] border-b border-amber-500/20">
        {/* Radius Pills */}
        <button
          onClick={() => setRadiusFilter(radiusFilter === 0.5 ? null : 0.5)}
          className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            radiusFilter === 0.5
              ? "bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/25"
              : "bg-[#14141E] text-slate-300 border border-amber-500/20 hover:border-amber-400/50"
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>⚡ 500m</span>
        </button>

        <button
          onClick={() => setRadiusFilter(radiusFilter === 1 ? null : 1)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            radiusFilter === 1
              ? "bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 font-black"
              : "bg-[#14141E] text-slate-300 border border-amber-500/20 hover:border-amber-400/50"
          }`}
        >
          1 km
        </button>

        <button
          onClick={() => setRadiusFilter(radiusFilter === 2 ? null : 2)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            radiusFilter === 2
              ? "bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 font-black"
              : "bg-[#14141E] text-slate-300 border border-amber-500/20 hover:border-amber-400/50"
          }`}
        >
          2 km
        </button>

        <div className="h-4 w-px bg-amber-500/20 shrink-0" />

        {/* Halal Filter Pill */}
        <button
          onClick={() => setHalalOnly(!halalOnly)}
          className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            halalOnly
              ? "bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/25"
              : "bg-[#14141E] text-emerald-400 border border-emerald-500/30 hover:border-emerald-400"
          }`}
        >
          <span>🕌 Halal ({halalCount})</span>
        </button>

        <button
          onClick={() => setOpenOnly(!openOnly)}
          className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            openOnly
              ? "bg-emerald-400 text-slate-950 font-black"
              : "bg-[#14141E] text-slate-300 border border-amber-500/20 hover:border-amber-400/50"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>🟢 Ouverts</span>
        </button>

        <button
          onClick={() => setDealsOnly(!dealsOnly)}
          className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            dealsOnly
              ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20"
              : "bg-[#14141E] text-slate-300 border border-amber-500/20 hover:border-amber-400/50"
          }`}
        >
          <Euro className="w-3.5 h-3.5" />
          <span>💸 ≤ 10 €</span>
        </button>

        <button
          onClick={() => setTiktokOnly(!tiktokOnly)}
          className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            tiktokOnly
              ? "bg-gradient-to-r from-[#FF0050] to-[#00F2FE] text-white font-black"
              : "bg-[#14141E] text-rose-300 border border-rose-500/30 hover:border-rose-400"
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>🔥 TikTok</span>
        </button>
      </div>

      {/* Real Interactive Leaflet Map Container */}
      <div className="relative w-full h-[calc(100vh-170px)] min-h-[520px] bg-slate-950 overflow-hidden border-y border-amber-500/20">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Quick Direct Google Maps launcher */}
        <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
          <a
            href={`https://www.google.com/maps/search/restaurants/@${userLat},${userLng},15z`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#0A0A10]/95 backdrop-blur-md border border-amber-500/40 text-amber-300 hover:text-white hover:bg-amber-500/20 text-xs font-black shadow-xl transition-all cursor-pointer"
            title="Ouvrir mon secteur directement dans l'application Google Maps"
          >
            <Navigation className="w-4 h-4 text-amber-400" />
            <span>Ouvrir dans l'app Google Maps ↗</span>
          </a>
        </div>

        {/* Floating Controls Top Right */}
        <div className="absolute right-3 top-16 flex flex-col gap-2 z-10">
          {/* Recenter GPS */}
          <button
            onClick={() => {
              onRecenterGPS();
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setView([userLat, userLng], 15, { animate: true });
              }
            }}
            className="w-10 h-10 rounded-2xl bg-slate-900/90 backdrop-blur-md shadow-lg border border-slate-700 flex items-center justify-center text-emerald-400 hover:bg-slate-800 transition-transform active:scale-95"
            title="Recentrer sur ma position"
          >
            <Compass className="w-5 h-5" />
          </button>

          {/* Map Layer Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className="w-10 h-10 rounded-2xl bg-slate-900/90 backdrop-blur-md shadow-lg border border-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-800 transition-transform active:scale-95"
              title="Changer de style de carte"
            >
              <Layers className="w-5 h-5" />
            </button>

            {showLayerMenu && (
              <div className="absolute right-12 top-0 bg-slate-900/95 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-slate-700 flex flex-col gap-1 w-48 z-20 animate-fadeIn">
                {(Object.keys(TILE_LAYERS) as Array<keyof typeof TILE_LAYERS>).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setCurrentTileKey(key);
                      if (tileLayerRef.current) {
                        tileLayerRef.current.setUrl(TILE_LAYERS[key].url);
                      }
                      setShowLayerMenu(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-left text-xs font-bold transition-colors ${
                      currentTileKey === key
                        ? "bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 font-black shadow-sm"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {TILE_LAYERS[key].name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Place Peek Drawer */}
        {selectedPlace && (
          <div className="absolute left-3 right-3 bottom-3 sm:left-4 sm:right-auto sm:max-w-md bg-[#0A0A10]/95 backdrop-blur-xl rounded-[28px] p-4 shadow-2xl border border-amber-500/30 z-10 animate-slideUp">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <span className="font-black text-base text-white truncate">
                    {selectedPlace.n}
                  </span>
                  {selectedPlace.tiktokViral && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                      🔥 TIKTOK
                    </span>
                  )}
                  {selectedPlace.isHalal && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                      <span>🕌</span>
                      <span>{selectedPlace.halalStatus || "Halal"}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5 flex-wrap">
                  <span className="font-bold text-amber-400">★ {selectedPlace.r.toFixed(1)}</span>
                  <span>({selectedPlace.c.toLocaleString("fr-FR")} avis)</span>
                  <span>·</span>
                  <span>{selectedPlace.sub}</span>
                  <span>·</span>
                  {(() => {
                    const dist = calculateDistanceKm(userLat, userLng, selectedPlace.la, selectedPlace.lo);
                    const walkMin = Math.max(1, Math.round(dist / 0.08));
                    return (
                      <div className="inline-flex items-center gap-1.5">
                        <span className="font-bold text-amber-300">
                          {formatDistance(dist)}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 rounded-md">
                          🚶 ~{walkMin} min à pied
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {selectedPlace.halalNotice && selectedPlace.isHalal && (
                  <div className="text-[11px] font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedPlace.halalNotice}</span>
                  </div>
                )}

                <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                  {selectedPlace.s}
                </p>

                {/* Instant Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectPlace(selectedPlace)}
                    className="flex-1 px-3 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:brightness-110 shadow-md shadow-amber-500/20 text-center cursor-pointer transition-all"
                  >
                    Voir la fiche complète
                  </button>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedPlace.n + ", " + selectedPlace.a)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 shadow-sm"
                  >
                    <Navigation className="w-3.5 h-3.5 text-slate-950" />
                    <span>Google Maps</span>
                  </a>
                  {selectedPlace.tel && (
                    <a
                      href={`tel:${selectedPlace.tel}`}
                      className="p-2.5 rounded-xl text-emerald-400 bg-[#161622] hover:bg-slate-800 border border-amber-500/30"
                      title="Appeler"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
