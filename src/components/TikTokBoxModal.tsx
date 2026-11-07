import React, { useState } from "react";
import { FoodDeal, RestaurantPlace } from "../types/food";
import { calculateDistanceKm, formatDistance } from "../utils/geo";
import {
  X,
  Volume2,
  VolumeX,
  Heart,
  Share2,
  Navigation,
  Sparkles,
  Flame,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check,
  ExternalLink,
} from "lucide-react";

interface TikTokBoxModalProps {
  deal: FoodDeal | null;
  allDeals: FoodDeal[];
  places: RestaurantPlace[];
  userLat: number;
  userLng: number;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onClose: () => void;
  onSelectDeal: (deal: FoodDeal) => void;
  onSelectPlace: (place: RestaurantPlace) => void;
}

export const TikTokBoxModal: React.FC<TikTokBoxModalProps> = ({
  deal,
  allDeals,
  places,
  userLat,
  userLng,
  isFavorite,
  onToggleFavorite,
  onClose,
  onSelectDeal,
  onSelectPlace,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(true);
  const [liked, setLiked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!deal) return null;

  // Find nearest restaurant
  const matchingPlaces = places.filter((p) => {
    const pName = p.name.toLowerCase();
    const bName = deal.brand.toLowerCase();
    const tName = deal.title.toLowerCase();
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

  const targetPlace = (matchingPlaces.length > 0
    ? [...matchingPlaces].sort((a, b) => {
        return (
          calculateDistanceKm(userLat, userLng, a.lat, a.lng) -
          calculateDistanceKm(userLat, userLng, b.lat, b.lng)
        );
      })[0]
    : places[0]) as RestaurantPlace;

  const distance = targetPlace
    ? calculateDistanceKm(userLat, userLng, targetPlace.lat, targetPlace.lng)
    : 1.2;

  const currentIndex = allDeals.findIndex((d) => d.id === deal.id);
  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % allDeals.length;
    onSelectDeal(allDeals[nextIdx]);
    setLiked(false);
  };
  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + allDeals.length) % allDeals.length;
    onSelectDeal(allDeals[prevIdx]);
    setLiked(false);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText?.(
      `Regarde ce bon plan TikTok sur GourMap : ${deal.title} à ${deal.price.toFixed(2)}€ chez ${deal.brand} !`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const gmapsUrl = targetPlace
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        `${targetPlace.name}, ${targetPlace.address}`
      )}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        deal.brand + " Paris"
      )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Container simulating vertical TikTok card */}
      <div className="relative w-full max-w-md h-[90vh] max-h-[820px] bg-[#0F172A] text-white rounded-[36px] overflow-hidden shadow-2xl flex flex-col border border-slate-800">
        {/* Top Header Overlay */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-[#10B981] text-slate-950 shadow-lg">
              <Flame className="w-3.5 h-3.5 text-slate-950" />
              SPOT TIKTOK VIRAL
            </span>
            {deal.tiktokViews && (
              <span className="text-xs font-semibold text-white/80 bg-white/10 px-2 py-0.5 rounded-full">
                {deal.tiktokViews}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="w-9 h-9 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white/90 hover:text-white transition-colors"
              aria-label="Son"
            >
              {isPlayingAudio ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-white/60" />
              )}
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Visual Gradient Background */}
        <div
          className="relative w-full h-[38%] flex items-center justify-center overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${deal.bannerGradient[0]}, ${deal.bannerGradient[1]})`,
          }}
        >
          {/* Animated decorative circles */}
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/15 blur-2xl animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-black/30 blur-2xl" />

          {/* Central Emoji & Big Price Badge */}
          <div className="flex flex-col items-center justify-center text-center z-10">
            <span className="text-7xl mb-2 drop-shadow-2xl animate-bounce duration-1000">
              {deal.emoji}
            </span>
            <div className="inline-flex items-baseline gap-1 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-xl">
              <span className="text-3xl font-black text-[#FFE600] font-sans">
                {deal.price.toFixed(2)} €
              </span>
              <span className="text-xs font-bold text-white/80 uppercase">
                {deal.price <= 10 ? "Moins de 10€" : "Bon Plan"}
              </span>
            </div>
          </div>

          {/* Animated Sound Equalizer Bar */}
          {isPlayingAudio && (
            <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-xs text-white/90 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <div className="flex items-center gap-2 truncate">
                <span className="flex gap-0.5 items-end h-3">
                  <span className="w-1 bg-emerald-400 h-2 animate-pulse" />
                  <span className="w-1 bg-emerald-400 h-3 animate-ping" />
                  <span className="w-1 bg-emerald-400 h-1.5 animate-pulse" />
                </span>
                <span className="truncate text-[11px] font-medium">
                  {deal.tiktokSound || "Trend Audio TikTok Paname • Son vérifié"}
                </span>
              </div>
              <span className="text-[10px] text-white/70 font-mono">100% ASMR</span>
            </div>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
          {/* Title & Brand */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black tracking-wide uppercase text-[#10B981]">
                {deal.brand}
              </span>
              {deal.isHalal && (
                <span className="flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                  <ShieldCheck className="w-3 h-3" />
                  100% Halal
                </span>
              )}
            </div>
            <h3 className="font-sans font-black text-2xl text-white leading-tight">
              {deal.title}
            </h3>
          </div>

          {/* What's in the Box */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-white/80">
              <span className="flex items-center gap-1.5 text-[#10B981]">
                <Sparkles className="w-3.5 h-3.5" />
                CE QUI EST DANS LA BOX :
              </span>
              <span className="text-[#10B981] font-black">{deal.price.toFixed(2)} €</span>
            </div>
            <p className="text-sm font-medium text-white/90 leading-snug">
              {deal.included}
            </p>
          </div>

          {/* Secret Ordering Hack */}
          {deal.secretHack && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-300 mb-1">
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                ASTUCE SECRÈTE DU MENU :
              </div>
              <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                « {deal.secretHack} »
              </p>
            </div>
          )}

          {/* Why it is viral */}
          <div>
            <span className="text-[11px] font-bold tracking-wider text-white/50 uppercase block mb-1">
              POURQUOI C'EST VIRAL SUR TIKTOK
            </span>
            <p className="text-xs text-white/80 leading-relaxed">{deal.note}</p>
          </div>

          {/* Nearest Spot Info */}
          {targetPlace && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-bold text-white/50 uppercase block">
                  ADRESSE LA PLUS PROCHE DE TOI
                </span>
                <span className="text-sm font-bold text-white truncate block">
                  {targetPlace.name}
                </span>
                <span className="text-xs text-white/60 truncate block">
                  {targetPlace.address}
                </span>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-xs font-black text-[#10B981]">
                  {formatDistance(distance)}
                </span>
                <span className="text-[10px] text-white/50 block">de ta position</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Bottom Bar */}
        <div className="p-4 bg-[#070A11] border-t border-white/10 flex items-center gap-2">
          {/* Prev / Next buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Box précédente"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Box suivante"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Like button */}
          <button
            onClick={() => {
              setLiked(!liked);
              if (targetPlace) onToggleFavorite(targetPlace.id);
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
              liked || (targetPlace && isFavorite)
                ? "bg-rose-500/20 border-rose-500/50 text-rose-400 scale-105"
                : "bg-white/10 border-white/10 text-white/80 hover:text-white"
            }`}
            aria-label="Ajouter aux favoris"
          >
            <Heart
              className={`w-5 h-5 ${
                liked || (targetPlace && isFavorite) ? "fill-rose-500 text-rose-500" : ""
              }`}
            />
          </button>

          {/* Share */}
          <button
            onClick={handleCopy}
            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Partager"
          >
            {copiedLink ? <Check className="w-5 h-5 text-[#10B981]" /> : <Share2 className="w-5 h-5" />}
          </button>

          {/* Direct GPS Action */}
          <a
            href={gmapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-10 px-4 rounded-xl font-black text-sm text-slate-950 flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] shadow-lg shadow-[#10B981]/25 transition-all active:scale-95 cursor-pointer"
          >
            <Navigation className="w-4 h-4 fill-current" />
            Y aller (GPS)
          </a>
        </div>
      </div>
    </div>
  );
};
