import { RawPlace } from "./rawDatabase";

export const FA_ICONS: Record<string, string> = {
  burger: `<path d="M14 46Q14 22 50 22Q86 22 86 46Z" fill="#e8a24a"/><circle cx="34" cy="34" r="1.6" fill="#fff7"/><circle cx="52" cy="30" r="1.6" fill="#fff7"/><circle cx="66" cy="36" r="1.6" fill="#fff7"/><path d="M12 50q6 8 12 0t12 0 12 0 12 0 12 0 12 0v4H12z" fill="#7cc04a"/><rect x="14" y="56" width="72" height="10" rx="5" fill="#6b3a22"/><path d="M14 68h72v4q0 8-10 8H24q-10 0-10-8z" fill="#e8a24a"/>`,
  poulet: `<path d="M30 70L52 48" stroke="#f3e3c3" stroke-width="7" stroke-linecap="round"/><circle cx="28" cy="74" r="6" fill="#f3e3c3"/><circle cx="22" cy="68" r="5" fill="#f3e3c3"/><ellipse cx="62" cy="38" rx="24" ry="20" transform="rotate(-35 62 38)" fill="#d9822b"/><path d="M50 30q10-8 22-2" stroke="#f5b25f" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  pizza: `<path d="M50 88L14 28Q50 12 86 28Z" fill="#f4c35a"/><path d="M14 28Q50 12 86 28L82 34Q50 20 18 34Z" fill="#d9822b"/><circle cx="44" cy="44" r="6" fill="#d9442b"/><circle cx="62" cy="38" r="5" fill="#d9442b"/><circle cx="52" cy="60" r="5" fill="#d9442b"/>`,
  sushi: `<rect x="16" y="50" width="68" height="22" rx="11" fill="#fff"/><path d="M14 46Q50 30 86 46Q86 56 50 56Q14 56 14 46Z" fill="#ff7a59"/><path d="M26 44q24-8 48 0" stroke="#ffb199" stroke-width="3" fill="none"/><rect x="44" y="40" width="12" height="34" fill="#23352a" opacity=".85"/>`,
  tacos: `<path d="M12 64Q12 24 50 24Q88 24 88 64Z" fill="#f2c36b"/><path d="M20 62Q22 38 50 36Q78 38 80 62" fill="#7cc04a"/><circle cx="40" cy="52" r="5" fill="#d9442b"/><circle cx="58" cy="50" r="5" fill="#d9442b"/><circle cx="50" cy="44" r="4" fill="#f7e27a"/>`,
  croissant: `<path d="M14 62Q22 28 50 26Q78 28 86 62Q72 52 50 54Q28 52 14 62Z" fill="#e0a04a"/><path d="M34 32l6 20M50 28v24M66 32l-6 20" stroke="#b9772a" stroke-width="3" stroke-linecap="round"/>`,
  glace: `<path d="M34 54L50 90L66 54Z" fill="#e3a65a"/><circle cx="50" cy="40" r="20" fill="#ff8fb3"/><circle cx="40" cy="30" r="12" fill="#fff0c9"/><circle cx="60" cy="32" r="11" fill="#9ad8c3"/>`,
  tasse: `<path d="M22 40h48v22q0 18-24 18t-24-18z" fill="#fff" stroke="#cdbba6" stroke-width="3"/><path d="M70 46h8q8 0 8 8t-8 8h-8" fill="none" stroke="#cdbba6" stroke-width="5"/><path d="M38 24q-6 6 0 12M52 22q-6 6 0 12" stroke="#cdbba6" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="46" cy="42" rx="20" ry="4" fill="#8a5a3a"/>`,
  ramen: `<path d="M14 48h72q0 30-36 30t-36-30z" fill="#e8553a"/><path d="M22 46q10-12 20 0t20 0 14 0" stroke="#f7e27a" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="62" cy="42" r="8" fill="#fff"/><circle cx="62" cy="42" r="3.5" fill="#f2b233"/><path d="M60 20L46 44M70 20L56 44" stroke="#8a5a3a" stroke-width="3" stroke-linecap="round"/>`,
  salade: `<path d="M14 50h72q0 28-36 28T14 50z" fill="#fff" stroke="#cdbba6" stroke-width="3"/><circle cx="34" cy="44" r="12" fill="#7cc04a"/><circle cx="52" cy="40" r="13" fill="#5aa832"/><circle cx="68" cy="45" r="11" fill="#7cc04a"/><circle cx="44" cy="46" r="5" fill="#e8553a"/><circle cx="60" cy="48" r="4" fill="#f7c948"/>`,
  steak: `<path d="M16 54Q14 30 42 26Q76 20 86 46Q90 70 56 76Q20 78 16 54Z" fill="#b5483a"/><path d="M30 50q14-10 30-6M34 62q18 4 36-8" stroke="#7a2a22" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="64" cy="44" r="6" fill="#f3d6c0"/>`,
  marche: `<path d="M18 40h64l-6 40H24z" fill="#c98f5a"/><path d="M26 40q24-26 48 0" fill="none" stroke="#a8713f" stroke-width="5"/><circle cx="38" cy="44" r="9" fill="#e8553a"/><circle cx="54" cy="40" r="9" fill="#7cc04a"/><circle cx="66" cy="46" r="8" fill="#f2b233"/>`,
  cloche: `<path d="M12 70h76" stroke="#cdbba6" stroke-width="5" stroke-linecap="round"/><path d="M20 70Q20 32 50 32Q80 32 80 70Z" fill="#e7e1d8" stroke="#cdbba6" stroke-width="3"/><circle cx="50" cy="28" r="5" fill="#cdbba6"/><path d="M32 54q6-10 18-10" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  tajine: `<path d="M14 72h72q0 8-8 8H22q-8 0-8-8z" fill="#c9733a"/><path d="M22 72Q26 44 50 20Q74 44 78 72Z" fill="#e08a47"/><circle cx="50" cy="18" r="4" fill="#a8572a"/><path d="M34 66q16-14 32 0" stroke="#f3c18c" stroke-width="3" fill="none"/>`,
  curry: `<path d="M14 48h72q0 28-36 28T14 48z" fill="#e0902f"/><circle cx="40" cy="48" r="6" fill="#c0622a"/><circle cx="56" cy="46" r="6" fill="#c0622a"/><path d="M30 44q20-8 40 0" stroke="#f7d27a" stroke-width="3" fill="none"/><path d="M60 28q14 2 18 14l-20-2z" fill="#f3d9a0"/>`,
  soupe: `<path d="M14 50h72q0 28-36 28T14 50z" fill="#fff" stroke="#cdbba6" stroke-width="3"/><ellipse cx="50" cy="50" rx="34" ry="7" fill="#e8a84a"/><path d="M40 30q-5 6 0 12M54 26q-5 6 0 12M66 30q-5 6 0 12" stroke="#cdbba6" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  assiette: `<circle cx="50" cy="52" r="34" fill="#fff" stroke="#e1d3c0" stroke-width="4"/><circle cx="50" cy="52" r="22" fill="none" stroke="#efe3d2" stroke-width="3"/><path d="M38 52q12-14 24 0" stroke="#e8553a" stroke-width="5" fill="none" stroke-linecap="round"/>`,
};

export const foodKey = (p: RawPlace) => {
  const s = p.sub;
  if (/Burger/i.test(s)) return "burger";
  if (/Poulet/i.test(s)) return "poulet";
  if (/Pizza|Italien/i.test(s)) return "pizza";
  if (/Ramen|Coréen|Vietnamien|Cambodgien/i.test(s)) return "ramen";
  if (/Japonais/i.test(s)) return "sushi";
  if (/Tacos|Kebab/i.test(s)) return "tacos";
  if (/Boulangerie|Pâtisserie|Crêperie/i.test(s)) return "croissant";
  if (/Glacier/i.test(s)) return "glace";
  if (/Café|thé/i.test(s)) return "tasse";
  if (/Végan|Végétarien|Méditerranéen|Tapas/i.test(s)) return "salade";
  if (/Steak|Grillades/i.test(s)) return "steak";
  if (/Marché|Halle|Food court|Street/i.test(s)) return "marche";
  if (/Bouillon/i.test(s)) return "soupe";
  if (/Marocain|Tunisien|Maghrébin/i.test(s)) return "tajine";
  if (/Indien|Africain/i.test(s)) return "curry";
  if (/^Français$/i.test(s)) return "cloche";
  return "assiette";
};

export const hashColor = (s: string) => {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
};

export const artStyle = (p: RawPlace) => {
  const h = hashColor(p.sub) % 360;
  return `linear-gradient(135deg, hsl(${h}, 80%, 88%), hsl(${(h + 35) % 360}, 85%, 74%))`;
};

const R = (re: RegExp) => (p: RawPlace) => re.test((p.sub + " " + p.n + " " + p.s).toLowerCase());

export interface TaxCategory {
  k: string;
  e: string;
  c: [string, string];
  note?: string;
  m: (p: RawPlace) => boolean;
  subs: [string, string, (p: RawPlace) => boolean][];
}

export const TAXONOMY: TaxCategory[] = [
  {
    k: "Restaurant",
    e: "🍽️",
    c: ["#ff8a3d", "#e8381a"],
    m: (p) => p.cat === "Restaurant",
    subs: [
      ["Français", "🥖", (p) => p.sub === "Français"],
      ["Bouillon", "🥘", (p) => p.sub === "Bouillon"],
      ["Italien & pizza", "🍕", (p) => /Italien|Pizza/i.test(p.sub)],
      ["Japonais & ramen", "🍣", (p) => /Japonais|Ramen/i.test(p.sub)],
      ["Coréen & Asie", "🍜", (p) => /Coréen|Vietnamien|Cambodgien/i.test(p.sub)],
      ["Indien", "🍛", (p) => p.sub === "Indien"],
      ["Libanais & Turc", "🥙", (p) => /Libanais|Turc|Égyptien/i.test(p.sub)],
      ["Maghreb", "🫕", (p) => /Marocain|Tunisien|Maghrébin/i.test(p.sub)],
      ["Afrique", "🍲", (p) => p.sub === "Africain"],
      ["Méditerranée & Latino", "🥗", (p) => /Méditerranéen|Latino|Tapas|Américain/i.test(p.sub)],
    ],
  },
  {
    k: "Viande & grillades",
    e: "🥩",
    c: ["#c0392b", "#7b1e1e"],
    m: (p) => R(/steak|tartare|bœuf|entrecôte|côte de|rumsteak|filet|viande|canard|agneau|magret|gigot|grillade|brochette|kebab|döner|dürüm|gyros|merguez|barbecue|burger|poulet|chicken/i)(p),
    subs: [
      ["Steak & tartare", "🥩", R(/steak|tartare|bœuf|entrecôte|côte de|rumsteak|filet|viande/i)],
      ["Canard & agneau", "🍖", R(/canard|agneau|magret|gigot/i)],
      ["Grillades & brochettes", "🔥", R(/grillade|brochette|kebab|döner|dürüm|gyros|merguez|barbecue/i)],
      ["Burgers", "🍔", R(/burger/i)],
      ["Poulet", "🍗", R(/poulet|chicken|tenders|ailes/i)],
    ],
  },
  {
    k: "Fast-food",
    e: "🍔",
    c: ["#ffc107", "#ff8f00"],
    m: (p) => p.cat === "Fast-food",
    subs: [
      ["Burgers", "🍔", R(/burger/i)],
      ["Tacos", "🌯", R(/tacos/i)],
      ["Kebab & grec", "🥙", (p) => p.sub === "Kebab"],
      ["Poulet", "🍗", R(/poulet|chicken/i)],
    ],
  },
  {
    k: "Goûter",
    e: "🥐",
    c: ["#ff6fa5", "#c2255c"],
    m: (p) => p.cat === "Goûter",
    subs: [
      ["Boulangerie", "🥖", (p) => p.sub === "Boulangerie"],
      ["Pâtisserie", "🍰", (p) => p.sub === "Pâtisserie"],
      ["Crêpes & gaufres", "🥞", R(/crêp|gaufre|galette/i)],
      ["Glaces", "🍦", R(/glac|gelato|sorbet/i)],
      ["Café & cookies", "🍪", R(/café|cookie|coffee/i)],
    ],
  },
  {
    k: "Brunch",
    e: "🥞",
    c: ["#ffb74d", "#f57c00"],
    m: R(/brunch|petit-déj/i),
    subs: [
      ["Sucré", "🥞", R(/pancake|gaufre|crêpe|granola|pain perdu|french toast|fondant/i)],
      ["Salé", "🍳", R(/œuf|avocado|bagel|saumon|bénédicte|sandwich|bacon/i)],
      ["Café de spécialité", "☕", R(/café|coffee|latte|matcha/i)],
    ],
  },
  {
    k: "Tea time",
    e: "🫖",
    c: ["#b39ddb", "#6a4cff"],
    m: (p) => /thé/i.test(p.sub) || (p.cat === "Goûter" && /thé/i.test(p.s)),
    subs: [
      ["Salon de thé", "🫖", (p) => /thé/i.test(p.sub) || /salon de thé/i.test(p.s)],
      ["Bubble tea & matcha", "🧋", R(/bubble|matcha|chai/i)],
      ["Scones & gâteaux", "🧁", R(/scone|gâteau|crumble|tarte|pâtisser|sablé/i)],
    ],
  },
  {
    k: "Végé & healthy",
    e: "🥗",
    c: ["#66bb6a", "#2e7d32"],
    m: (p) => R(/végan|végé|falafel|bol|salade|bowl|poke|frais|healthy/i)(p),
    subs: [
      ["Végan", "🌱", R(/végan/i)],
      ["Végétarien", "🥗", R(/végé|falafel/i)],
      ["Bols & salades", "🥙", R(/bol|salade|bowl|poke|frais|healthy/i)],
    ],
  },
  {
    k: "Box à 10 €",
    e: "🍱",
    c: ["#26c6da", "#00838f"],
    note: "Offres chiffrées relevées pour KFC, KFB, McDonald’s et Burger King, ou adresses petit prix (€).",
    m: (p) => p.pr === 1 || /kfb|nach|kfc|box|mcdonald|burger king/i.test(p.n),
    subs: [
      ["Offres ≤ 10 € chiffrées", "💸", (p) => /kfb|nach|kfc|mcdonald|burger king/i.test(p.n) || p.pr === 1],
      ["Tacos & sandwichs", "🌯", (p) => p.pr === 1 && R(/tacos|sandwich|wrap|naan|kebab|dürüm|makloub/i)(p)],
      ["Burgers & poulet", "🍔", (p) => p.pr <= 2 && p.cat === "Fast-food" && R(/burger|poulet|chicken|tenders|ailes/i)(p)],
      ["Pizza & pâtes", "🍕", (p) => p.pr <= 2 && R(/pizza|pâtes/i)(p)],
      ["Asie & sushi", "🍣", (p) => (p.pr === 1 && R(/sushi|nouilles|pho|bol|yaki|bo lok|pad thaï|bibimbap/i)(p)) || (/Japonais|Vietnamien|Cambodgien|Coréen/i.test(p.sub) && R(/formule|menu|prix doux|petit prix/i)(p))],
      ["Menu du midi", "🍽️", R(/formule|menu à|menu du midi|plat du jour/i)],
      ["Boulangerie & snacking", "🥖", (p) => p.cat === "Goûter" && p.pr === 1],
    ],
  },
  {
    k: "Marchés & street food",
    e: "🧺",
    c: ["#8bc34a", "#33691e"],
    m: (p) => p.cat === "Marché" || /street food/i.test(p.s),
    subs: [
      ["Marchés couverts", "🧺", (p) => p.sub === "Marché couvert"],
      ["Marchés de plein air", "🥬", (p) => p.sub === "Marché de plein air"],
      ["Halles & food courts", "🍽️", (p) => /Halle|Food court|Street food/i.test(p.sub)],
      ["Tacos & kebab de rue", "🌯", (p) => p.cat === "Fast-food" && /Tacos|Kebab/i.test(p.sub)],
    ],
  },
  {
    k: "Gastronomique & bistro",
    e: "⭐",
    c: ["#ffd54f", "#6d4c41"],
    m: (p) => p.pr >= 3 || /étoilé|gastronom|brasserie/i.test(p.s),
    subs: [
      ["Gastronomique", "⭐", (p) => p.pr >= 4 || /étoilé|gastronom/i.test(p.s)],
      ["Bistronomique", "🍷", (p) => p.cat === "Restaurant" && p.pr === 3],
      ["Brasserie chic", "🥂", R(/brasserie/i)],
    ],
  },
  {
    k: "Famille & anniversaire",
    e: "🎂",
    c: ["#f06292", "#ff9800"],
    m: (p) => R(/enfant|famil|happy|junior|jeux|espace|terrasse|grandes tablées|groupe|partager|pizza|burger|crêp|glace/i)(p),
    subs: [
      ["Menu enfant & familial", "👨‍👩‍👧", R(/enfant|famil|happy|junior/i)],
      ["Pizza, burgers & crêpes", "🍕", (p) => /Pizza|Burger|Crêperie|Tacos/i.test(p.sub)],
      ["Glaces & gâteaux", "🍰", (p) => /Glacier|Pâtisserie|Crêperie/i.test(p.sub) || R(/gâteau|glace|gaufre/i)(p)],
      ["Grandes tablées", "🪑", R(/grandes tablées|groupe|partager/i)],
      ["Espace, jeux & terrasse", "🛝", R(/jeux|espace|jardin|terrasse/i)],
    ],
  },
  {
    k: "Tard le soir",
    e: "🌙",
    c: ["#5c6bc0", "#1a237e"],
    m: (p) => /(–|jusqu’à)\s*[1-5]h/i.test(p.h || "") || /–\s*0h/i.test(p.h || ""),
    subs: [
      ["Après minuit", "🌃", (p) => /(–|jusqu’à)\s*[1-5]h/i.test(p.h || "")],
      ["Jusqu’à minuit", "🌙", (p) => /–\s*0h/i.test(p.h || "")],
    ],
  },
  {
    k: "Ambiance & sortie",
    e: "🥂",
    c: ["#ec407a", "#8e24aa"],
    m: (p) => R(/terrasse|vue |cadre|décor|jardin|tour eiffel|romantique|intim|cosy|bougies|partager|groupe|grandes tablées|karaoké|bar/i)(p),
    subs: [
      ["Terrasse", "☀️", R(/terrasse/i)],
      ["Beau cadre & vue", "🌆", R(/vue |cadre|décor|jardin|tour eiffel/i)],
      ["Romantique & cosy", "🕯️", R(/romantique|intim|cosy|bougies/i)],
      ["Entre amis", "🍻", R(/partager|groupe|grandes tablées|karaoké|bar/i)],
    ],
  },
];

export const BUDGET_STEPS = [
  { val: 0, emoji: "💸", label: "Peu importe", desc: "Montre-moi tout" },
  { val: 1, emoji: "🥪", label: "Petit prix", desc: "€ · pour manger sans se ruiner" },
  { val: 2, emoji: "🍝", label: "Budget moyen", desc: "€€ · le bon équilibre" },
  { val: 3, emoji: "🥂", label: "Je me fais plaisir", desc: "€€€ et plus" },
];
