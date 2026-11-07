import React, { useState } from "react";
import {
  X,
  Moon,
  Clock,
  Sparkles,
  Navigation,
  Phone,
  Flame,
  ShieldCheck,
  Star,
  CheckCircle,
} from "lucide-react";
import { RawPlace } from "../data/rawDatabase";
import { calculateDistanceKm, formatDistance, isCurrentlyOpen } from "../utils/geo";

interface NightRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: RawPlace[];
  userLat: number;
  userLng: number;
  onSelectPlace: (place: RawPlace) => void;
}

export const NightRadarModal: React.FC<NightRadarModalProps> = ({
  isOpen,
  onClose,
  places,
  userLat,
  userLng,
  onSelectPlace,
}) => {
  const [filterHalal, setFilterHalal] = useState(false);
  const [filterBudget, setFilterBudget] = useState<number | null>(null);

  if (!isOpen) return null;

  // Filter late night spots: either hours state late (00h, 01h, 02h, 05h, 24/7) or open currently late
  const nightPlaces = places
    .filter((p) => {
      const isNight =
        /00h|01h|02h|03h|04h|05h|06h|24h|nuit|tard/i.test(p.h + " " + p.s) ||
        isCurrentlyOpen(p.h);
      if (!isNight) return false;
      if (filterHalal && !p.isHalal) return false;
      if (filterBudget && p.pr > filterBudget) return false;
      return true;
    })
    .sort((a, b) => {
      // Prioritize currently open then high rating
      const aOpen = isCurrentlyOpen(a.h) ? 1 : 0;
      const bOpen = isCurrentlyOpen(b.h) ? 1 : 0;
      if (bOpen !== aOpen) return bOpen - aOpen;
      return b.r - a.r;
    })
    .slice(0, 30);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-[#09090E] text-[#F8FAFC] rounded-[36px] border border-amber-500/30 shadow-[0_0_60px_rgba(245,158,11,0.18)] overflow-hidden p-5 sm:p-6 max-h-[92vh] overflow-y-auto no-scrollbar animate-slideUp flex flex-col"
      >
        {/* Glow Top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-gradient-to-b from-purple-500/20 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white font-black shadow-lg shadow-purple-500/25 text-2xl shrink-0">
            🌙
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-xl text-white tracking-tight">
                SOS Faim Nocturne <span className="text-gold-gradient font-black">22h - 06h</span>
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Radar Nuit
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Les meilleures adresses ouvertes tard à Paris pour caler tes fringales
            </p>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-1 text-xs">
          <button
            onClick={() => setFilterHalal(!filterHalal)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              filterHalal
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
            }`}
          >
            🕌 100% Halal uniquement
          </button>

          <button
            onClick={() => setFilterBudget(filterBudget === 1 ? null : 1)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              filterBudget === 1
                ? "bg-amber-400 text-slate-950 font-black"
                : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
            }`}
          >
            💸 Menu ≤ 10 €
          </button>
        </div>

        {/* List of late-night spots */}
        <div className="space-y-2.5 max-h-[55vh] overflow-y-auto no-scrollbar pr-1">
          {nightPlaces.map((place) => {
            const dist = calculateDistanceKm(userLat, userLng, place.la, place.lo);
            const isOpen = isCurrentlyOpen(place.h);

            return (
              <div
                key={place.id}
                onClick={() => {
                  onSelectPlace(place);
                  onClose();
                }}
                className="p-3.5 rounded-2xl bg-[#12121A] border border-amber-500/20 hover:border-amber-400/60 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                      {place.n}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-full flex items-center gap-1 ${
                        isOpen
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
                      {isOpen ? "Ouvert maintenant" : "Ferme bientôt"}
                    </span>
                    {place.isHalal && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Halal
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-2 mb-1">
                    <span className="text-amber-400 font-bold">★ {place.r.toFixed(1)}</span>
                    <span>({place.c} avis)</span>
                    <span>·</span>
                    <span>{place.sub}</span>
                    <span>·</span>
                    <span>{"€".repeat(place.pr)}</span>
                  </div>

                  <div className="text-[11px] text-amber-200/80 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{place.h}</span>
                  </div>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                  <span className="text-xs font-bold text-amber-400 block">
                    {formatDistance(dist)}
                  </span>
                  <div className="flex items-center gap-1">
                    {place.tel && (
                      <a
                        href={`tel:${place.tel}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400"
                        title="Appeler pour commander"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.la},${place.lo}&travelmode=walking`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold hover:brightness-110"
                      title="Itinéraire à pied"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
