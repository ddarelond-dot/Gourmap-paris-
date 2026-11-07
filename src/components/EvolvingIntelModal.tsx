import React, { useState } from "react";
import {
  X,
  Sparkles,
  Flame,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  PlusCircle,
  ShieldCheck,
  Send,
  Navigation,
  Clock,
  Compass,
} from "lucide-react";
import { RawPlace } from "../data/rawDatabase";
import {
  CommunityIntel,
  TrendRadarSignal,
  getStoredIntel,
  addCommunityIntel,
  likeCommunityIntel,
  getStoredTrends,
} from "../data/evolvingData";

interface EvolvingIntelModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: RawPlace[];
  onSelectPlace: (place: RawPlace) => void;
  onPlaceAddedNotification?: (msg: string) => void;
}

export const EvolvingIntelModal: React.FC<EvolvingIntelModalProps> = ({
  isOpen,
  onClose,
  places,
  onSelectPlace,
  onPlaceAddedNotification,
}) => {
  const [activeTab, setActiveTab] = useState<"live" | "trends" | "contribute">("live");
  const [intelList, setIntelList] = useState<CommunityIntel[]>(() => getStoredIntel());
  const [trendList] = useState<TrendRadarSignal[]>(() => getStoredTrends());

  // Form state for contributing new real-time intel
  const [targetPlaceId, setTargetPlaceId] = useState<number>(places[0]?.id || 0);
  const [source, setSource] = useState<CommunityIntel["source"]>("TikTok");
  const [type, setType] = useState<CommunityIntel["type"]>("nouveau_banger");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [author, setAuthor] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = likeCommunityIntel(id);
    setIntelList(updated);
  };

  const handleSubmitIntel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !detail.trim()) return;

    const matchedPlace = places.find((p) => p.id === targetPlaceId) || places[0];

    const updated = addCommunityIntel({
      placeId: matchedPlace.id,
      placeName: matchedPlace.n,
      source,
      type,
      title: title.trim(),
      detail: detail.trim(),
      author: author.trim() || "Gourmand Anonyme",
    });

    setIntelList(updated);
    setIsSubmitted(true);
    if (onPlaceAddedNotification) {
      onPlaceAddedNotification("🧠 Nouveau signal enregistré ! L'app s'enrichit en direct.");
    }

    setTimeout(() => {
      setIsSubmitted(false);
      setTitle("");
      setDetail("");
      setActiveTab("live");
    }, 1500);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-2xl bg-[#0A0A10] rounded-t-[36px] sm:rounded-[36px] border border-amber-500/40 shadow-[0_0_70px_rgba(245,158,11,0.25)] p-5 sm:p-6 flex flex-col gap-4 text-white max-h-[92vh] overflow-y-auto no-scrollbar relative animate-slideUp"
      >
        {/* Glow Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/25 shrink-0">
              🧠
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-sans font-black text-lg sm:text-xl text-white leading-tight">
                  Radar Évolutif <span className="text-gold-gradient font-black">& Veille Collective</span>
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Auto-apprenant
                </span>
              </div>
              <p className="text-xs text-amber-200/70">
                GourMap s'enrichit en continu des tendances TikTok, avis récents et signaux de la communauté
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Nav Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#141420] border border-white/5">
          <button
            onClick={() => setActiveTab("live")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "live"
                ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>📡</span>
            <span>Flux en Direct ({intelList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("trends")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "trends"
                ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>📈</span>
            <span>Tendances IDF</span>
          </button>

          <button
            onClick={() => setActiveTab("contribute")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "contribute"
                ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>➕</span>
            <span>Nourrir l'App</span>
          </button>
        </div>

        {/* TAB 1: FLUX EN DIRECT */}
        {activeTab === "live" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-amber-200/80 px-1">
              <span>Signaux captés sur TikTok, Instagram & avis terrain :</span>
              <button
                onClick={() => setActiveTab("contribute")}
                className="text-amber-400 font-bold hover:underline flex items-center gap-1"
              >
                + Ajouter une info
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {intelList.map((item) => {
                const targetPlace = places.find((p) => p.id === item.placeId);
                const sourceBadge =
                  item.source === "TikTok"
                    ? "bg-[#FF0050]/20 text-[#FF0050] border-[#FF0050]/35"
                    : item.source === "Instagram"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/35"
                    : "bg-cyan-500/20 text-cyan-300 border-cyan-500/35";

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (targetPlace) {
                        onClose();
                        onSelectPlace(targetPlace);
                      }
                    }}
                    className="p-3.5 rounded-2xl bg-[#141420] border border-amber-500/20 hover:border-amber-400 transition-all flex flex-col gap-2 cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${sourceBadge}`}>
                          {item.source}
                        </span>
                        <span className="text-xs font-black text-amber-300 group-hover:underline">
                          📍 {item.placeName}
                        </span>
                        {item.verified && (
                          <span className="text-[10px] text-emerald-300 flex items-center gap-0.5" title="Signal vérifié par nos modérateurs">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Vérifié
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500">{item.date}</span>
                    </div>

                    <div>
                      <h4 className="font-sans font-black text-sm text-white group-hover:text-amber-300 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                        {item.detail}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
                      <span className="text-zinc-500">Par @{item.author}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleLike(item.id, e)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-amber-400/20 text-zinc-300 hover:text-amber-300 transition-all cursor-pointer"
                        >
                          <ThumbsUp className="w-3 h-3 text-amber-400" />
                          <span>{item.likes}</span>
                        </button>
                        <span className="text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform">
                          Voir le spot →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: TENDANCES IDF EN HAUSSE */}
        {activeTab === "trends" && (
          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200/90 flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Ces tendances sont calculées à partir des recherches, des sauvegardes en favoris et des créations de listes des utilisateurs d'Île-de-France.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trendList.map((t) => {
                const topPlace = places.find((p) => p.id === t.topPlaceId);
                return (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl bg-[#141420] border border-amber-500/20 flex flex-col justify-between gap-3 shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                          {t.tag}
                        </span>
                        <span className="text-xs font-black text-emerald-400">
                          +{t.growthPercent}% ce mois
                        </span>
                      </div>
                      <h4 className="font-sans font-black text-sm text-white">
                        {t.zone} ({t.department})
                      </h4>
                      <p className="text-xs text-amber-200/70 font-semibold mt-0.5">
                        {t.cuisine}
                      </p>
                      <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                        {t.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] text-zinc-500">
                        {t.hotSpotsCount} pépites actives
                      </span>
                      {topPlace && (
                        <button
                          onClick={() => {
                            onClose();
                            onSelectPlace(topPlace);
                          }}
                          className="text-xs font-black text-amber-400 hover:underline cursor-pointer"
                        >
                          Spot #1 : {topPlace.n} →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: NOURRIR L'APPLICATION */}
        {activeTab === "contribute" && (
          <form onSubmit={handleSubmitIntel} className="flex flex-col gap-3.5">
            <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/35 text-xs text-cyan-200">
              💡 <strong>Tu as repéré un banger sur TikTok ou dans la rue ?</strong> Partage-le ici. GourMap le prend en compte immédiatement pour enrichir les recommandations de tout le monde.
            </div>

            {isSubmitted ? (
              <div className="p-8 text-center bg-emerald-500/15 border border-emerald-500/40 rounded-3xl flex flex-col items-center gap-2">
                <span className="text-3xl">🎉</span>
                <h4 className="font-sans font-black text-base text-white">
                  Signal bien enregistré !
                </h4>
                <p className="text-xs text-emerald-300">
                  L'application s'est nourrie de ton info. Les prochains utilisateurs en profiteront directement !
                </p>
              </div>
            ) : (
              <>
                {/* Select Place */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black text-amber-400 uppercase tracking-wider">
                    Restaurant concerné :
                  </label>
                  <select
                    value={targetPlaceId}
                    onChange={(e) => setTargetPlaceId(Number(e.target.value))}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#141420] border border-amber-500/30 text-white text-xs outline-none focus:border-amber-400"
                  >
                    {places.slice(0, 80).map((p) => (
                      <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                        {p.n} ({p.z})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Source & Type Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black text-amber-400 uppercase tracking-wider">
                      D'où vient l'info ?
                    </label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value as any)}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#141420] border border-amber-500/30 text-white text-xs outline-none focus:border-amber-400"
                    >
                      <option value="TikTok">TikTok 🔥</option>
                      <option value="Instagram">Instagram 📸</option>
                      <option value="Local Foodie">Avis d'un Habitué 🚶</option>
                      <option value="Google Maps 2026">Google Maps vérifié ⭐</option>
                      <option value="Avis Communauté">Autre source 💬</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black text-amber-400 uppercase tracking-wider">
                      Type de découverte :
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#141420] border border-amber-500/30 text-white text-xs outline-none focus:border-amber-400"
                    >
                      <option value="nouveau_banger">Nouveau banger à la carte</option>
                      <option value="bon_plan_prix">Bon plan prix / Formule midi</option>
                      <option value="horaire_nocturne">Horaire nocturne / Changement</option>
                      <option value="file_attente">Astuce file d'attente / Heure creuse</option>
                      <option value="certif_halal">Info Halal certifiée</option>
                    </select>
                  </div>
                </div>

                {/* Titre */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black text-amber-400 uppercase tracking-wider">
                    Titre court & percutant :
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Le nouveau smash raclette est dispo ce soir !"
                    className="w-full py-2.5 px-3 rounded-xl bg-[#141420] border border-amber-500/30 text-white text-xs placeholder:text-zinc-500 outline-none focus:border-amber-400"
                  >
                  </input>
                </div>

                {/* Détail */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black text-amber-400 uppercase tracking-wider">
                    Détail croustillant (prix, astuce, sauce...) :
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    placeholder="Ex: Portion XXL, 11 € avec frites fraîches. Venir avant 20h pour éviter 25 min de queue."
                    className="w-full p-3 rounded-xl bg-[#141420] border border-amber-500/30 text-white text-xs placeholder:text-zinc-500 outline-none focus:border-amber-400 resize-none"
                  />
                </div>

                {/* Pseudo */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black text-amber-400 uppercase tracking-wider">
                    Ton pseudo / @ réseaux (optionnel) :
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Ex: SamyFood93"
                    className="w-full py-2.5 px-3 rounded-xl bg-[#141420] border border-amber-500/30 text-white text-xs placeholder:text-zinc-500 outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-slate-950" />
                  <span>Enregistrer & Nourrir GourMap</span>
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
