import { RestaurantPlace, TaxonomyItem } from "../types/food";

const textMatch = (re: RegExp) => (p: RestaurantPlace) =>
  re.test((p.subCategory + " " + p.name + " " + p.summary).toLowerCase());

export const TAXONOMY_CATEGORIES: TaxonomyItem[] = [
  {
    key: "Restaurant",
    emoji: "🍽️",
    gradient: ["#ff8a3d", "#e8381a"],
    matcher: (p) => p.category === "Restaurant",
    subs: [
      { label: "Français", emoji: "🥖", matcher: (p) => p.subCategory === "Français" },
      { label: "Bouillon", emoji: "🥘", matcher: (p) => p.subCategory === "Bouillon" },
      { label: "Italien & pizza", emoji: "🍕", matcher: textMatch(/italien|pizza/) },
      { label: "Japonais & ramen", emoji: "🍣", matcher: textMatch(/japonais|ramen/) },
      { label: "Coréen & Asie", emoji: "🍜", matcher: textMatch(/coréen|vietnamien|cambodgien/) },
      { label: "Indien", emoji: "🍛", matcher: (p) => p.subCategory === "Indien" },
      { label: "Libanais & Turc", emoji: "🥙", matcher: textMatch(/libanais|turc|égyptien/) },
      { label: "Maghreb", emoji: "🫕", matcher: textMatch(/marocain|tunisien|maghrébin/) },
      { label: "Afrique", emoji: "🍲", matcher: (p) => p.subCategory === "Africain" },
      { label: "Méditerranée & Latino", emoji: "🥗", matcher: textMatch(/méditerranéen|latino|tapas|américain/) },
    ],
  },
  {
    key: "Viande & grillades",
    emoji: "🥩",
    gradient: ["#c0392b", "#7b1e1e"],
    subs: [
      { label: "Steak & tartare", emoji: "🥩", matcher: textMatch(/steak|tartare|bœuf|entrecôte|côte de|rumsteak|filet|viande/) },
      { label: "Canard & agneau", emoji: "🍖", matcher: textMatch(/canard|agneau|magret|gigot/) },
      { label: "Grillades & brochettes", emoji: "🔥", matcher: textMatch(/grillade|brochette|kebab|döner|dürüm|gyros|merguez|barbecue/) },
      { label: "Burgers", emoji: "🍔", matcher: textMatch(/burger/) },
      { label: "Poulet", emoji: "🍗", matcher: textMatch(/poulet|chicken|tenders|ailes/) },
    ],
  },
  {
    key: "Fast-food",
    emoji: "🍔",
    gradient: ["#ffc107", "#ff8f00"],
    matcher: (p) => p.category === "Fast-food",
    subs: [
      { label: "Burgers", emoji: "🍔", matcher: textMatch(/burger/) },
      { label: "Tacos", emoji: "🌯", matcher: textMatch(/tacos/) },
      { label: "Kebab & grec", emoji: "🥙", matcher: (p) => p.subCategory === "Kebab" },
      { label: "Poulet & Box", emoji: "🍗", matcher: textMatch(/poulet|chicken|box/) },
    ],
  },
  {
    key: "Goûter",
    emoji: "🥐",
    gradient: ["#ff6fa5", "#c2255c"],
    matcher: (p) => p.category === "Goûter",
    subs: [
      { label: "Boulangerie", emoji: "🥖", matcher: (p) => p.subCategory === "Boulangerie" },
      { label: "Pâtisserie", emoji: "🍰", matcher: (p) => p.subCategory === "Pâtisserie" },
      { label: "Crêpes & gaufres", emoji: "🥞", matcher: textMatch(/crêp|gaufre|galette/) },
      { label: "Glaces", emoji: "🍦", matcher: textMatch(/glac|gelato|sorbet/) },
      { label: "Café & cookies", emoji: "🍪", matcher: textMatch(/café|cookie|coffee/) },
    ],
  },
  {
    key: "Brunch",
    emoji: "🥞",
    gradient: ["#ffb74d", "#f57c00"],
    matcher: textMatch(/brunch|petit-déj/),
    subs: [
      { label: "Sucré", emoji: "🥞", matcher: textMatch(/pancake|gaufre|crêpe|granola|pain perdu|french toast|fondant/) },
      { label: "Salé", emoji: "🍳", matcher: textMatch(/œuf|avocado|bagel|saumon|bénédicte|sandwich|bacon/) },
      { label: "Café de spécialité", emoji: "☕", matcher: textMatch(/café|coffee|latte|matcha/) },
    ],
  },
  {
    key: "Tea time",
    emoji: "🫖",
    gradient: ["#b39ddb", "#6a4cff"],
    matcher: (p) => /thé/i.test(p.subCategory) || (p.category === "Goûter" && /thé/i.test(p.summary)),
    subs: [
      { label: "Salon de thé", emoji: "🫖", matcher: (p) => /thé/i.test(p.subCategory) || /salon de thé/i.test(p.summary) },
      { label: "Bubble tea & matcha", emoji: "🧋", matcher: textMatch(/bubble|matcha|chai/) },
      { label: "Scones & gâteaux", emoji: "🧁", matcher: textMatch(/scone|gâteau|crumble|tarte|pâtisser|sablé/) },
    ],
  },
  {
    key: "Végé & healthy",
    emoji: "🥗",
    gradient: ["#66bb6a", "#2e7d32"],
    subs: [
      { label: "Végan", emoji: "🌱", matcher: textMatch(/végan/) },
      { label: "Végétarien", emoji: "🥗", matcher: textMatch(/végé|falafel/) },
      { label: "Bols & salades", emoji: "🥙", matcher: textMatch(/bol|salade|bowl|poke|frais|healthy/) },
    ],
  },
  {
    key: "Box à 10 €",
    emoji: "🍱",
    gradient: ["#26c6da", "#00838f"],
    note: "Offres chiffrées relevées pour KFB, Nach & Tacos, KFC, McDonald’s et Burger King.",
    subs: [
      { label: "Offres ≤ 10 € chiffrées", emoji: "💸", matcher: (p) => p.isBoxDeal === true },
      { label: "Tacos & sandwichs", emoji: "🌯", matcher: (p) => p.priceLevel === 1 && textMatch(/tacos|sandwich|wrap|naan|kebab|dürüm|makloub/)(p) },
      { label: "Burgers & poulet", emoji: "🍔", matcher: (p) => p.priceLevel <= 2 && textMatch(/burger|poulet|chicken|tenders|ailes/)(p) },
      { label: "Pizza & pâtes", emoji: "🍕", matcher: (p) => p.priceLevel <= 2 && textMatch(/pizza|pâtes/)(p) },
      { label: "Asie & sushi", emoji: "🍣", matcher: (p) => p.priceLevel === 1 && textMatch(/sushi|nouilles|pho|bol|yaki|bo lok|pad thaï|bibimbap/)(p) },
      { label: "Menu du midi", emoji: "🍽️", matcher: textMatch(/formule|menu à|menu du midi|menu autour|plat du jour|formule midi/) },
      { label: "Boulangerie & snacking", emoji: "🥖", matcher: (p) => p.category === "Goûter" && p.priceLevel === 1 },
    ],
  },
  {
    key: "Marchés & street food",
    emoji: "🧺",
    gradient: ["#8bc34a", "#33691e"],
    matcher: (p) => p.category === "Marché" || /street food/i.test(p.summary),
    subs: [
      { label: "Marchés couverts", emoji: "🧺", matcher: (p) => p.subCategory === "Marché couvert" },
      { label: "Marchés de plein air", emoji: "🥬", matcher: (p) => p.subCategory === "Marché de plein air" },
      { label: "Halles & food courts", emoji: "🍽️", matcher: textMatch(/halle|food court|street food/) },
      { label: "Tacos & kebab de rue", emoji: "🌯", matcher: (p) => p.category === "Fast-food" && textMatch(/tacos|kebab/)(p) },
    ],
  },
  {
    key: "Gastronomique & bistro",
    emoji: "⭐",
    gradient: ["#ffd54f", "#6d4c41"],
    subs: [
      { label: "Gastronomique", emoji: "⭐", matcher: (p) => p.priceLevel >= 4 || /étoilé|gastronom/i.test(p.summary) },
      { label: "Bistronomique", emoji: "🍷", matcher: (p) => p.category === "Restaurant" && p.priceLevel === 3 },
      { label: "Brasserie chic", emoji: "🥂", matcher: textMatch(/brasserie/) },
    ],
  },
  {
    key: "Famille & anniversaire",
    emoji: "🎂",
    gradient: ["#f06292", "#ff9800"],
    subs: [
      { label: "Menu enfant & familial", emoji: "👨‍👩‍👧", matcher: textMatch(/enfant|famil|happy|junior/) },
      { label: "Pizza, burgers & crêpes", emoji: "🍕", matcher: (p) => textMatch(/pizza|burger|crêperie|tacos/)(p) && p.isKidFriendly === true },
      { label: "Glaces & gâteaux", emoji: "🍰", matcher: (p) => textMatch(/glacier|pâtisserie|crêperie|gâteau|glace|gaufre/)(p) },
      { label: "Grandes tablées", emoji: "🪑", matcher: textMatch(/grandes tablées|groupe|partager/) },
      { label: "Espace, jeux & terrasse", emoji: "🛝", matcher: textMatch(/jeux|espace|jardin|terrasse/) },
    ],
  },
  {
    key: "Tard le soir",
    emoji: "🌙",
    gradient: ["#5c6bc0", "#1a237e"],
    subs: [
      { label: "Après minuit", emoji: "🌃", matcher: (p) => /(–|jusqu’à)\s*[1-5]h/.test(p.hours) },
      { label: "Jusqu’à minuit", emoji: "🌙", matcher: (p) => /–\s*0h/.test(p.hours) },
    ],
  },
  {
    key: "Ambiance & sortie",
    emoji: "🥂",
    gradient: ["#ec407a", "#8e24aa"],
    subs: [
      { label: "Terrasse", emoji: "☀️", matcher: (p) => p.hasTerrace === true },
      { label: "Beau cadre & vue", emoji: "🌆", matcher: textMatch(/vue |cadre|décor|jardin|tour eiffel/) },
      { label: "Romantique & cosy", emoji: "🕯️", matcher: textMatch(/romantique|intim|cosy|bougies/) },
      { label: "Entre amis", emoji: "🍻", matcher: textMatch(/partager|groupe|grandes tablées|karaoké|bar/) },
    ],
  },
];

// Ensure fallback matcher for each taxonomy item
TAXONOMY_CATEGORIES.forEach((t) => {
  if (!t.matcher) {
    t.matcher = (p) => t.subs.some((s) => s.matcher(p));
  }
});
