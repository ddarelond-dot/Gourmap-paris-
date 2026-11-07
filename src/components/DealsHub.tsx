import React, { useState } from "react";
import { FoodDeal, RestaurantPlace } from "../types/food";
import { FOOD_DEALS } from "../data/dealsData";
import { calculateDistanceKm, formatDistance } from "../utils/geo";
import {
  Flame,
  Navigation,
  Sparkles,
  ShieldCheck,
  Play,
  Share2,
  Check,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

interface DealsHubProps {
  places: RestaurantPlace[];
  userLat: number;
  userLng: number;
  onSelectPlace: (place: RestaurantPlace) => void;
  onOpenTikTokModal?: (deal: FoodDeal) => void;
}

export const DealsHub: React.FC<DealsHubProps> = ({
  places,
  userLat,
  userLng,
  onSelectPlace,
  onOpenTikTokModal,
}) => {
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [onlyHalal, setOnlyHalal] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ["Tous", "Box", "Poulet", "Burger", "Tacos", "Asie"];

  const filteredDeals = FOOD_DEALS.filter((d) => {
    if (maxPrice !== null && d.price > maxPrice) return false;
    if (selectedCategory !== "Tous" && d.category !== selectedCategory) return false;
    if (onlyHalal && !d.isHalal) return false;
    return true;
  });

  const getNearestRestaurantForDeal = (deal: FoodDeal): RestaurantPlace => {
    if (deal.restaurantIds && deal.restaurantIds.length > 0) {
      const matched = places.find((p) => p.id === deal.restaurantIds![0]);
      if (matched) return matched;
    }

    const matchingPlaces = places.filter((p) => {
      const pName = (p.name || p.n || "").toLowerCase();
      const bName = deal.brand.toLowerCase();
      return (
        pName.includes(bName.slice(0, 5)) ||
        (deal.id.startsWith("kfb") && pName.includes("kfb")) ||
        (deal.id.startsWith("chicken-street") && pName.includes("chicken")) ||
        (deal.id.startsWith("nach") && (pName.includes("nach") || pName.includes("tacos"))) ||
        (deal.id.startsWith("dumbo") && pName.includes("dumbo")) ||
        (deal.id.startsWith("wesh") && pName.includes("wesh")) ||
        (deal.id.startsWith("surpriz") && (pName.includes("sürpriz") || pName.includes("kebab"))) ||
        (deal.id.startsWith("mian") && pName.includes("mian")) ||
        (deal.id.startsWith("cot-cot") && pName.includes("cot")) ||
        (deal.id.startsWith("bouillon") && pName.includes("bouillon")) ||
        (deal.id.startsWith("popolare") && (pName.includes("popolare") || pName.includes("mamma"))) ||
        (deal.id.startsWith("mamiche") && pName.includes("mamiche")) ||
        (deal.id.startsWith("pho") && pName.includes("pho")) ||
        (deal.id.startsWith("bmk") && pName.includes("bmk")) ||
        (deal.id.startsWith("otacos") && pName.includes("tacos"))
      );
    });

    if (!matchingPlaces.length) return places[0];

    return [...matchingPlaces].sort((a, b) => {
      return (
        calculateDistanceKm(userLat, userLng, a.lat || a.la || 0, a.lng || a.lo || 0) -
        calculateDistanceKm(userLat, userLng, b.lat || b.la || 0, b.lng || b.lo || 0)
      );
    })[0];
  };

  const handleShareDeal = (deal: FoodDeal, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText?.(
      `Regarde la ${deal.title} (${deal.price.toFixed(2)}€) chez ${deal.brand} sur GourMap !`
    );
    setCopiedId(deal.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 space-y-6">
      {/* Top Banner Hero: 24K Gold & Obsidian Glass */}
      <div className="relative overflow-hidden rounded-[32px] p-6 bg-gradient-to-r from-[#0C0C12] via-[#1A140C] to-[#120E08] text-white border border-amber-500/30 shadow-2xl shadow-amber-500/10">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md">
              <Flame className="w-3.5 h-3.5 text-slate-950" />
              BOX VIRALES TIKTOK & MENUS ≤ 10 €
            </span>
            <span className="text-xs font-semibold text-amber-200/80">
              {FOOD_DEALS.length} formules complètes vérifiées
            </span>
          </div>

          <h2 className="font-sans font-black text-3xl md:text-4xl leading-tight text-white tracking-tight">
            Les Box à moins de 10 € qui <span className="text-gold-gradient font-black">cartonnent</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Poulet croustillant mariné, naans chauds coulants au tandoor, smash burgers double cheddar et loaded boxes au meilleur prix de Paris et banlieue.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-200/80">
              <span>🍗 Tenders XXL</span>
              <span>·</span>
              <span>🫓 Cheese Naan chaud</span>
              <span>·</span>
              <span className="text-emerald-400">🕌 100% Halal certifié</span>
            </div>
          </div>
        </div>

        {/* Decorative Floating Accent */}
        <div className="absolute right-4 -bottom-6 text-9xl opacity-10 select-none pointer-events-none text-amber-400">
          📦
        </div>
      </div>

      {/* Filter and Category Segmented Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Price Filters */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-amber-400/80 uppercase tracking-wider whitespace-nowrap">
              Budget max :
            </span>
            {[
              { label: "Tous", val: null },
              { label: "≤ 5 €", val: 5 },
              { label: "≤ 7.50 €", val: 7.5 },
              { label: "≤ 8.90 €", val: 8.9 },
              { label: "≤ 10 €", val: 10 },
            ].map((b) => {
              const active = maxPrice === b.val;
              return (
                <button
                  key={b.label}
                  onClick={() => setMaxPrice(b.val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/25"
                      : "bg-[#14141E] border border-amber-500/20 text-slate-300 hover:border-amber-400/60"
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>

          {/* Halal Toggle */}
          <button
            onClick={() => setOnlyHalal(!onlyHalal)}
            className={`self-start sm:self-auto px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              onlyHalal
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                : "bg-[#14141E] border border-emerald-500/30 text-emerald-300 hover:border-emerald-400"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Halal certifié
          </button>
        </div>

        {/* Categories Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((c) => {
            const active = selectedCategory === c;
            return (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-white text-slate-950 font-black shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {c === "Box" ? "🔥 Toutes les Box" : c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Deals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDeals.map((deal) => {
          const nearestPlace = getNearestRestaurantForDeal(deal);
          const distance = calculateDistanceKm(
            userLat,
            userLng,
            nearestPlace.lat || nearestPlace.la || 0,
            nearestPlace.lng || nearestPlace.lo || 0
          );

          return (
            <div
              key={deal.id}
              onClick={() => onOpenTikTokModal ? onOpenTikTokModal(deal) : onSelectPlace(nearestPlace)}
              className="group relative bg-[#0C0C14] border border-amber-500/25 rounded-[28px] p-5 shadow-sm hover:border-amber-400 hover:shadow-[0_0_35px_rgba(245,158,11,0.18)] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Top Meta Line */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-black tracking-wider uppercase text-amber-400">
                        {deal.brand}
                      </span>
                      <span>·</span>
                      <span>{deal.category}</span>
                      {deal.isHalal && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                            <span>🕌</span> Halal
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="font-sans font-black text-xl text-white mt-1 group-hover:text-amber-300 transition-colors leading-tight">
                      {deal.title}
                    </h3>
                  </div>

                  {/* Price Tag (24K Gold) */}
                  <div className="text-right shrink-0">
                    <span className="px-3.5 py-1 rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-black text-sm shadow-md inline-block">
                      {deal.price.toFixed(deal.price % 1 === 0 ? 0 : 2).replace(".", ",")} €
                    </span>
                    {deal.tiktokViews && (
                      <span className="block text-[10px] font-bold text-amber-300 mt-1">
                        ▶ {deal.tiktokViews}
                      </span>
                    )}
                  </div>
                </div>

                {/* What's in the Box */}
                <div className="p-3 rounded-2xl bg-[#08080C] border border-amber-500/15 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/80 block mb-1">
                    Dans la box :
                  </span>
                  <p className="text-xs font-medium text-slate-300 leading-snug">
                    {deal.included}
                  </p>
                </div>

                {/* Secret Hack */}
                {deal.secretHack && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-slate-200 mb-3 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">
                      <strong className="text-amber-400">Hack secret : </strong>
                      {deal.secretHack}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-amber-500/15 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <Navigation className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold text-white">
                    {formatDistance(distance)} de toi
                  </span>
                  <span>·</span>
                  <span className="truncate max-w-[120px] text-slate-400">{nearestPlace.name || nearestPlace.n}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleShareDeal(deal, e)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Partager ce bon plan"
                  >
                    {copiedId === deal.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenTikTokModal) {
                        onOpenTikTokModal(deal);
                      } else {
                        onSelectPlace(nearestPlace);
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 font-black text-xs hover:brightness-110 transition-all cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-slate-950" />
                    <span>Voir la Box</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
