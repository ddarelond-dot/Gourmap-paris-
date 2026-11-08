import React, { useState } from "react";
import { RawPlace } from "../data/rawDatabase";
import { CustomList } from "../types/food";
import {
  X,
  Star,
  Share2,
  Copy,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  MapPin,
  Sparkles,
  MessageCircle,
  Eye,
  CheckCircle2,
  BookmarkCheck,
  Download,
  Upload,
} from "lucide-react";
import { artStyle, foodKey, FA_ICONS } from "../data/taxonomy";

interface StarringListModalProps {
  isOpen: boolean;
  onClose: () => void;
  customLists: CustomList[];
  onUpdateLists: (lists: CustomList[]) => void;
  places: RawPlace[];
  onSelectPlace: (place: RawPlace) => void;
  activePlaceToStar?: RawPlace | null;
  onClosePlaceToStar?: () => void;
  onFilterByList?: (list: CustomList) => void;
}

export const StarringListModal: React.FC<StarringListModalProps> = ({
  isOpen,
  onClose,
  customLists,
  onUpdateLists,
  places,
  onSelectPlace,
  activePlaceToStar,
  onClosePlaceToStar,
  onFilterByList,
}) => {
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [testedPlaceIds, setTestedPlaceIds] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("gm-tested-places") || "[]");
    } catch {
      return [];
    }
  });

  // New list form
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newEmoji, setNewEmoji] = useState("⭐");

  if (!isOpen) return null;

  const currentList = customLists.find((l) => l.id === selectedListId) || null;

  // Toggle tested status
  const handleToggleTested = (placeId: number) => {
    const next = testedPlaceIds.includes(placeId)
      ? testedPlaceIds.filter((id) => id !== placeId)
      : [...testedPlaceIds, placeId];
    setTestedPlaceIds(next);
    try {
      localStorage.setItem("gm-tested-places", JSON.stringify(next));
    } catch {}
  };

  // Toggle place in list
  const handleTogglePlaceInList = (listId: string, placeId: number) => {
    const updated = customLists.map((list) => {
      if (list.id !== listId) return list;
      const exists = list.placeIds.includes(placeId);
      const nextIds = exists
        ? list.placeIds.filter((id) => id !== placeId)
        : [...list.placeIds, placeId];
      return { ...list, placeIds: nextIds, updatedAt: new Date().toISOString() };
    });
    onUpdateLists(updated);
  };

  // Create new list
  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const initialIds: number[] = activePlaceToStar ? [activePlaceToStar.id] : [];
    const newList: CustomList = {
      id: "list-" + Date.now(),
      title: newTitle.trim(),
      description: newDesc.trim() || "Sélection exclusive enregistrée sur L'Appli Gourmande 24K",
      emoji: newEmoji,
      isPublic: true,
      placeIds: initialIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onUpdateLists([newList, ...customLists]);
    setIsCreatingList(false);
    setNewTitle("");
    setNewDesc("");
    setSelectedListId(newList.id);
  };

  // Delete list
  const handleDeleteList = (listId: string) => {
    if (customLists.length <= 1) return;
    const updated = customLists.filter((l) => l.id !== listId);
    onUpdateLists(updated);
    if (selectedListId === listId) setSelectedListId(null);
  };

  // Share list via link
  const handleShareLink = (list: CustomList) => {
    const shareUrl = `${window.location.origin}/?list=${encodeURIComponent(list.title)}&count=${list.placeIds.length}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Share list on WhatsApp
  const handleShareWhatsApp = (list: CustomList) => {
    const listPlaces = places.filter((p) => list.placeIds.includes(p.id));
    const items = listPlaces
      .slice(0, 10)
      .map((p, i) => `${i + 1}. ${p.n} (★ ${p.r.toFixed(1)} · ${p.z})`)
      .join("\n");
    const text = encodeURIComponent(
      `👑 *${list.emoji} ${list.title}* – Ma Starring List sur L'Appli Gourmande 24K :\n\n${items}\n\n👉 Retrouve toutes les adresses sur L'Appli Gourmande !`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  // Copy list as formatted text
  const handleCopyTextList = (list: CustomList) => {
    const listPlaces = places.filter((p) => list.placeIds.includes(p.id));
    const items = listPlaces
      .map((p, i) => `${i + 1}. ${p.n} — ${p.sub} (★ ${p.r.toFixed(1)} | ${p.z})\n📍 ${p.a}`)
      .join("\n\n");
    const summary = `${list.emoji} ${list.title}\n${list.description}\n\n${items}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  // Export all lists as JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(customLists, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `gourmap-starring-lists-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      onClick={() => {
        onClose();
        if (onClosePlaceToStar) onClosePlaceToStar();
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[92vh] bg-[#0E0E15] border border-amber-500/35 rounded-3xl overflow-y-auto no-scrollbar shadow-[0_0_50px_rgba(245,158,11,0.18)] flex flex-col p-5 sm:p-6 text-white relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/20 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <Star className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans font-black text-lg sm:text-xl text-white">
                  Starring Lists 24K
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {customLists.length} listes
                </span>
              </div>
              <p className="text-xs text-amber-200/70">
                Créez, classez et partagez vos sélections de pépites entre amis
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              if (onClosePlaceToStar) onClosePlaceToStar();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner if adding a specific place */}
        {activePlaceToStar && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#181824] to-[#181824] border border-amber-400/40 mb-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-0.5">
                ⭐ Ajouter à une liste :
              </span>
              <h4 className="font-black text-sm text-white truncate">
                {activePlaceToStar.n}
              </h4>
              <p className="text-[11px] text-zinc-400 truncate">
                {activePlaceToStar.sub} · ★ {activePlaceToStar.r.toFixed(1)} · {activePlaceToStar.z}
              </p>
            </div>

            <button
              onClick={() => setIsCreatingList(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shrink-0 cursor-pointer transition-transform active:scale-95 shadow-md shadow-amber-500/30"
            >
              + Nouvelle liste
            </button>
          </div>
        )}

        {/* View Mode: List Details or All Lists */}
        {selectedListId && currentList ? (
          /* SINGLE LIST DETAIL VIEW */
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedListId(null)}
                className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
              >
                ← Retour à toutes les listes
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShareWhatsApp(currentList)}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Partager sur WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>

                <button
                  onClick={() => handleCopyTextList(currentList)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Copier le texte de la liste"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? "Copié !" : "Copier"}</span>
                </button>

                <button
                  onClick={() => handleShareLink(currentList)}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer transition-transform active:scale-95 shadow-sm"
                  title="Copier lien de partage"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? "Lien copié !" : "Partager"}</span>
                </button>
              </div>
            </div>

            {/* List Header Card */}
            <div className="p-4 rounded-2xl bg-[#141420] border border-amber-500/25 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-3xl p-2 rounded-2xl bg-amber-400/10 border border-amber-400/20">
                  {currentList.emoji}
                </span>
                <div className="min-w-0">
                  <h4 className="font-black text-lg text-white truncate">
                    {currentList.title}
                  </h4>
                  <p className="text-xs text-amber-200/70 truncate">
                    {currentList.description}
                  </p>
                  <span className="text-[11px] text-zinc-400 mt-0.5 block">
                    {currentList.placeIds.length} adresses · {currentList.placeIds.filter((id) => testedPlaceIds.includes(id)).length} testées
                  </span>
                </div>
              </div>

              {onFilterByList && (
                <button
                  onClick={() => {
                    onFilterByList(currentList);
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs shrink-0 cursor-pointer transition-transform active:scale-95 shadow-md shadow-cyan-500/25 flex items-center gap-1.5"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Sur la carte</span>
                </button>
              )}
            </div>

            {/* Places in this list */}
            <div className="flex flex-col gap-2.5 max-h-[50vh] overflow-y-auto no-scrollbar pr-1">
              {currentList.placeIds.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <Star className="w-10 h-10 mx-auto mb-2 opacity-30 text-amber-400" />
                  <p className="text-sm font-bold text-zinc-300">Cette liste est encore vide</p>
                  <p className="text-xs mt-1">Cliquez sur l'étoile d'un restaurant pour l'ajouter ici !</p>
                </div>
              ) : (
                currentList.placeIds.map((placeId) => {
                  const place = places.find((p) => p.id === placeId);
                  if (!place) return null;
                  const isTested = testedPlaceIds.includes(placeId);

                  return (
                    <div
                      key={place.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isTested
                          ? "bg-[#101018]/60 border-emerald-500/30 opacity-80"
                          : "bg-[#141420] border-amber-500/20 hover:border-amber-400/60"
                      }`}
                    >
                      <div
                        onClick={() => {
                          onSelectPlace(place);
                          onClose();
                        }}
                        className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                      >
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/20"
                          style={{ background: artStyle(place) }}
                        >
                          <svg
                            className="w-7 h-7"
                            viewBox="0 0 100 100"
                            dangerouslySetInnerHTML={{ __html: FA_ICONS[foodKey(place)] }}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className={`font-black text-sm text-white truncate ${isTested ? "line-through text-zinc-400" : ""}`}>
                              {place.n}
                            </h5>
                            {isTested && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Testé ✓
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-zinc-400 block truncate">
                            <span className="text-amber-400 font-bold">★ {place.r.toFixed(1)}</span> · {place.sub} · {place.z}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleToggleTested(place.id)}
                          className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            isTested
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-white/5 hover:bg-white/10 text-zinc-400 border border-white/5"
                          }`}
                          title={isTested ? "Marquer comme non testé" : "Marquer comme déjà testé"}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleTogglePlaceInList(currentList.id, place.id)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Retirer de cette liste"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* ALL LISTS OVERVIEW */
          <div className="flex flex-col gap-4">
            {/* Create new list button or form */}
            {!isCreatingList ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCreatingList(true)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all cursor-pointer active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>Créer une nouvelle Starring List</span>
                </button>

                <button
                  onClick={handleExportJSON}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-amber-500/20 text-amber-300 transition-colors cursor-pointer"
                  title="Exporter mes listes en JSON"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateList} className="p-4 rounded-2xl bg-[#141420] border border-amber-500/30 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Nouvelle Starring List 24K</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsCreatingList(false)}
                    className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-amber-200/70 block mb-1">
                    Titre de la sélection
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Mes smashs parisiens ultimes ≤ 10€"
                    className="w-full p-2.5 rounded-xl bg-[#08080C] border border-amber-500/30 text-white text-xs sm:text-sm outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-amber-200/70 block mb-1">
                    Description ou ambiance
                  </label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Ex: Double cheddar maturé, pain brioché et frites paprika"
                    className="w-full p-2.5 rounded-xl bg-[#08080C] border border-amber-500/30 text-white text-xs sm:text-sm outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-amber-200/70 block mb-1">
                    Icône Emoji
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    {["⭐", "🔥", "👑", "🍔", "🍗", "🍕", "🍜", "🍣", "🌮", "🌙", "💸", "🥐"].map((emo) => (
                      <button
                        key={emo}
                        type="button"
                        onClick={() => setNewEmoji(emo)}
                        className={`text-xl p-2 rounded-xl border transition-all cursor-pointer ${
                          newEmoji === emo
                            ? "border-amber-400 bg-amber-400/20 scale-105"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-transform active:scale-95 shadow-md shadow-amber-500/30 cursor-pointer"
                >
                  Enregistrer et ajouter {activePlaceToStar ? `« ${activePlaceToStar.n} »` : "la liste"}
                </button>
              </form>
            )}

            {/* List Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto no-scrollbar pr-1">
              {customLists.map((list) => {
                const isSelectedInAddMode = activePlaceToStar
                  ? list.placeIds.includes(activePlaceToStar.id)
                  : false;

                return (
                  <div
                    key={list.id}
                    onClick={() => setSelectedListId(list.id)}
                    className="p-4 rounded-2xl bg-[#12121A] border border-amber-500/25 hover:border-amber-400/80 transition-all shadow-md hover:shadow-amber-500/10 cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl p-2 rounded-xl bg-amber-400/10 border border-amber-400/20 group-hover:scale-105 transition-transform">
                          {list.emoji}
                        </span>

                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {activePlaceToStar && (
                            <button
                              onClick={() => handleTogglePlaceInList(list.id, activePlaceToStar.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                isSelectedInAddMode
                                  ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30"
                                  : "bg-amber-400 text-slate-950 hover:bg-amber-300"
                              }`}
                            >
                              {isSelectedInAddMode ? "✓ Dans la liste" : "+ Ajouter"}
                            </button>
                          )}

                          <button
                            onClick={() => handleShareWhatsApp(list)}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-400 transition-colors"
                            title="Partager sur WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleShareLink(list)}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 transition-colors"
                            title="Copier le lien"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-black text-sm text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                        {list.title}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
                        {list.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-amber-500/15 flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="font-bold text-amber-200">
                        {list.placeIds.length} adresse{list.placeIds.length > 1 ? "s" : ""}
                      </span>
                      <span className="text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Consulter →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
