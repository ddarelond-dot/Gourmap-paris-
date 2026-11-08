import React, { useState } from "react";
import {
  Sparkles,
  Dices,
  Smartphone,
  Award,
  BookOpen,
  Users,
  MoreHorizontal,
  Flame,
  X,
  Compass,
  Download,
  ShieldCheck,
  Calculator,
  Train,
  MapPin,
  Trophy,
} from "lucide-react";

interface HeaderProps {
  isDark?: boolean;
  onToggleTheme?: () => void;
  onSurpriseMe: () => void;
  onOpenWidget: () => void;
  onOpenGamification: () => void;
  onOpenDiary: () => void;
  onOpenGroupVote: () => void;
  onOpenRoulette?: () => void;
  onOpenBoxGenerator?: () => void;
  onOpenPWAInstall?: () => void;
  onOpenFoodDuel?: () => void;
  onOpenBillSplitter?: () => void;
  onOpenMetroFilter?: () => void;
  onOpenFoodTour?: () => void;
  onOpenGoldenJackpot?: () => void;
  onOpenNightRadar?: () => void;
  onOpenAddRestaurant?: () => void;
  onOpenStarringLists?: () => void;
  onOpenCoinFlip?: () => void;
  onOpenMidpoint?: () => void;
  onOpenDietaryFilters?: () => void;
  onOpenEvolvingIntel?: () => void;
  onOpenShakeToPick?: () => void;
  isPhoneFrame?: boolean;
  onTogglePhoneFrame?: () => void;
  testedCount: number;
  userPoints: number;
  isToolsMenuOpen?: boolean;
  onToggleToolsMenu?: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
  onSurpriseMe,
  onOpenWidget,
  onOpenGamification,
  onOpenDiary,
  onOpenGroupVote,
  onOpenRoulette,
  onOpenBoxGenerator,
  onOpenPWAInstall,
  onOpenFoodDuel,
  onOpenBillSplitter,
  onOpenMetroFilter,
  onOpenFoodTour,
  onOpenGoldenJackpot,
  onOpenNightRadar,
  onOpenAddRestaurant,
  onOpenStarringLists,
  onOpenCoinFlip,
  onOpenMidpoint,
  onOpenDietaryFilters,
  onOpenEvolvingIntel,
  onOpenShakeToPick,
  isPhoneFrame,
  onTogglePhoneFrame,
  testedCount,
  userPoints,
  isToolsMenuOpen: controlledToolsOpen,
  onToggleToolsMenu,
}) => {
  const [internalToolsOpen, setInternalToolsOpen] = useState(false);
  const toolsOpen = controlledToolsOpen !== undefined ? controlledToolsOpen : internalToolsOpen;
  const setToolsOpen = onToggleToolsMenu || setInternalToolsOpen;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#08080C]/95 backdrop-blur-2xl border-b border-amber-500/20 px-3.5 sm:px-6 py-3 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Identity: Black & 24K Gold Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-200 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-amber-500/30 group-hover:scale-105 group-hover:rotate-3 transition-all shrink-0 border border-amber-300/40"
              style={{ backgroundColor: "#F59E0B", color: "#0A0A10" }}
            >
              AG
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-black text-2xl tracking-tight text-white leading-none">
                L'Appli <span className="text-[#FBBF24] font-black drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]" style={{ color: "#FBBF24" }}>Gourmande</span>
              </span>
              <span className="text-[10px] font-bold tracking-wide text-amber-300/90 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse inline-block" />
                Le Guide & GPS Food · Paris & IDF (100% Vraies Pépites)
              </span>
            </div>
          </div>

          {/* Streamlined Luxury Controls */}
          <div className="flex items-center gap-2">
            {/* Midpoint Meetup Button */}
            {onOpenMidpoint && (
              <button
                onClick={onOpenMidpoint}
                title="Trouver un resto à mi-chemin entre deux adresses ou potes"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-cyan-950/40 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/20 active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                <span>🤝</span>
                <span className="hidden sm:inline">À Mi-Chemin</span>
              </button>
            )}

            {/* Dietary Filters Button */}
            {onOpenDietaryFilters && (
              <button
                onClick={onOpenDietaryFilters}
                title="Régimes alimentaires, 100% Halal, Végé, Terrasse"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/20 active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                <span>🛡️</span>
                <span className="hidden sm:inline">Filtres & Halal</span>
                <span className="sm:hidden">Halal</span>
              </button>
            )}

            {/* All Tools Drawer Button */}
            <button
              onClick={() => setToolsOpen(true)}
              title="Ouvrir la boîte à outils (Jackpot, Roulette, Split note, etc.)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400/20 to-yellow-400/10 text-amber-300 border border-amber-500/40 hover:border-amber-400 hover:bg-amber-400/25 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <span>⚡</span>
              <span className="hidden sm:inline">Outils</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black">
                8+
              </span>
            </button>

            {/* Gamification Points Badge */}
            <button
              onClick={onOpenGamification}
              title="Tes points gourmands"
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{userPoints} pts</span>
            </button>

          </div>
        </div>
      </header>

      {/* Luxury Black & Gold Tools Drawer */}
      {toolsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
          onClick={() => setToolsOpen(false)}
        >
          <div
            className="w-full sm:max-w-lg bg-[#0A0A0F] rounded-t-[36px] sm:rounded-[36px] border border-amber-500/30 shadow-[0_0_60px_rgba(245,158,11,0.2)] p-5 sm:p-6 flex flex-col gap-4 text-[#F8FAFC] animate-slideUp max-h-[92vh] overflow-y-auto no-scrollbar relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Golden Header Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-gradient-to-b from-amber-500/20 to-transparent blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 relative">
              <div>
                <h3 className="font-sans font-black text-lg text-white">
                  Modules & Outils <span className="text-gold-gradient font-black">Luxe 24K</span>
                </h3>
                <p className="text-xs text-slate-400">
                  L'arsenal complet pour tes sorties culinaires
                </p>
              </div>
              <button
                onClick={() => setToolsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* Radar Évolutif & Veille Collective */}
              {onOpenEvolvingIntel && (
                <button
                  onClick={() => {
                    setToolsOpen(false);
                    onOpenEvolvingIntel();
                  }}
                  className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/25 via-[#161624] to-yellow-500/10 border border-amber-400/60 hover:border-amber-300 text-left flex flex-col gap-1 transition-all group cursor-pointer shadow-md col-span-2 sm:col-span-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">🧠</span>
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded-md border border-emerald-500/30">
                      Live
                    </span>
                  </div>
                  <strong className="text-xs font-black text-amber-300 group-hover:text-amber-200">Radar Évolutif</strong>
                  <span className="text-[10px] text-amber-100/70">
                    Veille TikTok & signaux récents
                  </span>
                </button>
              )}

              {/* Ajouter un Resto */}
              {onOpenAddRestaurant && (
                <button
                  onClick={() => {
                    setToolsOpen(false);
                    onOpenAddRestaurant();
                  }}
                  className="p-3.5 rounded-2xl bg-[#12121A] border border-emerald-500/35 hover:border-emerald-400 text-left flex flex-col gap-1 transition-all group cursor-pointer shadow-sm"
                >
                  <span className="text-2xl">➕</span>
                  <strong className="text-xs font-black text-emerald-300 group-hover:text-emerald-200">+ Ajouter Resto</strong>
                  <span className="text-[10px] text-slate-400">
                    Nouveau spot pas encore listé
                  </span>
                </button>
              )}

              {/* Jackpot 24K */}
              {onOpenGoldenJackpot && (
                <button
                  onClick={() => {
                    setToolsOpen(false);
                    onOpenGoldenJackpot();
                  }}
                  className="p-3.5 rounded-2xl bg-[#12121A] border border-amber-500/30 hover:border-amber-400 text-left flex flex-col gap-1 transition-all group cursor-pointer shadow-sm"
                >
                  <span className="text-2xl">🎰</span>
                  <strong className="text-xs font-black text-amber-300 group-hover:text-amber-200">Jackpot 24K</strong>
                  <span className="text-[10px] text-slate-400">
                    Machine à sous food
                  </span>
                </button>
              )}

              {/* Secoue & Déguste */}
              {onOpenShakeToPick && (
                <button
                  onClick={() => {
                    setToolsOpen(false);
                    onOpenShakeToPick();
                  }}
                  className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/25 via-[#181824] to-[#12121A] border border-amber-400/50 hover:border-amber-300 text-left flex flex-col gap-1 transition-all group cursor-pointer shadow-sm"
                >
                  <span className="text-2xl animate-bounce">🎲</span>
                  <strong className="text-xs font-black text-amber-300 group-hover:text-amber-200">Secoue & Déguste</strong>
                  <span className="text-[10px] text-amber-100/70">
                    Tirage au sort express
                  </span>
                </button>
              )}

              {/* Faim de Nuit */}
              {onOpenNightRadar && (
                <button
                  onClick={() => {
                    setToolsOpen(false);
                    onOpenNightRadar();
                  }}
                  className="p-3.5 rounded-2xl bg-[#12121A] border border-purple-500/30 hover:border-purple-400 text-left flex flex-col gap-1 transition-all group cursor-pointer shadow-sm"
                >
                  <span className="text-2xl">🌙</span>
                  <strong className="text-xs font-bold text-purple-300 group-hover:text-purple-200">Faim Nocturne</strong>
                  <span className="text-[10px] text-slate-400">
                    Ouvert 22h - 06h
                  </span>
                </button>
              )}

              {/* Partager l'addition (Bill Splitter) */}
              {onOpenBillSplitter && (
                <button
                  onClick={() => {
                    setToolsOpen(false);
                    onOpenBillSplitter();
                  }}
                  className="p-3.5 rounded-2xl bg-[#12121A] border border-amber-500/30 hover:border-amber-400 text-left flex flex-col gap-1 transition-all group cursor-pointer"
                >
                  <span className="text-2xl">🧮</span>
                  <strong className="text-xs font-bold text-white group-hover:text-amber-300">Split Addition</strong>
                  <span className="text-[10px] text-slate-400">
                    Calcul & partage WhatsApp
                  </span>
                </button>
              )}

              {/* Métro & RER */}
              {onOpenMetroFilter && (
                <button
                  onClick={() => {
                    setToolsOpen(false);
                    onOpenMetroFilter();
                  }}
                  className="p-3.5 rounded-2xl bg-[#12121A] border border-cyan-500/30 hover:border-cyan-400 text-left flex flex-col gap-1 transition-all group cursor-pointer"
                >
                  <span className="text-2xl">🚇</span>
                  <strong className="text-xs font-bold text-white group-hover:text-cyan-300">Métro Gourmand</strong>
                  <span className="text-[10px] text-slate-400">
                    À 5 min de ta station
                  </span>
                </button>
              )}

              {/* Food Tour 3 Étapes */}
              {onOpenFoodTour && (
                <button
                  onClick={() => {
                    setToolsOpen(false);
                    onOpenFoodTour();
                  }}
                  className="p-3.5 rounded-2xl bg-[#12121A] border border-indigo-500/30 hover:border-indigo-400 text-left flex flex-col gap-1 transition-all group cursor-pointer"
                >
                  <span className="text-2xl">🗺️</span>
                  <strong className="text-xs font-bold text-white group-hover:text-indigo-300">Food Tour</strong>
                  <span className="text-[10px] text-slate-400">
                    Circuit piéton 3 étapes
                  </span>
                </button>
              )}

              {/* Le Duel Gourmand */}
              {onOpenFoodDuel && (
                <button
                  onClick={() => {
                    setToolsOpen(false);
                    onOpenFoodDuel();
                  }}
                  className="p-3.5 rounded-2xl bg-[#12121A] border border-rose-500/30 hover:border-rose-400 text-left flex flex-col gap-1 transition-all group cursor-pointer"
                >
                  <span className="text-2xl">🔥</span>
                  <strong className="text-xs font-bold text-white group-hover:text-rose-300">Le Duel Food</strong>
                  <span className="text-[10px] text-slate-400">
                    Swipe pour matcher
                  </span>
                </button>
              )}

              {/* Box TikTok Generator */}
              {onOpenBoxGenerator && (
                <button
                  onClick={() => {
                    setToolsOpen(false);
                    onOpenBoxGenerator();
                  }}
                  className="p-3.5 rounded-2xl bg-[#12121A] border border-amber-500/30 hover:border-amber-400 text-left flex flex-col gap-1 transition-all group cursor-pointer"
                >
                  <span className="text-2xl">📦</span>
                  <strong className="text-xs font-bold text-white group-hover:text-amber-300">Box ≤ 10€</strong>
                  <span className="text-[10px] text-slate-400">
                    Générateur & astuces
                  </span>
                </button>
              )}

              {/* Roulette Anti-Hesitation */}
              {onOpenRoulette && (
                <button
                  onClick={() => {
                    setToolsOpen(false);
                    onOpenRoulette();
                  }}
                  className="p-3.5 rounded-2xl bg-[#12121A] border border-emerald-500/30 hover:border-emerald-400 text-left flex flex-col gap-1 transition-all group cursor-pointer"
                >
                  <span className="text-2xl">🎡</span>
                  <strong className="text-xs font-bold text-white group-hover:text-emerald-300">Roulette</strong>
                  <span className="text-[10px] text-slate-400">
                    Tirage au sort express
                  </span>
                </button>
              )}

              {/* Carnet de Souvenirs */}
              <button
                onClick={() => {
                  setToolsOpen(false);
                  onOpenDiary();
                }}
                className="p-3.5 rounded-2xl bg-[#12121A] border border-emerald-500/30 hover:border-emerald-400 text-left flex flex-col gap-1 transition-all group cursor-pointer"
              >
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <strong className="text-xs font-bold text-white group-hover:text-emerald-300">Carnet Food</strong>
                <span className="text-[10px] text-slate-400">
                  Notes & adresses testées
                </span>
              </button>

              {/* Starring Lists 24K */}
              {onOpenStarringLists && (
                <button
                  onClick={() => {
                    setToolsOpen(false);
                    onOpenStarringLists();
                  }}
                  className="p-3.5 rounded-2xl bg-[#12121A] border border-amber-500/40 hover:border-amber-400 text-left flex flex-col gap-1 transition-all group cursor-pointer"
                >
                  <span className="text-2xl">⭐</span>
                  <strong className="text-xs font-bold text-white group-hover:text-amber-300">Starring Lists</strong>
                  <span className="text-[10px] text-slate-400">
                    Mes sélections & partage
                  </span>
                </button>
              )}

              {/* Pile ou Face Pièce d'Or */}
              {onOpenCoinFlip && (
                <button
                  onClick={() => {
                    setToolsOpen(false);
                    onOpenCoinFlip();
                  }}
                  className="p-3.5 rounded-2xl bg-[#12121A] border border-yellow-500/40 hover:border-yellow-300 text-left flex flex-col gap-1 transition-all group cursor-pointer"
                >
                  <span className="text-2xl">🪙</span>
                  <strong className="text-xs font-bold text-white group-hover:text-yellow-300">Pile ou Face</strong>
                  <span className="text-[10px] text-slate-400">
                    Tirage au sort 24K
                  </span>
                </button>
              )}

              {/* Mode Groupe */}
              <button
                onClick={() => {
                  setToolsOpen(false);
                  onOpenGroupVote();
                }}
                className="p-3.5 rounded-2xl bg-[#12121A] border border-amber-500/30 hover:border-amber-400 text-left flex flex-col gap-1 transition-all group cursor-pointer"
              >
                <Users className="w-5 h-5 text-amber-400" />
                <strong className="text-xs font-bold text-white group-hover:text-amber-300">Mode Groupe</strong>
                <span className="text-[10px] text-slate-400">
                  Vote à plusieurs en direct
                </span>
              </button>

              {/* À Mi-Chemin */}
              {onOpenMidpoint && (
                <button
                  onClick={() => {
                    setToolsOpen(false);
                    onOpenMidpoint();
                  }}
                  className="p-3.5 rounded-2xl bg-[#12121A] border border-cyan-500/35 hover:border-cyan-400 text-left flex flex-col gap-1 transition-all group cursor-pointer shadow-sm"
                >
                  <span className="text-2xl">🤝</span>
                  <strong className="text-xs font-bold text-cyan-300 group-hover:text-cyan-200">À Mi-Chemin</strong>
                  <span className="text-[10px] text-slate-400">
                    Trouver le resto équidistant
                  </span>
                </button>
              )}

              {/* Régimes & 100% Halal */}
              {onOpenDietaryFilters && (
                <button
                  onClick={() => {
                    setToolsOpen(false);
                    onOpenDietaryFilters();
                  }}
                  className="p-3.5 rounded-2xl bg-[#12121A] border border-emerald-500/35 hover:border-emerald-400 text-left flex flex-col gap-1 transition-all group cursor-pointer shadow-sm"
                >
                  <span className="text-2xl">🛡️</span>
                  <strong className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200">Régimes & Halal</strong>
                  <span className="text-[10px] text-slate-400">
                    Certifié, Végé, Sans Gluten
                  </span>
                </button>
              )}

              {/* Installer sur téléphone */}
              {onOpenPWAInstall && (
                <button
                  onClick={() => {
                    setToolsOpen(false);
                    onOpenPWAInstall();
                  }}
                  className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/25 via-amber-400/15 to-transparent border border-amber-400 text-left flex flex-col gap-1 transition-all group cursor-pointer col-span-2"
                >
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-5 h-5 text-amber-300" />
                    <strong className="text-xs font-black text-amber-200">Sur mon Téléphone</strong>
                  </div>
                  <span className="text-[11px] text-amber-100/90">
                    Installer l'application sur ton écran d'accueil (iPhone & Android)
                  </span>
                </button>
              )}
            </div>

            <div className="pt-2 text-center text-[11px] text-amber-200/50 border-t border-amber-500/20">
              L'Appli Gourmande Île-de-France · Édition Noire & Or 24K · Curation d'Élite & Pépites Vérifiées
            </div>
          </div>
        </div>
      )}
    </>
  );
};
