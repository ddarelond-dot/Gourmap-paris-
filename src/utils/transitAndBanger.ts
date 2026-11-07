import { calculateDistanceKm } from "./geo";

export interface TransitStation {
  name: string;
  line: string;
  type: "metro" | "rer" | "tram";
  lat: number;
  lng: number;
  color: string;
  textColor: string;
}

export const TRANSIT_NETWORK: TransitStation[] = [
  // Paris Intra-muros Major Hubs
  { name: "Châtelet - Les Halles", line: "M1 / M4 / M14", type: "metro", lat: 48.8606, lng: 2.3477, color: "#FFCD00", textColor: "#000" },
  { name: "République", line: "M3 / M5 / M8 / M9 / M11", type: "metro", lat: 48.8675, lng: 2.3638, color: "#CF009E", textColor: "#fff" },
  { name: "Bastille", line: "M1 / M5 / M8", type: "metro", lat: 48.8531, lng: 2.3691, color: "#FF7E2E", textColor: "#000" },
  { name: "Saint-Michel - Notre-Dame", line: "M4 / RER B", type: "metro", lat: 48.8534, lng: 2.3444, color: "#5291CE", textColor: "#fff" },
  { name: "Gare du Nord", line: "M4 / M5 / RER B/D", type: "metro", lat: 48.8809, lng: 2.3553, color: "#CF009E", textColor: "#fff" },
  { name: "Montparnasse - Bienvenüe", line: "M4 / M6 / M12 / M13", type: "metro", lat: 48.8421, lng: 2.3219, color: "#6EC4E8", textColor: "#000" },
  { name: "Strasbourg - Saint-Denis", line: "M4 / M8 / M9", type: "metro", lat: 48.8696, lng: 2.3544, color: "#CF009E", textColor: "#fff" },
  { name: "Belleville", line: "M2 / M11", type: "metro", lat: 48.8722, lng: 2.3769, color: "#704B1C", textColor: "#fff" },
  { name: "Gare de Lyon", line: "M1 / M14 / RER A", type: "metro", lat: 48.8443, lng: 2.3744, color: "#62259D", textColor: "#fff" },
  { name: "Opéra", line: "M3 / M7 / M8 / RER A", type: "metro", lat: 48.8712, lng: 2.3323, color: "#FA9ABA", textColor: "#000" },
  { name: "Olympiades", line: "M14", type: "metro", lat: 48.8268, lng: 2.3664, color: "#62259D", textColor: "#fff" },
  { name: "Pigalle", line: "M2 / M12", type: "metro", lat: 48.8822, lng: 2.3371, color: "#007852", textColor: "#fff" },
  { name: "Nation", line: "M1 / M2 / M6 / M9 / RER A", type: "metro", lat: 48.8484, lng: 2.3959, color: "#E3051B", textColor: "#fff" },
  { name: "Odéon", line: "M4 / M10", type: "metro", lat: 48.8523, lng: 2.3387, color: "#C9910D", textColor: "#fff" },
  { name: "Saint-Paul (Le Marais)", line: "M1", type: "metro", lat: 48.8553, lng: 2.3614, color: "#FFCD00", textColor: "#000" },
  { name: "Abbesses (Montmartre)", line: "M12", type: "metro", lat: 48.8845, lng: 2.3385, color: "#007852", textColor: "#fff" },
  { name: "Oberkampf", line: "M5 / M9", type: "metro", lat: 48.8643, lng: 2.3697, color: "#FF7E2E", textColor: "#000" },
  { name: "Ménilmontant", line: "M2", type: "metro", lat: 48.8665, lng: 2.3837, color: "#003CA6", textColor: "#fff" },
  { name: "Canal Saint-Martin / Jacques Bonsergent", line: "M5", type: "metro", lat: 48.8711, lng: 2.3602, color: "#FF7E2E", textColor: "#000" },
  { name: "Place d'Italie", line: "M5 / M6 / M7", type: "metro", lat: 48.8315, lng: 2.3556, color: "#6ECA97", textColor: "#000" },

  // Seine-Saint-Denis (93)
  { name: "Saint-Denis - Porte de Paris", line: "M13 / T8", type: "metro", lat: 48.9298, lng: 2.3571, color: "#6EC4E8", textColor: "#000" },
  { name: "Saint-Denis Basilique", line: "M13 / T1 / T5", type: "metro", lat: 48.9362, lng: 2.3574, color: "#6EC4E8", textColor: "#000" },
  { name: "Mairie de Saint-Ouen", line: "M13 / M14", type: "metro", lat: 48.9117, lng: 2.3335, color: "#62259D", textColor: "#fff" },
  { name: "Carrefour Pleyel", line: "M13 / M14", type: "metro", lat: 48.9202, lng: 2.3441, color: "#62259D", textColor: "#fff" },
  { name: "Mairie de Montreuil", line: "M9", type: "metro", lat: 48.8624, lng: 2.4418, color: "#B6BD00", textColor: "#000" },
  { name: "Pantin - Église de Pantin", line: "M5", type: "metro", lat: 48.8932, lng: 2.4086, color: "#FF7E2E", textColor: "#000" },
  { name: "Aubervilliers - Front Populaire", line: "M12", type: "metro", lat: 48.9064, lng: 2.3653, color: "#007852", textColor: "#fff" },
  { name: "Bobigny - Pablo Picasso", line: "M5 / T1", type: "metro", lat: 48.9068, lng: 2.4496, color: "#FF7E2E", textColor: "#000" },
  { name: "Noisy-le-Grand Mont d'Est", line: "RER A", type: "rer", lat: 48.8398, lng: 2.5511, color: "#E3051B", textColor: "#fff" },
  { name: "Aulnay-sous-Bois", line: "RER B / T4", type: "rer", lat: 48.9328, lng: 2.4962, color: "#5291CE", textColor: "#fff" },

  // Hauts-de-Seine (92)
  { name: "La Défense - Grande Arche", line: "M1 / RER A / T2", type: "metro", lat: 48.8918, lng: 2.2378, color: "#FFCD00", textColor: "#000" },
  { name: "Boulogne - Jean Jaurès", line: "M10", type: "metro", lat: 48.8403, lng: 2.2407, color: "#C9910D", textColor: "#fff" },
  { name: "Marcel Sembat (Boulogne)", line: "M9", type: "metro", lat: 48.8335, lng: 2.2435, color: "#B6BD00", textColor: "#000" },
  { name: "Louise Michel (Levallois)", line: "M3", type: "metro", lat: 48.8906, lng: 2.2877, color: "#837902", textColor: "#fff" },
  { name: "Pont de Neuilly", line: "M1", type: "metro", lat: 48.8848, lng: 2.2592, color: "#FFCD00", textColor: "#000" },
  { name: "Mairie de Clichy", line: "M13", type: "metro", lat: 48.9038, lng: 2.3049, color: "#6EC4E8", textColor: "#000" },
  { name: "Mairie de Montrouge", line: "M4", type: "metro", lat: 48.8175, lng: 2.3197, color: "#CF009E", textColor: "#fff" },
  { name: "Mairie d'Issy", line: "M12", type: "metro", lat: 48.8242, lng: 2.2736, color: "#007852", textColor: "#fff" },
  { name: "Gabriel Péri (Asnières / Gennevilliers)", line: "M13", type: "metro", lat: 48.9168, lng: 2.2965, color: "#6EC4E8", textColor: "#000" },
  { name: "Nanterre - Université", line: "RER A", type: "rer", lat: 48.9009, lng: 2.2139, color: "#E3051B", textColor: "#fff" },
  { name: "Rueil-Malmaison", line: "RER A", type: "rer", lat: 48.8894, lng: 2.1706, color: "#E3051B", textColor: "#fff" },

  // Val-de-Marne (94)
  { name: "Château de Vincennes", line: "M1 / RER A", type: "metro", lat: 48.8447, lng: 2.4403, color: "#FFCD00", textColor: "#000" },
  { name: "Mairie d'Ivry", line: "M7", type: "metro", lat: 48.8115, lng: 2.3852, color: "#FA9ABA", textColor: "#000" },
  { name: "Villejuif - Louis Aragon", line: "M7 / T7", type: "metro", lat: 48.7871, lng: 2.3676, color: "#FA9ABA", textColor: "#000" },
  { name: "Créteil - Préfecture", line: "M8", type: "metro", lat: 48.7801, lng: 2.4608, color: "#E19BDF", textColor: "#000" },
  { name: "Saint-Mandé", line: "M1", type: "metro", lat: 48.8442, lng: 2.4190, color: "#FFCD00", textColor: "#000" },
  { name: "Charenton - Écoles", line: "M8", type: "metro", lat: 48.8222, lng: 2.4137, color: "#E19BDF", textColor: "#000" },
  { name: "Maisons-Alfort - Les Juilliottes", line: "M8", type: "metro", lat: 48.7997, lng: 2.4468, color: "#E19BDF", textColor: "#000" },

  // Grande Couronne (78, 91, 95, 77)
  { name: "Versailles Château Rive Gauche", line: "RER C", type: "rer", lat: 48.8000, lng: 2.1298, color: "#FFCE00", textColor: "#000" },
  { name: "Saint-Germain-en-Laye", line: "RER A", type: "rer", lat: 48.8986, lng: 2.0967, color: "#E3051B", textColor: "#fff" },
  { name: "Massy - Palaiseau", line: "RER B / RER C", type: "rer", lat: 48.7247, lng: 2.2605, color: "#5291CE", textColor: "#fff" },
  { name: "Évry - Courcouronnes", line: "RER D", type: "rer", lat: 48.6247, lng: 2.4285, color: "#00814F", textColor: "#fff" },
  { name: "Cergy - Préfecture", line: "RER A / Ligne L", type: "rer", lat: 49.0368, lng: 2.0799, color: "#E3051B", textColor: "#fff" },
  { name: "Enghien-les-Bains", line: "Ligne H", type: "rer", lat: 48.9702, lng: 2.3082, color: "#704B1C", textColor: "#fff" },
  { name: "Argenteuil", line: "Ligne J", type: "rer", lat: 48.9482, lng: 2.2478, color: "#B6BD00", textColor: "#000" },
  { name: "Marne-la-Vallée Chessy", line: "RER A", type: "rer", lat: 48.8708, lng: 2.7831, color: "#E3051B", textColor: "#fff" },
  { name: "Fontainebleau - Avon", line: "Ligne R", type: "rer", lat: 48.4187, lng: 2.7233, color: "#FF7E2E", textColor: "#000" },
];

/**
 * Returns the nearest transit station with walking time calculation (~4.5 km/h = 75m/min)
 */
export function getNearestTransit(lat: number, lng: number): {
  name: string;
  line: string;
  type: "metro" | "rer" | "tram";
  walkMin: number;
  formatted: string;
  color: string;
  textColor: string;
} | null {
  let closest: TransitStation | null = null;
  let minDistance = Infinity;

  for (const station of TRANSIT_NETWORK) {
    const d = calculateDistanceKm(lat, lng, station.lat, station.lng);
    if (d < minDistance) {
      minDistance = d;
      closest = station;
    }
  }

  if (!closest || minDistance > 2.8) return null;

  const walkMin = Math.max(1, Math.round((minDistance * 1000) / 75));
  const icon = closest.type === "rer" ? "🚆" : "🚇";

  return {
    name: closest.name,
    line: closest.line,
    type: closest.type,
    walkMin,
    color: closest.color,
    textColor: closest.textColor,
    formatted: `${icon} ${closest.line.split(" ")[0]} · ${closest.name} (~${walkMin} min à pied)`,
  };
}

/**
 * Extracts or generates the mouth-watering "Banger à commander" for any place.
 */
export function getSignatureBanger(place: {
  n?: string;
  s?: string;
  pros?: string[];
  sub?: string;
  foodKey?: string;
}): string {
  // If place has pros mentioning a specific dish, prioritize it
  if (place.pros && place.pros.length > 0) {
    for (const pro of place.pros) {
      const lower = pro.toLowerCase();
      if (
        lower.includes("burger") ||
        lower.includes("smash") ||
        lower.includes("poulet") ||
        lower.includes("couscous") ||
        lower.includes("tajine") ||
        lower.includes("sushi") ||
        lower.includes("chirashi") ||
        lower.includes("pizza") ||
        lower.includes("pâtes") ||
        lower.includes("bœuf") ||
        lower.includes("entrecôte") ||
        lower.includes("tacos") ||
        lower.includes("naan") ||
        lower.includes("ramen") ||
        lower.includes("cookie") ||
        lower.includes("crêpe") ||
        lower.includes("flan")
      ) {
        return pro.charAt(0).toUpperCase() + pro.slice(1);
      }
    }
  }

  // Parse summary for tempting keywords
  const summary = (place.s || "").toLowerCase();
  if (summary.includes("couscous")) return "Le Couscous Royal 5 viandes & graine roulée main";
  if (summary.includes("smash")) return "Le Smash Burger Double Cheddar fumé & frites maison";
  if (summary.includes("poulet")) return "Le Poulet croustillant mariné minute & panure dorée";
  if (summary.includes("entrecôte") || summary.includes("saucisse")) return "L'Entrecôte grillée minute servie avec frites maison";
  if (summary.includes("tacos") || summary.includes("grillade")) return "Le Tacos garni généreux avec sauce fromagère maison";
  if (summary.includes("pad thaï") || summary.includes("curry")) return "Le Pad Thaï sauté au wok minute & crevettes géantes";
  if (summary.includes("ramen") || summary.includes("chashu")) return "Le Bol de Ramen au bouillon riche 14h & œuf parfait";
  if (summary.includes("sushi") || summary.includes("saumon")) return "Le Chirashi Saumon Label Rouge fondant & riz tiède vinaigré";
  if (summary.includes("pizza") || summary.includes("mozzarella")) return "La Pizza Napolitaine croûte soufflée & mozzarella di bufala";
  if (summary.includes("cookie") || summary.includes("flan")) return "Le Cookie XXL coulant praliné & fleur de sel de Guérande";
  if (summary.includes("crêpe") || summary.includes("galette")) return "La Galette sarrasin pur beurre, œuf bio & fromage affiné";
  if (summary.includes("bio") || summary.includes("saison")) return "Le Menu Ardoise de Saison cuisiné minute par le Chef";

  // Fallback based on subCategory
  const sub = (place.sub || "").toLowerCase();
  if (sub.includes("français")) return "Le Plat du Jour maison mijoté avec amour";
  if (sub.includes("burger")) return "Le Burger Gourmet Signature pain brioché";
  if (sub.includes("kebab")) return "Le Döner Veau Maison pain toasté & légumes rôtis";
  if (sub.includes("japonais")) return "Le Bento Dégustation & sushis frais découpés minute";
  if (sub.includes("turc")) return "L'Assiette Grillades Mixtes au feu de bois & pain pita chaud";
  if (sub.includes("italien")) return "Les Pâtes fraîches à la truffe & parmesan 24 mois";

  return "La Spécialité Signature plébiscitée par les habitués";
}
