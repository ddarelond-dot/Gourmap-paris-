import { RawPlace } from "./rawDatabase";

export interface CommunityIntel {
  id: string;
  placeId: number;
  placeName: string;
  source: "TikTok" | "Instagram" | "Local Foodie" | "Google Maps 2026" | "Avis Communauté";
  type: "nouveau_banger" | "bon_plan_prix" | "horaire_nocturne" | "file_attente" | "certif_halal";
  title: string;
  detail: string;
  author: string;
  likes: number;
  date: string;
  verified: boolean;
}

export interface TrendRadarSignal {
  id: string;
  zone: string;
  department: string;
  cuisine: string;
  growthPercent: number; // e.g. +140% de recherches ce mois
  description: string;
  hotSpotsCount: number;
  topPlaceId: number;
  tag: string;
}

const STORAGE_INTEL_KEY = "gourmap-community-intel";
const STORAGE_TRENDS_KEY = "gourmap-trend-signals";

// Pre-seeded authentic community intel signals across Paris & IDF
export const INITIAL_INTEL: CommunityIntel[] = [
  {
    id: "intel-1",
    placeId: 0,
    placeName: "La Tradition (Saint-Denis)",
    source: "TikTok",
    type: "nouveau_banger",
    title: "Le nouveau smash cheddar fumé est disponible le midi",
    detail: "Testé hier : le bun brioché est toasté au beurre clarifié minute, portion encore plus généreuse pour 11,50 €.",
    author: "KarimFood93",
    likes: 84,
    date: "Hier",
    verified: true,
  },
  {
    id: "intel-2",
    placeId: 1,
    placeName: "La Passerelle (L'Île-Saint-Denis)",
    source: "Instagram",
    type: "horaire_nocturne",
    title: "Terrasse chauffée au bord de l'eau installée",
    detail: "Nouvelle formule goûter le mercredi après-midi avec tarte de saison bio faite maison.",
    author: "ParisBordsDeSeine",
    likes: 62,
    date: "Il y a 2 jours",
    verified: true,
  },
  {
    id: "intel-3",
    placeId: 2,
    placeName: "Les Curieux (Saint-Denis)",
    source: "Avis Communauté",
    type: "bon_plan_prix",
    title: "Le couscous royal du vendredi midi servi dès 11h45",
    detail: "Venir avant 12h15 pour avoir une table sans attendre. Graine ultra fine et bouillon mijoté.",
    author: "Nadia_Gourmet",
    likes: 129,
    date: "Il y a 3 jours",
    verified: true,
  },
  {
    id: "intel-4",
    placeId: 17,
    placeName: "KFB (KF Burger & Chicken)",
    source: "TikTok",
    type: "nouveau_banger",
    title: "La Box TikTok Crousti passe en version Spicy Garlic",
    detail: "Nouvelle panure ultra croustillante avec sauce ail douce épicée, toujours sous la barre des 10 €.",
    author: "FoodBuzzParis",
    likes: 310,
    date: "Cette semaine",
    verified: true,
  },
  {
    id: "intel-5",
    placeId: 24,
    placeName: "Bouillon Populaire Paris",
    source: "Local Foodie",
    type: "file_attente",
    title: "Moins d'attente les soirs de semaine à 19h précises",
    detail: "L'œuf mayo champion et la purée saucisse sont toujours impeccables. Prix imbattables intra-muros.",
    author: "JulienPaname",
    likes: 95,
    date: "Cette semaine",
    verified: true,
  },
];

// Evolving trends across Île-de-France
export const INITIAL_TREND_SIGNALS: TrendRadarSignal[] = [
  {
    id: "trend-1",
    zone: "Saint-Denis & Grand Paris Pleyel",
    department: "93",
    cuisine: "Street Food Fusion & Smash",
    growthPercent: 185,
    description: "Explosion de cantines artisanales et smash bars avec l'ouverture des nouvelles stations de métro.",
    hotSpotsCount: 42,
    topPlaceId: 0,
    tag: "🔥 En très forte hausse",
  },
  {
    id: "trend-2",
    zone: "Paris 11e (Oberkampf / Charonne)",
    department: "75",
    cuisine: "Coffee Shop & Cookies XXL coulants",
    growthPercent: 140,
    description: "Les pâtisseries minute et cookies sortis du four font le buzz sur les réseaux.",
    hotSpotsCount: 68,
    topPlaceId: 174,
    tag: "🍪 Tendance Goûter",
  },
  {
    id: "trend-3",
    zone: "Boulogne & Issy-les-Moulineaux",
    department: "92",
    cuisine: "Cuisine de Saison & Bistrots Vivants",
    growthPercent: 95,
    description: "Adresses bistronomiques accessibles le midi avec formules ardoise à prix doux.",
    hotSpotsCount: 35,
    topPlaceId: 1,
    tag: "🌿 Fraîcheur & Bio",
  },
  {
    id: "trend-4",
    zone: "Créteil & Bords de Marne",
    department: "94",
    cuisine: "Grillades au feu de bois & Spécialités Méditerranée",
    growthPercent: 110,
    description: "Très forte demande pour les grandes tables familiales 100% Halal certifiées.",
    hotSpotsCount: 29,
    topPlaceId: 3,
    tag: "🕌 Famille & Convivialité",
  },
];

export function getStoredIntel(): CommunityIntel[] {
  if (typeof window === "undefined") return INITIAL_INTEL;
  try {
    const raw = localStorage.getItem(STORAGE_INTEL_KEY);
    if (!raw) return INITIAL_INTEL;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_INTEL;
  } catch {
    return INITIAL_INTEL;
  }
}

export function addCommunityIntel(intel: Omit<CommunityIntel, "id" | "likes" | "date" | "verified">): CommunityIntel[] {
  const current = getStoredIntel();
  const newItem: CommunityIntel = {
    ...intel,
    id: "intel-" + Date.now(),
    likes: 1,
    date: "À l'instant",
    verified: false,
  };
  const updated = [newItem, ...current];
  try {
    localStorage.setItem(STORAGE_INTEL_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function likeCommunityIntel(id: string): CommunityIntel[] {
  const current = getStoredIntel();
  const updated = current.map(item => item.id === id ? { ...item, likes: item.likes + 1 } : item);
  try {
    localStorage.setItem(STORAGE_INTEL_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function getStoredTrends(): TrendRadarSignal[] {
  if (typeof window === "undefined") return INITIAL_TREND_SIGNALS;
  try {
    const raw = localStorage.getItem(STORAGE_TRENDS_KEY);
    if (!raw) return INITIAL_TREND_SIGNALS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TREND_SIGNALS;
  } catch {
    return INITIAL_TREND_SIGNALS;
  }
}
