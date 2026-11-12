import React from "react";
import { RawPlace } from "../data/rawDatabase";

interface UberEatsStyleCategoriesProps {
  onSelectCategory: (categoryKey: string | null) => void;
  selectedCategory?: string | null;
  allPlaces?: RawPlace[];
}

export const UBER_EATS_CATEGORIES = [
  { key: "poulet", name: "Poulet & Tenders", icon: "🍗" },
  { key: "burger", name: "Burgers & Smash", icon: "🍔" },
  { key: "pizza", name: "Pizzas", icon: "🍕" },
  { key: "sushi", name: "Sushis & Japonais", icon: "🍣" },
  { key: "kebab", name: "Kebabs & Grill", icon: "🥙" },
  { key: "tacos", name: "Tacos Français", icon: "🌮" },
  { key: "naan", name: "Cheese Naan & Indien", icon: "🫓" },
  { key: "ramen", name: "Ramens & Noodles", icon: "🍜" },
  { key: "steak", name: "Viandes & Steakhouses", icon: "🥩" },
  { key: "boulangerie", name: "Pâtisseries & Goûter", icon: "🥐" },
  { key: "couscous", name: "Couscous & Tajines", icon: "🥘" },
  { key: "pâtes", name: "Pâtes & Italien", icon: "🍝" },
];

export const UberEatsStyleCategories: React.FC<UberEatsStyleCategoriesProps> = ({
  onSelectCategory,
  selectedCategory,
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5 py-1">
      <div className="px-1 flex items-center justify-between text-xs">
        <span className="font-bold text-zinc-300">Catégories</span>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
          >
            Voir tout
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
        {UBER_EATS_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => onSelectCategory(isSelected ? null : cat.key)}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? "bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/25 border border-amber-300 scale-[1.02]"
                  : "bg-[#12121A] text-zinc-300 border border-zinc-800/80 hover:border-amber-400/50 hover:text-white"
              }`}
            >
              <span className="text-lg leading-none">{cat.icon}</span>
              <span className="whitespace-nowrap">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
