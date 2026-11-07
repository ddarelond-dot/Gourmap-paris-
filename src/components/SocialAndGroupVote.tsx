import React, { useState } from "react";
import { RestaurantPlace, CustomList, GroupSession } from "../types/food";
import {
  X,
  Users,
  Vote,
  Share2,
  Copy,
  Check,
  Plus,
  Trophy,
  Flame,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface SocialAndGroupVoteProps {
  isOpen: boolean;
  onClose: () => void;
  places: RestaurantPlace[];
  customLists: CustomList[];
  onCreateList: (title: string, description: string, emoji: string, placeIds: number[]) => void;
  storyPlace: RestaurantPlace | null;
  onCloseStoryPlace: () => void;
}

export const SocialAndGroupVote: React.FC<SocialAndGroupVoteProps> = ({
  isOpen,
  onClose,
  places,
  customLists,
  onCreateList,
  storyPlace,
  onCloseStoryPlace,
}) => {
  const [activeTab, setActiveTab] = useState<"group" | "lists" | "story">("group");
  const [copiedLink, setCopiedLink] = useState(false);

  // Group vote state simulation
  const [votes, setVotes] = useState<Record<number, number>>({ 1: 4, 2: 3, 3: 1, 6: 2 });
  const [userVotedPlaceId, setUserVotedPlaceId] = useState<number | null>(1);
  const [groupVoters, setGroupVoters] = useState<string[]>([
    "Karim (toi) : KFB",
    "Sarah : KFB",
    "Alex : KFB",
    "Mehdi : Nach Tacos",
    "Inès : Nach Tacos",
    "Léa : Bouillon Pigalle",
    "Thomas : KFB",
  ]);

  // Create list form state
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [newListEmoji, setNewListEmoji] = useState("🍔");
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<number[]>([1, 6, 7]);

  if (!isOpen && !storyPlace) return null;

  const currentTab = storyPlace ? "story" : activeTab;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleVote = (placeId: number) => {
    setUserVotedPlaceId(placeId);
    setVotes((prev) => ({
      ...prev,
      [placeId]: (prev[placeId] || 0) + 1,
    }));
    setGroupVoters((prev) => [`Toi : ${places.find((p) => p.id === placeId)?.name}`, ...prev]);
  };

  const handleSaveList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    onCreateList(newListTitle.trim(), newListDesc.trim(), newListEmoji, selectedPlaceIds);
    setIsCreatingList(false);
    setNewListTitle("");
    setNewListDesc("");
  };

  // Group options to vote on
  const groupCandidates = places.filter((p) => [1, 2, 3, 6].includes(p.id));
  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  return (
    <div
      onClick={() => {
        onClose();
        onCloseStoryPlace();
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[90vh] bg-white dark:bg-[#0F172A] rounded-3xl overflow-y-auto no-scrollbar shadow-2xl border border-slate-200 dark:border-slate-800 relative flex flex-col p-5 text-slate-900 dark:text-white"
      >
        {/* Header with Close Button */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#10B981] text-slate-950 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-sans font-black text-xl text-slate-900 dark:text-white">
                Social & Mode Groupe
              </h3>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Fin du débat interminable : votez et partagez en 1 clic
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onCloseStoryPlace();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher if not forced in story mode */}
        {!storyPlace && (
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl mb-4">
            <button
              onClick={() => setActiveTab("group")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "group"
                  ? "bg-white dark:bg-[#070A11] text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              Mode Groupe ("On y va ensemble")
            </button>
            <button
              onClick={() => setActiveTab("lists")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "lists"
                  ? "bg-white dark:bg-[#070A11] text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              Mes Listes Gourmandes
            </button>
          </div>
        )}

        {/* TAB 1: Mode Groupe / Vote entre amis */}
        {currentTab === "group" && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#10B981] text-slate-950">
                  SESSION EN COURS · CODE : SOIR-75
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {totalVotes} votes exprimés
                </span>
              </div>
              <h4 className="font-black text-base text-slate-900 dark:text-white mb-1">
                🍔 On mange où ce soir entre potes ?
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Partage le lien dans le groupe WhatsApp / Messenger. Le resto avec le plus de votes l'emporte !
              </p>

              <button
                onClick={handleCopyLink}
                className="mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl font-bold text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-transform active:scale-95 cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4 text-[#10B981]" />}
                <span>{copiedLink ? "Lien copié dans le presse-papier !" : "Copier le lien d'invitation au vote"}</span>
              </button>
            </div>

            {/* Voting candidates */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Les options en lice :
              </span>

              {groupCandidates.map((place) => {
                const count = votes[place.id] || 0;
                const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                const isMyVote = userVotedPlaceId === place.id;
                const isLeading = count === Math.max(...Object.values(votes));

                return (
                  <div
                    key={place.id}
                    className={`relative p-3.5 rounded-2xl border transition-all ${
                      isLeading
                        ? "bg-white dark:bg-[#070A11] border-[#10B981] shadow-sm"
                        : "bg-white dark:bg-[#070A11] border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-sm text-slate-900 dark:text-white">
                            {place.name}
                          </span>
                          {isLeading && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-500">
                              <Trophy className="w-3 h-3 fill-amber-500" /> EN TÊTE
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {place.subCategory} · ★ {place.rating.toFixed(1)} · {place.zone}
                        </span>
                      </div>

                      <button
                        onClick={() => handleVote(place.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                          isMyVote
                            ? "bg-[#10B981] text-slate-950 font-black"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-[#10B981] hover:text-slate-950"
                        }`}
                      >
                        {isMyVote ? "✓ Mon vote" : "Voter"}
                      </button>
                    </div>

                    {/* Vote progress bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#10B981] h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1.5">
                      <span>{count} vote{count > 1 ? "s" : ""}</span>
                      <span>{percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Voter Feed */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                Derniers votes reçus :
              </span>
              <div className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-300">
                {groupVoters.slice(0, 4).map((voter, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    <span>{voter}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Listes personnalisées & Partage */}
        {currentTab === "lists" && (
          <div className="flex flex-col gap-4">
            {!isCreatingList ? (
              <>
                <button
                  onClick={() => setIsCreatingList(true)}
                  className="flex items-center justify-center gap-2 p-3 rounded-2xl font-black text-xs sm:text-sm text-slate-950 bg-[#10B981] hover:bg-[#059669] shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Créer une nouvelle liste personnalisée</span>
                </button>

                <div className="flex flex-col gap-3">
                  {customLists.map((list) => (
                    <div
                      key={list.id}
                      className="p-4 rounded-2xl bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-2xl">{list.emoji}</span>
                          <button
                            onClick={handleCopyLink}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Partager</span>
                          </button>
                        </div>
                        <h4 className="font-black text-base text-slate-900 dark:text-white">
                          {list.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {list.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>{list.placeIds.length} adresses répertoriées</span>
                        <span className="font-bold text-[#10B981]">Publique · Synchronisée</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <form onSubmit={handleSaveList} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Titre de la liste
                  </label>
                  <input
                    type="text"
                    required
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="Ex: Mes meilleurs smash burgers de Paris"
                    className="w-full p-3 rounded-xl bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newListDesc}
                    onChange={(e) => setNewListDesc(e.target.value)}
                    placeholder="Pourquoi cette sélection est folle ?"
                    className="w-full p-3 rounded-xl bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {["🍔", "🍗", "🍕", "🥘", "🥐", "🌙", "🔥"].map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setNewListEmoji(emo)}
                      className={`text-xl p-2 rounded-xl border cursor-pointer ${
                        newListEmoji === emo
                          ? "border-[#10B981] bg-[#10B981]/15"
                          : "border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl font-black text-xs sm:text-sm text-slate-950 bg-[#10B981] hover:bg-[#059669] cursor-pointer"
                  >
                    Sauvegarder et générer le lien
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingList(false)}
                    className="px-4 py-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: Story Card Generator for Instagram & Snapchat */}
        {currentTab === "story" && storyPlace && (
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">
              Format Story Instagram / Snapchat 9:16 prêt à être partagé
            </span>

            {/* Visual Story Card Mockup */}
            <div className="w-full max-w-xs aspect-[9/14] rounded-3xl bg-gradient-to-br from-[#070A11] via-[#0F172A] to-[#020617] p-5 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden border-2 border-white/10">
              <div className="flex items-center justify-between z-10">
                <span className="font-sans font-black text-lg tracking-tight">
                  Gour<span className="text-[#10B981]">Map</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#10B981] text-slate-950">
                  TOP SPOTS 2026
                </span>
              </div>

              {/* Photo preview in story card */}
              <div className="my-auto z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#10B981] shadow-xl mb-3">
                  <img
                    src={storyPlace.photoUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80"}
                    alt={storyPlace.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-sans font-black text-2xl leading-tight mb-1">
                  {storyPlace.name}
                </h4>
                <span className="text-amber-400 font-extrabold text-sm mb-1">
                  ★ {storyPlace.rating.toFixed(1)} ({storyPlace.reviewCount} avis)
                </span>
                <span className="text-xs font-semibold text-white/80">
                  {storyPlace.subCategory} · {storyPlace.zone}
                </span>

                <div className="mt-3 p-2.5 rounded-xl bg-white/10 backdrop-blur-md text-[11px] font-medium leading-snug">
                  "{storyPlace.summary.slice(0, 95)}…"
                </div>
              </div>

              {/* Footer sticker */}
              <div className="z-10 text-center">
                <span className="inline-block px-3 py-1.5 rounded-full text-xs font-black bg-white text-slate-950 shadow-md">
                  📍 Trouvé sur GourMap GPS
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 w-full">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-3 rounded-2xl font-black text-xs sm:text-sm text-slate-950 bg-[#10B981] hover:bg-[#059669] shadow-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? "Lien copié !" : "Copier le lien pour ma Story"}</span>
              </button>
              <button
                onClick={onCloseStoryPlace}
                className="px-4 py-3 rounded-2xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
