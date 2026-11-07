import React, { useState } from "react";
import { RawPlace } from "../data/rawDatabase";
import { calculateDistanceKm, formatDistance, isCurrentlyOpen } from "../utils/geo";
import { FoodVisual } from "./FoodVisual";
import { X, Sparkles, Navigation, Phone, RotateCw, Trophy, Flame } from "lucide-react";

interface GourmetRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: RawPlace[];
  userLat: number;
  userLng: number;
  onSelectPlace: (place: RawPlace) => void;
}

const ROULETTE_SECTORS = [
  { label: "🍗 Box Poulet KFB", emoji: "🍗", color: "#10B981", filter: (p: RawPlace) => /poulet|kfb|chicken|tenders/i.test(p.sub + " " + p.n) },
  { label: "🍔 Smash Burger", emoji: "🍔", color: "#D97706", filter: (p: RawPlace) => /burger|smash/i.test(p.sub + " " + p.n) },
  { label: "🥘 Bouillon Parisien", emoji: "🥘", color: "#9333EA", filter: (p: RawPlace) => /bouillon/i.test(p.sub + " " + p.n) },
  { label: "🧀 Nachos & Tacos", emoji: "🧀", color: "#EA580C", filter: (p: RawPlace) => /tacos|nachos/i.test(p.sub + " " + p.n) },
  { label: "🍜 Ramen Artisanal", emoji: "🍜", color: "#059669", filter: (p: RawPlace) => /ramen|japonais/i.test(p.sub + " " + p.n) },
  { label: "🫓 Cheese Naan Chaud", emoji: "🫓", color: "#0284C7", filter: (p: RawPlace) => /indien|naan/i.test(p.sub + " " + p.n) },
  { label: "🍲 Couscous & Tajine", emoji: "🍲", color: "#DC2626", filter: (p: RawPlace) => /maghrébin|marocain|couscous/i.test(p.sub + " " + p.n) },
  { label: "🥐 Babka & Pâtisserie", emoji: "🥐", color: "#DB2777", filter: (p: RawPlace) => /boulangerie|pâtisserie/i.test(p.sub + " " + p.n) },
];

export const GourmetRouletteModal: React.FC<GourmetRouletteModalProps> = ({
  isOpen,
  onClose,
  places,
  userLat,
  userLng,
  onSelectPlace,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [winnerPlace, setWinnerPlace] = useState<RawPlace | null>(null);
  const [winnerSector, setWinnerSector] = useState<(typeof ROULETTE_SECTORS)[0] | null>(null);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWinnerPlace(null);

    // Pick a random sector
    const randomSectorIndex = Math.floor(Math.random() * ROULETTE_SECTORS.length);
    const selectedSector = ROULETTE_SECTORS[randomSectorIndex];

    // Compute extra rotations (between 5 and 8 full spins)
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const sectorAngle = 360 / ROULETTE_SECTORS.length;
    // Target angle points to chosen sector
    const targetDegree = rotationDegree + extraSpins * 360 + randomSectorIndex * sectorAngle;

    setRotationDegree(targetDegree);

    // Filter matching places near user
    const matching = places.filter((p) => selectedSector.filter(p));
    const sortedByDistance = (matching.length > 0 ? matching : places).sort((a, b) => {
      const distA = calculateDistanceKm(userLat, userLng, a.la, a.lo);
      const distB = calculateDistanceKm(userLat, userLng, b.la, b.lo);
      return distA - distB;
    });

    const candidate = sortedByDistance[Math.floor(Math.random() * Math.min(5, sortedByDistance.length))] || places[0];

    setTimeout(() => {
      setIsSpinning(false);
      setWinnerSector(selectedSector);
      setWinnerPlace(candidate);
    }, 2800);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 relative flex flex-col items-center max-h-[92vh] overflow-y-auto no-scrollbar animate-slideUp text-slate-900 dark:text-white"
      >
        {/* Mobile handle indicator */}
        <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-3 sm:hidden" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-transform active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#10B981]/15 text-[#10B981] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Anti-Hésitation
          </span>
          <h2 className="font-sans font-black text-2xl text-slate-900 dark:text-white">
            Roulette Gourmande 🎡
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tourne la roue pour décider instantanément où manger !
          </p>
        </div>

        {/* The Animated Wheel */}
        <div className="relative w-64 h-64 my-2 flex items-center justify-center">
          {/* Wheel Pointer Pin at Top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-3 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-[#10B981] drop-shadow-md" />

          {/* Wheel Canvas Container */}
          <div
            className="w-full h-full rounded-full border-4 border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden relative transition-transform duration-[2800ms] cubic-bezier(0.15, 0.9, 0.25, 1)"
            style={{ transform: `rotate(${rotationDegree}deg)` }}
          >
            {ROULETTE_SECTORS.map((sec, idx) => {
              const angle = (360 / ROULETTE_SECTORS.length) * idx;
              return (
                <div
                  key={sec.label}
                  className="absolute inset-0 origin-center flex justify-center pt-2 text-white font-bold text-[11px] shadow-xs select-none"
                  style={{
                    backgroundColor: sec.color,
                    clipPath: "polygon(50% 50%, 30% 0%, 70% 0%)",
                    transform: `rotate(${angle}deg)`,
                  }}
                >
                  <span className="transform rotate-90 translate-y-3">{sec.emoji}</span>
                </div>
              );
            })}

            {/* Center Circle Hub */}
            <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white dark:bg-[#070A11] border-4 border-[#10B981] shadow-lg flex items-center justify-center text-lg z-10 font-black">
              🎲
            </div>
          </div>
        </div>

        {/* Spin CTA Button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className={`w-full max-w-xs mt-3 py-3.5 px-6 rounded-2xl font-black text-sm text-slate-950 shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
            isSpinning
              ? "bg-slate-400 cursor-not-allowed opacity-80"
              : "bg-[#10B981] hover:bg-[#059669] shadow-[#10B981]/30 cursor-pointer"
          }`}
        >
          <RotateCw className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`} />
          <span>{isSpinning ? "La roue tourne..." : "Lancer la Roulette !"}</span>
        </button>

        {/* Winner Announcement Card */}
        {winnerPlace && (
          <div className="w-full mt-4 p-4 rounded-3xl bg-white dark:bg-[#070A11] border-2 border-[#10B981] shadow-xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-full bg-[#10B981] text-slate-950 font-black">
                <Trophy className="w-4 h-4" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#10B981] block">
                  LE DESTIN A CHOISI !
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {winnerSector?.label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 shrink-0 rounded-2xl overflow-hidden">
                <FoodVisual place={winnerPlace as any} size="sm" className="w-14 h-14" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                    {winnerPlace.n}
                  </h4>
                  {winnerPlace.isHalal && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#10B981] text-slate-950">
                      Halal
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {winnerPlace.a}
                </p>
                <div className="flex items-center gap-2 text-xs font-bold mt-1 text-[#10B981]">
                  <span>★ {winnerPlace.r.toFixed(1)}</span>
                  <span>·</span>
                  <span>{formatDistance(calculateDistanceKm(userLat, userLng, winnerPlace.la, winnerPlace.lo))} de toi</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${winnerPlace.la},${winnerPlace.lo}&travelmode=walking`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md text-center active:scale-95 transition-all"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>On y va !</span>
              </a>

              <button
                onClick={() => {
                  onSelectPlace(winnerPlace);
                  onClose();
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <span>Voir la fiche</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
