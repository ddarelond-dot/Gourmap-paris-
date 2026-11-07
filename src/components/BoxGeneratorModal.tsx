import React, { useState } from "react";
import { FoodDeal, RestaurantPlace } from "../types/food";
import { FOOD_DEALS } from "../data/dealsData";
import { calculateDistanceKm, formatDistance } from "../utils/geo";
import {
  X,
  Sparkles,
  Flame,
  ShieldCheck,
  Navigation,
  Dices,
  CheckCircle2,
  Euro,
} from "lucide-react";

interface BoxGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: RestaurantPlace[];
  userLat: number;
  userLng: number;
  onSelectPlace: (place: RestaurantPlace) => void;
  onSelectTikTokDeal?: (deal: FoodDeal) => void;
}

export const BoxGeneratorModal: React.FC<BoxGeneratorModalProps> = ({
  isOpen,
  onClose,
  places,
  userLat,
  userLng,
  onSelectPlace,
  onSelectTikTokDeal,
}) => {
  const [budget, setBudget] = useState<number>(10);
  const [craving, setCraving] = useState<string>("all");
  const [onlyHalal, setOnlyHalal] = useState<boolean>(true);
  const [generatedDeal, setGeneratedDeal] = useState<FoodDeal | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    setIsSpinning(true);
    setTimeout(() => {
      let pool = FOOD_DEALS.filter((d) => d.price <= budget);
      if (onlyHalal) {
        const halalOnly = pool.filter((d) => d.isHalal);
        if (halalOnly.length > 0) pool = halalOnly;
      }
      if (craving !== "all") {
        const cravingMatches = pool.filter((d) => {
          if (craving === "chicken") return d.category === "Poulet" || d.title.toLowerCase().includes("tender") || d.title.toLowerCase().includes("poulet");
          if (craving === "burger") return d.category === "Burger" || d.title.toLowerCase().includes("smash");
          if (craving === "naan") return d.title.toLowerCase().includes("naan");
          if (craving === "tacos") return d.category === "Tacos" || d.title.toLowerCase().includes("nach");
          if (craving === "asia") return d.category === "Asie";
          return true;
        });
        if (cravingMatches.length > 0) pool = cravingMatches;
      }

      const randomPick = pool[Math.floor(Math.random() * pool.length)] || FOOD_DEALS[0];
      setGeneratedDeal(randomPick);
      setIsSpinning(false);
    }, 450);
  };

  // Find corresponding place for generated deal
  const matchingPlace = generatedDeal
    ? places.find(
        (p) =>
          p.name.toLowerCase().includes(generatedDeal.brand.toLowerCase().slice(0, 5)) ||
          p.summary.toLowerCase().includes(generatedDeal.brand.toLowerCase().slice(0, 5))
      ) || places[0]
    : null;

  const distance = matchingPlace
    ? calculateDistanceKm(userLat, userLng, matchingPlace.lat, matchingPlace.lng)
    : 1.0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative text-slate-900 dark:text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-2xl bg-[#10B981] flex items-center justify-center text-slate-950 font-black shadow-md shadow-[#10B981]/30">
            ⚡
          </div>
          <div>
            <h3 className="font-sans font-black text-2xl leading-none text-slate-900 dark:text-white">
              Générateur de Box ≤ 10 €
            </h3>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Trouve ta box idéale selon ton budget et ton envie en 1 clic
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 my-5">
          {/* Budget Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
              Ton budget maximum :
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 7.5, 9, 10].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBudget(b)}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    budget === b
                      ? "bg-[#10B981] text-slate-950 shadow-md shadow-[#10B981]/25"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  ≤ {b.toFixed(b % 1 === 0 ? 0 : 2)} €
                </button>
              ))}
            </div>
          </div>

          {/* Craving Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
              Ton envie du moment :
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
              {[
                { id: "all", label: "🎲 Surprise" },
                { id: "chicken", label: "🍗 Tenders" },
                { id: "naan", label: "🫓 Cheese Naan" },
                { id: "burger", label: "🍔 Smash" },
                { id: "tacos", label: "🌮 Tacos / Loaded" },
                { id: "asia", label: "🥡 Wok & Bao" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCraving(c.id)}
                  className={`py-2 px-2.5 rounded-xl text-center truncate transition-all cursor-pointer ${
                    craving === c.id
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Halal Option Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span className="text-xs font-bold">100% Halal certifié uniquement</span>
            </div>
            <button
              type="button"
              onClick={() => setOnlyHalal(!onlyHalal)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 cursor-pointer ${
                onlyHalal ? "bg-[#10B981]" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                  onlyHalal ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isSpinning}
          className="w-full py-3.5 rounded-2xl font-black text-sm text-slate-950 flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] shadow-lg shadow-[#10B981]/25 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {isSpinning ? (
            <>
              <Dices className="w-5 h-5 animate-spin" />
              Mélange des meilleures pépites...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Générer ma Box Parfaite (≤ {budget}€)
            </>
          )}
        </button>

        {/* Result Card */}
        {generatedDeal && (
          <div className="mt-5 p-4 rounded-2xl bg-white dark:bg-[#070A11] border-2 border-[#10B981] shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#10B981]">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{generatedDeal.brand}</span>
                  {generatedDeal.isHalal && (
                    <span className="text-[#10B981] text-[10px] font-black uppercase">
                      · Halal
                    </span>
                  )}
                </div>
                <h4 className="font-sans font-black text-lg text-slate-900 dark:text-white leading-snug">
                  {generatedDeal.title}
                </h4>
              </div>
              <span className="text-2xl font-black text-[#10B981] font-sans">
                {generatedDeal.price.toFixed(2)} €
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              {generatedDeal.included}
            </p>

            {generatedDeal.secretHack && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 italic mb-3">
                💡 <span className="font-bold text-[#10B981]">Astuce :</span> « {generatedDeal.secretHack} »
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              {matchingPlace && (
                <button
                  onClick={() => {
                    onClose();
                    onSelectPlace(matchingPlace);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Fiche restaurant ({formatDistance(distance)})
                </button>
              )}

              {onSelectTikTokDeal && (
                <button
                  onClick={() => {
                    onClose();
                    onSelectTikTokDeal(generatedDeal);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-black text-slate-950 bg-[#10B981] hover:bg-[#059669] flex items-center justify-center gap-1.5 shadow-md shadow-[#10B981]/20 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5" />
                  Mode TikTok Reel
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
