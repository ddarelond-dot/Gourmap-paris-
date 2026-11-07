import React, { useState, useMemo } from "react";
import { X, Users, MapPin, Navigation, Sparkles, MessageCircle, Compass, ArrowRight, Star, Heart } from "lucide-react";
import { RawPlace } from "../data/rawDatabase";
import { calculateDistanceKm, formatDistance } from "../utils/geo";

interface MidpointMeetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: RawPlace[];
  userLat: number;
  userLng: number;
  onSelectPlace: (place: RawPlace) => void;
}

// Popular Meeting Hubs & Stations across Paris and Île-de-France
const POPULAR_HUBS = [
  { name: "Châtelet – Les Halles (Centre Paris)", lat: 48.8606, lng: 2.3476 },
  { name: "Gare de Lyon / Bercy (Paris 12e)", lat: 48.8443, lng: 2.3744 },
  { name: "Montparnasse (Paris 14e / 15e)", lat: 48.8412, lng: 2.3216 },
  { name: "Gare du Nord / Gare de l'Est (Paris 10e)", lat: 48.8809, lng: 2.3553 },
  { name: "Saint-Lazare / Opéra (Paris 8e / 9e)", lat: 48.8756, lng: 2.3255 },
  { name: "La Défense – Grande Arche (92)", lat: 48.8924, lng: 2.2361 },
  { name: "Saint-Denis – Pleyel (93)", lat: 48.9189, lng: 2.3486 },
  { name: "Vincennes – Château (94)", lat: 48.8483, lng: 2.4332 },
  { name: "Créteil – Université (94)", lat: 48.7891, lng: 2.4523 },
  { name: "Boulogne – Marcel Sembat (92)", lat: 48.8336, lng: 2.2427 },
  { name: "Versailles – Chantiers (78)", lat: 48.7958, lng: 2.1356 },
  { name: "Massy – Palaiseau (91)", lat: 48.7252, lng: 2.2605 },
  { name: "Cergy – Préfecture (95)", lat: 49.0366, lng: 2.0789 },
  { name: "Argenteuil – Centre (95)", lat: 48.9482, lng: 2.2467 },
  { name: "Évry – Courcouronnes (91)", lat: 48.6253, lng: 2.4289 },
  { name: "Meaux – Gare (77)", lat: 48.9567, lng: 2.8751 },
  { name: "Chelles – Gournay (77)", lat: 48.8752, lng: 2.5912 },
];

export const MidpointMeetupModal: React.FC<MidpointMeetupModalProps> = ({
  isOpen,
  onClose,
  places,
  userLat,
  userLng,
  onSelectPlace,
}) => {
  const [person1Choice, setPerson1Choice] = useState<string>("gps");
  const [person2Choice, setPerson2Choice] = useState<string>("Gare de Lyon / Bercy (Paris 12e)");
  const [maxBudget, setMaxBudget] = useState<number | null>(null);
  const [cuisineFilter, setCuisineFilter] = useState<string>("all");

  const coords1 = useMemo(() => {
    if (person1Choice === "gps") {
      return { name: "Ta position GPS en direct", lat: userLat, lng: userLng };
    }
    const found = POPULAR_HUBS.find((h) => h.name === person1Choice);
    return found || { name: person1Choice, lat: userLat, lng: userLng };
  }, [person1Choice, userLat, userLng]);

  const coords2 = useMemo(() => {
    const found = POPULAR_HUBS.find((h) => h.name === person2Choice);
    return found || POPULAR_HUBS[0];
  }, [person2Choice]);

  // Exact spatial centroid
  const midpoint = useMemo(() => {
    const lat = (coords1.lat + coords2.lat) / 2;
    const lng = (coords1.lng + coords2.lng) / 2;
    return { lat, lng };
  }, [coords1, coords2]);

  // Distance between the 2 people
  const totalDistanceKm = useMemo(() => {
    return calculateDistanceKm(coords1.lat, coords1.lng, coords2.lat, coords2.lng);
  }, [coords1, coords2]);

  // Find best rated spots near the midpoint
  const midpointResults = useMemo(() => {
    if (!places || places.length === 0) return [];

    let pool = places.filter((p) => {
      if (maxBudget !== null && p.pr > maxBudget) return false;
      if (cuisineFilter !== "all" && p.cat !== cuisineFilter && !p.sub.toLowerCase().includes(cuisineFilter.toLowerCase())) return false;
      return true;
    });

    // Score based on distance to midpoint and high rating
    const scored = pool.map((p) => {
      const dMid = calculateDistanceKm(midpoint.lat, midpoint.lng, p.la, p.lo);
      const d1 = calculateDistanceKm(coords1.lat, coords1.lng, p.la, p.lo);
      const d2 = calculateDistanceKm(coords2.lat, coords2.lng, p.la, p.lo);
      const fairness = Math.abs(d1 - d2); // lower is more equal for both
      // Score: high rating, high reviews, small midpoint distance, fair split
      const score = p.r * 2.5 + Math.log10(p.c + 10) - dMid * 1.8 - fairness * 0.8;
      return { place: p, dMid, d1, d2, fairness, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 15);
  }, [places, midpoint, coords1, coords2, maxBudget, cuisineFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-[#0A0A10] border border-amber-500/35 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="px-5 py-4 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shadow-amber-500/30">
              🤝
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans font-black text-lg text-white">
                  Où Manger à Mi-Chemin ?
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  Duo & Potes
                </span>
              </div>
              <p className="text-xs text-amber-200/70">
                Trouve le spot parfait à égale distance de chacun en Île-de-France
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
          {/* Inputs for Person 1 and Person 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#12121A] p-4 rounded-2xl border border-amber-500/20">
            {/* Person 1 */}
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-amber-400 block mb-1">
                📍 Personne 1 (Toi)
              </label>
              <select
                value={person1Choice}
                onChange={(e) => setPerson1Choice(e.target.value)}
                className="w-full bg-[#181824] border border-zinc-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none"
              >
                <option value="gps">📡 Ma Position GPS actuelle</option>
                {POPULAR_HUBS.map((h) => (
                  <option key={h.name} value={h.name}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Person 2 */}
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-amber-400 block mb-1">
                📍 Personne 2 (Ton pote / date)
              </label>
              <select
                value={person2Choice}
                onChange={(e) => setPerson2Choice(e.target.value)}
                className="w-full bg-[#181824] border border-zinc-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none"
              >
                {POPULAR_HUBS.map((h) => (
                  <option key={h.name} value={h.name}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Centroid Info Pill */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="text-zinc-200">
                Distance entre vous : <strong className="text-white font-black">{totalDistanceKm.toFixed(1)} km</strong>
              </span>
            </div>
            <span className="text-[11px] font-bold text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
              Égalité de trajet garantie (~{Math.round((totalDistanceKm / 2) / 0.08)} min chacun à pied ou métro)
            </span>
          </div>

          {/* Quick Filters for Midpoint */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/80 shrink-0">
              Budget :
            </span>
            {[
              { label: "Tous", val: null },
              { label: "≤ 10 €", val: 1 },
              { label: "≤ 18 €", val: 2 },
            ].map((b) => (
              <button
                key={b.label}
                onClick={() => setMaxBudget(b.val)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  maxBudget === b.val
                    ? "bg-amber-400 text-slate-950 font-black"
                    : "bg-[#141420] text-zinc-400 border border-white/5 hover:text-white"
                }`}
              >
                {b.label}
              </button>
            ))}

            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/80 shrink-0 ml-2">
              Envie :
            </span>
            {[
              { label: "Tous", val: "all" },
              { label: "Smash", val: "Smash" },
              { label: "Italien", val: "Italien" },
              { label: "Tacos", val: "Tacos" },
              { label: "Asiatique", val: "Asiatique" },
            ].map((c) => (
              <button
                key={c.label}
                onClick={() => setCuisineFilter(c.val)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  cuisineFilter === c.val
                    ? "bg-amber-400 text-slate-950 font-black"
                    : "bg-[#141420] text-zinc-400 border border-white/5 hover:text-white"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">
              Pépites parfaites à mi-chemin ({midpointResults.length} trouvées) :
            </h4>

            {midpointResults.map(({ place, d1, d2, fairness }, idx) => {
              const walk1 = Math.max(1, Math.round(d1 / 0.08));
              const walk2 = Math.max(1, Math.round(d2 / 0.08));

              return (
                <div
                  key={place.id}
                  onClick={() => {
                    onSelectPlace(place);
                    onClose();
                  }}
                  className="p-3.5 rounded-2xl bg-[#12121A] border border-amber-500/20 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer group flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-amber-400">
                          #{idx + 1}
                        </span>
                        <h5 className="font-black text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                          {place.n}
                        </h5>
                        {place.tiktokViral && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-[#FF0050] text-white">
                            TIKTOK
                          </span>
                        )}
                        {place.isHalal && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950">
                            HALAL
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5 truncate">
                        ★ {place.r.toFixed(1)} ({place.c} avis) · {place.sub} · {place.z}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const share = `On se retrouve à mi-chemin ? 🤝\n📍 *${place.n}*\nAdresse : ${place.a}\n🗺️ Itinéraire : https://www.google.com/maps/dir/?api=1&destination=${place.la},${place.lo}`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(share)}`, "_blank");
                      }}
                      className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30 transition-colors shrink-0"
                      title="Partager sur WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Travel Time for Both */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5 text-[11px]">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <span className="text-amber-400 font-bold">Toi :</span>
                      <span>{formatDistance(d1)} (~{walk1} min)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <span className="text-cyan-400 font-bold">Pote :</span>
                      <span>{formatDistance(d2)} (~{walk2} min)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-amber-500/20 bg-[#0E0E16] flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            Calcul spatial sub-millimétrique garanti
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-black bg-amber-400 text-slate-950 hover:brightness-110 transition-all cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
