import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Trophy,
  Navigation,
  Compass,
  Flame,
  Star,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { RawPlace } from "../data/rawDatabase";
import { calculateDistanceKm, formatDistance } from "../utils/geo";

interface GoldenJackpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: RawPlace[];
  userLat: number;
  userLng: number;
  onSelectPlace: (place: RawPlace) => void;
}

const REEL_FOODS = [
  { emoji: "🍗", label: "Crousti Poulet KFB", filter: (p: RawPlace) => /poulet|kfb|chicken|tenders/i.test(p.sub + " " + p.n) },
  { emoji: "🍔", label: "Smash Burger Coulant", filter: (p: RawPlace) => /burger|smash/i.test(p.sub + " " + p.n) },
  { emoji: "🫓", label: "Cheese Naan Chaud", filter: (p: RawPlace) => /naan|indien/i.test(p.sub + " " + p.n) },
  { emoji: "🥘", label: "Bouillon Culte", filter: (p: RawPlace) => /bouillon/i.test(p.sub + " " + p.n) },
  { emoji: "🧀", label: "Loaded Nachos & Tacos", filter: (p: RawPlace) => /tacos|nachos/i.test(p.sub + " " + p.n) },
  { emoji: "🍜", label: "Ramen Artisanal", filter: (p: RawPlace) => /ramen|japonais/i.test(p.sub + " " + p.n) },
  { emoji: "🥐", label: "Cookie XXL & Babka", filter: (p: RawPlace) => /cookie|boulangerie|pâtisserie/i.test(p.sub + " " + p.n) },
];

const REEL_ZONES = [
  { label: "Paris Centre / Châtelet", match: (p: RawPlace) => /1er|2e|3e|4e|Châtelet|Halles/i.test(p.z + " " + p.a) },
  { label: "Bastille & 11e District", match: (p: RawPlace) => /11e|Bastille|Oberkampf/i.test(p.z + " " + p.a) },
  { label: "Saint-Denis / 93 Nord", match: (p: RawPlace) => /Saint-Denis|93|Stade/i.test(p.z + " " + p.a) },
  { label: "Belleville & 20e", match: (p: RawPlace) => /19e|20e|Belleville/i.test(p.z + " " + p.a) },
  { label: "Quartier Latin & 5e", match: (p: RawPlace) => /5e|6e|Saint-Michel/i.test(p.z + " " + p.a) },
  { label: "Toute l'Île-de-France", match: () => true },
];

const REEL_VIBES = [
  { emoji: "💸", label: "Menu ≤ 10 €", match: (p: RawPlace) => p.pr === 1 || !!p.isBoxDeal },
  { emoji: "🕌", label: "100% Halal Certifié", match: (p: RawPlace) => !!p.isHalal },
  { emoji: "🔥", label: "Phénomène TikTok", match: (p: RawPlace) => !!p.tiktokViral || p.c > 500 },
  { emoji: "⭐", label: "Top Noté 4.6+", match: (p: RawPlace) => p.r >= 4.6 },
];

export const GoldenJackpotModal: React.FC<GoldenJackpotModalProps> = ({
  isOpen,
  onClose,
  places,
  userLat,
  userLng,
  onSelectPlace,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [index1, setIndex1] = useState(0);
  const [index2, setIndex2] = useState(0);
  const [index3, setIndex3] = useState(0);
  const [winningPlace, setWinningPlace] = useState<RawPlace | null>(null);
  const [hasJackpot, setHasJackpot] = useState(false);

  if (!isOpen) return null;

  const playSynthBeep = (freq: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio autoplay gracefully handled
    }
  };

  const spinJackpot = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWinningPlace(null);
    setHasJackpot(false);

    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      setIndex1(Math.floor(Math.random() * REEL_FOODS.length));
      setIndex2(Math.floor(Math.random() * REEL_ZONES.length));
      setIndex3(Math.floor(Math.random() * REEL_VIBES.length));
      playSynthBeep(400 + (counter % 4) * 80);

      if (counter > 22) {
        clearInterval(interval);
        setIsSpinning(false);

        // Pick final combination
        const f1 = Math.floor(Math.random() * REEL_FOODS.length);
        const f2 = Math.floor(Math.random() * REEL_ZONES.length);
        const f3 = Math.floor(Math.random() * REEL_VIBES.length);
        setIndex1(f1);
        setIndex2(f2);
        setIndex3(f3);

        const chosenFood = REEL_FOODS[f1];
        const chosenZone = REEL_ZONES[f2];
        const chosenVibe = REEL_VIBES[f3];

        // Search in the 2,050 database for matching gem
        const matches = places.filter((p) => {
          return chosenFood.filter(p) && chosenZone.match(p) && chosenVibe.match(p);
        });

        const fallbackMatches = places.filter((p) => chosenFood.filter(p) && chosenVibe.match(p));
        const finalMatches = matches.length > 0 ? matches : fallbackMatches.length > 0 ? fallbackMatches : places.filter((p) => p.r >= 4.6);

        const winner = finalMatches[Math.floor(Math.random() * finalMatches.length)] || places[0];
        setWinningPlace(winner);
        setHasJackpot(true);

        // Victory sound chord
        setTimeout(() => playSynthBeep(523.25), 100);
        setTimeout(() => playSynthBeep(659.25), 220);
        setTimeout(() => playSynthBeep(783.99), 350);
      }
    }, 90);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#0A0A0F] text-[#F8FAFC] rounded-[36px] border border-amber-500/30 shadow-[0_0_60px_rgba(245,158,11,0.22)] overflow-hidden p-6 max-h-[92vh] overflow-y-auto no-scrollbar animate-slideUp flex flex-col"
      >
        {/* Ambient Golden Halo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-gradient-to-b from-amber-500/25 via-amber-400/10 to-transparent blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-amber-300/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Golden Crown */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/30 text-2xl shrink-0">
            🎰
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-xl text-white tracking-tight">
                Jackpot <span className="text-gold-gradient font-black">Gourmand 24K</span>
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Luxe
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Tire le levier et laisse le hasard te trouver la table parfaite
            </p>
          </div>
        </div>

        {/* 3-Reel Slot Machine Container */}
        <div className="p-4 rounded-3xl bg-[#12121A] border-2 border-amber-500/40 shadow-inner mb-5 relative overflow-hidden">
          {/* Luminous border trim */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

          <div className="grid grid-cols-3 gap-2">
            {/* Reel 1: Plat */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#08080C] border border-amber-500/20 text-center min-h-[96px] shadow-sm">
              <span className="text-3xl mb-1 filter drop-shadow-md transition-transform duration-100 scale-105">
                {REEL_FOODS[index1].emoji}
              </span>
              <span className="text-[11px] font-bold text-amber-200 line-clamp-1">
                {REEL_FOODS[index1].label}
              </span>
            </div>

            {/* Reel 2: Zone */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#08080C] border border-amber-500/20 text-center min-h-[96px] shadow-sm">
              <span className="text-2xl mb-1">📍</span>
              <span className="text-[11px] font-bold text-amber-300 line-clamp-2 leading-tight">
                {REEL_ZONES[index2].label}
              </span>
            </div>

            {/* Reel 3: Vibe */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#08080C] border border-amber-500/20 text-center min-h-[96px] shadow-sm">
              <span className="text-3xl mb-1 filter drop-shadow-md">
                {REEL_VIBES[index3].emoji}
              </span>
              <span className="text-[11px] font-bold text-amber-200 line-clamp-1">
                {REEL_VIBES[index3].label}
              </span>
            </div>
          </div>
        </div>

        {/* Spin Lever Button */}
        <button
          onClick={spinJackpot}
          disabled={isSpinning}
          className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg cursor-pointer mb-5 ${
            isSpinning
              ? "bg-amber-600 text-slate-950 opacity-75 cursor-wait"
              : "bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-slate-950 shadow-amber-500/30 hover:shadow-amber-500/50 hover:brightness-110"
          }`}
        >
          {isSpinning ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
              <span>Tirage du Jackpot en cours...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>{hasJackpot ? "🎰 Relancer le Jackpot Doré" : "🎰 Tirer le Levier d'Or"}</span>
            </>
          )}
        </button>

        {/* Winning Card Result */}
        {winningPlace && (
          <div className="p-4 rounded-3xl bg-gradient-to-b from-[#181824] to-[#101018] border border-amber-400/50 shadow-xl animate-scaleIn">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                Pépite Sélectionnée !
              </span>
              <span className="text-xs font-extrabold text-amber-300">
                {formatDistance(calculateDistanceKm(userLat, userLng, winningPlace.la, winningPlace.lo))} de toi
              </span>
            </div>

            <h4 className="font-extrabold text-base text-white truncate mb-1">
              {winningPlace.n}
            </h4>

            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <span className="text-amber-400 font-bold">★ {winningPlace.r.toFixed(1)}</span>
              <span>({winningPlace.c} avis)</span>
              <span>·</span>
              <span>{winningPlace.sub}</span>
              {winningPlace.isHalal && (
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  🕌 Halal
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
              {winningPlace.s}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onSelectPlace(winningPlace);
                  onClose();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:brightness-105 transition-colors text-center cursor-pointer"
              >
                Voir la fiche & menu
              </button>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${winningPlace.la},${winningPlace.lo}&travelmode=walking`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl font-bold text-xs bg-slate-800 text-white hover:bg-slate-700 flex items-center gap-1"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                <span>Y aller</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
