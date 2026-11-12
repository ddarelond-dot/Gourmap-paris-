import { RestaurantPlace } from "../types/food";

// Haversine distance formula in kilometers
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1).replace(".", ",")} km`;
}

// Check if a place is open based on place object or hours string
export function isCurrentlyOpen(placeOrHours?: RestaurantPlace | string | null, date: Date = new Date()): boolean {
  if (!placeOrHours) return true;
  const hoursStr = typeof placeOrHours === "string" ? placeOrHours : (placeOrHours?.hours || "");
  const lower = hoursStr.toLowerCase();
  if (lower.includes("24h/24") || lower.includes("tous les jours 6h–2h") || lower.includes("tous les jours 8h–5h")) {
    return true;
  }
  const currentHour = date.getHours();
  // Standard day/lunch/dinner hours
  if (currentHour >= 11 && currentHour <= 23) {
    return true;
  }
  // Morning boulangeries / cafes
  if (currentHour >= 6 && currentHour < 11 && (lower.includes("6h") || lower.includes("7h") || lower.includes("8h") || lower.includes("9h"))) {
    return true;
  }
  // Night owls
  if (currentHour >= 0 && currentHour <= 4 && (lower.includes("–2h") || lower.includes("–1h") || lower.includes("–3h") || lower.includes("–4h") || lower.includes("–5h") || lower.includes("jusqu’à") || lower.includes("0h"))) {
    return true;
  }
  return false;
}

// Landmarks in Paris area for context
export const PARIS_LANDMARKS = [
  { name: "Châtelet / Les Halles", lat: 48.8606, lng: 2.3476 },
  { name: "Stade de France", lat: 48.9245, lng: 2.3601 },
  { name: "Tour Eiffel", lat: 48.8584, lng: 2.2945 },
  { name: "Pigalle / Moulin Rouge", lat: 48.8825, lng: 2.3375 },
  { name: "Canal Saint-Martin", lat: 48.8718, lng: 2.3658 },
  { name: "Mairie de Saint-Ouen", lat: 48.9117, lng: 2.3335 },
  { name: "Bastille", lat: 48.8531, lng: 2.3691 },
  { name: "République", lat: 48.8674, lng: 2.3636 },
  { name: "Gare du Nord", lat: 48.8809, lng: 2.3553 },
  { name: "Gare de Lyon", lat: 48.8443, lng: 2.3744 },
];

export function getNearestLandmark(lat: number, lng: number): string {
  let closest = "";
  let minDistance = Infinity;

  for (const lm of PARIS_LANDMARKS) {
    const d = calculateDistanceKm(lat, lng, lm.lat, lm.lng);
    if (d < minDistance) {
      minDistance = d;
      closest = lm.name;
    }
  }

  if (minDistance <= 1.8) {
    return `à ${formatDistance(minDistance)} de ${closest}`;
  }
  return "";
}
