import React, { useState } from "react";
import { Sparkles, Calendar, ArrowRight, Flame, Clock } from "lucide-react";
import { getActiveWeeklySpotlight, getFutureSpotlightIn3Weeks } from "../utils/timeBasedEvolution";

interface WeeklyEvolutionBannerProps {
  onSearchTopic: (query: string) => void;
}

export const WeeklyEvolutionBanner: React.FC<WeeklyEvolutionBannerProps> = ({ onSearchTopic }) => {
  const [showFutureDrop, setShowFutureDrop] = useState(false);
  const current = getActiveWeeklySpotlight();
  const future = getFutureSpotlightIn3Weeks();

  return (
    <div className="px-4">
      <div
        className={`p-4 rounded-3xl bg-gradient-to-r ${current.themeColor} border border-amber-500/35 relative overflow-hidden shadow-lg transition-all`}
      >
        {/* Subtle background glow */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-2 relative z-10">
          {/* Header Row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
              <Flame className="w-3 h-3 text-slate-950 fill-slate-950" />
              <span>{current.badge}</span>
            </span>

            <button
              onClick={() => setShowFutureDrop(!showFutureDrop)}
              className="text-[11px] font-bold text-amber-200/90 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>{showFutureDrop ? "Fermer l'aperçu" : "🔮 Voir ce qui arrive dans 3 semaines"}</span>
            </button>
          </div>

          {/* Main Title & Subtitle */}
          <div>
            <h3 className="font-sans font-black text-base sm:text-lg text-white leading-tight">
              {current.title}
            </h3>
            <p className="text-xs text-amber-100/80 mt-0.5 line-clamp-1">
              {current.subtitle}
            </p>
          </div>

          {/* Featured Banger of the Week */}
          <div className="p-2.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl shrink-0">{current.bangerOfTheWeek.emoji}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <strong className="text-xs font-black text-amber-300 truncate">
                    {current.bangerOfTheWeek.placeName}
                  </strong>
                  <span className="text-[10px] text-zinc-400">·</span>
                  <span className="text-xs font-bold text-white truncate">
                    {current.bangerOfTheWeek.dish}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-300 line-clamp-1">
                  "{current.bangerOfTheWeek.quote}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                {current.bangerOfTheWeek.price}
              </span>
              <button
                onClick={() => onSearchTopic(current.searchFilter)}
                className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
              >
                <span>Explorer</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Future Drop Preview (dans 3 semaines) */}
          {showFutureDrop && (
            <div className="mt-1 p-3 rounded-2xl bg-[#0D0D14]/90 border border-purple-500/40 text-xs text-purple-200 animate-fadeIn flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-purple-300 font-black">
                <span>🔮</span>
                <span className="uppercase text-[10px] tracking-wider">Évolution automatique dans 3 semaines :</span>
              </div>
              <p className="text-white font-bold">
                {future.title} ({future.badge})
              </p>
              <p className="text-[11px] text-zinc-400">
                L'application s'actualise au fil du calendrier : nouveaux drops, menus éphémères et focus bangers tournent sans aucune mise à jour requise.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
