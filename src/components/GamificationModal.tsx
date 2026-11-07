import React from "react";
import { UserGamification } from "../types/food";
import { GOURMET_BADGES } from "../data/dealsData";
import { X, Award, Flame, Footprints, PiggyBank, CheckCircle2, Lock } from "lucide-react";

interface GamificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  gamification: UserGamification;
}

export const GamificationModal: React.FC<GamificationModalProps> = ({
  isOpen,
  onClose,
  gamification,
}) => {
  if (!isOpen) return null;

  const nextLevelPoints = (gamification.level + 1) * 200;
  const currentLevelProgress = Math.min(100, Math.round((gamification.points % 200) / 2));

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[90vh] bg-white dark:bg-[#0F172A] rounded-3xl overflow-y-auto no-scrollbar shadow-2xl border border-slate-200 dark:border-slate-800 relative flex flex-col p-5 text-slate-900 dark:text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#10B981] text-slate-950 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-sans font-black text-xl text-slate-900 dark:text-white">
                Défis Gourmands & Badges
              </h3>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Débloque des trophées virtuels en explorant Paris & ses pépites
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level and Points Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-[#10B981] to-[#047857] text-slate-950 shadow-lg shadow-[#10B981]/20 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-black/20 text-white backdrop-blur-md">
              NIVEAU {gamification.level}
            </span>
            <span className="font-black text-lg text-slate-950">{gamification.points} Points Gourmands</span>
          </div>
          <h4 className="font-sans font-black text-2xl mb-1 text-slate-950">
            {gamification.levelTitle}
          </h4>
          <p className="text-xs text-slate-950/80 mb-3 font-semibold">
            Plus que {nextLevelPoints - gamification.points} points pour passer au niveau {gamification.level + 1} !
          </p>

          {/* Level Progress Bar */}
          <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-slate-950 h-full rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${currentLevelProgress}%` }}
            />
          </div>
        </div>

        {/* Personal Statistics Dashboard */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className="p-3 rounded-2xl bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 text-center shadow-xs">
            <Flame className="w-5 h-5 text-[#10B981] mx-auto mb-1" />
            <span className="font-black text-lg text-slate-900 dark:text-white block">
              {gamification.placesTestedCount}
            </span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
              Spots testés
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 text-center shadow-xs">
            <Footprints className="w-5 h-5 text-[#06B6D4] mx-auto mb-1" />
            <span className="font-black text-lg text-slate-900 dark:text-white block">
              {gamification.kilometersWalked} km
            </span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
              Parcourus
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 text-center shadow-xs">
            <PiggyBank className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <span className="font-black text-lg text-slate-900 dark:text-white block">
              {gamification.moneySavedEur} €
            </span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
              Économisés
            </span>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tous les trophées à débloquer :
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {GOURMET_BADGES.map((badge) => {
              const isUnlocked = gamification.unlockedBadgeIds.includes(badge.id);

              return (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                    isUnlocked
                      ? "bg-white dark:bg-[#070A11] border-[#10B981]/50 shadow-xs"
                      : "bg-slate-50/50 dark:bg-[#070A11]/50 border-dashed border-slate-300 dark:border-slate-800 opacity-60"
                  }`}
                >
                  <span className="text-2xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shadow-xs">
                    {badge.icon}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        {badge.name}
                      </span>
                      {isUnlocked ? (
                        <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                      {badge.description}
                    </p>
                    <span className="text-[10px] font-black text-[#10B981] block mt-1">
                      Mission : {badge.requirement}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
