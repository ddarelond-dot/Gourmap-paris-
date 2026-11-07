import React, { useState } from "react";
import { FoodDiaryEntry, RestaurantPlace } from "../types/food";
import { X, BookOpen, Star, Plus, Calendar, Tag, Trash2 } from "lucide-react";

interface FoodDiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  diaryEntries: FoodDiaryEntry[];
  places: RestaurantPlace[];
  onAddEntry: (entry: Omit<FoodDiaryEntry, "id">) => void;
  onDeleteEntry: (id: string) => void;
}

export const FoodDiaryModal: React.FC<FoodDiaryModalProps> = ({
  isOpen,
  onClose,
  diaryEntries,
  places,
  onAddEntry,
  onDeleteEntry,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<number>(places[0]?.id || 1);
  const [rating, setRating] = useState<number>(5);
  const [favoriteDish, setFavoriteDish] = useState("");
  const [notes, setNotes] = useState("");
  const [costPaid, setCostPaid] = useState<number | undefined>(9.90);
  const [tag, setTag] = useState<"Coup de cœur" | "À refaire" | "Sympa" | "Décevant">("Coup de cœur");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const place = places.find((p) => p.id === selectedPlaceId);
    if (!place) return;

    onAddEntry({
      placeId: place.id,
      placeName: place.name,
      visitedAt: new Date().toISOString().split("T")[0],
      rating,
      favoriteDish: favoriteDish || "Menu complet signature",
      notes: notes || "Très bonne expérience, portions généreuses !",
      costPaid,
      tag,
    });

    setIsAdding(false);
    setFavoriteDish("");
    setNotes("");
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[90vh] bg-white dark:bg-[#0F172A] rounded-3xl overflow-y-auto no-scrollbar shadow-2xl border border-slate-200 dark:border-slate-800 relative flex flex-col p-5 text-slate-900 dark:text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#10B981] text-slate-950 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-sans font-black text-xl text-slate-900 dark:text-white">
                Carnet de Souvenirs
              </h3>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Tes visites gourmandes notées, plats préférés et budget dépensé
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list or New form */}
        {!isAdding ? (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl font-black text-xs sm:text-sm text-slate-950 bg-[#10B981] hover:bg-[#059669] shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Noter un nouveau restaurant testé</span>
            </button>

            {diaryEntries.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold">Ton carnet est encore vierge !</p>
                <p className="text-xs">Ajoute ton premier resto testé pour débloquer le badge Chroniqueur.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {diaryEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-base text-slate-900 dark:text-white">
                            {entry.placeName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              entry.tag === "Coup de cœur"
                                ? "bg-rose-500 text-white"
                                : entry.tag === "À refaire"
                                ? "bg-amber-500 text-slate-950"
                                : "bg-[#10B981] text-slate-950"
                            }`}
                          >
                            {entry.tag}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Visité le {entry.visitedAt}
                          {entry.costPaid && ` · ${entry.costPaid.toFixed(2).replace(".", ",")} €`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="flex items-center text-amber-500 font-extrabold text-sm">
                          <Star className="w-4 h-4 fill-amber-500 mr-0.5" />
                          {entry.rating}/5
                        </span>
                        <button
                          onClick={() => onDeleteEntry(entry.id)}
                          className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                          title="Supprimer la note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl text-xs text-slate-800 dark:text-slate-200">
                      <span className="font-black text-[#10B981]">Plat kiffé : </span>
                      <span className="font-semibold">{entry.favoriteDish}</span>
                    </div>

                    {entry.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                        "{entry.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Lieu visité
              </label>
              <select
                value={selectedPlaceId}
                onChange={(e) => setSelectedPlaceId(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white outline-none"
              >
                {places.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.zone})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Ma Note (1 à 5)
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 text-lg cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          s <= rating ? "text-amber-500 fill-amber-500" : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Montant payé (€)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={costPaid || ""}
                  onChange={(e) => setCostPaid(parseFloat(e.target.value) || undefined)}
                  placeholder="Ex: 9.90"
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Mon Plat / Box préféré(e)
              </label>
              <input
                type="text"
                required
                value={favoriteDish}
                onChange={(e) => setFavoriteDish(e.target.value)}
                placeholder="Ex: Box Crousti KFB 5 tenders cajun"
                className="w-full p-2.5 rounded-xl bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Mes Notes personnelles
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ambiance, sauce signature, astuce de commande…"
                className="w-full p-2.5 rounded-xl bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Mon ressenti global
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(["Coup de cœur", "À refaire", "Sympa", "Décevant"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTag(t)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      tag === t
                        ? "bg-[#10B981] text-slate-950 font-black"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 rounded-2xl font-black text-xs sm:text-sm text-slate-950 bg-[#10B981] hover:bg-[#059669] cursor-pointer"
              >
                Enregistrer dans mon carnet
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-3 rounded-2xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
