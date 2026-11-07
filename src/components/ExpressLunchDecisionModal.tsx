import React, { useState } from "react";
import { X, Sparkles, Navigation, Phone, Compass, ArrowRight, RotateCcw } from "lucide-react";
import { RawPlace } from "../data/rawDatabase";
import { calculateDistanceKm, formatDistance } from "../utils/geo";
import { getNearestTransit, getSignatureBanger } from "../utils/transitAndBanger";

interface ExpressLunchDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: RawPlace[];
  userLat: number;
  userLng: number;
  onSelectPlace: (place: RawPlace) => void;
}

export const ExpressLunchDecisionModal: React.FC<ExpressLunchDecisionModalProps> = ({
  isOpen,
  onClose,
  places,
  userLat,
  userLng,
  onSelectPlace,
}) => {
  const [budget, setBudget] = useState<number | null>(15); // max budget in EUR
  const [vibe, setVibe] = useState<"all" | "fast" | "bistrot" | "halal" | "vege" | "sweet">("all");
  const [zonePref, setZonePref] = useState<"near" | "paris" | "couronne" | "idf">("near");
  const [results, setResults] = useState<RawPlace[] | null>(null);

  if (!isOpen) return null;

  const handleComputeMatches = () => {
    let pool = places.filter((p) => {
      // Budget filter
      if (budget !== null) {
        if (budget === 10 && p.pr > 1) return false;
        if (budget === 15 && p.pr > 2) return false;
        if (budget === 25 && p.pr > 3) return false;
      }

      // Vibe filter
      if (vibe === "fast" && p.cat !== "Fast-food" && !p.sub.toLowerCase().includes("burger") && !p.sub.toLowerCase().includes("kebab")) return false;
      if (vibe === "bistrot" && p.cat !== "Restaurant") return false;
      if (vibe === "halal" && !p.isHalal) return false;
      if (vibe === "vege" && !p.hasVegetarian) return false;
      if (vibe === "sweet" && p.cat !== "Goûter" && !p.sub.toLowerCase().includes("cookie") && !p.sub.toLowerCase().includes("pâtisserie")) return false;

      // Zone filter
      const dist = calculateDistanceKm(userLat, userLng, p.la, p.lo);
      if (zonePref === "near" && dist > 3.0) return false;
      if (zonePref === "paris" && !p.z.includes("er") && !p.z.includes("e") && !p.z.includes("Paris")) return false;
      if (zonePref === "couronne" && (p.z.includes("er") || p.z.includes("e Paris"))) return false;

      return true;
    });

    // If pool is empty, relax distance or budget
    if (pool.length < 3) {
      pool = places.filter((p) => {
        if (vibe === "halal" && !p.isHalal) return false;
        return true;
      });
    }

    // Sort by rating & distance combination
    const sorted = [...pool].sort((a, b) => {
      const distA = calculateDistanceKm(userLat, userLng, a.la, a.lo);
      const distB = calculateDistanceKm(userLat, userLng, b.la, b.lo);
      const scoreA = a.r * 10 - distA * 1.2;
      const scoreB = b.r * 10 - distB * 1.2;
      return scoreB - scoreA;
    });

    setResults(sorted.slice(0, 3));
  };

  const handleReset = () => {
    setResults(null);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-xl bg-[#0C0C12] rounded-t-[36px] sm:rounded-[36px] border border-amber-500/35 shadow-[0_0_60px_rgba(245,158,11,0.25)] p-5 sm:p-6 flex flex-col gap-5 text-white max-h-[92vh] overflow-y-auto no-scrollbar relative animate-slideUp"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shadow-amber-500/25">
              ⚡
            </div>
            <div>
              <h3 className="font-sans font-black text-lg sm:text-xl text-white leading-tight">
                On mange où ? <span className="text-gold-gradient font-black">Décide en 3 clics</span>
              </h3>
              <p className="text-xs text-amber-200/70">
                L'algorithme express pour trouver 3 pépites parfaites sans hésiter
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!results ? (
          /* 3 Question Form */
          <div className="flex flex-col gap-4">
            {/* Step 1: Budget */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span>1.</span> <span>Quel budget ?</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "≤ 10 € 💸", sub: "Prix mini", val: 10 },
                  { label: "≤ 15 € 🍔", sub: "Formule midi", val: 15 },
                  { label: "≤ 25 € 🍷", sub: "Posé / Plaisir", val: 25 },
                  { label: "Peu importe ✨", sub: "Carte blanche", val: null },
                ].map((b) => (
                  <button
                    key={b.label}
                    onClick={() => setBudget(b.val)}
                    className={`p-2.5 rounded-2xl text-left transition-all border cursor-pointer ${
                      budget === b.val
                        ? "bg-amber-400 text-slate-950 font-black border-amber-300 shadow-md shadow-amber-500/25"
                        : "bg-[#141420] text-zinc-300 border-white/5 hover:border-amber-400/40"
                    }`}
                  >
                    <span className="block text-xs font-black">{b.label}</span>
                    <span className={`block text-[10px] ${budget === b.val ? "text-slate-900" : "text-zinc-500"}`}>
                      {b.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Vibe / Envie */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span>2.</span> <span>Quelle ambiance & envie ?</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "all", label: "Surprends-moi 🎲", desc: "Toutes cuisines" },
                  { id: "fast", label: "Street Food & Smash 🍔", desc: "Rapide & croustillant" },
                  { id: "halal", label: "100% Halal certifié 🕌", desc: "Viandes sans alcool" },
                  { id: "bistrot", label: "Bistrot & Bouillon 🍷", desc: "Plats réconfortants" },
                  { id: "vege", label: "Végé & Frais 🥗", desc: "Bowls & green" },
                  { id: "sweet", label: "Goûter & Cookies 🥐", desc: "Pâtisserie & café" },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVibe(v.id as any)}
                    className={`p-2.5 rounded-2xl text-left transition-all border cursor-pointer ${
                      vibe === v.id
                        ? "bg-amber-400 text-slate-950 font-black border-amber-300 shadow-md shadow-amber-500/25"
                        : "bg-[#141420] text-zinc-300 border-white/5 hover:border-amber-400/40"
                    }`}
                  >
                    <span className="block text-xs font-black">{v.label}</span>
                    <span className={`block text-[10px] ${vibe === v.id ? "text-slate-900" : "text-zinc-500"}`}>
                      {v.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Distance */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span>3.</span> <span>Où ça ?</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "near", label: "🚶 Proche de moi", desc: "< 15 min à pied" },
                  { id: "paris", label: "🗼 Paris (75)", desc: "Tous arrondissements" },
                  { id: "couronne", label: "🎨 Banlieue (92/93/94)", desc: "Pépites Petite Couronne" },
                  { id: "idf", label: "🌟 Toute l'IDF", desc: "Sans limite de zone" },
                ].map((z) => (
                  <button
                    key={z.id}
                    onClick={() => setZonePref(z.id as any)}
                    className={`p-2.5 rounded-2xl text-left transition-all border cursor-pointer ${
                      zonePref === z.id
                        ? "bg-amber-400 text-slate-950 font-black border-amber-300 shadow-md shadow-amber-500/25"
                        : "bg-[#141420] text-zinc-300 border-white/5 hover:border-amber-400/40"
                    }`}
                  >
                    <span className="block text-xs font-black">{z.label}</span>
                    <span className={`block text-[10px] ${zonePref === z.id ? "text-slate-900" : "text-zinc-500"}`}>
                      {z.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleComputeMatches}
              className="mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Trouver mes 3 pépites parfaites</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        ) : (
          /* Results View: 3 Perfect Matches */
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Voici les 3 meilleures adresses sélectionnées pour toi</span>
              </span>
              <button
                onClick={handleReset}
                className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Changer</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {results.map((place, idx) => {
                const dist = calculateDistanceKm(userLat, userLng, place.la, place.lo);
                const transit = getNearestTransit(place.la, place.lo);
                const banger = getSignatureBanger(place);

                return (
                  <div
                    key={place.id}
                    className="p-4 rounded-3xl bg-[#141420] border border-amber-500/30 hover:border-amber-400 transition-all flex flex-col gap-2.5 shadow-lg relative group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-lg font-black">
                            {["🥇 #1 Choix", "🥈 #2 Choix", "🥉 #3 Choix"][idx]}
                          </span>
                          <span className="text-amber-400 font-black text-sm">
                            ★ {place.r.toFixed(1)}
                          </span>
                          {place.isHalal && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
                              🕌 Halal
                            </span>
                          )}
                        </div>
                        <h4 className="font-sans font-black text-base text-white mt-0.5">
                          {place.n}
                        </h4>
                        <span className="text-xs text-zinc-400 block">
                          {place.sub} · {place.z} · <strong className="text-amber-300">{formatDistance(dist)}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Signature Dish Highlight */}
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2 text-xs">
                      <span className="text-base shrink-0">🔥</span>
                      <div className="min-w-0">
                        <span className="text-[10px] font-black uppercase text-amber-300 block">
                          Le banger à commander :
                        </span>
                        <span className="text-white font-bold truncate block">
                          {banger}
                        </span>
                      </div>
                    </div>

                    {/* Nearest Transit */}
                    {transit && (
                      <div className="text-[11px] text-zinc-300 flex items-center gap-1.5">
                        <span>🚇</span>
                        <span className="font-semibold">{transit.formatted}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectPlace(place);
                        }}
                        className="py-2 rounded-xl text-xs font-black bg-amber-400 text-slate-950 hover:brightness-110 text-center cursor-pointer transition-all"
                      >
                        Voir Fiche
                      </button>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${place.la},${place.lo}&travelmode=walking`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 rounded-xl text-xs font-bold bg-[#1E1E2C] text-white hover:border-amber-400 border border-white/10 flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        <Navigation className="w-3 h-3 text-amber-400" />
                        <span>Maps</span>
                      </a>
                      {place.tel ? (
                        <a
                          href={`tel:${place.tel}`}
                          className="py-2 rounded-xl text-xs font-bold bg-[#1E1E2C] text-emerald-300 hover:border-emerald-400 border border-white/10 flex items-center justify-center gap-1 cursor-pointer transition-all"
                        >
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>Appeler</span>
                        </a>
                      ) : (
                        <div className="py-2 rounded-xl text-[11px] text-zinc-500 bg-[#14141E] text-center border border-white/5">
                          Sans tél
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleReset}
              className="py-2.5 rounded-xl border border-white/10 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all text-center cursor-pointer"
            >
              ← Recommencer une sélection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
