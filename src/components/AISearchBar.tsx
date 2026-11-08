import React, { useState } from "react";
import { Sparkles, ArrowRight, X, AlertCircle, CheckCircle2 } from "lucide-react";

interface AISearchBarProps {
  onSearch: (query: string) => Promise<void>;
  isLoading: boolean;
  aiResponse: {
    explanation?: string;
    detectedOccasion?: string;
    practicalTip?: string;
  } | null;
  onClearAI: () => void;
}

const QUICK_PROMPTS = [
  { label: "⚡ Box ≤ 10€ TikTok", prompt: "Je veux les box virales TikTok à moins de 10 euros comme la box KFB et les nachos" },
  { label: "🕌 100% Halal Certifié", prompt: "Les meilleurs restos et fast-food 100% halal à Paris et dans le 93" },
  { label: "🏛️ Halles & Marchés", prompt: "Les marchés couverts et halles de street food comme le Marché des Enfants Rouges" },
  { label: "🥐 Brunch & Douceurs", prompt: "Un brunch gourmand ou des croissants et pâtisseries célèbres comme Cédric Grolet" },
  { label: "🌙 Faim après minuit", prompt: "Grosse faim tard dans la nuit après minuit, pas cher et ouvert maintenant" },
  { label: "🎉 Anniversaire & Groupe", prompt: "Repas convivial pour un anniversaire de groupe avec budget raisonnable" },
];

export const AISearchBar: React.FC<AISearchBarProps> = ({
  onSearch,
  isLoading,
  aiResponse,
  onClearAI,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  };

  const handleSelectQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
    onSearch(prompt);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-3 pb-2">
      {/* Search Bar Input Container */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="relative flex-1 flex items-center bg-[#0E0E16] rounded-2xl border border-amber-500/30 focus-within:border-amber-400 focus-within:shadow-[0_0_25px_rgba(245,158,11,0.22)] shadow-xl p-1.5 pl-4 transition-all">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mr-2.5 animate-pulse" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="« 3 potes, box ≤ 10€ halal », « Anniv terrasse Saint-Denis »…"
            className="w-full bg-transparent text-white placeholder-amber-200/40 text-sm outline-none pr-2 font-medium"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue("");
                onClearAI();
              }}
              className="p-1.5 rounded-full text-amber-300/60 hover:text-white mr-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:brightness-110 disabled:opacity-40 transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            {isLoading ? (
              <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Chercher</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Prompt Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 pb-1">
        {QUICK_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectQuickPrompt(item.prompt)}
            className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#14141E] border border-amber-500/20 text-amber-200/90 hover:border-amber-400 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* AI Reasoning Response Banner */}
      {isLoading && (
        <div className="mt-3 p-4 rounded-2xl bg-[#0E0E16] border border-amber-500/30 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
            <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
            <span>Scan instantané de la base des 2 050 adresses…</span>
          </div>
          <div className="h-4 rounded-md animate-shimmer mb-2 w-3/4" />
          <div className="h-3.5 rounded-md animate-shimmer w-1/2" />
        </div>
      )}

      {!isLoading && aiResponse && aiResponse.explanation && (
        <div className="mt-3 p-4 rounded-2xl bg-[#0E0E16] border border-amber-500/40 shadow-xl transition-all animate-fadeIn">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm">
                <Sparkles className="w-3 h-3 text-slate-950" />
                IA L'Appli Gourmande 24K
              </span>
              {aiResponse.detectedOccasion && (
                <span className="text-xs font-bold text-amber-300">
                  Occasion : {aiResponse.detectedOccasion}
                </span>
              )}
            </div>
            <button
              onClick={onClearAI}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
              title="Fermer l'analyse"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm font-medium text-slate-200 leading-relaxed mb-2">
            {aiResponse.explanation}
          </p>

          {aiResponse.practicalTip && (
            <div className="flex items-start gap-2 pt-2 border-t border-amber-500/20 text-xs text-amber-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Astuce de terrain : {aiResponse.practicalTip}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
