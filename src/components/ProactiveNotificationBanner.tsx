import React, { useState } from "react";
import { Bell, CloudRain, Sun, Moon, Flame, X, Sparkles } from "lucide-react";
import { RestaurantPlace } from "../types/food";

interface ProactiveNotificationBannerProps {
  onSelectPlace: (place: RestaurantPlace) => void;
  places: RestaurantPlace[];
}

export const ProactiveNotificationBanner: React.FC<ProactiveNotificationBannerProps> = ({
  onSelectPlace,
  places,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [activeMoodIndex, setActiveMoodIndex] = useState(0);

  const hour = new Date().getHours();

  const MOOD_ALERTS = [
    {
      type: "lunch",
      icon: "🍗",
      badge: "ALERTE GÉOLOCALISÉE · 12H-14H",
      title: "C'est l'heure de la pause ! La Box Crousti TikTok KFB est à 400m",
      description: "Tenders marinés bien chauds et frites cajun à moins de 10 € pour caler la faim.",
      targetPlaceId: 1,
      bgGradient: "from-[#10B981] to-[#047857]",
    },
    {
      type: "weather",
      icon: "🌧️",
      badge: "MÉTÉO PARISIENNE · PLUIE & FRAÎCHEUR",
      title: "Envie de réconfort ? Bouillon Julien et son potage traditionnel fumant",
      description: "Soupe à l'oignon gratinée et décor Art Nouveau magique au sec.",
      targetPlaceId: 4,
      bgGradient: "from-[#0284C7] to-[#1E40AF]",
    },
    {
      type: "night",
      icon: "🌙",
      badge: "FAIM DE NUIT · SPOTS OUVERTS TARD",
      title: "Faim après minuit ? Chouchou et Au Pied de Cochon servent jusqu'à 5h du mat'",
      description: "Des plats chauds complets même au milieu de la nuit.",
      targetPlaceId: 18,
      bgGradient: "from-[#6366F1] to-[#4338CA]",
    },
  ];

  if (!isVisible) return null;

  const currentAlert = MOOD_ALERTS[activeMoodIndex];
  const targetPlace = places.find((p) => p.id === currentAlert.targetPlaceId) || places[0];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pt-2 pb-1">
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${currentAlert.bgGradient} text-white p-3.5 sm:p-4 shadow-lg shadow-black/20 transition-all`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl sm:text-3xl p-2 rounded-xl bg-white/20 backdrop-blur-md shrink-0">
              {currentAlert.icon}
            </span>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-white/25">
                  {currentAlert.badge}
                </span>
                <button
                  onClick={() => setActiveMoodIndex((prev) => (prev + 1) % MOOD_ALERTS.length)}
                  className="text-[11px] underline font-bold opacity-90 hover:opacity-100 cursor-pointer"
                >
                  Changer d'humeur / météo ↻
                </button>
              </div>

              <h4 className="font-black text-sm sm:text-base leading-snug">
                {currentAlert.title}
              </h4>
              <p className="text-xs text-white/90 mt-0.5 leading-relaxed">
                {currentAlert.description}
              </p>

              <button
                onClick={() => onSelectPlace(targetPlace)}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black text-xs bg-white text-slate-950 hover:bg-slate-100 shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <span>Voir le spot ({targetPlace.name})</span>
                <Bell className="w-3.5 h-3.5 text-[#10B981]" />
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="p-1 rounded-full text-white/70 hover:text-white shrink-0"
            title="Masquer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
