import React, { useState } from "react";
import { RawPlace } from "../data/rawDatabase";
import { calculateDistanceKm, formatDistance, isCurrentlyOpen } from "../utils/geo";
import { FoodVisual } from "./FoodVisual";
import {
  X,
  Heart,
  Flame,
  Sparkles,
  Navigation,
  RotateCcw,
  Trophy,
  Share2,
  Clock,
  MapPin,
  Check,
} from "lucide-react";

interface FoodDuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: RawPlace[];
  userLat: number;
  userLng: number;
  onSelectPlace: (place: RawPlace) => void;
}

export const FoodDuelModal: React.FC<FoodDuelModalProps> = ({
  isOpen,
  onClose,
  places,
  userLat,
  userLng,
  onSelectPlace,
}) => {
  // Pool of high-rated curated spots
  const [deck, setDeck] = useState<RawPlace[]>(() => {
    return [...places]
      .filter((p) => p.r >= 4.5 && p.c >= 80)
      .sort(() => 0.5 - Math.random())
      .slice(0, 20);
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<RawPlace[]>([]);
  const [showMatchCelebration, setShowMatchCelebration] = useState<RawPlace | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  if (!isOpen) return null;

  const currentPlace = deck[currentIndex];

  const handleSwipe = (direction: "left" | "right") => {
    setSwipeDirection(direction);
    setTimeout(() => {
      if (direction === "right" && currentPlace) {
        const nextMatches = [currentPlace, ...matches];
        setMatches(nextMatches);
        setShowMatchCelebration(currentPlace);
      }
      setSwipeDirection(null);
      if (currentIndex < deck.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Recycle or finish
        setCurrentIndex(0);
      }
    }, 250);
  };

  const handleReset = () => {
    const reshuffled = [...places]
      .filter((p) => p.r >= 4.5 && p.c >= 80)
      .sort(() => 0.5 - Math.random())
      .slice(0, 20);
    setDeck(reshuffled);
    setCurrentIndex(0);
    setMatches([]);
    setShowMatchCelebration(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div
        className="relative w-full max-w-sm sm:max-w-md bg-[#0A0A10] text-white rounded-[32px] border border-amber-500/30 shadow-[0_0_60px_rgba(245,158,11,0.2)] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <div>
              <h3 className="font-sans font-black text-lg leading-tight text-white">
                Le Duel <span className="text-gold-gradient font-black">Gourmand 24K</span>
              </h3>
              <p className="text-[11px] text-amber-200/70">
                Swipe à droite si ça te donne faim !
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Match Celebration Overlay */}
        {showMatchCelebration ? (
          <div className="p-6 flex flex-col items-center justify-center text-center my-auto animate-scaleUp">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/30 mb-4 animate-bounce">
              🎉
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">
              C'EST UN MATCH GOURMAND !
            </span>
            <h2 className="font-sans font-black text-2xl mt-1 mb-2 text-white">
              {showMatchCelebration.n}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
              <span className="text-amber-400 font-bold">★ {showMatchCelebration.r.toFixed(1)}</span>
              <span>·</span>
              <span>{showMatchCelebration.sub}</span>
              <span>·</span>
              <span>{showMatchCelebration.z}</span>
              <span>·</span>
              <span className="text-amber-300 font-bold">
                {formatDistance(calculateDistanceKm(userLat, userLng, showMatchCelebration.la, showMatchCelebration.lo))}
              </span>
            </div>
            <p className="text-xs text-slate-200 italic bg-[#12121A] p-3 rounded-2xl border border-amber-500/25 mb-6">
              « {showMatchCelebration.s} »
            </p>

            <div className="w-full flex flex-col gap-2.5">
              <button
                onClick={() => {
                  onSelectPlace(showMatchCelebration);
                  onClose();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-slate-950" />
                <span>Voir la fiche & Itinéraire direct</span>
              </button>
              <button
                onClick={() => setShowMatchCelebration(null)}
                className="w-full py-2.5 text-xs font-bold text-amber-300 hover:underline cursor-pointer"
              >
                Continuer à swiper d'autres pépites →
              </button>
            </div>
          </div>
        ) : currentPlace ? (
          /* Card View */
          <div className="p-4 flex-1 flex flex-col justify-between overflow-y-auto no-scrollbar">
            <div
              className={`relative rounded-3xl overflow-hidden bg-[#12121A] border border-amber-500/25 shadow-md transition-all duration-300 ${
                swipeDirection === "left"
                  ? "-translate-x-24 -rotate-12 opacity-0"
                  : swipeDirection === "right"
                  ? "translate-x-24 rotate-12 opacity-0"
                  : "translate-x-0 rotate-0 opacity-100"
              }`}
            >
              {/* Visual Banner */}
              <div className="h-56 sm:h-64 relative overflow-hidden flex items-center justify-center">
                <FoodVisual place={currentPlace as any} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                
                {/* Distance & Halal Tag */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white font-bold text-xs">
                    {formatDistance(calculateDistanceKm(userLat, userLng, currentPlace.la, currentPlace.lo))}
                  </span>
                  {currentPlace.isHalal && (
                    <span className="px-2.5 py-1 rounded-xl bg-[#10B981] text-slate-950 font-black text-xs">
                      🕌 Halal
                    </span>
                  )}
                  {currentPlace.tiktokViral && (
                    <span className="px-2 py-1 rounded-xl bg-gradient-to-r from-[#FF0050] to-[#00F2FE] text-white font-black text-xs">
                      TikTok Viral 🔥
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-md">
                  ★ {currentPlace.r.toFixed(1)} ({currentPlace.c} avis)
                </div>

                {/* Bottom Card Title Info */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                    {currentPlace.cat} · {currentPlace.sub}
                  </span>
                  <h2 className="font-sans font-black text-2xl leading-tight">
                    {currentPlace.n}
                  </h2>
                </div>
              </div>

              {/* Card Body Info */}
              <div className="p-4 flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                  <span className="truncate">{currentPlace.a}</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                  <span className={isCurrentlyOpen(currentPlace.h) ? "text-[#10B981] font-bold" : "text-rose-500 font-bold"}>
                    {isCurrentlyOpen(currentPlace.h) ? "Ouvert actuellement" : "Fermé"}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">· {currentPlace.h}</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mt-1">
                  « {currentPlace.s} »
                </p>
              </div>
            </div>

            {/* Action Buttons: Pass (✕), Reset, Love (❤️) */}
            <div className="flex items-center justify-center gap-5 mt-4 pt-2">
              <button
                onClick={() => handleSwipe("left")}
                aria-label="Passer"
                className="w-14 h-14 rounded-full bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:border-rose-400 shadow-md flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
              >
                <X className="w-7 h-7" />
              </button>

              <button
                onClick={handleReset}
                title="Recharger le deck"
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-transform active:rotate-180 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleSwipe("right")}
                aria-label="J'adore"
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#10B981] to-[#06B6D4] text-slate-950 shadow-lg shadow-[#10B981]/30 flex items-center justify-center transition-transform active:scale-90 hover:scale-105 cursor-pointer"
              >
                <Heart className="w-8 h-8 fill-current" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center my-auto">
            <Trophy className="w-12 h-12 text-[#10B981] mx-auto mb-3" />
            <h3 className="font-sans font-black text-xl mb-1 text-slate-900 dark:text-white">Fin du deck !</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Tu as exploré toutes les pépites du moment.
            </p>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-slate-950 font-black text-xs cursor-pointer"
            >
              Recommencer avec 20 nouvelles adresses
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
