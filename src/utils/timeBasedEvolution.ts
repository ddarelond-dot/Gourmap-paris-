/**
 * Moteur d'Évolution Dynamique et Temporelle de L'Appli Gourmande
 * Fait évoluer le contenu, les drops et les bannières automatiquement
 * au fil des semaines sans nécessiter de recompilation manuelle.
 */

export interface WeeklySpotlight {
  weekNumber: number;
  badge: string;
  title: string;
  subtitle: string;
  highlightCategory: string;
  searchFilter: string;
  themeColor: string;
  bangerOfTheWeek: {
    placeName: string;
    dish: string;
    price: string;
    emoji: string;
    quote: string;
  };
  upcomingDropIn3Weeks: string;
}

// 8 cycles thématiques tournants basés sur la semaine de l'année
export const ROTATING_WEEKLY_SPOTLIGHTS: WeeklySpotlight[] = [
  {
    weekNumber: 1,
    badge: "🔥 DROP SEMAINE · CHICKEN FEVER",
    title: "Le Duel du Poulet le Plus Croustillant",
    subtitle: "Pepe Chicken Habanero vs KFB Spicy Garlic : qui a la meilleure panure d'IDF ?",
    highlightCategory: "Poulet & Tenders",
    searchFilter: "poulet",
    themeColor: "from-orange-500/30 via-red-500/20 to-[#12121A]",
    bangerOfTheWeek: {
      placeName: "Pepe Chicken",
      dish: "Tenders Niveau 5 Ghost Pepper",
      price: "12,90 €",
      emoji: "🍗",
      quote: "Le piment le plus corsé de Paris qui affole TikTok.",
    },
    upcomingDropIn3Weeks: "Drop Spécial : Les Smash Burgers au Cheddar Maturé 18 Mois",
  },
  {
    weekNumber: 2,
    badge: "💸 DROP SEMAINE · CHASSE AUX BOXS",
    title: "Les Menus & Boxs à Moins de 10 €",
    subtitle: "Spécial étudiants et fins de mois : portion gargantuesque sans se ruiner.",
    highlightCategory: "Boxs ≤ 10€",
    searchFilter: "box",
    themeColor: "from-emerald-500/30 via-teal-500/20 to-[#12121A]",
    bangerOfTheWeek: {
      placeName: "KFB (Saint-Ouen)",
      dish: "Box Crousti 5 Tenders + Frites Cheesy",
      price: "9,90 €",
      emoji: "📦",
      quote: "Le repas complet imbattable à moins d'un billet de 10.",
    },
    upcomingDropIn3Weeks: "Drop Spécial : Les Meilleurs Naans au Fromage Tandoor Coulant",
  },
  {
    weekNumber: 3,
    badge: "🍔 DROP SEMAINE · SMASH REVOLUTION",
    title: "La Semaine des Smash Burgers Extra Fins",
    subtitle: "Croûte caramélisée croustillante, bun potato ultra moelleux et sauce secrète.",
    highlightCategory: "Burgers & Smash",
    searchFilter: "smash",
    themeColor: "from-amber-500/30 via-yellow-500/20 to-[#12121A]",
    bangerOfTheWeek: {
      placeName: "Dumbo & Mangez et Cassez-vous",
      dish: "Double Cheeseburger Smash Minute",
      price: "3,80 € / 10,00 €",
      emoji: "🍔",
      quote: "La référence absolue du smash new-yorkais à Paris.",
    },
    upcomingDropIn3Weeks: "Drop Spécial : Les Nouilles Étirées Minute & Bouillons 14h",
  },
  {
    weekNumber: 4,
    badge: "🕌 DROP SEMAINE · CÉLÉBRATION 100% HALAL",
    title: "Pépites Grillades & Naans de Paris & 93",
    subtitle: "Brochettes d'agneau au feu de bois, butter chicken et tenders certifiés sans concession.",
    highlightCategory: "100% Halal",
    searchFilter: "halal",
    themeColor: "from-teal-500/30 via-emerald-500/20 to-[#12121A]",
    bangerOfTheWeek: {
      placeName: "La Tradition",
      dish: "Mix Grillades Naan Fromage + Sauce Verte",
      price: "11,50 €",
      emoji: "🫓",
      quote: "Pain cuit à la flamme devant toi et viande ultra tendre.",
    },
    upcomingDropIn3Weeks: "Drop Spécial : Les Pâtisseries Fines & Cookies XXL de Chef",
  },
  {
    weekNumber: 5,
    badge: "🫖 DROP SEMAINE · TEA TIME & COOKIES XXL",
    title: "Les Douceurs Suprêmes de la Capitale",
    subtitle: "Cookies coulants au praliné, bubble teas de spécialité et chocolat chaud épais.",
    highlightCategory: "Goûter & Tea Time",
    searchFilter: "cookie",
    themeColor: "from-pink-500/30 via-rose-500/20 to-[#12121A]",
    bangerOfTheWeek: {
      placeName: "Crème Paris / Cédric Grolet",
      dish: "Cookie Cœur Gianduja Cacao",
      price: "4,50 €",
      emoji: "🍪",
      quote: "Croustillant à l'extérieur, fondant absolu au centre.",
    },
    upcomingDropIn3Weeks: "Drop Spécial : Les Buffets & Bouillons Parisiens Culte",
  },
  {
    weekNumber: 6,
    badge: "🌙 DROP SEMAINE · RADAR DE NUIT",
    title: "Ouvert Entre 23h et 05h du Matin",
    subtitle: "Pour combler les fringales nocturnes après minuit sans jamais trouver porte close.",
    highlightCategory: "Faim Nocturne",
    searchFilter: "nuit",
    themeColor: "from-purple-500/30 via-indigo-500/20 to-[#12121A]",
    bangerOfTheWeek: {
      placeName: "Chez Denise / Kebab de Nuit Bastille",
      dish: "Döner artisanal broche maison",
      price: "8,50 €",
      emoji: "🌙",
      quote: "Le sauveur des soirées parisiennes jusqu'à l'aube.",
    },
    upcomingDropIn3Weeks: "Drop Spécial : Les Pépites Cachées à Moins de 200m du Métro",
  },
  {
    weekNumber: 7,
    badge: "🍜 DROP SEMAINE · ASIAN STREET FOOD",
    title: "Le Tour d'Asie sans Quitter le Métro",
    subtitle: "Banh mi croustillants, raviolis grillés du 13e et ramen fumants.",
    highlightCategory: "Asie & Ramens",
    searchFilter: "ramen",
    themeColor: "from-red-500/30 via-amber-500/20 to-[#12121A]",
    bangerOfTheWeek: {
      placeName: "Kodawari Ramen",
      dish: "Kurogoma Ramen Sauce Sésame Noir",
      price: "14,50 €",
      emoji: "🍜",
      quote: "Une immersion sonore et gustative digne de Tokyo.",
    },
    upcomingDropIn3Weeks: "Drop Spécial : Les Meilleures Pizzerias Napolitaines d'IDF",
  },
  {
    weekNumber: 8,
    badge: "🍕 DROP SEMAINE · NAPOLI SECRETE",
    title: "Pizzas au Feu de Bois & Pâte Maturation 72h",
    subtitle: "Fior di latte des Pouilles, basilic frais et cornicione gonflée à souhait.",
    highlightCategory: "Pizzas & Italie",
    searchFilter: "pizza",
    themeColor: "from-yellow-500/30 via-red-500/20 to-[#12121A]",
    bangerOfTheWeek: {
      placeName: "Peppe Pizzeria (Champion du Monde)",
      dish: "Campione del Mondo",
      price: "15,00 €",
      emoji: "🍕",
      quote: "La pizza élue meilleure d'Europe par le jury international.",
    },
    upcomingDropIn3Weeks: "Drop Spécial : Les Grands Fast-Foods en Édition Limitée",
  },
];

/**
 * Calcule le spotlight dynamique en fonction de la date actuelle
 */
export function getActiveWeeklySpotlight(): WeeklySpotlight {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const diffTime = Math.abs(now.getTime() - startOfYear.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weekOfYear = Math.ceil(diffDays / 7);

  // Rotation modulo 8
  const index = (weekOfYear - 1) % ROTATING_WEEKLY_SPOTLIGHTS.length;
  return ROTATING_WEEKLY_SPOTLIGHTS[index];
}

/**
 * Calcule ce qui va drop dans 3 semaines pour donner de la visibilité sur l'évolution
 */
export function getFutureSpotlightIn3Weeks(): WeeklySpotlight {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const diffTime = Math.abs(now.getTime() - startOfYear.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weekOfYear = Math.ceil(diffDays / 7) + 3;

  const index = (weekOfYear - 1) % ROTATING_WEEKLY_SPOTLIGHTS.length;
  return ROTATING_WEEKLY_SPOTLIGHTS[index];
}
