import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { PLACES_DATA } from "./src/data/placesData.ts";
import { FAMOUS_CHAINS_PLACES } from "./src/data/famousChainsData.ts";
import { FOOD_DEALS } from "./src/data/dealsData.ts";

const ALL_SERVER_PLACES: any[] = [...FAMOUS_CHAINS_PLACES, ...PLACES_DATA];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In AI Studio environment, the dev server must strictly listen on port 3000
// (Port 8080 is reserved by nginx proxy which reverse-proxies external requests to 3000).
const portArgIndex = process.argv.indexOf("--port");
const cliPort = portArgIndex !== -1 ? parseInt(process.argv[portArgIndex + 1], 10) : null;
const PORT = cliPort || (process.env.PORT && process.env.PORT !== "8080" ? parseInt(process.env.PORT, 10) : 3000);
// Disable HMR in AI Studio environment to prevent browser WebSocket reconnect loops
process.env.DISABLE_HMR = "true";
const isDev = process.env.NODE_ENV !== "production";

const app = express();

app.use(express.json());

// Initialize Google Gemini SDK (Server-Side only)
let aiClient: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
} catch (err) {
  console.warn("Gemini client initialization notice:", err);
}

// In-Memory Database Store for real-time synchronization
interface SyncState {
  favorites: number[];
  customLists: any[];
  foodDiary: any[];
  gamification: any;
  updatedAt: string;
}

const syncStore: Record<string, SyncState> = {
  default: {
    favorites: [1, 2, 3, 6],
    customLists: [
      {
        id: "viral-tiktok-paris",
        title: "🔥 Pépites TikTok Paris & 93",
        description: "Les box de poulet frit croustillant, smash burgers et bouillons les plus viraux de l'année.",
        emoji: "🔥",
        isPublic: true,
        placeIds: [1, 2, 6, 7, 3],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "box-etudiants-10e",
        title: "💸 Box & Menus ≤ 10 €",
        description: "Pour manger comme un roi sans vider son compte en banque.",
        emoji: "🥪",
        isPublic: true,
        placeIds: [1, 2, 6, 9, 13, 15],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    foodDiary: [
      {
        id: "diary-1",
        placeId: 1,
        placeName: "KFB (KF Burger & Chicken)",
        visitedAt: "2026-10-18",
        rating: 5,
        favoriteDish: "Box Crousti 5 tenders sauce cheese",
        notes: "Incroyable croustillant, frites bien relevées, portions qui calent pour la journée !",
        costPaid: 9.90,
        tag: "Coup de cœur"
      }
    ],
    gamification: {
      points: 420,
      level: 3,
      levelTitle: "Chasseur de Pépites",
      placesTestedCount: 6,
      kilometersWalked: 14.5,
      moneySavedEur: 38.5,
      unlockedBadgeIds: ["explorer-1", "tiktok-hunter", "money-saver"]
    },
    updatedAt: new Date().toISOString(),
  }
};

// Group Sessions Store for "On y va ensemble" collaborative voting
interface GroupRoom {
  id: string;
  code: string;
  title: string;
  creatorName: string;
  createdAt: string;
  options: {
    placeId: number;
    votes: number;
    voterNames: string[];
  }[];
  status: "open" | "closed";
  selectedWinnerId?: number;
}

const groupRooms: Record<string, GroupRoom> = {
  "DEMO1": {
    id: "DEMO1",
    code: "SOIR-75",
    title: "🍔 On mange où ce soir entre potes ?",
    creatorName: "Karim",
    createdAt: new Date().toISOString(),
    options: [
      { placeId: 1, votes: 3, voterNames: ["Karim", "Sarah", "Alex"] },
      { placeId: 2, votes: 2, voterNames: ["Mehdi", "Inès"] },
      { placeId: 3, votes: 1, voterNames: ["Léa"] }
    ],
    status: "open"
  }
};

// API: Places list
app.get("/api/places", (req, res) => {
  res.json({ places: ALL_SERVER_PLACES, total: ALL_SERVER_PLACES.length });
});

// API: Deals & Box list
app.get("/api/deals", (req, res) => {
  res.json({ deals: FOOD_DEALS, total: FOOD_DEALS.length });
});

// Community evolving signals memory store
const evolvingSignalsStore: any[] = [
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
  }
];

app.get("/api/intel", (req, res) => {
  res.json({ success: true, intel: evolvingSignalsStore });
});

app.post("/api/intel", (req, res) => {
  const { placeId, placeName, source, type, title, detail, author } = req.body;
  if (!title || !detail) {
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  const newSignal = {
    id: "intel-" + Date.now(),
    placeId: Number(placeId) || 0,
    placeName: placeName || "Spot Gourmand",
    source: source || "Communauté",
    type: type || "nouveau_banger",
    title,
    detail,
    author: author || "Gourmand Anonyme",
    likes: 1,
    date: "À l'instant",
    verified: false,
  };

  evolvingSignalsStore.unshift(newSignal);
  res.json({ success: true, signal: newSignal, total: evolvingSignalsStore.length });
});

// API: Sync state (GET & POST)
app.get("/api/sync", (req, res) => {
  const userId = (req.query.userId as string) || "default";
  const state = syncStore[userId] || syncStore.default;
  res.json({ success: true, state });
});

app.post("/api/sync", (req, res) => {
  const userId = (req.body.userId as string) || "default";
  const { favorites, customLists, foodDiary, gamification } = req.body;

  syncStore[userId] = {
    favorites: favorites || syncStore[userId]?.favorites || [],
    customLists: customLists || syncStore[userId]?.customLists || [],
    foodDiary: foodDiary || syncStore[userId]?.foodDiary || [],
    gamification: gamification || syncStore[userId]?.gamification || syncStore.default.gamification,
    updatedAt: new Date().toISOString(),
  };

  res.json({ success: true, state: syncStore[userId] });
});

// API: Group voting rooms
app.post("/api/groups", (req, res) => {
  const { title, creatorName, placeIds } = req.body;
  const code = "GM" + Math.floor(1000 + Math.random() * 9000);
  const roomId = "room-" + Date.now();

  const newRoom: GroupRoom = {
    id: roomId,
    code,
    title: title || "Où mange-t-on ensemble ?",
    creatorName: creatorName || "Un gourmand",
    createdAt: new Date().toISOString(),
    options: (placeIds || [1, 2, 3]).map((id: number) => ({
      placeId: id,
      votes: 1,
      voterNames: [creatorName || "Toi"]
    })),
    status: "open"
  };

  groupRooms[roomId] = newRoom;
  groupRooms[code] = newRoom;

  res.json({ success: true, room: newRoom });
});

app.get("/api/groups/:idOrCode", (req, res) => {
  const key = req.params.idOrCode;
  const room = groupRooms[key];
  if (!room) {
    return res.status(404).json({ error: "Session introuvable" });
  }
  res.json({ success: true, room });
});

app.post("/api/groups/:idOrCode/vote", (req, res) => {
  const key = req.params.idOrCode;
  const { placeId, voterName } = req.body;
  const room = groupRooms[key];

  if (!room) {
    return res.status(404).json({ error: "Session introuvable" });
  }

  const opt = room.options.find(o => o.placeId === placeId);
  if (opt) {
    opt.votes += 1;
    if (voterName && !opt.voterNames.includes(voterName)) {
      opt.voterNames.push(voterName);
    }
  }

  // Check if winner can be computed
  const sorted = [...room.options].sort((a, b) => b.votes - a.votes);
  if (sorted[0]?.votes >= 3) {
    room.selectedWinnerId = sorted[0].placeId;
  }

  res.json({ success: true, room });
});

// API: Advanced AI Conversational Search using Gemini 3.8 Flash
app.post("/api/search-ai", async (req, res) => {
  const { prompt, query: queryParam } = req.body;
  const query = (prompt || queryParam || "").trim();

  if (!query) {
    return res.status(400).json({ error: "Prompt manquant" });
  }

  // Fast local semantic & multi-criteria matcher
  const qLower = query.toLowerCase();
  const isHalal = /halal/.test(qLower);
  const isBudgetUnder10 = /10\s*€|10\s*balles|10\s*euros?|pas cher|petit prix|éco/.test(qLower);
  const isChicken = /poulet|chicken|tenders|crispy|croustillant|ailes/.test(qLower);
  const isBurger = /burger|smash/.test(qLower);
  const isBouillon = /bouillon|tradition|français|oeuf mayo|escargot/.test(qLower);
  const isKid = /anniv|enfant|fils|fille|famille|bambin|happy meal|6 ans|8 ans|10 ans/.test(qLower);
  const isLate = /nuit|minuit|tard|ouvert tard|2h|3h|4h/.test(qLower);
  const isRomantic = /date|romantique|amoureux|couple|cosy|intimiste/.test(qLower);
  const isTikTok = /tiktok|viral|tendance|réseaux|box/.test(qLower);

  // Smart candidate scoring across all catalog places
  const scoredPlaces = ALL_SERVER_PLACES.map(p => {
    let score = 0;
    const pText = [p.name, p.subCategory, p.summary, p.zone, p.category].join(" ").toLowerCase();

    // Halal match
    if (isHalal) {
      if (p.isHalal) score += 50;
      else score -= 100; // Deprioritize non-halal if explicitly requested
    }
    // Budget match
    if (isBudgetUnder10) {
      if (p.priceLevel === 1 || p.isBoxDeal) score += 30;
      else if (p.priceLevel === 2) score += 5;
      else score -= 40;
    }
    // Cuisine match
    if (isChicken && (/poulet|chicken|tenders|wings|crousti/.test(pText))) score += 35;
    if (isBurger && (/burger|smash/.test(pText))) score += 35;
    if (isBouillon && (/bouillon/.test(pText))) score += 45;
    if (isTikTok && (p.tiktokViral || p.isBoxDeal)) score += 25;
    if (isLate && p.isOpenLate) score += 20;
    if (isKid && p.isKidFriendly) score += 20;

    // Word occurrences
    const words = qLower.split(/\s+/).filter((w: string) => w.length >= 3);
    for (const w of words) {
      if (pText.includes(w)) score += 12;
    }

    // Quality bonus
    score += (p.rating || 4.5) * 4;

    return { place: p, score };
  });

  scoredPlaces.sort((a, b) => b.score - a.score);
  const candidatePlaces = scoredPlaces.slice(0, 30).map(s => s.place);
  const finalMatched = candidatePlaces.slice(0, 6);
  const matchedIds = finalMatched.map(p => p.id);

  let explanation = `J'ai sélectionné pour toi ${finalMatched.length} adresses idéales répondant exactement à tes critères (${isHalal ? "halal, " : ""}${isBudgetUnder10 ? "≤ 10 €, " : ""}${isChicken ? "poulet croustillant, " : ""}${isTikTok ? "spots viraux TikTok" : "top recommandés"}).`;
  let tip = isKid
    ? "🎂 Astuce fête : appelle pour réserver la grande tablée et demande s'ils acceptent les gâteaux d'anniversaire personnalisés."
    : isBudgetUnder10
    ? "💸 Bon plan : demande la Box TikTok KFB ou le McDeal pour maximiser le ratio quantité/prix."
    : "🧭 Conseil itinéraire : clique sur 'Itinéraire direct' pour lancer Google Maps en mode marche à pied.";

  // If Gemini API is active, call gemini-3.8-flash on the pre-filtered candidates for rich conversational reasoning
  if (aiClient) {
    try {
      const placesMini = candidatePlaces.slice(0, 15).map(p => ({
        id: p.id,
        nom: p.name,
        type: p.subCategory,
        prix: p.priceLevel === 1 ? "≤ 10 €" : p.priceLevel === 2 ? "10-25 €" : "25-50 €",
        note: p.rating,
        halal: p.isHalal ? (p.halalStatus || "oui") : "non",
        tiktok: p.tiktokViral ? "viral" : "non",
        quartier: p.zone,
        resume: p.summary
      }));

      let timer: NodeJS.Timeout | null = null;
      const timeoutPromise = new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), 12000);
      });

      const aiGeneratePromise = aiClient.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Tu es le Lead Sommelier, Concierge Culinaire & Expert GPS Food de l'application L'Appli Gourmande (Paris & Île-de-France).
L'utilisateur te demande : "${query}".
Tu peux répondre à TOUTES les questions : recommandations précises, plats signatures, secrets culinaires, budget, occasions festives, quartiers, adresses halal, terrasses, ou fonctionnement de l'application.

Voici les meilleurs candidats sélectionnés dans notre base de 2 070+ adresses vérifiées :
${JSON.stringify(placesMini)}

Réponds en JSON avec le format exact suivant :
{
  "explanation": "2-3 phrases chaleureuses, expertes et enthousiastes répondant précisément à la demande et citant les meilleurs spots",
  "matchedPlaceIds": [liste ordonnée des IDs les plus pertinents, max 6],
  "detectedOccasion": "type d'occasion ou intention détectée",
  "practicalTip": "1 conseil d'initié très concret (ex: meilleur horaire, plat secret, sauce à demander, astuce transport)"
}`,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        }
      });

      const aiResponse: any = await Promise.race([aiGeneratePromise, timeoutPromise]);
      if (timer) clearTimeout(timer);

      if (aiResponse && aiResponse.text) {
        const parsed = JSON.parse(aiResponse.text);
        if (parsed.matchedPlaceIds && Array.isArray(parsed.matchedPlaceIds) && parsed.matchedPlaceIds.length > 0) {
          return res.json({
            explanation: parsed.explanation || explanation,
            matchedPlaceIds: parsed.matchedPlaceIds,
            detectedOccasion: parsed.detectedOccasion || "Recherche personnalisée",
            practicalTip: parsed.practicalTip || tip,
          });
        }
      }
    } catch {
      // Graceful fallback to deterministic ranking engine
    }
  }

  return res.json({
    explanation,
    matchedPlaceIds: matchedIds,
    detectedOccasion: isKid ? "Sortie famille & Anniversaire" : isLate ? "Grosse faim de nuit" : isTikTok ? "Chasse aux pépites virales TikTok" : "Sortie gourmande",
    practicalTip: tip,
  });
});

// Server boot with Vite middleware integration in development
async function startServer() {
  const distPath = path.resolve(__dirname, "dist");
  const hasDist = fs.existsSync(path.resolve(distPath, "index.html"));

  if (!isDev && hasDist) {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 L'Appli Gourmande Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is currently in use.`);
    } else {
      console.error("Server startup error:", err);
    }
  });
}

startServer();
