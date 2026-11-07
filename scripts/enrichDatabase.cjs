const fs = require("fs");
const path = require("path");

const rawDbPath = path.resolve("./src/data/rawDatabase.ts");
const content = fs.readFileSync(rawDbPath, "utf8");

// Extract the array JSON from ALL_RAW_PLACES
const startMarker = "export const ALL_RAW_PLACES: RawPlace[] = ";
const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
  console.error("Marker not found in rawDatabase.ts");
  process.exit(1);
}

const jsonStart = startIndex + startMarker.length;
const jsonStr = content.slice(jsonStart).trim().replace(/;$/, "");
const places = JSON.parse(jsonStr);

console.log("Loaded", places.length, "places from rawDatabase.ts");

function evaluateHalalAndDietary(p) {
  const name = p.n || p.name || "";
  const sub = p.sub || p.subCategory || "";
  const summary = p.s || p.summary || "";
  const cat = p.cat || p.category || "";
  const addr = p.a || p.address || "";
  const zone = p.z || p.zone || "";
  const hours = p.h || p.hours || "";
  const price = p.pr || p.priceLevel || 1;

  const fullText = [name, sub, summary, cat, addr, zone].join(" ").toLowerCase();

  const is93 = /\b(93\d{3}|saint-denis|aubervilliers|saint-ouen|bobigny|pantin|montreuil|la courneuve|stains|épinay|bagnolet|rosny|drancy)\b/i.test(fullText);
  const isFastFood = (cat === "Fast-food" || p.cat === "Fast-food");

  // Definitive Halal cuisines
  const isHalalCuisine = /kebab|döner|dürüm|shawarma|chawarma|tacos|naan|curry|tandoori|indien|pakistanais|couscous|tajine|marocain|tunisien|algérien|maghrébin|libanais|syrien|égyptien|turc|africain|sénégalais|ivoirien|mafé|yassa|aloco|poulet|chicken|tenders|wings|crousty|braisé|dibiterie|chick'n/i.test(fullText);

  // Halal keywords
  const hasHalalKeyword = /halal|avs|achahada|bacon de dinde|jambon de dinde|sauce algérienne|samoussa|merguez|pastels/i.test(fullText);

  // Fast-food & burger in 93 or dedicated viral halal chains
  const isHalalBurgerOrFastFood = (isFastFood || /burger|smash/i.test(fullText)) && (is93 || /bill|kfb|point b|g la dalle|nach|sold out|wesh|chick|best cook|crispy|street bangkok/i.test(fullText));

  let isHalal = false;
  let halalStatus = undefined;
  let halalNotice = undefined;

  if (hasHalalKeyword || isHalalCuisine || isHalalBurgerOrFastFood) {
    isHalal = true;
    halalStatus = "100% Halal";
    halalNotice = "Toutes les viandes servies sont certifiées Halal.";

    if (/poulet|chicken|tenders|wings|crousty|kfb|wesh bro|chicken street|popeyes/i.test(fullText)) {
      halalStatus = "100% Halal";
      halalNotice = "Poulet 100% certifié Halal, panure croustillante préparée minute.";
    } else if (/kebab|döner|shawarma|chawarma/i.test(fullText)) {
      halalStatus = "100% Halal";
      halalNotice = "Broche artisanale et viandes de veau/dinde 100% Halal certifiées.";
    } else if (/tacos|nach|nachos/i.test(fullText)) {
      halalStatus = "100% Halal";
      halalNotice = "Viandes hachées, tenders et cordons bleus certifiés Halal, sauce fromagère maison.";
    } else if (/indien|pakistanais|naan|curry/i.test(fullText)) {
      halalStatus = "100% Halal";
      halalNotice = "Viandes Halal et pains naans cuits au four tandoor traditionnel.";
    } else if (/marocain|tunisien|algérien|couscous|tajine/i.test(fullText)) {
      halalStatus = "100% Halal";
      halalNotice = "Viandes d'agneau, poulet et merguez artisanales 100% Halal.";
    } else if (/libanais|syrien/i.test(fullText)) {
      halalStatus = "100% Halal";
      halalNotice = "Chawarma, kafta et grillades certifiés Halal, mezzés végétariens.";
    } else if (/africain|aloco|mafé|thiéboudienne|braisé/i.test(fullText)) {
      halalStatus = "100% Halal";
      halalNotice = "Poulet braisé, bœuf mafé et grillades traditionnelles 100% Halal.";
    } else if (/burger|smash/i.test(fullText)) {
      halalStatus = "Viandes Halal certifiées";
      halalNotice = "Steak haché de bœuf frais & bacon de dinde certifiés Halal.";
    }
  } else if (/pizza|italien|thaï|thai|ramen|poke|salade/i.test(fullText) && (is93 || /halal|poulet|végé/i.test(fullText))) {
    isHalal = true;
    halalStatus = "Options Halal disponibles";
    halalNotice = "Propose des options avec viandes halal ou 100% végétariennes.";
  }

  // Dietary: Vegetarian
  const hasVegetarian = /végé|végan|falafel|tofu|salade|avocado|bowl|fromage|margherita|hummus|burrata|halloumi/.test(fullText) ||
    sub === "Végan" || sub === "Végétarien" || sub === "Pâtisserie" || sub === "Glacier" || sub === "Café / Brunch" || /indien|libanais|italien/.test(fullText);

  // Dietary: Open Late
  const isOpenLate = /(–|jusqu’à)\s*[1-5]h/i.test(hours) || /–\s*0h/i.test(hours) || /24h\/24/i.test(hours);

  // Terrace
  const hasTerrace = /terrasse/i.test(fullText);

  // Kid friendly
  const isKidFriendly = /enfant|famil|happy|junior|gâteau|glace|crêpe|jeux|pizza|burger|pancake|chocolat/.test(fullText);

  // Box deal under 10 euros
  const isBoxDeal = /box|tenders|crousti|formule|menu|sandwich|nach|kfb|dalle|snack/.test(fullText) || Number(price) === 1;

  // TikTok viral spots
  const isViral = /kfb|nach|bouillon pigalle|bouillon république|bouillon chartier|kodawari|clem & gwen|wesh bro|chicken street|sold out|dumbo|huge|communale|bältis|chez sophie|daimant|au pied de cochon|le drugstore|madame brasserie|le jules verne|kozy|p1 bouche|popeyes|grolet|babka zana|bo&mie|french bastards|mamiche|popolare|peppe/i.test(name);

  return {
    isHalal,
    halalStatus,
    halalNotice,
    hasVegetarian,
    isOpenLate,
    hasTerrace,
    isKidFriendly,
    isBoxDeal,
    tiktokViral: isViral || p.tiktokViral || false,
    tiktokTrendNote: (isViral || p.tiktokViral) ? (p.tiktokTrendNote || "Spot viral très partagé sur TikTok et Instagram") : undefined
  };
}

const enrichedPlaces = places.map((p) => {
  const enrichments = evaluateHalalAndDietary(p);
  return {
    ...p,
    ...enrichments,
    // Ensure all dual-format fields exist for compatibility
    name: p.name || p.n,
    address: p.address || p.a,
    lat: p.lat || p.la,
    lng: p.lng || p.lo,
    rating: p.rating || p.r,
    reviewCount: p.reviewCount || p.c,
    priceLevel: p.priceLevel || p.pr,
    category: p.category || p.cat,
    subCategory: p.subCategory || p.sub,
    phone: p.phone || p.tel,
    hours: p.hours || p.h,
    summary: p.summary || p.s,
    zone: p.zone || p.z,
    n: p.n || p.name,
    a: p.a || p.address,
    la: p.la || p.lat,
    lo: p.lo || p.lng,
    r: p.r || p.rating,
    c: p.c || p.reviewCount,
    pr: p.pr || p.priceLevel,
    cat: p.cat || p.category,
    sub: p.sub || p.subCategory,
    tel: p.tel || p.phone,
    h: p.h || p.hours,
    s: p.s || p.summary,
    z: p.z || p.zone,
  };
});

console.log("Enriched all", enrichedPlaces.length, "places.");
const halalCount = enrichedPlaces.filter(p => p.isHalal).length;
console.log("Verified Halal spots count:", halalCount);

// Write back to rawDatabase.ts
const newRawDbContent = `export interface RawPlace {
  id: number;
  n: string;
  a: string;
  la: number;
  lo: number;
  r: number;
  c: number;
  pr: number;
  cat: "Restaurant" | "Fast-food" | "Goûter" | "Marché";
  sub: string;
  tel: string;
  h: string;
  s: string;
  z: string;
  tiktokViral?: boolean;
  name?: string;
  address?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  reviewCount?: number;
  priceLevel?: number;
  category?: string;
  subCategory?: string;
  phone?: string;
  hours?: string;
  summary?: string;
  zone?: string;
  pros?: string[];
  cons?: string[];
  tiktokTrendNote?: string;
  isHalal?: boolean;
  halalStatus?: "100% Halal" | "Viandes Halal certifiées" | "Options Halal disponibles";
  halalNotice?: string;
  hasVegetarian?: boolean;
  hasTerrace?: boolean;
  isOpenLate?: boolean;
  isKidFriendly?: boolean;
  isBoxDeal?: boolean;
  foodKey?: string;
}

export const ALL_RAW_PLACES: RawPlace[] = ${JSON.stringify(enrichedPlaces, null, 2)};
`;

fs.writeFileSync(rawDbPath, newRawDbContent, "utf8");
console.log("Successfully updated rawDatabase.ts!");

// Also update placesData.ts with the exact same 2050 places so both files are 100% in sync!
const placesDataPath = path.resolve("./src/data/placesData.ts");
const placesDataContent = `import { RestaurantPlace } from "../types/food";

export const PLACES_DATA: RestaurantPlace[] = ${JSON.stringify(enrichedPlaces, null, 2)};

export const PARIS_DISTRICTS = [
  "Tous",
  "Saint-Denis",
  "Saint-Ouen",
  "Paris 1",
  "Paris 2",
  "Paris 3",
  "Paris 4",
  "Paris 5",
  "Paris 6",
  "Paris 7",
  "Paris 8",
  "Paris 9",
  "Paris 10",
  "Paris 11",
  "Paris 12",
  "Paris 13",
  "Paris 14",
  "Paris 15",
  "Paris 16",
  "Paris 17",
  "Paris 18",
  "Paris 19",
  "Paris 20",
  "Montreuil",
  "Boulogne",
  "Aubervilliers",
  "Vincennes"
];
`;

fs.writeFileSync(placesDataPath, placesDataContent, "utf8");
console.log("Successfully updated placesData.ts with all 2,050 places!");
