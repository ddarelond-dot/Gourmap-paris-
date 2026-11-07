import React from "react";
import { TAXONOMY } from "../data/taxonomy";
import { RawPlace } from "../data/rawDatabase";
import { ChevronRight, Sparkles } from "lucide-react";

interface UberEatsStyleCategoriesProps {
  onSelectCategory: (searchQuery: string, taxIdx: number) => void;
  allPlaces: RawPlace[];
  selectedTaxIndex?: number;
}

// Quick icons & trending tags for top Uber Eats style carousel
export const UBER_EATS_CATEGORIES = [
  { name: "Burgers & Smash", icon: "🍔", tag: "Smash & Bacon", search: "burger", taxIdx: 0 },
  { name: "Poulet & Tenders", icon: "🍗", tag: "Croustillant", search: "poulet", taxIdx: 0 },
  { name: "Pizzas Napolitaines", icon: "🍕", tag: "Feu de bois", search: "pizza", taxIdx: 0 },
  { name: "Sushis & Rolls", icon: "🍣", tag: "Frais minute", search: "sushi", taxIdx: 0 },
  { name: "Kebabs & Döner", icon: "🥙", tag: "Berlinois", search: "kebab", taxIdx: 0 },
  { name: "Tacos & Burritos", icon: "🌮", tag: "Gratiné", search: "tacos", taxIdx: 0 },
  { name: "Ramens & Noodles", icon: "🍜", tag: "Bouillon 14h", search: "ramen", taxIdx: 0 },
  { name: "Cheese Naan", icon: "🫓", tag: "Tandoor coulant", search: "naan", taxIdx: 0 },
  { name: "Cookies & Bakery", icon: "🥐", tag: "Cœur coulant", search: "cookie", taxIdx: 2 },
  { name: "Couscous & Tajines", icon: "🥘", tag: "Royal 5 viandes", search: "couscous", taxIdx: 0 },
  { name: "Pâtes Fraîches", icon: "🍝", tag: "Truffes & Cacio", search: "pâtes", taxIdx: 0 },
  { name: "Brunch & Pancakes", icon: "🥞", tag: "Avocado & Fluffy", search: "brunch", taxIdx: 0 },
  { name: "Healthy & Salades", icon: "🥗", tag: "Bio & Bowls", search: "salade", taxIdx: 0 },
  { name: "Glaces & Desserts", icon: "🍦", tag: "Artisanal", search: "glace", taxIdx: 2 },
];

export const UberEatsStyleCategories: React.FC<UberEatsStyleCategoriesProps> = ({
  onSelectCategory,
  allPlaces,
  selectedTaxIndex,
}) => {
  return (
    <div className="w-full flex flex-col gap-2 pt-1 pb-1">
      {/* Section Header */}
      <div className="px-4 flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Catégories en 1-Clic (Style Uber Eats)</span>
        </span>
        <span className="text-[10px] text-zinc-400">Glisse pour tout voir →</span>
      </div>

      {/* Horizontal Scrollable Circular & Bubble Category Row */}
      <div className="flex items-center gap-3 px-4 overflow-x-auto no-scrollbar py-1">
        {UBER_EATS_CATEGORIES.map((cat, idx) => {
          return (
            <button
              key={cat.name}
              onClick={() => onSelectCategory(cat.search, cat.taxIdx)}
              className="shrink-0 flex flex-col items-center gap-1.5 group cursor-pointer active:scale-95 transition-all text-center"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-gradient-to-br from-[#1C1C28] to-[#12121A] border border-amber-500/25 group-hover:border-amber-400 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center text-3xl sm:text-4xl shadow-md group-hover:scale-105 transition-all relative overflow-hidden">
                <span className="group-hover:rotate-6 transition-transform">{cat.icon}</span>
                <div className="absolute inset-0 bg-amber-400/0 group-hover:bg-amber-400/5 transition-colors" />
              </div>

              <div className="flex flex-col items-center max-w-[76px]">
                <span className="font-sans font-black text-[11px] text-white group-hover:text-amber-300 transition-colors leading-tight line-clamp-1">
                  {cat.name.split(" ")[0]}
                </span>
                <span className="text-[9px] font-semibold text-amber-200/60 line-clamp-1">
                  {cat.tag}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
