import React, { useState } from "react";
import {
  X,
  Compass,
  Sparkles,
  MapPin,
  ChevronRight,
  Navigation,
  Clock,
  Euro,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { RawPlace } from "../data/rawDatabase";
import { calculateDistanceKm, formatDistance } from "../utils/geo";

interface FoodTourPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: RawPlace[];
  userLat: number;
  userLng: number;
  onSelectPlace: (place: RawPlace) => void;
}

interface TourTheme {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  gradient: string;
  step1Filter: (p: RawPlace) => boolean;
  step2Filter: (p: RawPlace) => boolean;
  step3Filter: (p: RawPlace) => boolean;
}

const TOUR_THEMES: TourTheme[] = [
  {
    id: "tiktok-viral",
    name: "🔥 Pépites TikTok & Street Food",
    emoji: "🔥",
    desc: "Les spots ultra-généreux vus sur TikTok à Paris",
    gradient: "from-rose-500 to-amber-500",
    step1Filter: (p) => /tenders|poulet|kfb|snack|nachos/i.test(p.sub + " " + p.n) || !!p.tiktokViral,
    step2Filter: (p) => /burger|smash|naan|tacos/i.test(p.sub + " " + p.n) && p.r >= 4.4,
    step3Filter: (p) => /cookie|waffle|gouter|boulangerie|donut|bubble/i.test(p.sub + " " + p.n),
  },
  {
    id: "halal-deluxe",
    name: "🕌 Circuit 100% Halal Gourmand",
    emoji: "🕌",
    desc: "Tranché, certifié sans porc ni alcool, viandes savoureuses",
    gradient: "from-emerald-500 to-teal-500",
    step1Filter: (p) => !!p.isHalal && /poulet|snack|entrée|mezzé/i.test(p.sub + " " + p.n),
    step2Filter: (p) => !!p.isHalal && /naan|burger|tajine|couscous|grill/i.test(p.sub + " " + p.n) && p.r >= 4.5,
    step3Filter: (p) => /pâtisserie|thé|crêpe|gaufre|boulangerie/i.test(p.sub + " " + p.n),
  },
  {
    id: "budget-etudiant",
    name: "💸 Festin Maxi Portions ≤ 10 €",
    emoji: "💸",
    desc: "3 étapes ultra-abordables pour caler sans se ruiner",
    gradient: "from-cyan-500 to-blue-500",
    step1Filter: (p) => p.pr === 1 || !!p.isBoxDeal,
    step2Filter: (p) => p.pr === 1 && p.r >= 4.3,
    step3Filter: (p) => (p.cat === "Goûter" || /boulangerie|croissant/i.test(p.sub)) && p.pr === 1,
  },
  {
    id: "bouillon-terroir",
    name: "🥘 Bouillon & Paris Authentique",
    emoji: "🥘",
    desc: "Bistrots historiques et spécialités parisiennes cultes",
    gradient: "from-amber-500 to-orange-600",
    step1Filter: (p) => /bistrot|bouillon|oeuf|apéritif/i.test(p.sub + " " + p.n),
    step2Filter: (p) => /bouillon|tradition|brasserie|viande/i.test(p.sub + " " + p.n) && p.r >= 4.2,
    step3Filter: (p) => /chou|tarte|pâtisserie|boulangerie/i.test(p.sub + " " + p.n),
  },
];

export const FoodTourPlannerModal: React.FC<FoodTourPlannerModalProps> = ({
  isOpen,
  onClose,
  places,
  userLat,
  userLng,
  onSelectPlace,
}) => {
  const [selectedThemeId, setSelectedThemeId] = useState<string>("tiktok-viral");
  const [seed, setSeed] = useState<number>(0);

  if (!isOpen) return null;

  const activeTheme = TOUR_THEMES.find((t) => t.id === selectedThemeId) || TOUR_THEMES[0];

  // Pick 3 realistic coherent stops
  const step1Candidates = places.filter(activeTheme.step1Filter);
  const step2Candidates = places.filter(activeTheme.step2Filter);
  const step3Candidates = places.filter(activeTheme.step3Filter);

  const stop1 = step1Candidates[(seed + 1) % (step1Candidates.length || 1)] || places[0];
  // Find step 2 reasonably close to step 1 (within 2.5 km if possible)
  const sortedStep2 = [...step2Candidates].sort((a, b) => {
    const da = calculateDistanceKm(stop1.la, stop1.lo, a.la, a.lo);
    const db = calculateDistanceKm(stop1.la, stop1.lo, b.la, b.lo);
    return da - db;
  });
  const stop2 = sortedStep2[(seed) % Math.min(5, sortedStep2.length || 1)] || places[1];

  // Find step 3 close to step 2
  const sortedStep3 = [...step3Candidates].sort((a, b) => {
    const da = calculateDistanceKm(stop2.la, stop2.lo, a.la, a.lo);
    const db = calculateDistanceKm(stop2.la, stop2.lo, b.la, b.lo);
    return da - db;
  });
  const stop3 = sortedStep3[(seed + 2) % Math.min(5, sortedStep3.length || 1)] || places[2];

  const dist1to2 = calculateDistanceKm(stop1.la, stop1.lo, stop2.la, stop2.lo);
  const dist2to3 = calculateDistanceKm(stop2.la, stop2.lo, stop3.la, stop3.lo);
  const totalWalkKm = dist1to2 + dist2to3;
  const walkMinutes = Math.round(totalWalkKm * 12); // ~5 km/h

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${stop1.la},${stop1.lo}&destination=${stop3.la},${stop3.lo}&waypoints=${stop2.la},${stop2.lo}&travelmode=walking`;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#0D1322] text-[#F1F5F9] rounded-3xl border border-slate-700/80 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden p-5 sm:p-6 max-h-[92vh] overflow-y-auto no-scrollbar animate-slideUp flex flex-col"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-gradient-to-b from-indigo-500/15 via-amber-500/10 to-transparent blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-white">Food Tour Parisien</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Itinéraire 3 Étapes
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Un parcours gourmand complet : Entrée ➔ Plat ➔ Dessert
            </p>
          </div>
        </div>

        {/* Theme Pills */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {TOUR_THEMES.map((theme) => {
            const isSelected = selectedThemeId === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  setSelectedThemeId(theme.id);
                  setSeed(0);
                }}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-800/90 border-indigo-400 shadow-md shadow-indigo-500/15"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400"
                }`}
              >
                <div className="text-sm font-bold text-white mb-0.5">{theme.name}</div>
                <div className="text-[10px] text-slate-400 line-clamp-1">{theme.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Tour Stats Bar */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 mb-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>~{walkMinutes} min de marche</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>{totalWalkKm.toFixed(1)} km au total</span>
          </div>
          <button
            onClick={() => setSeed((prev) => prev + 1)}
            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
          >
            🎲 Changer d'adresses
          </button>
        </div>

        {/* 3 Steps Timeline */}
        <div className="space-y-3 mb-5">
          {/* Step 1 */}
          <div
            onClick={() => {
              onSelectPlace(stop1);
              onClose();
            }}
            className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-400/50 transition-all cursor-pointer flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
              1
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                Étape 1 · L'Amuse-Bouche / Entrée
              </span>
              <div className="font-extrabold text-sm text-white truncate">{stop1.n}</div>
              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <span className="text-amber-400 font-bold">★ {stop1.r.toFixed(1)}</span>
                <span>·</span>
                <span>{stop1.sub}</span>
                <span>·</span>
                <span>{stop1.a.slice(0, 22)}...</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center text-[11px] text-slate-400 gap-1 -my-1">
            <span>↓ Marche : {formatDistance(dist1to2)} (~{Math.round(dist1to2 * 12)} min)</span>
          </div>

          {/* Step 2 */}
          <div
            onClick={() => {
              onSelectPlace(stop2);
              onClose();
            }}
            className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-400/50 transition-all cursor-pointer flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
              2
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                Étape 2 · Le Plat Signature Copieux
              </span>
              <div className="font-extrabold text-sm text-white truncate">{stop2.n}</div>
              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <span className="text-amber-400 font-bold">★ {stop2.r.toFixed(1)}</span>
                <span>·</span>
                <span>{stop2.sub}</span>
                <span>·</span>
                <span>{stop2.a.slice(0, 22)}...</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center text-[11px] text-slate-400 gap-1 -my-1">
            <span>↓ Marche : {formatDistance(dist2to3)} (~{Math.round(dist2to3 * 12)} min)</span>
          </div>

          {/* Step 3 */}
          <div
            onClick={() => {
              onSelectPlace(stop3);
              onClose();
            }}
            className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-400/50 transition-all cursor-pointer flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
              3
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                Étape 3 · Le Dessert / Cookie Coulant
              </span>
              <div className="font-extrabold text-sm text-white truncate">{stop3.n}</div>
              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <span className="text-amber-400 font-bold">★ {stop3.r.toFixed(1)}</span>
                <span>·</span>
                <span>{stop3.sub}</span>
                <span>·</span>
                <span>{stop3.a.slice(0, 22)}...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Open Walking Directions in Google Maps */}
        <div className="space-y-2">
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-400 hover:to-rose-400 shadow-md shadow-indigo-500/25 transition-transform active:scale-95 text-center"
          >
            <Navigation className="w-4 h-4" />
            <span>Lancer l'itinéraire piéton 3 étapes dans Google Maps</span>
          </a>

          <p className="text-[11px] text-center text-slate-500">
            Clique sur une étape pour voir les avis détaillés, le numéro et le menu.
          </p>
        </div>
      </div>
    </div>
  );
};
