import React, { useState } from "react";
import { RawPlace } from "../data/rawDatabase";
import { X, Sparkles, Navigation, RotateCw, Trophy, ArrowRight, Dices } from "lucide-react";
import { artStyle, foodKey, FA_ICONS } from "../data/taxonomy";
import { calculateDistanceKm, formatDistance } from "../utils/geo";

interface CoinFlipSurpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: RawPlace[];
  userLat: number;
  userLng: number;
  onSelectPlace: (place: RawPlace) => void;
}

export const CoinFlipSurpriseModal: React.FC<CoinFlipSurpriseModalProps> = ({
  isOpen,
  onClose,
  places,
  userLat,
  userLng,
  onSelectPlace,
}) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [resultPlace, setResultPlace] = useState<RawPlace | null>(() => {
    return places.length > 0 ? places[Math.floor(Math.random() * Math.min(places.length, 100))] : null;
  });
  const [coinSide, setCoinSide] = useState<"heads" | "tails">("heads");

  if (!isOpen) return null;

  const handleFlipCoin = () => {
    if (isFlipping) return;
    setIsFlipping(true);

    // Pick top rated spot close to user (rating >= 4.5)
    const eligible = places.filter((p) => p.r >= 4.5);
    const pool = eligible.length > 0 ? eligible : places;
    const randomPick = pool[Math.floor(Math.random() * pool.length)];

    setTimeout(() => {
      setResultPlace(randomPick);
      setCoinSide(Math.random() > 0.5 ? "heads" : "tails");
      setIsFlipping(false);
    }, 1200);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0E0E15] border border-amber-500/40 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(245,158,11,0.2)] flex flex-col p-6 text-white text-center relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-4 w-full">
          <div className="flex items-center gap-2 text-left">
            <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              🪙
            </span>
            <div>
              <h3 className="font-sans font-black text-base text-white">
                Pile ou Face Gourmand 24K
              </h3>
              <span className="text-[10px] text-amber-200/70">
                La pièce d'or choisit le resto parfait à ta place
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D Animated Gold Coin */}
        <div className="py-6 flex flex-col items-center justify-center">
          <div
            onClick={handleFlipCoin}
            className={`w-32 h-32 rounded-full cursor-pointer relative select-none transition-transform duration-500 ${
              isFlipping ? "animate-spin scale-110" : "hover:scale-105 active:scale-95"
            }`}
            style={{ perspective: "1000px" }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-600 via-amber-300 to-yellow-100 border-4 border-yellow-200 shadow-[0_0_40px_rgba(245,158,11,0.4)] flex flex-col items-center justify-center text-slate-950 relative overflow-hidden">
              <div className="absolute inset-2 rounded-full border-2 border-dashed border-amber-700/40" />
              <span className="text-3xl font-black">{coinSide === "heads" ? "👑" : "★"}</span>
              <span className="font-sans font-black text-[11px] tracking-wider uppercase mt-0.5">
                {coinSide === "heads" ? "GOURMAP" : "24 CARATS"}
              </span>
            </div>
          </div>

          <button
            onClick={handleFlipCoin}
            disabled={isFlipping}
            className="mt-5 py-2.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isFlipping ? "animate-spin" : ""}`} />
            <span>{isFlipping ? "La pièce tourne..." : "Lancer la Pièce d'Or"}</span>
          </button>
        </div>

        {/* Selected Result Card */}
        {resultPlace && !isFlipping && (
          <div className="p-4 rounded-2xl bg-[#141420] border border-amber-500/30 text-left flex flex-col gap-2.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Le Destin a Tranché :</span>
              </span>
              <span className="text-xs font-black text-emerald-400">
                ★ {resultPlace.r.toFixed(1)} / 5
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/20"
                style={{ background: artStyle(resultPlace) }}
              >
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 100 100"
                  dangerouslySetInnerHTML={{ __html: FA_ICONS[foodKey(resultPlace)] }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="font-black text-sm text-white truncate">
                  {resultPlace.n}
                </h4>
                <p className="text-xs text-zinc-400 truncate">
                  {resultPlace.sub} · {resultPlace.z}
                </p>
                <span className="text-[11px] font-bold text-amber-300 block">
                  {formatDistance(calculateDistanceKm(userLat, userLng, resultPlace.la, resultPlace.lo))} de toi
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 line-clamp-2 italic">
              « {resultPlace.s} »
            </p>

            <button
              onClick={() => {
                onSelectPlace(resultPlace);
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-transform active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Y aller maintenant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
