import React, { useState } from "react";
import {
  X,
  PlusCircle,
  MapPin,
  Sparkles,
  CheckCircle2,
  Phone,
  Clock,
  Navigation,
  Star,
  ShieldCheck,
  Flame,
  Tag,
  Info,
} from "lucide-react";
import { RawPlace } from "../data/rawDatabase";

interface AddRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlace: (newPlace: RawPlace) => void;
  userLat?: number;
  userLng?: number;
}

const COMMON_SUBS = [
  "Smash Burger",
  "Italien / Pizza",
  "Tacos & Burritos",
  "Poulet Frit & Wings",
  "Kebab & Berliner",
  "Ramen & Gyoza",
  "Sushi & Chirashi",
  "Thaï & Wok",
  "Indien & Cheese Naan",
  "Libanais & Mezze",
  "Boulangerie & Pâtisserie",
  "Brunch & Pancakes",
  "Crêperie & Gaufres",
  "Bistrot Français",
  "Bubble Tea",
];

const PARIS_ZONES = [
  "1er Louvre",
  "2e Sentier / Montorgueil",
  "3e Haut-Marais",
  "4e Marais / Saint-Paul",
  "5e Quartier Latin",
  "6e Saint-Germain",
  "7e Tour Eiffel",
  "8e Champs-Élysées",
  "9e Opéra / Pigalle",
  "10e Canal Saint-Martin",
  "11e Bastille / Oberkampf",
  "12e Aligre / Nation",
  "13e Chinatown",
  "14e Montparnasse",
  "15e Convention",
  "16e Passy",
  "17e Batignolles",
  "18e Montmartre",
  "19e Belleville",
  "20e Gambetta",
  "Saint-Denis & Pleyel",
  "Saint-Ouen",
  "Boulogne-Billancourt",
  "Levallois-Perret",
  "Montreuil",
  "Pantin",
  "Autre Paris / IDF",
];

export const AddRestaurantModal: React.FC<AddRestaurantModalProps> = ({
  isOpen,
  onClose,
  onAddPlace,
  userLat = 48.8566,
  userLng = 2.3522,
}) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(userLat);
  const [lng, setLng] = useState(userLng);
  const [cat, setCat] = useState<"Restaurant" | "Fast-food" | "Goûter" | "Marché">("Fast-food");
  const [sub, setSub] = useState("Smash Burger");
  const [zone, setZone] = useState("11e Bastille / Oberkampf");
  const [rating, setRating] = useState(4.8);
  const [priceLevel, setPriceLevel] = useState(1);
  const [isHalal, setIsHalal] = useState(true);
  const [halalStatus, setHalalStatus] = useState<"100% Halal" | "Viandes Halal certifiées" | "Options Halal disponibles">("100% Halal");
  const [isOpenLate, setIsOpenLate] = useState(false);
  const [phone, setPhone] = useState("");
  const [summary, setSummary] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isOpen) return null;

  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée sur ce navigateur.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Number(pos.coords.latitude.toFixed(5)));
        setLng(Number(pos.coords.longitude.toFixed(5)));
        if (!address) {
          setAddress(`Position GPS exacte (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        }
        setIsLocating(false);
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPlace: RawPlace = {
      id: Date.now(),
      n: name.trim(),
      a: address.trim() || `${zone}, Paris`,
      la: lat,
      lo: lng,
      r: rating,
      c: 1,
      pr: priceLevel,
      cat,
      sub,
      tel: phone.trim() || "+33100000000",
      h: isOpenLate ? "Tous les jours 11h30–02h (Nocturne)" : "Tous les jours 12h–23h",
      s: summary.trim() || `Pépite culinaire recommandée par la communauté L'Appli Gourmande : ${sub} de qualité supérieure.`,
      z: zone,
      name: name.trim(),
      address: address.trim() || `${zone}, Paris`,
      lat,
      lng,
      rating,
      reviewCount: 1,
      priceLevel,
      category: cat,
      subCategory: sub,
      phone: phone.trim() || "+33100000000",
      hours: isOpenLate ? "Tous les jours 11h30–02h (Nocturne)" : "Tous les jours 12h–23h",
      summary: summary.trim() || `Pépite culinaire recommandée par la communauté L'Appli Gourmande : ${sub} de qualité supérieure.`,
      zone,
      isHalal,
      halalStatus: isHalal ? halalStatus : undefined,
      halalNotice: isHalal ? "Viandes et préparations certifiées Halal" : undefined,
      isOpenLate,
      tiktokViral: true,
      foodKey: sub.toLowerCase().includes("burger")
        ? "burger"
        : sub.toLowerCase().includes("pizza")
        ? "pizza"
        : sub.toLowerCase().includes("tacos")
        ? "tacos"
        : sub.toLowerCase().includes("chicken") || sub.toLowerCase().includes("poulet")
        ? "chicken"
        : sub.toLowerCase().includes("ramen")
        ? "ramen"
        : sub.toLowerCase().includes("sushi")
        ? "sushi"
        : sub.toLowerCase().includes("kebab")
        ? "kebab"
        : "bistrot",
      pros: ["Super accueil", "Produits frais"],
      cons: [],
    };

    onAddPlace(newPlace);
    setSuccessNotice(true);
    setTimeout(() => {
      setSuccessNotice(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-[#0A0A10] text-[#F9F9FB] rounded-3xl border border-amber-500/35 shadow-[0_20px_70px_rgba(0,0,0,0.9)] shadow-amber-500/10 overflow-hidden p-5 sm:p-6 max-h-[92vh] overflow-y-auto no-scrollbar animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-24 bg-gradient-to-b from-amber-500/25 to-transparent blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-800"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-5 relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/30 text-2xl font-black shrink-0 border border-amber-300">
            ✨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-black text-xl tracking-tight text-white">
                Ajouter un <span className="text-gold-gradient font-black">Resto VIP</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Instantané
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Tu es dans un resto pas encore répertorié ? Ajoute-le directement sur la carte !
            </p>
          </div>
        </div>

        {successNotice && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 mb-4 animate-fadeIn">
            <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-400" />
            <div className="text-xs leading-relaxed text-zinc-100">
              <strong className="block font-bold text-sm text-emerald-300">
                Pépite ajoutée avec succès !
              </strong>
              Le restaurant est maintenant enregistré dans ton application et épinglé sur la carte.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Restaurant Name */}
          <div>
            <label className="block text-xs font-bold text-amber-300 mb-1">
              Nom du restaurant *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Le Smash Gourmet, Cantine Beyrouth, Trattoria 11e..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121A] border border-amber-500/25 text-white placeholder-zinc-500 text-sm focus:outline-hidden focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Address & GPS */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-amber-300">
                Adresse & Localisation *
              </label>
              <button
                type="button"
                onClick={handleUseCurrentGPS}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{isLocating ? "Géolocalisation..." : "Prendre ma position GPS"}</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: 24 Rue de Charonne, 75011 Paris"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121A] border border-amber-500/25 text-white placeholder-zinc-500 text-sm focus:outline-hidden focus:border-amber-400 transition-colors"
            />
          </div>

          {/* District / Zone & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Quartier / Zone
              </label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#12121A] border border-zinc-800 text-white text-xs focus:outline-hidden focus:border-amber-400 cursor-pointer"
              >
                {PARIS_ZONES.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Catégorie
              </label>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#12121A] border border-zinc-800 text-white text-xs focus:outline-hidden focus:border-amber-400 cursor-pointer"
              >
                <option value="Fast-food">🍔 Fast-food</option>
                <option value="Restaurant">🍽️ Restaurant</option>
                <option value="Goûter">🥐 Goûter & Brunch</option>
                <option value="Marché">🏛️ Marché & Halles</option>
              </select>
            </div>
          </div>

          {/* Subcategory / Specialty */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Spécialité culinaire
            </label>
            <input
              type="text"
              value={sub}
              onChange={(e) => setSub(e.target.value)}
              placeholder="Ex: Smash Burger, Tacos, Pizza, Ramen..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121A] border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-hidden focus:border-amber-400 transition-colors mb-2"
            />
            {/* Quick Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {COMMON_SUBS.slice(0, 7).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSub(s)}
                  className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                    sub === s
                      ? "bg-amber-400 text-zinc-950 font-black"
                      : "bg-[#181824] text-zinc-400 hover:text-white border border-zinc-800"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Rating & Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Note Google Maps ({rating.toFixed(1)} ★)
              </label>
              <input
                type="range"
                min="3.5"
                max="5.0"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Budget / Prix
              </label>
              <div className="flex rounded-xl bg-[#12121A] border border-zinc-800 p-1">
                {[
                  [1, "€ ≤ 10€"],
                  [2, "€€ 10-20€"],
                  [3, "€€€ 25€+"],
                ].map(([val, label]) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setPriceLevel(Number(val))}
                    className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      priceLevel === val
                        ? "bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Halal and Late Night toggles */}
          <div className="p-3 rounded-2xl bg-[#12121A] border border-amber-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Options Halal</span>
              </div>
              <input
                type="checkbox"
                checked={isHalal}
                onChange={(e) => setIsHalal(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>

            {isHalal && (
              <div className="flex gap-1.5 pt-1 border-t border-zinc-800">
                {(["100% Halal", "Viandes Halal certifiées", "Options Halal disponibles"] as const).map((status) => (
                  <button
                    type="button"
                    key={status}
                    onClick={() => setHalalStatus(status)}
                    className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer text-center ${
                      halalStatus === status
                        ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                        : "bg-[#181824] text-zinc-400 hover:text-white border border-zinc-800"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">Ouvert tard (Nocturne après 23h)</span>
              </div>
              <input
                type="checkbox"
                checked={isOpenLate}
                onChange={(e) => setIsOpenLate(e.target.checked)}
                className="w-4 h-4 accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Summary / Avis Personnel */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Ton avis ou plat coup de cœur
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Ex: Le smash double cheese est incroyable avec la sauce maison, frites fraîches croustillantes !"
              className="w-full px-3.5 py-2 rounded-xl bg-[#12121A] border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-hidden focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm text-zinc-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 shadow-lg shadow-amber-500/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-zinc-950" />
            <span>Ajouter & Épingler cette pépite</span>
          </button>
        </form>
      </div>
    </div>
  );
};
