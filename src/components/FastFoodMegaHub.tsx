import React, { useState } from "react";
import {
  Flame,
  Sparkles,
  Package,
  Star,
  Navigation,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { FAST_FOOD_UNIVERSE, FastFoodBrand } from "../data/fastFoodUniverse";
import { FOOD_DEALS } from "../data/dealsData";
import { FoodDeal, RestaurantPlace } from "../types/food";

interface FastFoodMegaHubProps {
  onSearchBrand: (query: string) => void;
  onSelectDeal: (deal: FoodDeal) => void;
  onOpenBoxGenerator: () => void;
}

export const FastFoodMegaHub: React.FC<FastFoodMegaHubProps> = ({
  onSearchBrand,
  onSelectDeal,
  onOpenBoxGenerator,
}) => {
  const [activeFilter, setActiveFilter] = useState<"all" | "giants" | "boxes" | "hyped">("all");
  const [selectedBrand, setSelectedBrand] = useState<FastFoodBrand | null>(null);

  const giants = FAST_FOOD_UNIVERSE.filter((b) => b.category === "giants");
  const hypedGems = FAST_FOOD_UNIVERSE.filter((b) => b.category === "hyped_gems");

  return (
    <section className="px-4 py-2 flex flex-col gap-3">
      {/* Mega Hub Header with Gold Accent */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🍔</span>
            <h2 className="font-sans font-black text-xl sm:text-2xl text-white tracking-tight">
              Le QG Fast-Food <span className="text-gold-gradient font-black">& Boxs Virales</span>
            </h2>
          </div>
          <p className="text-xs text-amber-200/70 mt-0.5">
            Tous les grands fast-foods connus, les boxs TikTok et les pépites boostées regroupés au même endroit.
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={onOpenBoxGenerator}
          className="px-3 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span>⚡</span>
          <span>Générateur de Box</span>
        </button>
      </div>

      {/* 4 Smart Selector Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#141420] border border-amber-500/20 overflow-x-auto no-scrollbar">
        {[
          { id: "all", label: "🌟 Tout le QG", desc: "Vue complète" },
          { id: "giants", label: "👑 Fast-Foods Connus", desc: "Burger King, Pepe..." },
          { id: "boxes", label: "📦 Boxs ≤ 10€ & TikTok", desc: "Crousti, Naan, Tacos" },
          { id: "hyped", label: "🔥 Pépites Boostées", desc: "KFB, Dumbo, Sürpriz" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`shrink-0 py-2 px-3.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === tab.id
                ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-md shadow-amber-500/25"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ================= 1. LES FAST-FOODS CONNUS (GÉANTS CULTES) ================= */}
      {(activeFilter === "all" || activeFilter === "giants") && (
        <div className="flex flex-col gap-2.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span>👑</span>
              <span>Les Grands Fast-Foods Connus (Drops & Trucs du Moment)</span>
            </span>
            <span className="text-[10px] text-zinc-500">{giants.length} enseignes cultes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {giants.map((brand) => (
              <div
                key={brand.id}
                onClick={() => setSelectedBrand(brand)}
                className="p-3.5 rounded-3xl bg-[#12121A] border border-amber-500/20 hover:border-amber-400 transition-all flex flex-col justify-between gap-3 shadow-md hover:shadow-amber-500/10 cursor-pointer group relative overflow-hidden"
              >
                {/* Brand Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                      {brand.logoEmoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-sans font-black text-sm text-white group-hover:text-amber-300 transition-colors">
                          {brand.name}
                        </h4>
                        {brand.isHalal && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Halal
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-1">
                        {brand.tagline}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-200/80">{brand.priceLevel}</span>
                </div>

                {/* LE TRUC DU MOMENT (ICONIQUE & PERCUTANT) */}
                <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#181824] to-[#12121A] border border-amber-400/30 flex flex-col gap-1 relative">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${brand.currentBangerDrop.badgeColor} shadow-xs`}>
                      {brand.currentBangerDrop.badge}
                    </span>
                    <span className="text-xs font-black text-amber-300">
                      {brand.currentBangerDrop.price}
                    </span>
                  </div>
                  <h5 className="font-sans font-black text-xs text-white leading-snug line-clamp-1">
                    {brand.currentBangerDrop.title}
                  </h5>
                  <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
                    {brand.currentBangerDrop.description}
                  </p>
                </div>

                {/* Famous items pills & search CTA */}
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <div className="flex items-center gap-1 overflow-hidden text-[10px] text-zinc-400 truncate">
                    <span>Populaire :</span>
                    <span className="text-zinc-300 font-bold truncate">
                      {brand.famousItems.slice(0, 2).join(", ")}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSearchBrand(brand.searchQuery);
                    }}
                    className="shrink-0 px-2.5 py-1 rounded-xl text-[10px] font-black bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-slate-950 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Trouver</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 2. TOUTES LES BOXS & DEALS ≤ 10€ (TIKTOK & VIRALES) ================= */}
      {(activeFilter === "all" || activeFilter === "boxes") && (
        <div className="flex flex-col gap-2.5 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span>📦</span>
              <span>Toutes les Boxs & Bons Plans ≤ 10 € (TikTok ASMR & Crousti)</span>
            </span>
            <span className="text-[10px] text-zinc-500">{FOOD_DEALS.length} boxs cultes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FOOD_DEALS.slice(0, 6).map((deal) => (
              <div
                key={deal.id}
                onClick={() => onSelectDeal(deal)}
                className="p-3.5 rounded-3xl bg-[#12121A] border border-emerald-500/25 hover:border-emerald-400 transition-all flex flex-col justify-between gap-3 shadow-md hover:shadow-emerald-500/10 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                      {deal.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                          {deal.brand}
                        </span>
                        {deal.isHalal && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Halal
                          </span>
                        )}
                      </div>
                      <h4 className="font-sans font-black text-sm text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                        {deal.title}
                      </h4>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-black/80 text-emerald-400 border border-emerald-500/30 font-black text-xs shrink-0 shadow-xs">
                    {deal.price.toFixed(deal.price % 1 === 0 ? 0 : 2).replace(".", ",")} €
                  </span>
                </div>

                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                  {deal.included}
                </p>

                {/* Secret Hack / Tip */}
                {deal.secretHack && (
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-1.5">
                    <span className="shrink-0">💡</span>
                    <span className="truncate">Hack : {deal.secretHack}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                  <span className="text-zinc-500">{deal.tiktokViews || "Viral TikTok"}</span>
                  <span className="text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Ouvrir la Box →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 3. FAST FOODS MOINS CONNUS MAIS BOOSTÉS (PÉPITES VIRALES) ================= */}
      {(activeFilter === "all" || activeFilter === "hyped") && (
        <div className="flex flex-col gap-2.5 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <span>🔥</span>
              <span>Fast-Foods Moins Connus mais Boostés (Pépites Réseaux & Banlieue)</span>
            </span>
            <span className="text-[10px] text-zinc-500">{hypedGems.length} spots pépite</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {hypedGems.map((gem) => (
              <div
                key={gem.id}
                onClick={() => setSelectedBrand(gem)}
                className="p-3.5 rounded-3xl bg-[#12121A] border border-rose-500/25 hover:border-rose-400 transition-all flex flex-col justify-between gap-3 shadow-md hover:shadow-rose-500/10 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                      {gem.logoEmoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-sans font-black text-sm text-white group-hover:text-rose-300 transition-colors">
                          {gem.name}
                        </h4>
                        {gem.isHalal && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Halal
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-1">
                        {gem.tagline}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-300">{gem.priceLevel}</span>
                </div>

                {/* Le Banger Boosté */}
                <div className="p-2.5 rounded-2xl bg-gradient-to-r from-rose-500/15 via-[#181824] to-[#12121A] border border-rose-400/30 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${gem.currentBangerDrop.badgeColor} shadow-xs`}>
                      {gem.currentBangerDrop.badge}
                    </span>
                    <span className="text-xs font-black text-rose-300">
                      {gem.currentBangerDrop.price}
                    </span>
                  </div>
                  <h5 className="font-sans font-black text-xs text-white leading-snug line-clamp-1">
                    {gem.currentBangerDrop.title}
                  </h5>
                  <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
                    {gem.currentBangerDrop.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-[10px] text-zinc-400 truncate">
                    Banger : <strong className="text-white">{gem.famousItems[0]}</strong>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSearchBrand(gem.searchQuery);
                    }}
                    className="shrink-0 px-2.5 py-1 rounded-xl text-[10px] font-black bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Voir spots</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brand Detail Modal (When user clicks on any Fast Food brand) */}
      {selectedBrand && (
        <div
          onClick={() => setSelectedBrand(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg bg-[#0C0C14] rounded-t-[32px] sm:rounded-[32px] border border-amber-500/35 p-5 sm:p-6 flex flex-col gap-4 text-white shadow-2xl relative animate-slideUp"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0">
                  {selectedBrand.logoEmoji}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-sans font-black text-lg text-white">
                      {selectedBrand.name}
                    </h3>
                    {selectedBrand.isHalal && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        100% Halal
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">{selectedBrand.tagline}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBrand(null)}
                className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Le truc du moment */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#161622] to-amber-500/10 border border-amber-500/40 flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${selectedBrand.currentBangerDrop.badgeColor}`}>
                  {selectedBrand.currentBangerDrop.badge}
                </span>
                <span className="text-sm font-black text-amber-300">
                  {selectedBrand.currentBangerDrop.price}
                </span>
              </div>
              <h4 className="font-sans font-black text-sm text-white">
                {selectedBrand.currentBangerDrop.title}
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {selectedBrand.currentBangerDrop.description}
              </p>
            </div>

            {/* Best items to order */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                Les classiques à commander les yeux fermés :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedBrand.famousItems.map((item) => (
                  <span
                    key={item}
                    className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#181824] border border-white/10 text-zinc-200"
                  >
                    ★ {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Launch search CTA */}
            <button
              onClick={() => {
                const query = selectedBrand.searchQuery;
                setSelectedBrand(null);
                onSearchBrand(query);
              }}
              className="mt-2 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-950" />
              <span>Voir les adresses de {selectedBrand.name} autour de moi</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
