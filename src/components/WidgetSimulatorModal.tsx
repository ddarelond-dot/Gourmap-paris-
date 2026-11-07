import React from "react";
import { RestaurantPlace } from "../types/food";
import { calculateDistanceKm, formatDistance, isCurrentlyOpen } from "../utils/geo";
import { X, Smartphone, Navigation, Star, Flame, Sparkles } from "lucide-react";

interface WidgetSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  closestPlace: RestaurantPlace;
  userLat: number;
  userLng: number;
  onSelectPlace: (place: RestaurantPlace) => void;
}

export const WidgetSimulatorModal: React.FC<WidgetSimulatorModalProps> = ({
  isOpen,
  onClose,
  closestPlace,
  userLat,
  userLng,
  onSelectPlace,
}) => {
  if (!isOpen) return null;

  const distance = formatDistance(calculateDistanceKm(userLat, userLng, closestPlace.lat, closestPlace.lng));
  const openNow = isCurrentlyOpen(closestPlace.hours);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#0C0C0E] text-white rounded-3xl p-5 shadow-2xl border border-white/10 relative flex flex-col gap-4 animate-slideUp"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white/70">
            <Smartphone className="w-4 h-4 text-[#10B981]" />
            <span>Simulateur Widget iOS / Android</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-white/60 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-white/70">
          Ce widget interactif reste épinglé sur l'écran d'accueil de ton smartphone pour t'indiquer le meilleur spot à deux pas en 0 clic.
        </p>

        {/* Realistic Home Screen Widget Card Preview */}
        <div className="w-full rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#070A11] to-[#020617] p-4 border border-[#10B981]/30 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-wider text-[#10B981]">
                GourMap ⚡ Zéro-Clic
              </span>
            </div>
            <span className="text-[10px] font-bold text-white/60">À 2 pas</span>
          </div>

          <div className="flex items-center gap-3 my-2">
            <img
              src={closestPlace.photoUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80"}
              alt={closestPlace.name}
              className="w-14 h-14 rounded-xl object-cover border border-white/20 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-extrabold text-sm text-white truncate">
                {closestPlace.name}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-white/80 mt-0.5">
                <span className="text-amber-400 font-extrabold flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {closestPlace.rating.toFixed(1)}
                </span>
                <span>·</span>
                <span className="font-bold text-[#10B981]">{distance}</span>
              </div>
              <span className="text-[11px] text-white/60 block truncate">
                {closestPlace.subCategory} · {openNow ? "🟢 Ouvert" : "🔴 Fermé"}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center gap-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${closestPlace.lat},${closestPlace.lng}&travelmode=walking`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-slate-950 font-black text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
            >
              <Navigation className="w-3.5 h-3.5 fill-current" />
              <span>Y aller (0 clic)</span>
            </a>

            <button
              onClick={() => {
                onClose();
                onSelectPlace(closestPlace);
              }}
              className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
            >
              Détails
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white cursor-pointer"
        >
          Fermer l'aperçu
        </button>
      </div>
    </div>
  );
};
