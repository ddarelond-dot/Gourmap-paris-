import React, { useState } from "react";
import { X, Train, MapPin, Sparkles, Navigation, Search, Check } from "lucide-react";
import { RawPlace } from "../data/rawDatabase";
import { calculateDistanceKm, formatDistance } from "../utils/geo";

interface MetroStation {
  name: string;
  lines: string[];
  lat: number;
  lng: number;
  zone: string;
}

export const PARIS_METRO_HUBS: MetroStation[] = [
  { name: "Châtelet - Les Halles", lines: ["1", "4", "7", "11", "14", "A", "B"], lat: 48.8606, lng: 2.3477, zone: "Paris Centre" },
  { name: "République", lines: ["3", "5", "8", "9", "11"], lat: 48.8675, lng: 2.3638, zone: "Paris 3e/10e/11e" },
  { name: "Bastille", lines: ["1", "5", "8"], lat: 48.8531, lng: 2.3691, zone: "Paris 11e/12e" },
  { name: "Saint-Michel - Notre-Dame", lines: ["4", "10", "B", "C"], lat: 48.8534, lng: 2.3444, zone: "Quartier Latin" },
  { name: "Gare du Nord", lines: ["4", "5", "B", "D", "E"], lat: 48.8809, lng: 2.3553, zone: "Paris 10e" },
  { name: "Montparnasse - Bienvenüe", lines: ["4", "6", "12", "13"], lat: 48.8421, lng: 2.3219, zone: "Paris 14e/15e" },
  { name: "Strasbourg - Saint-Denis", lines: ["4", "8", "9"], lat: 48.8696, lng: 2.3544, zone: "Paris 10e / Food District" },
  { name: "Belleville", lines: ["2", "11"], lat: 48.8722, lng: 2.3769, zone: "Paris 19e/20e / Asian Street Food" },
  { name: "Saint-Denis Basilique", lines: ["13", "T1", "T5"], lat: 48.9362, lng: 2.3574, zone: "Saint-Denis Centre" },
  { name: "Saint-Denis - Porte de Paris", lines: ["13", "T8"], lat: 48.9298, lng: 2.3571, zone: "Saint-Denis / Stade de France" },
  { name: "Gare de Lyon", lines: ["1", "14", "A", "D"], lat: 48.8443, lng: 2.3744, zone: "Paris 12e" },
  { name: "Opéra", lines: ["3", "7", "8", "A"], lat: 48.8712, lng: 2.3323, zone: "Paris 9e / Quartier Japonais" },
  { name: "Olympiades", lines: ["14"], lat: 48.8268, lng: 2.3664, zone: "Paris 13e / Chinatown" },
  { name: "Pigalle / Blanche", lines: ["2", "12"], lat: 48.8822, lng: 2.3371, zone: "Paris 9e/18e / Smash & Night" },
];

export const METRO_LINE_COLORS: Record<string, { bg: string; text: string }> = {
  "1": { bg: "#FFCD00", text: "#000" },
  "2": { bg: "#003CA6", text: "#fff" },
  "3": { bg: "#837902", text: "#fff" },
  "4": { bg: "#CF009E", text: "#fff" },
  "5": { bg: "#FF7E2E", text: "#000" },
  "6": { bg: "#6ECA97", text: "#000" },
  "7": { bg: "#FA9ABA", text: "#000" },
  "8": { bg: "#E19BDF", text: "#000" },
  "9": { bg: "#B6BD00", text: "#000" },
  "10": { bg: "#C9910D", text: "#fff" },
  "11": { bg: "#704B1C", text: "#fff" },
  "12": { bg: "#007852", text: "#fff" },
  "13": { bg: "#6EC4E8", text: "#000" },
  "14": { bg: "#62259D", text: "#fff" },
  "A": { bg: "#E3051B", text: "#fff" },
  "B": { bg: "#5291CE", text: "#fff" },
  "C": { bg: "#FFCE00", text: "#000" },
  "D": { bg: "#00814F", text: "#fff" },
  "E": { bg: "#BD76AC", text: "#fff" },
  "T1": { bg: "#003CA6", text: "#fff" },
  "T8": { bg: "#837902", text: "#fff" },
};

interface MetroFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStation: MetroStation | null;
  onSelectStation: (station: MetroStation | null) => void;
  places: RawPlace[];
  onSelectPlace: (place: RawPlace) => void;
}

export const MetroFilterModal: React.FC<MetroFilterModalProps> = ({
  isOpen,
  onClose,
  selectedStation,
  onSelectStation,
  places,
  onSelectPlace,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLine, setFilterLine] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredStations = PARIS_METRO_HUBS.filter((station) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!station.name.toLowerCase().includes(q) && !station.zone.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (filterLine && !station.lines.includes(filterLine)) {
      return false;
    }
    return true;
  });

  // Places close to the active station (within 700 meters)
  const nearbyPlaces = selectedStation
    ? places
        .filter((p) => {
          const dist = calculateDistanceKm(selectedStation.lat, selectedStation.lng, p.la, p.lo);
          return dist <= 0.8;
        })
        .sort((a, b) => b.r - a.r)
        .slice(0, 15)
    : [];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-[#0D1322] text-[#F1F5F9] rounded-3xl border border-slate-700/80 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden p-5 sm:p-6 max-h-[92vh] overflow-y-auto no-scrollbar animate-slideUp flex flex-col"
      >
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-gradient-to-b from-cyan-500/15 via-indigo-500/10 to-transparent blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white font-black shadow-lg shadow-cyan-500/20">
            <Train className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-white">Métro & RER Gourmand</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Direct Station
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Trouve les meilleures tables à 5 minutes à pied de ta station
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une station (Châtelet, Bastille, Saint-Denis...)"
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-400"
          />
        </div>

        {/* Quick Line Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-3">
          <button
            onClick={() => setFilterLine(null)}
            className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all ${
              filterLine === null
                ? "bg-white text-slate-950"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            Toutes les lignes
          </button>
          {["1", "4", "8", "9", "11", "13", "14", "A", "B"].map((line) => {
            const conf = METRO_LINE_COLORS[line] || { bg: "#3B82F6", text: "#fff" };
            const isActive = filterLine === line;
            return (
              <button
                key={line}
                onClick={() => setFilterLine(isActive ? null : line)}
                style={{
                  backgroundColor: isActive ? conf.bg : undefined,
                  color: isActive ? conf.text : undefined,
                }}
                className={`w-7 h-7 rounded-full text-xs font-black shrink-0 flex items-center justify-center transition-all ${
                  isActive
                    ? "scale-110 shadow-md ring-2 ring-white/50"
                    : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
                }`}
              >
                {line}
              </button>
            );
          })}
        </div>

        {/* Station Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 max-h-56 overflow-y-auto no-scrollbar pr-1">
          {filteredStations.map((station) => {
            const isSelected = selectedStation?.name === station.name;
            return (
              <div
                key={station.name}
                onClick={() => onSelectStation(isSelected ? null : station)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10"
                    : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <span className="font-bold text-xs text-white truncate">{station.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                </div>
                <div className="flex items-center gap-1 flex-wrap mb-1">
                  {station.lines.map((line) => {
                    const c = METRO_LINE_COLORS[line] || { bg: "#64748B", text: "#fff" };
                    return (
                      <span
                        key={line}
                        style={{ backgroundColor: c.bg, color: c.text }}
                        className="w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center shadow-2xs"
                      >
                        {line}
                      </span>
                    );
                  })}
                </div>
                <span className="text-[10px] text-slate-400">{station.zone}</span>
              </div>
            );
          })}
        </div>

        {/* Nearby Spots Around Selected Station */}
        {selectedStation && (
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">
                Pépites autour de <strong className="text-cyan-400">{selectedStation.name}</strong> ({nearbyPlaces.length})
              </span>
              <button
                onClick={() => onSelectStation(null)}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                Réinitialiser
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
              {nearbyPlaces.map((place) => {
                const dist = calculateDistanceKm(selectedStation.lat, selectedStation.lng, place.la, place.lo);
                return (
                  <div
                    key={place.id}
                    onClick={() => {
                      onSelectPlace(place);
                      onClose();
                    }}
                    className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/50 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white truncate">{place.n}</span>
                        {place.tiktokViral && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                            TikTok
                          </span>
                        )}
                        {place.isHalal && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Halal
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        <span className="text-amber-400 font-bold">★ {place.r.toFixed(1)}</span>
                        <span> · {place.sub}</span>
                        <span> · {place.a.slice(0, 24)}...</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-bold text-cyan-400 block">
                        {formatDistance(dist)}
                      </span>
                      <span className="text-[9px] text-slate-400">à pied</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
