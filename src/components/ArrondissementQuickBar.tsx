import React, { useState } from "react";
import { MapPin, Sparkles, Compass } from "lucide-react";

export const PARIS_ARRONDISSEMENTS = [
  { id: "Toutes", label: "🌟 Tout Paris & IDF", short: "Tout IDF", dept: "all" },
  // Paris 75
  { id: "1er", label: "1er Louvre / Palais-Royal", short: "1er Louvre", dept: "75" },
  { id: "2e", label: "2e Sentier / Montorgueil", short: "2e Sentier", dept: "75" },
  { id: "3e", label: "3e Haut-Marais / Arts", short: "3e Marais", dept: "75" },
  { id: "4e", label: "4e Marais / Saint-Paul", short: "4e Marais", dept: "75" },
  { id: "5e", label: "5e Quartier Latin / Mouffetard", short: "5e Q. Latin", dept: "75" },
  { id: "6e", label: "6e Saint-Germain-des-Prés", short: "6e St-Germain", dept: "75" },
  { id: "7e", label: "7e Tour Eiffel / Invalides", short: "7e Tour Eiffel", dept: "75" },
  { id: "8e", label: "8e Champs-Élysées / Madeleine", short: "8e Champs-Élysées", dept: "75" },
  { id: "9e", label: "9e Opéra / Pigalle / Martyrs", short: "9e Pigalle", dept: "75" },
  { id: "10e", label: "10e Canal Saint-Martin / Faubourg", short: "10e Canal", dept: "75" },
  { id: "11e", label: "11e Bastille / Oberkampf / Roquette", short: "11e Oberkampf", dept: "75" },
  { id: "12e", label: "12e Aligre / Nation / Bercy", short: "12e Nation", dept: "75" },
  { id: "13e", label: "13e Chinatown / BNF / Butte", short: "13e Chinatown", dept: "75" },
  { id: "14e", label: "14e Montparnasse / Daguerre", short: "14e Montparnasse", dept: "75" },
  { id: "15e", label: "15e Convention / Beaugrenelle", short: "15e Beaugrenelle", dept: "75" },
  { id: "16e", label: "16e Passy / Auteuil / Trocadéro", short: "16e Passy", dept: "75" },
  { id: "17e", label: "17e Batignolles / Ternes", short: "17e Batignolles", dept: "75" },
  { id: "18e", label: "18e Montmartre / Abbesses", short: "18e Montmartre", dept: "75" },
  { id: "19e", label: "19e Belleville / Buttes-Chaumont", short: "19e Belleville", dept: "75" },
  { id: "20e", label: "20e Gambetta / Ménilmontant", short: "20e Gambetta", dept: "75" },
  // Hauts-de-Seine 92
  { id: "Boulogne", label: "Boulogne-Billancourt", short: "Boulogne 92", dept: "92" },
  { id: "Levallois", label: "Levallois-Perret", short: "Levallois 92", dept: "92" },
  { id: "Neuilly", label: "Neuilly-sur-Seine", short: "Neuilly 92", dept: "92" },
  { id: "Courbevoie", label: "Courbevoie & La Défense", short: "La Défense 92", dept: "92" },
  { id: "Nanterre", label: "Nanterre", short: "Nanterre 92", dept: "92" },
  { id: "Asnières", label: "Asnières-sur-Seine", short: "Asnières 92", dept: "92" },
  { id: "Clichy", label: "Clichy-la-Garenne", short: "Clichy 92", dept: "92" },
  { id: "Issy", label: "Issy-les-Moulineaux", short: "Issy 92", dept: "92" },
  { id: "Montrouge", label: "Montrouge", short: "Montrouge 92", dept: "92" },
  { id: "Rueil", label: "Rueil-Malmaison", short: "Rueil 92", dept: "92" },
  { id: "Suresnes", label: "Suresnes", short: "Suresnes 92", dept: "92" },
  { id: "Puteaux", label: "Puteaux", short: "Puteaux 92", dept: "92" },
  { id: "Antony", label: "Antony", short: "Antony 92", dept: "92" },
  // Seine-Saint-Denis 93
  { id: "Saint-Denis", label: "Saint-Denis & Pleyel", short: "St-Denis 93", dept: "93" },
  { id: "Saint-Ouen", label: "Saint-Ouen & Puces", short: "St-Ouen 93", dept: "93" },
  { id: "Montreuil", label: "Montreuil", short: "Montreuil 93", dept: "93" },
  { id: "Pantin", label: "Pantin & Canal", short: "Pantin 93", dept: "93" },
  { id: "Aubervilliers", label: "Aubervilliers", short: "Aubervilliers 93", dept: "93" },
  { id: "Bagnolet", label: "Bagnolet & Les Lilas", short: "Bagnolet 93", dept: "93" },
  { id: "Bobigny", label: "Bobigny", short: "Bobigny 93", dept: "93" },
  { id: "Noisy", label: "Noisy-le-Grand", short: "Noisy 93", dept: "93" },
  { id: "Aulnay", label: "Aulnay-sous-Bois", short: "Aulnay 93", dept: "93" },
  { id: "Drancy", label: "Drancy", short: "Drancy 93", dept: "93" },
  { id: "Bondy", label: "Bondy", short: "Bondy 93", dept: "93" },
  { id: "Rosny", label: "Rosny-sous-Bois", short: "Rosny 93", dept: "93" },
  // Val-de-Marne 94
  { id: "Créteil", label: "Créteil & Bords de Marne", short: "Créteil 94", dept: "94" },
  { id: "Vincennes", label: "Vincennes", short: "Vincennes 94", dept: "94" },
  { id: "Saint-Mandé", label: "Saint-Mandé", short: "St-Mandé 94", dept: "94" },
  { id: "Charenton", label: "Charenton-le-Pont", short: "Charenton 94", dept: "94" },
  { id: "Ivry", label: "Ivry-sur-Seine", short: "Ivry 94", dept: "94" },
  { id: "Villejuif", label: "Villejuif", short: "Villejuif 94", dept: "94" },
  { id: "Vitry", label: "Vitry-sur-Seine", short: "Vitry 94", dept: "94" },
  { id: "Maisons-Alfort", label: "Maisons-Alfort", short: "Maisons-Alfort 94", dept: "94" },
  { id: "Fontenay", label: "Fontenay-sous-Bois", short: "Fontenay 94", dept: "94" },
  { id: "Champigny", label: "Champigny-sur-Marne", short: "Champigny 94", dept: "94" },
  { id: "Alfortville", label: "Alfortville", short: "Alfortville 94", dept: "94" },
  // Yvelines (78)
  { id: "Versailles", label: "Versailles & Château", short: "Versailles 78", dept: "78" },
  { id: "Saint-Germain", label: "Saint-Germain-en-Laye", short: "St-Germain 78", dept: "78" },
  { id: "Poissy", label: "Poissy", short: "Poissy 78", dept: "78" },
  { id: "Sartrouville", label: "Sartrouville", short: "Sartrouville 78", dept: "78" },
  { id: "Mantes", label: "Mantes-la-Jolie", short: "Mantes 78", dept: "78" },
  { id: "Rambouillet", label: "Rambouillet", short: "Rambouillet 78", dept: "78" },
  // Val-d'Oise (95)
  { id: "Cergy", label: "Cergy-Pontoise", short: "Cergy 95", dept: "95" },
  { id: "Argenteuil", label: "Argenteuil", short: "Argenteuil 95", dept: "95" },
  { id: "Sarcelles", label: "Sarcelles", short: "Sarcelles 95", dept: "95" },
  { id: "Enghien", label: "Enghien-les-Bains", short: "Enghien 95", dept: "95" },
  { id: "Montmorency", label: "Montmorency & Deuil", short: "Montmorency 95", dept: "95" },
  { id: "Pontoise", label: "Pontoise", short: "Pontoise 95", dept: "95" },
  // Essonne (91)
  { id: "Massy", label: "Massy-Palaiseau", short: "Massy 91", dept: "91" },
  { id: "Évry", label: "Évry-Courcouronnes", short: "Évry 91", dept: "91" },
  { id: "Corbeil", label: "Corbeil-Essonnes", short: "Corbeil 91", dept: "91" },
  { id: "Palaiseau", label: "Palaiseau & Saclay", short: "Palaiseau 91", dept: "91" },
  { id: "Sainte-Geneviève", label: "Ste-Geneviève-des-Bois", short: "Ste-Geneviève 91", dept: "91" },
  // Seine-et-Marne (77)
  { id: "Meaux", label: "Meaux", short: "Meaux 77", dept: "77" },
  { id: "Chelles", label: "Chelles", short: "Chelles 77", dept: "77" },
  { id: "Melun", label: "Melun & Sénart", short: "Melun 77", dept: "77" },
  { id: "Fontainebleau", label: "Fontainebleau", short: "Fontainebleau 77", dept: "77" },
  { id: "Torcy", label: "Torcy & Val d'Europe", short: "Torcy 77", dept: "77" },
];

interface ArrondissementQuickBarProps {
  selectedZone: string;
  onSelectZone: (zone: string) => void;
  placesCount?: number;
}

export const ArrondissementQuickBar: React.FC<ArrondissementQuickBarProps> = ({
  selectedZone,
  onSelectZone,
  placesCount,
}) => {
  const [activeDept, setActiveDept] = useState<"all" | "75" | "92" | "93" | "94" | "78" | "91" | "95" | "77">("all");

  const filteredDistricts = PARIS_ARRONDISSEMENTS.filter((arr) => {
    if (activeDept === "all") return true;
    if (arr.id === "Toutes") return true;
    return arr.dept === activeDept;
  });

  return (
    <div className="w-full px-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-wider text-amber-300/90 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>Explorer les Pépites par Quartier & Ville (Paris & IDF)</span>
        </span>
        {selectedZone !== "Toutes" && (
          <button
            onClick={() => onSelectZone("Toutes")}
            className="text-[10px] font-bold text-amber-400 hover:text-white cursor-pointer transition-colors"
          >
            ✕ Réinitialiser ({selectedZone})
          </button>
        )}
      </div>

      {/* 8 Departments Quick Group Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: "all", label: "🌟 Tout IDF" },
          { id: "75", label: "🗼 Paris (75)" },
          { id: "92", label: "🏢 92 Hauts-de-Seine" },
          { id: "93", label: "🎨 93 Seine-St-Denis" },
          { id: "94", label: "🌳 94 Val-de-Marne" },
          { id: "78", label: "🏰 78 Yvelines" },
          { id: "91", label: "🚀 91 Essonne" },
          { id: "95", label: "✈️ 95 Val-d'Oise" },
          { id: "77", label: "🌲 77 Seine-et-Marne" },
        ].map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveDept(d.id as any)}
            className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              activeDept === d.id
                ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                : "bg-[#141420] text-zinc-400 border border-white/5 hover:text-white"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Horizontal Arrondissement / Commune Scroller */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {filteredDistricts.map((arr) => {
          const isSelected =
            arr.id === "Toutes"
              ? selectedZone === "Toutes"
              : selectedZone.toLowerCase().includes(arr.id.toLowerCase());

          return (
            <button
              key={arr.id}
              onClick={() => onSelectZone(arr.id === "Toutes" ? "Toutes" : arr.id)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                isSelected
                  ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black shadow-md shadow-amber-500/25 scale-102"
                  : "bg-[#141420] text-zinc-300 border border-amber-500/20 hover:border-amber-400/60 hover:text-amber-200"
              }`}
            >
              {arr.short}
            </button>
          );
        })}
      </div>
    </div>
  );
};
