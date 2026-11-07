import React, { useState, useEffect } from "react";
import { X, Sparkles, Navigation, RotateCw, MapPin, ExternalLink, Heart } from "lucide-react";
import { RawPlace } from "../data/rawDatabase";
import { fireGoldConfetti } from "../utils/confetti";
import { calculateDistanceKm, formatDistance } from "../utils/geo";
import { getSignatureBanger } from "../utils/transitAndBanger";

interface ShakeToPickModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: RawPlace[];
  userLat: number;
  userLng: number;
  onSelectPlace: (place: RawPlace) => void;
}

export const ShakeToPickModal: React.FC<ShakeToPickModalProps> = ({
  isOpen,
  onClose,
  places,
  userLat,
  userLng,
  onSelectPlace,
}) => {
  const [selectedPlace, setSelectedPlace] = useState<RawPlace | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // Top candidates: places rated >= 4.6 or with viral status
  const topSpots = places.filter((p) => p.r >= 4.6 || p.tiktokViral);

  const rollNewSpot = () => {
    setIsSpinning(true);

    let count = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * topSpots.length);
      setSelectedPlace(topSpots[randomIdx]);
      count++;

      if (count > 10) {
        clearInterval(interval);
        const finalIdx = Math.floor(Math.random() * topSpots.length);
        const winner = topSpots[finalIdx];
        setSelectedPlace(winner);
        setIsSpinning(false);
        fireGoldConfetti();
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      }
    }, 80);
  };

  useEffect(() => {
    if (isOpen) {
      rollNewSpot();
    }
  }, [isOpen]);

  if (!isOpen || !selectedPlace) return null;

  const dist = calculateDistanceKm(userLat, userLng, selectedPlace.la, selectedPlace.lo);
  const walkMin = Math.max(1, Math.round(dist / 0.08));

  const citymapperUrl = `https://citymapper.com/directions?endcoord=${selectedPlace.la},${selectedPlace.lo}&endname=${encodeURIComponent(selectedPlace.n)}`;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.la},${selectedPlace.lo}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#0A0A10] rounded-3xl border border-amber-500/40 p-6 flex flex-col gap-4 text-white relative shadow-[0_0_80px_rgba(245,158,11,0.25)] animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-amber-400/20 blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-amber-500/20 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">🎲</span>
            <div>
              <h3 className="font-sans font-black text-lg text-white">
                Tirage <span className="text-gold-gradient font-black">"Secoue & Déguste"</span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Choisi au sort parmi la crème de Paris & IDF
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Winner Card */}
        <div
          className={`p-5 rounded-3xl bg-gradient-to-br from-[#161622] via-[#0E0E18] to-[#0A0A10] border border-amber-400/50 flex flex-col gap-3.5 relative overflow-hidden transition-all ${
            isSpinning ? "opacity-70 scale-98" : "scale-100 shadow-xl"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                  ★ {selectedPlace.r.toFixed(1)}
                </span>
                {selectedPlace.isHalal && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 flex items-center gap-0.5">
                    🕌 Halal
                  </span>
                )}
                <span className="text-xs text-amber-200">{"€".repeat(selectedPlace.pr)}</span>
              </div>
              <h2 className="font-sans font-black text-2xl text-white mt-1 leading-tight">
                {selectedPlace.n}
              </h2>
              <span className="text-xs text-zinc-400 block mt-0.5">
                {selectedPlace.sub} · {selectedPlace.z}
              </span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center text-2xl shrink-0">
              🍽️
            </div>
          </div>

          {/* Signature Dish */}
          <div className="p-3 rounded-2xl bg-black/50 border border-amber-500/20 text-xs">
            <span className="text-[10px] font-black uppercase text-amber-300 block mb-0.5">
              🔥 Le Banger à tester :
            </span>
            <p className="font-black text-sm text-white">
              {getSignatureBanger(selectedPlace)}
            </p>
          </div>

          {/* Distance */}
          <div className="flex items-center justify-between text-xs text-zinc-300 pt-1 border-t border-white/5">
            <span className="flex items-center gap-1 text-amber-300 font-bold">
              <MapPin className="w-3.5 h-3.5" />
              <span>{formatDistance(dist)}</span>
            </span>
            <span className="text-emerald-400 font-bold">
              🚶 ~{walkMin} min à pied
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onSelectPlace(selectedPlace);
              }}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 font-black text-sm shadow-md hover:brightness-110 active:scale-97 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Voir la Fiche Complète →</span>
            </button>

            <button
              onClick={rollNewSpot}
              disabled={isSpinning}
              className="px-4 py-3 rounded-2xl bg-[#181824] border border-amber-500/30 text-amber-300 hover:text-white hover:border-amber-400 active:scale-97 transition-all cursor-pointer flex items-center gap-1.5"
              title="Relancer un tirage au sort"
            >
              <RotateCw className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`} />
              <span className="text-xs font-bold">Encore</span>
            </button>
          </div>

          {/* Direct Navigation shortcuts (Citymapper / Google Maps) */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <a
              href={citymapperUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-bold text-center flex items-center justify-center gap-1.5 hover:bg-emerald-500/20 transition-colors"
            >
              <span>🟢</span>
              <span>Citymapper (RATP)</span>
            </a>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-[#141420] border border-cyan-500/40 text-cyan-300 font-bold text-center flex items-center justify-center gap-1.5 hover:bg-cyan-500/20 transition-colors"
            >
              <span>🗺️</span>
              <span>Google Maps</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
