import { ALL_RAW_PLACES, RawPlace } from "./rawDatabase";
import { FAMOUS_CHAINS_PLACES } from "./famousChainsData";

const STORAGE_KEY = "gourmap-custom-places";

// Base catalog: 2,065+ authentic curated spots across Paris & all Île-de-France (75, 92, 93, 94, 78, 91, 95, 77)
// Including major iconic French & international chains (Buffalo Grill, Hippopotamus, Five Guys, Popeyes, Léon, etc.)
export const BASE_ALL_PLACES: RawPlace[] = [...FAMOUS_CHAINS_PLACES, ...ALL_RAW_PLACES];

export function getCustomPlaces(): RawPlace[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Could not read custom places from localStorage", e);
    return [];
  }
}

export function saveCustomPlace(newPlace: RawPlace): RawPlace[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getCustomPlaces();
    const updated = [newPlace, ...current.filter((p) => p.id !== newPlace.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn("Could not save custom place to localStorage", e);
    return [];
  }
}

export function deleteCustomPlace(id: number): RawPlace[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getCustomPlaces();
    const updated = current.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn("Could not delete custom place from localStorage", e);
    return [];
  }
}
