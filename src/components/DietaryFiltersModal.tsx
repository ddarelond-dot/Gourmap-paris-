import React from "react";
import { X, Check, Sparkles, ShieldCheck, Sun, Moon, Utensils, Award } from "lucide-react";

export interface DietaryFilterState {
  halalStrict: boolean;
  vegetarian: boolean;
  terrace: boolean;
  lateNight: boolean;
  budgetUnder10: boolean;
  fastService: boolean;
  tiktokViral: boolean;
  topRatedOnly: boolean;
}

interface DietaryFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: DietaryFilterState;
  onUpdateFilters: (newFilters: DietaryFilterState) => void;
  totalMatchingCount: number;
}

export const DietaryFiltersModal: React.FC<DietaryFiltersModalProps> = ({
  isOpen,
  onClose,
  filters,
  onUpdateFilters,
  totalMatchingCount,
}) => {
  if (!isOpen) return null;

  const toggle = (key: keyof DietaryFilterState) => {
    onUpdateFilters({
      ...filters,
      [key]: !filters[key],
    });
  };

  const reset = () => {
    onUpdateFilters({
      halalStrict: false,
      vegetarian: false,
      terrace: false,
      lateNight: false,
      budgetUnder10: false,
      fastService: false,
      tiktokViral: false,
      topRatedOnly: false,
    });
  };

  const OPTIONS: Array<{
    key: keyof DietaryFilterState;
    title: string;
    desc: string;
    emoji: string;
    badge?: string;
  }> = [
    {
      key: "halalStrict",
      title: "100% Halal Certifié",
      desc: "Viandes certifiées, préparations artisanales sans porc ni alcool",
      emoji: "🕌",
      badge: "Certifié AVS/Achahada",
    },
    {
      key: "budgetUnder10",
      title: "Box & Formules ≤ 10 €",
      desc: "Menue étudiant, smash + frites ou box TikTok sous la barre des 10€",
      emoji: "💸",
      badge: "Anti-Inflation",
    },
    {
      key: "vegetarian",
      title: "Options Végétariennes & Veggie",
      desc: "Falafels dorés, pizzas légumes grillés, currys et bowls sains",
      emoji: "🥗",
    },
    {
      key: "lateNight",
      title: "Faim Nocturne (Ouvert Tard)",
      desc: "Spots en direct ouverts après 23h, minuit ou 02h du matin",
      emoji: "🌙",
      badge: "Nocturne",
    },
    {
      key: "terrace",
      title: "Grande Terrasse Ensoleillée",
      desc: "Tables extérieures, cours pavées et terrasses chauffées en hiver",
      emoji: "☀️",
    },
    {
      key: "tiktokViral",
      title: "Spots Viraux TikTok & Reels",
      desc: "Fromage fondu étirable, burgers coulants et adresses tendances",
      emoji: "🔥",
      badge: "Buzz TikTok",
    },
    {
      key: "topRatedOnly",
      title: "Notes d'Élite (★ 4.8+ & 200+ avis)",
      desc: "Uniquement les meilleures tables plébiscitées par les gourmets",
      emoji: "⭐",
    },
    {
      key: "fastService",
      title: "Service Express (< 10 min)",
      desc: "Idéal pour pause déj rapide, à emporter ou avant le cinéma",
      emoji: "⚡",
    },
  ];

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-[#0A0A10] border border-amber-500/35 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="px-5 py-4 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shadow-amber-500/30">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans font-black text-lg text-white">
                  Régimes & Exigences Alimentaires
                </h3>
                {activeCount > 0 && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                    {activeCount} actif{activeCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-200/70">
                Filtre sur-mesure parmi la sélection vérifiée de Paris et toute l'Île-de-France
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="p-5 overflow-y-auto space-y-2.5 no-scrollbar">
          {OPTIONS.map((opt) => {
            const isActive = filters[opt.key];
            return (
              <div
                key={opt.key}
                onClick={() => toggle(opt.key)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isActive
                    ? "bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/10"
                    : "bg-[#12121A] border-zinc-800 hover:border-amber-500/30"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                      isActive ? "bg-amber-400 text-slate-950" : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {opt.emoji}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-sm text-white">
                        {opt.title}
                      </h4>
                      {opt.badge && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-1">
                      {opt.desc}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                    isActive
                      ? "bg-amber-400 border-amber-400 text-slate-950"
                      : "border-zinc-700 bg-transparent"
                  }`}
                >
                  {isActive && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-amber-500/20 bg-[#0E0E16] flex items-center justify-between gap-3">
          <button
            onClick={reset}
            className="text-xs font-bold text-zinc-400 hover:text-white transition-colors"
          >
            Réinitialiser
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/25 transition-all cursor-pointer"
          >
            Afficher ({totalMatchingCount.toLocaleString("fr-FR")} adresses)
          </button>
        </div>
      </div>
    </div>
  );
};
