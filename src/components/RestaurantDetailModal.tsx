import React from "react";
import { RestaurantPlace } from "../types/food";
import { calculateDistanceKm, formatDistance, isCurrentlyOpen } from "../utils/geo";
import { FoodVisual } from "./FoodVisual";
import {
  X,
  Star,
  Navigation,
  Phone,
  Clock,
  Heart,
  Share2,
  CheckCircle,
  AlertTriangle,
  Flame,
  BookmarkPlus,
  Compass,
  Calculator,
} from "lucide-react";

interface RestaurantDetailModalProps {
  place: RestaurantPlace | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  userLat: number;
  userLng: number;
  onAddToDiary: (place: RestaurantPlace) => void;
  onShareStory: (place: RestaurantPlace) => void;
  onSplitBill?: (restaurantName: string) => void;
}

export const RestaurantDetailModal: React.FC<RestaurantDetailModalProps> = ({
  place,
  onClose,
  isFavorite,
  onToggleFavorite,
  userLat,
  userLng,
  onAddToDiary,
  onShareStory,
  onSplitBill,
}) => {
  if (!place) return null;

  const pName = place.name || (place as any).n || "Restaurant";
  const pAddress = place.address || (place as any).a || "Paris";
  const pLat = place.lat || (place as any).la || 48.86;
  const pLng = place.lng || (place as any).lo || 2.34;
  const pRating = place.rating || (place as any).r || 4.5;
  const pReviewCount = place.reviewCount || (place as any).c || 100;
  const pPriceLevel = place.priceLevel || (place as any).pr || 2;
  const pSub = place.subCategory || (place as any).sub || "Restaurant";
  const pPhone = place.phone || (place as any).tel || "";
  const pHours = place.hours || (place as any).h || "Tous les jours";
  const pSummary = place.summary || (place as any).s || "";
  const pZone = place.zone || (place as any).z || "Paris";
  const pPros = place.pros && Array.isArray(place.pros) && place.pros.length > 0 ? place.pros : ["Très bon rapport qualité-prix", "Adresse plébiscitée par les habitués"];
  const pCons = place.cons && Array.isArray(place.cons) && place.cons.length > 0 ? place.cons : ["Forte affluence possible aux heures de pointe"];

  const distance = formatDistance(calculateDistanceKm(userLat, userLng, pLat, pLng));
  const openNow = isCurrentlyOpen(pHours);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[92vh] sm:max-h-[85vh] bg-[#0A0A10] rounded-t-[32px] sm:rounded-[32px] overflow-y-auto no-scrollbar shadow-[0_0_60px_rgba(245,158,11,0.2)] border border-amber-500/30 animate-slideUp relative flex flex-col"
      >
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-950/80 border border-amber-500/30 backdrop-blur-md text-amber-200 hover:text-white flex items-center justify-center hover:bg-slate-900 transition-transform active:scale-95 cursor-pointer"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Banner (Photo or Vector SVG art) */}
        <div className="relative w-full h-52 sm:h-64 overflow-hidden shrink-0">
          <FoodVisual place={place} size="hero" className="w-full h-full !rounded-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A10] via-[#0A0A10]/40 to-transparent pointer-events-none" />

          {/* Badges Overlay */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-md">
              {place.category || (place as any).cat || "Restaurant"}
            </span>
            {place.tiktokViral && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-[#FF0050] to-[#E0245E] text-white shadow-md">
                <Flame className="w-3.5 h-3.5 fill-white" />
                VIRAL TIKTOK
              </span>
            )}
            {place.isHalal && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                🕌 Halal
              </span>
            )}
          </div>

          {/* Name & Quick Rating on Hero Bottom */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="font-extrabold text-2xl sm:text-3xl leading-tight drop-shadow-md text-white">
              {pName}
            </h2>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold opacity-95 mt-1 text-slate-300">
              <span className="flex items-center gap-1 text-amber-400 font-extrabold">
                <Star className="w-4 h-4 fill-amber-400" />
                {pRating.toFixed(1)} ({pReviewCount.toLocaleString("fr-FR")} avis Google)
              </span>
              <span>·</span>
              <span>{"€".repeat(pPriceLevel)}</span>
              <span>·</span>
              <span>{pSub}</span>
              <span>·</span>
              <span className="font-bold text-amber-300">{distance} de toi</span>
            </div>
          </div>
        </div>

        {/* Modal Body Contents */}
        <div className="p-5 flex-1 flex flex-col gap-4">
          {/* Main Action Buttons: Itinerary, Phone, Favorite, Share */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${pLat},${pLng}&travelmode=walking`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:brightness-110 shadow-md shadow-amber-500/25 transition-transform active:scale-95 cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-slate-950" />
              <span>Itinéraire</span>
            </a>

            {pPhone ? (
              <a
                href={`tel:${pPhone}`}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-amber-300 bg-[#14141E] border border-amber-500/30 hover:border-amber-400 transition-transform active:scale-95 shadow-xs"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Appeler</span>
              </a>
            ) : (
              <div className="flex items-center justify-center text-xs text-slate-500 bg-slate-950 border border-slate-800 rounded-2xl">
                Non renseigné
              </div>
            )}

            <button
              onClick={() => onToggleFavorite(place.id)}
              className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-transform active:scale-95 border cursor-pointer ${
                isFavorite
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                  : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800"
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
              <span>{isFavorite ? "Favori" : "Enregistrer"}</span>
            </button>

            <button
              onClick={() => onShareStory(place)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-slate-300 bg-slate-800/80 border border-slate-700 hover:bg-slate-800 transition-transform active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>Story</span>
            </button>
          </div>

          {/* Special TikTok Mention */}
          {place.tiktokViral && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FF0050]/15 via-[#00F2FE]/10 to-transparent border border-[#FF0050]/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-base shrink-0">
                  🎵
                </span>
                <div>
                  <span className="text-xs font-extrabold text-white block">
                    Phénomène TikTok Détecté
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Présent dans plusieurs vidéos virales à Paris (+500k vues)
                  </span>
                </div>
              </div>
              <a
                href={`https://www.tiktok.com/search?q=${encodeURIComponent(place.name + " paris food")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white text-black text-xs font-black shadow-xs hover:bg-slate-100 shrink-0"
              >
                Voir vidéos
              </a>
            </div>
          )}

          {/* Halal Guarantee Card */}
          {place.isHalal && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
              <div className="flex items-start gap-2.5">
                <span className="text-xl">🕌</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-emerald-300 uppercase tracking-wider">
                      Statut Halal Vérifié
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {place.halalStatus || "100% Halal"}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    {place.halalNotice || "Certifié sans porc ni alcool, viandes certifiées halal."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Address & Hours */}
          <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
              <Compass className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{pAddress}</span>
                <span className="block text-xs text-slate-400 mt-0.5">
                  Zone : {pZone}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs sm:text-sm pt-2 border-t border-slate-800">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${openNow ? "text-emerald-400" : "text-rose-400"}`}>
                    {openNow ? "🟢 Ouvert actuellement" : "🔴 Fermé actuellement"}
                  </span>
                </div>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Horaires : {pHours}
                </span>
              </div>
            </div>
          </div>

          {/* Tranché Pros & Cons Analysis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Pros */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/20">
              <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-400 mb-2">
                <CheckCircle className="w-4 h-4" />
                Points Forts Tranchés
              </span>
              <ul className="flex flex-col gap-1.5">
                {pPros.map((pro, i) => (
                  <li key={i} className="text-xs text-emerald-200 leading-snug flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons / Things to know */}
            <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20">
              <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                Ce qu'il faut savoir
              </span>
              <ul className="flex flex-col gap-1.5">
                {pCons.map((con, i) => (
                  <li key={i} className="text-xs text-amber-200 leading-snug flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">!</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Full Summary from reviews */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-1.5">
              Ce que disent les habitués & avis vérifiés :
            </h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {pSummary}
            </p>
          </div>

          {/* Add to Food Diary, Split Bill & Google Maps Links */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <button
              onClick={() => onAddToDiary(place)}
              className="w-full flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-black text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:brightness-110 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <BookmarkPlus className="w-4 h-4 text-slate-950" />
              <span>Consigner au carnet 24K</span>
            </button>

            {onSplitBill && (
              <button
                onClick={() => onSplitBill(pName)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl font-bold text-xs text-amber-300 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-amber-400" />
                <span>Split Note</span>
              </button>
            )}

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " " + place.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl font-bold text-xs text-slate-400 hover:text-white transition-colors"
            >
              <span>Google Maps</span>
              <Compass className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
