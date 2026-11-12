import React, { useState, useEffect, useMemo } from "react";
import { RawPlace } from "./data/rawDatabase";
import { BASE_ALL_PLACES, getCustomPlaces, saveCustomPlace } from "./data/allPlacesProvider";
import { TAXONOMY, BUDGET_STEPS, FA_ICONS, foodKey, artStyle, TaxCategory } from "./data/taxonomy";
import { FOOD_DEALS, GOURMET_BADGES } from "./data/dealsData";
import { calculateDistanceKm, formatDistance, isCurrentlyOpen, getNearestLandmark } from "./utils/geo";
import { Header } from "./components/Header";
import { AISearchBar } from "./components/AISearchBar";
import { RealLeafletMap } from "./components/RealLeafletMap";
import { DealsHub } from "./components/DealsHub";
import { SocialAndGroupVote } from "./components/SocialAndGroupVote";
import { FoodDiaryModal } from "./components/FoodDiaryModal";
import { GamificationModal } from "./components/GamificationModal";
import { WidgetSimulatorModal } from "./components/WidgetSimulatorModal";
import { ProactiveNotificationBanner } from "./components/ProactiveNotificationBanner";
import { GourmetRouletteModal } from "./components/GourmetRouletteModal";
import { TikTokBoxModal } from "./components/TikTokBoxModal";
import { BoxGeneratorModal } from "./components/BoxGeneratorModal";
import { PWAInstallModal } from "./components/PWAInstallModal";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { FoodDuelModal } from "./components/FoodDuelModal";
import { BillSplitterModal } from "./components/BillSplitterModal";
import { MetroFilterModal, PARIS_METRO_HUBS } from "./components/MetroFilterModal";
import { FoodTourPlannerModal } from "./components/FoodTourPlannerModal";
import { GoldenJackpotModal } from "./components/GoldenJackpotModal";
import { NightRadarModal } from "./components/NightRadarModal";
import { AddRestaurantModal } from "./components/AddRestaurantModal";
import { StarringListModal } from "./components/StarringListModal";
import { CoinFlipSurpriseModal } from "./components/CoinFlipSurpriseModal";
import { ArrondissementQuickBar } from "./components/ArrondissementQuickBar";
import { MidpointMeetupModal } from "./components/MidpointMeetupModal";
import { DietaryFiltersModal, DietaryFilterState } from "./components/DietaryFiltersModal";
import { ExpressLunchDecisionModal } from "./components/ExpressLunchDecisionModal";
import { EvolvingIntelModal } from "./components/EvolvingIntelModal";
import { FastFoodMegaHub } from "./components/FastFoodMegaHub";
import { UberEatsStyleCategories } from "./components/UberEatsStyleCategories";
import { WeeklyEvolutionBanner } from "./components/WeeklyEvolutionBanner";
import { ShakeToPickModal } from "./components/ShakeToPickModal";
import { fireGoldConfetti } from "./utils/confetti";
import { getNearestTransit, getSignatureBanger } from "./utils/transitAndBanger";
import { getCalendarFoodEvolution } from "./utils/dynamicEvolutionEngine";
import { FoodDiaryEntry, CustomList, UserGamification, FoodDeal } from "./types/food";
import {
  Navigation,
  Phone,
  Clock,
  Heart,
  Share2,
  X,
  Compass,
  Star,
  ChevronRight,
  Sparkles,
  Award,
  Layers,
  Flame,
  ShieldCheck,
  Smartphone,
  Search,
  MessageCircle,
  Copy,
  Check,
} from "lucide-react";

export default function App() {
  // Permanently locked Luxury Obsidian & 24K Gold Dark Mode (Never white)
  const isDark = true;
  const evolutionIntel = useMemo(() => getCalendarFoodEvolution(), []);

  // GPS User location (defaults to Saint-Denis / Paris center)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 48.924,
    lng: 2.348,
  });

  // Main navigation tab: Accueil (feed), Catégories (categories), Carte GPS (map), Favoris (favs)
  const [activeTab, setActiveTab] = useState<"feed" | "categories" | "fastfood" | "map" | "deals" | "favs" | "group">("feed");
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(false);

  // Category key from quick category row ("poulet", "burger", "pizza", etc.)
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);

  // Original 3-click browsing step in Feed: "home" | "sub" | "bud" | "res"
  const [feedStep, setFeedStep] = useState<"home" | "sub" | "bud" | "res">("home");
  const [selectedTaxIndex, setSelectedTaxIndex] = useState<number>(-1);
  const [selectedSubIndex, setSelectedSubIndex] = useState<number>(-1);
  const [selectedBudget, setSelectedBudget] = useState<number>(0);
  const [selectedZone, setSelectedZone] = useState<string>("Toutes");
  const [activeWishes, setActiveWishes] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [resultLimit, setResultLimit] = useState<number>(36);

  // Selected place for full detail sheet modal
  const [selectedPlace, setSelectedPlace] = useState<RawPlace | null>(null);

  // Custom user-added restaurants stored in localStorage
  const [customPlaces, setCustomPlaces] = useState<RawPlace[]>(() => getCustomPlaces());
  const [isAddRestaurantOpen, setIsAddRestaurantOpen] = useState<boolean>(false);
  const [distanceRadiusKm, setDistanceRadiusKm] = useState<number | null>(null);
  const [sortMode, setSortMode] = useState<"smart" | "distance" | "rating" | "popular" | "price">("smart");

  // Unified catalog: 152,000+ preloaded Paris/IDF places + all user-added spots
  const allPlaces = useMemo(() => {
    return [...customPlaces, ...BASE_ALL_PLACES];
  }, [customPlaces]);

  const handleAddCustomPlace = (newPlace: RawPlace) => {
    const updated = saveCustomPlace(newPlace);
    setCustomPlaces(updated);
    setSelectedPlace(newPlace);
  };

  // Favorites synchronized with localStorage & backend
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("gm-fav") || "[0, 1, 2, 17, 24, 174]");
    } catch {
      return [0, 1, 2, 17, 24, 174];
    }
  });

  // Custom Lists & Food Diary & Gamification state
  const [customLists, setCustomLists] = useState<CustomList[]>([
    {
      id: "viral-tiktok-paris",
      title: "🔥 Pépites TikTok Paris & 93",
      description: "Les box de poulet croustillant et bouillons cultes.",
      emoji: "🔥",
      isPublic: true,
      placeIds: [0, 1, 17, 24, 174],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  const [diaryEntries, setDiaryEntries] = useState<FoodDiaryEntry[]>([
    {
      id: "diary-1",
      placeId: 0,
      placeName: "La Tradition",
      visitedAt: "2026-10-18",
      rating: 5,
      favoriteDish: "Poulet rôti et burger maison",
      notes: "Accueil très chaleureux, portions énormes et prix justes !",
      costPaid: 14.5,
      tag: "Coup de cœur",
    },
  ]);

  const [gamification, setGamification] = useState<UserGamification>({
    points: 480,
    level: 3,
    levelTitle: "Chasseur de Pépites",
    placesTestedCount: 8,
    kilometersWalked: 18.2,
    moneySavedEur: 42.0,
    unlockedBadgeIds: ["explorer-1", "tiktok-hunter", "money-saver"],
  });

  // Modal toggles
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [isGamificationOpen, setIsGamificationOpen] = useState(false);
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [isGroupVoteOpen, setIsGroupVoteOpen] = useState(false);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [selectedTikTokDeal, setSelectedTikTokDeal] = useState<FoodDeal | null>(null);
  const [isBoxGeneratorOpen, setIsBoxGeneratorOpen] = useState(false);
  const [isPWAInstallOpen, setIsPWAInstallOpen] = useState(false);
  const [isFoodDuelOpen, setIsFoodDuelOpen] = useState(false);
  const [isBillSplitterOpen, setIsBillSplitterOpen] = useState(false);
  const [isMetroFilterOpen, setIsMetroFilterOpen] = useState(false);
  const [selectedMetroStation, setSelectedMetroStation] = useState<any | null>(null);
  const [isFoodTourOpen, setIsFoodTourOpen] = useState(false);
  const [isJackpotOpen, setIsJackpotOpen] = useState(false);
  const [isNightRadarOpen, setIsNightRadarOpen] = useState(false);
  const [isStarringListOpen, setIsStarringListOpen] = useState(false);
  const [placeToStar, setPlaceToStar] = useState<RawPlace | null>(null);
  const [isCoinFlipOpen, setIsCoinFlipOpen] = useState(false);
  const [isMidpointOpen, setIsMidpointOpen] = useState(false);
  const [isDietaryOpen, setIsDietaryOpen] = useState(false);
  const [isExpressLunchOpen, setIsExpressLunchOpen] = useState(false);
  const [isEvolvingIntelOpen, setIsEvolvingIntelOpen] = useState(false);
  const [isShakeToPickOpen, setIsShakeToPickOpen] = useState(false);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dietaryFilters, setDietaryFilters] = useState<DietaryFilterState>({
    halalStrict: false,
    vegetarian: false,
    terrace: false,
    lateNight: false,
    budgetUnder10: false,
    fastService: false,
    tiktokViral: false,
    topRatedOnly: false,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const [instantSearchQuery, setInstantSearchQuery] = useState("");
  const [maxBudgetEur, setMaxBudgetEur] = useState<number | null>(null);
  const [storyPlace, setStoryPlace] = useState<RawPlace | null>(null);

  // AI Search state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<{
    explanation?: string;
    detectedOccasion?: string;
    practicalTip?: string;
  } | null>(null);
  const [aiMatchedIds, setAiMatchedIds] = useState<number[] | null>(null);

  // Permanently enforce Luxury Obsidian Dark Mode across document
  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
    localStorage.setItem("gourmap-theme", "dark");
  }, []);

  // Real geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {},
        { timeout: 5000 }
      );
    }
  }, []);

  // Accelerometer shake detection to trigger "Secoue & Déguste"
  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0;
    let lastTime = 0;

    const handleMotion = (e: DeviceMotionEvent) => {
      const current = e.accelerationIncludingGravity;
      if (!current) return;
      const curTime = Date.now();
      if (curTime - lastTime > 120) {
        const diffTime = curTime - lastTime;
        lastTime = curTime;
        const speed = (Math.abs((current.x || 0) + (current.y || 0) + (current.z || 0) - lastX - lastY - lastZ) / diffTime) * 10000;
        if (speed > 1400) {
          setIsShakeToPickOpen(true);
        }
        lastX = current.x || 0;
        lastY = current.y || 0;
        lastZ = current.z || 0;
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, []);

  // Sync with backend API
  useEffect(() => {
    fetch("/api/sync")
      .then((res) => res.json())
      .then((data) => {
        if (data.state) {
          if (data.state.favorites) setFavorites(data.state.favorites);
          if (data.state.customLists) setCustomLists(data.state.customLists);
          if (data.state.foodDiary) setDiaryEntries(data.state.foodDiary);
          if (data.state.gamification) setGamification(data.state.gamification);
        }
      })
      .catch(() => {});
  }, []);

  const persistFavorites = (nextFavs: number[]) => {
    setFavorites(nextFavs);
    try {
      localStorage.setItem("gm-fav", JSON.stringify(nextFavs));
    } catch {}
    fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorites: nextFavs }),
    }).catch(() => {});
  };

  const handleToggleFavorite = (id: number) => {
    const next = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    persistFavorites(next);
  };

  // Recenter GPS
  const handleRecenterGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  };

  // AI Conversational Search
  const handleAISearch = async (prompt: string) => {
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/search-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, userLat: userLocation.lat, userLng: userLocation.lng }),
      });
      const data = await res.json();
      setAiResponse({
        explanation: data.explanation,
        detectedOccasion: data.detectedOccasion,
        practicalTip: data.practicalTip,
      });
      if (data.matchedPlaceIds && data.matchedPlaceIds.length > 0) {
        setAiMatchedIds(data.matchedPlaceIds);
        setFeedStep("res");
      }
    } catch {
      setAiResponse({
        explanation: "Voici les meilleurs choix sélectionnés par l'IA L'Appli Gourmande.",
        detectedOccasion: "Sélection sur mesure",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleClearAI = () => {
    setAiResponse(null);
    setAiMatchedIds(null);
  };

  // Filter wishes with comprehensive Halal & dietary detection
  const WISHES: Record<string, (p: RawPlace) => boolean> = {
    "Ouvert maintenant": (p) => isCurrentlyOpen(p.h || (p as any).hours),
    "🕌 Halal": (p) => p.isHalal === true,
    Halal: (p) => p.isHalal === true,
    "🔥 TikTok": (p) => p.tiktokViral === true,
    "🌱 Végé": (p) => p.hasVegetarian === true,
    "🌙 Ouvert tard": (p) => p.isOpenLate === true,
    "☀️ Terrasse": (p) => p.hasTerrace === true,
    "⭐ Top noté": (p) => p.r >= 4.7 && p.c >= 80,
    "💸 Bon plan ≤ 10 €": (p) => p.isBoxDeal === true || p.pr === 1,
  };

  const sortPlaces = (list: RawPlace[]) => {
    const uLat = userLocation.lat;
    const uLng = userLocation.lng;

    const compare = (a: RawPlace, b: RawPlace) => {
      const distA = calculateDistanceKm(uLat, uLng, a.la, a.lo);
      const distB = calculateDistanceKm(uLat, uLng, b.la, b.lo);

      if (sortMode === "distance") return distA - distB;
      if (sortMode === "rating") return b.r - a.r || distA - distB;
      if (sortMode === "popular") return b.c - a.c || distA - distB;
      if (sortMode === "price") return a.pr - b.pr || distA - distB;

      // Default "smart" 24K algorithm
      const scoreA = a.r * Math.log10(a.c + 10) - (selectedZone === "Toutes" ? 0.45 * distA : 0);
      const scoreB = b.r * Math.log10(b.c + 10) - (selectedZone === "Toutes" ? 0.45 * distB : 0);
      return scoreB - scoreA;
    };

    // If list is small (already filtered by user), sort directly in ~1ms
    if (list.length <= 600) {
      return [...list].sort(compare);
    }

    // For massive catalogs (150,000+), fast spatial/scoring pre-selection
    const itemsWithDist = new Array(list.length);
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      const dLat = p.la - uLat;
      const dLng = (p.lo - uLng) * 0.65;
      itemsWithDist[i] = { p, dSq: dLat * dLat + dLng * dLng };
    }

    if (sortMode === "rating") {
      itemsWithDist.sort((a, b) => b.p.r - a.p.r);
    } else if (sortMode === "popular") {
      itemsWithDist.sort((a, b) => b.p.c - a.p.c);
    } else if (sortMode === "price") {
      itemsWithDist.sort((a, b) => a.p.pr - b.p.pr);
    } else {
      itemsWithDist.sort((a, b) => a.dSq - b.dSq);
    }
    const topCandidates = itemsWithDist.slice(0, 500).map((x) => x.p);

    return topCandidates.sort(compare);
  };

  // Helper to strictly match food category
  const matchPlaceCategory = (p: RawPlace, catKey: string): boolean => {
    const normKey = catKey.toLowerCase().trim();
    const sub = (p.sub || "").toLowerCase();
    const name = (p.n || "").toLowerCase();
    const cat = (p.cat || "").toLowerCase();
    const fk = (p.foodKey || "").toLowerCase();

    switch (normKey) {
      case "poulet":
        return fk === "poulet" || sub.includes("poulet") || name.includes("poulet") || name.includes("chicken") || name.includes("kfc") || name.includes("popeyes") || sub.includes("tenders") || sub.includes("crispy");
      case "burger":
        return fk === "burger" || sub.includes("burger") || name.includes("burger") || sub.includes("smash");
      case "pizza":
        return fk === "pizza" || sub.includes("pizza") || name.includes("pizza") || sub.includes("italien");
      case "sushi":
        return fk === "sushi" || sub.includes("sushi") || sub.includes("japonais") || name.includes("sushi") || name.includes("wok");
      case "kebab":
        return fk === "kebab" || sub.includes("kebab") || name.includes("kebab") || sub.includes("döner") || name.includes("bosphore") || name.includes("marmaris");
      case "tacos":
        return fk === "tacos" || sub.includes("tacos") || name.includes("tacos") || name.includes("chamas");
      case "naan":
        return fk === "naan" || fk === "curry" || sub.includes("naan") || sub.includes("indien") || name.includes("naan") || name.includes("taj mahal");
      case "ramen":
        return fk === "ramen" || sub.includes("ramen") || sub.includes("nouilles") || name.includes("ramen") || name.includes("pho");
      case "steak":
        return fk === "steak" || fk === "viandes" || sub.includes("grill") || sub.includes("viande") || sub.includes("steak") || name.includes("buffalo grill");
      case "boulangerie":
        return fk === "croissant" || sub.includes("boulangerie") || sub.includes("pâtisserie") || cat.includes("goûter") || name.includes("boulangerie") || name.includes("paul") || name.includes("crêperie");
      case "couscous":
        return fk === "tajine" || fk === "couscous" || sub.includes("couscous") || sub.includes("tajine") || name.includes("couscous");
      case "pâtes":
        return sub.includes("pâte") || (sub.includes("italien") && !sub.includes("pizza"));
      default:
        return fk === normKey || sub.includes(normKey) || name.includes(normKey);
    }
  };

  // Calculate filtered results for step-by-step browsing with Anti-0 Result guarantee across verified spots
  const { results: currentResults, isRelaxed: isFilterRelaxed } = useMemo(() => {
    if (aiMatchedIds) {
      const matched = aiMatchedIds.map((id) => allPlaces.find((p) => p.id === id)).filter(Boolean) as RawPlace[];
      return { results: matched.length > 0 ? matched : sortPlaces(allPlaces.slice(0, 10)), isRelaxed: false };
    }
    if (activeTab === "favs") {
      return { results: allPlaces.filter((p) => favorites.includes(p.id)), isRelaxed: false };
    }

    const t = selectedTaxIndex >= 0 ? TAXONOMY[selectedTaxIndex] : null;
    const sp = t && selectedSubIndex >= 0 ? t.subs[selectedSubIndex][2] : null;
    const q = instantSearchQuery.trim().toLowerCase();
    const isHalalUserWant = activeWishes.includes("Halal") || dietaryFilters.halalStrict;

    const matchesZone = (p: RawPlace) => {
      if (selectedZone === "Toutes") return true;
      if (selectedZone === "Paris (Tous)") return p.z.startsWith("Paris");
      if (selectedZone === "Paris 1-10") {
        const num = parseInt(p.z.replace("Paris ", ""), 10);
        return !isNaN(num) && num >= 1 && num <= 10;
      }
      if (selectedZone === "Paris 11-20") {
        const num = parseInt(p.z.replace("Paris ", ""), 10);
        return !isNaN(num) && num >= 11 && num <= 20;
      }
      return p.z.toLowerCase().includes(selectedZone.toLowerCase()) ||
             (p.zone && p.zone.toLowerCase().includes(selectedZone.toLowerCase())) ||
             p.a.toLowerCase().includes(selectedZone.toLowerCase());
    };

    const matchesCategory = (p: RawPlace) => {
      if (!selectedCategoryKey) return true;
      return matchPlaceCategory(p, selectedCategoryKey);
    };

    const matchesQuery = (p: RawPlace) => {
      if (!q) return true;
      if (p.n.toLowerCase().includes(q) || p.a.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q) || p.z.toLowerCase().includes(q)) {
        return true;
      }
      const categoryKeywords = ["poulet", "chicken", "burger", "pizza", "kebab", "tacos", "sushi", "ramen", "naan", "steak"];
      if (!categoryKeywords.includes(q) && p.s.toLowerCase().includes(q)) {
        return true;
      }
      return false;
    };

    // 1. Strict filter pass
    let strict = allPlaces.filter((p) => {
      if (!matchesQuery(p)) return false;
      if (!matchesCategory(p)) return false;
      if (!matchesZone(p)) return false;
      if (maxBudgetEur !== null) {
        if (maxBudgetEur === 10 && p.pr > 1) return false;
        if (maxBudgetEur === 15 && p.pr > 2) return false;
        if (maxBudgetEur === 25 && p.pr > 3) return false;
      }
      if (t && !t.m(p)) return false;
      if (sp && !sp(p)) return false;
      if (selectedBudget > 0) {
        if (selectedBudget === 3 && p.pr < 3) return false;
        if (selectedBudget < 3 && p.pr !== selectedBudget) return false;
      }
      if (distanceRadiusKm !== null) {
        const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, p.la, p.lo);
        if (dist > distanceRadiusKm) return false;
      }
      if (selectedMetroStation) {
        const distToStation = calculateDistanceKm(selectedMetroStation.lat, selectedMetroStation.lng, p.la, p.lo);
        if (distToStation > 0.8) return false;
      }
      if (openNowOnly && !isCurrentlyOpen(p.h)) return false;
      if (dietaryFilters.halalStrict && !p.isHalal) return false;
      if (dietaryFilters.vegetarian && !p.hasVegetarian) return false;
      if (dietaryFilters.terrace && !p.hasTerrace) return false;
      if (dietaryFilters.lateNight && !p.isOpenLate) return false;
      if (dietaryFilters.budgetUnder10 && p.pr > 1) return false;
      if (dietaryFilters.tiktokViral && !p.tiktokViral) return false;
      if (dietaryFilters.topRatedOnly && (p.r < 4.8 || p.c < 100)) return false;
      if (activeWishes.some((w) => !WISHES[w](p))) return false;
      return true;
    });

    if (strict.length > 0) {
      return { results: sortPlaces(strict), isRelaxed: false };
    }

    // 2. Anti-0 Guarantee Fallback A: Keep category and query strictly, widen zone
    const widenedZone = allPlaces.filter((p) => {
      if (!matchesQuery(p)) return false;
      if (!matchesCategory(p)) return false;
      if (t && !t.m(p)) return false;
      if (sp && !sp(p)) return false;
      if (isHalalUserWant && !p.isHalal) return false;
      return true;
    });

    if (widenedZone.length > 0) {
      return { results: sortPlaces(widenedZone), isRelaxed: true };
    }

    // 3. Anti-0 Guarantee Fallback B: Keep zone and category, relax secondary wishes
    const relaxedWishes = allPlaces.filter((p) => {
      if (!matchesCategory(p)) return false;
      if (t && !t.m(p)) return false;
      if (sp && !sp(p)) return false;
      if (!matchesZone(p)) return false;
      return true;
    });

    if (relaxedWishes.length > 0) {
      return { results: sortPlaces(relaxedWishes), isRelaxed: true };
    }

    // 4. Fallback: If category requested, show top rated in that category
    if (selectedCategoryKey) {
      const catPlaces = allPlaces.filter((p) => matchPlaceCategory(p, selectedCategoryKey));
      if (catPlaces.length > 0) {
        return { results: sortPlaces(catPlaces).slice(0, 35), isRelaxed: true };
      }
    }
    if (t) {
      const taxPlaces = allPlaces.filter((p) => t.m(p));
      if (taxPlaces.length > 0) {
        return { results: sortPlaces(taxPlaces).slice(0, 35), isRelaxed: true };
      }
    }

    // 5. Ultimate fallback: Top rated places nearest to user
    return { results: sortPlaces(allPlaces.filter((p) => p.r >= 4.5)).slice(0, 35), isRelaxed: true };
  }, [allPlaces, aiMatchedIds, activeTab, favorites, selectedCategoryKey, selectedTaxIndex, selectedSubIndex, selectedBudget, selectedZone, distanceRadiusKm, activeWishes, userLocation, selectedMetroStation, instantSearchQuery, maxBudgetEur, sortMode, openNowOnly, dietaryFilters]);

  // Zone list across all verified spots
  const allZones = useMemo(() => [
    "Toutes",
    "Paris (Tous)",
    "Paris 1-10",
    "Paris 11-20",
    "Créteil",
    "Saint-Ouen",
    "Saint-Denis",
    "Boulogne-Billancourt",
    "Vincennes",
    "Montreuil",
    "Aubervilliers",
    "Nanterre",
    "Thiais",
    "Sarcelles",
    "Bondy",
    "Rosny-sous-Bois",
    "Torcy",
    "Villeneuve",
  ], []);

  // Surprise lottery pick
  const handleSurpriseMe = () => {
    const topRated = allPlaces.filter((p) => p.r >= 4.6 && p.c >= 100);
    const p = topRated[Math.floor(Math.random() * topRated.length)] || allPlaces[0];
    setSelectedPlace(p);
  };

  // Top trending and gems memoized for instant 60 FPS UI
  const hotPlaces = useMemo(() => allPlaces.filter((p) => p.c >= 2000).slice(0, 10), [allPlaces]);
  const gemsPlaces = useMemo(() => allPlaces.filter((p) => p.r >= 4.8 && p.c >= 300).slice(0, 10), [allPlaces]);
  const freshPlaces = useMemo(() => allPlaces.slice(-28).reverse().slice(0, 10), [allPlaces]);

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Bonjour ☀️" : hour < 15 ? "Bon appétit 🍽️" : hour < 18 ? "Un petit goûter ? 🥐" : "Bonsoir 🌙";

  return (
    <div
      className={`min-h-screen ${
        isPhoneFrame
          ? "bg-[#06080F] p-2 md:p-8 flex items-center justify-center"
          : "bg-[#08080C]"
      } text-zinc-100 flex flex-col font-sans transition-colors selection:bg-amber-400/20`}
      style={{ backgroundColor: "#08080C" }}
    >
      <div
        className={`w-full ${
          isPhoneFrame
            ? "max-w-[420px] h-[92vh] max-h-[890px] rounded-[52px] shadow-2xl border-[10px] border-zinc-800 bg-[#08080C] overflow-hidden flex flex-col relative"
            : "min-h-screen flex flex-col pb-24 bg-[#08080C]"
        }`}
        style={{ backgroundColor: "#08080C" }}
      >
        {isPhoneFrame && (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-between px-3 pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-slate-800" />
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          </div>
        )}

        <div className={`flex-1 flex flex-col ${isPhoneFrame ? "overflow-y-auto no-scrollbar pb-24" : ""}`}>
          {/* Header */}
          <Header
            onSurpriseMe={handleSurpriseMe}
            onOpenWidget={() => setIsWidgetOpen(true)}
            onOpenGamification={() => setIsGamificationOpen(true)}
            onOpenDiary={() => setIsDiaryOpen(true)}
            onOpenGroupVote={() => setIsGroupVoteOpen(true)}
            onOpenRoulette={() => setIsRouletteOpen(true)}
            onOpenBoxGenerator={() => setIsBoxGeneratorOpen(true)}
            onOpenPWAInstall={() => setIsPWAInstallOpen(true)}
            onOpenFoodDuel={() => setIsFoodDuelOpen(true)}
            onOpenBillSplitter={() => setIsBillSplitterOpen(true)}
            onOpenMetroFilter={() => setIsMetroFilterOpen(true)}
            onOpenFoodTour={() => setIsFoodTourOpen(true)}
            onOpenGoldenJackpot={() => setIsJackpotOpen(true)}
            onOpenNightRadar={() => setIsNightRadarOpen(true)}
            onOpenAddRestaurant={() => setIsAddRestaurantOpen(true)}
            onOpenStarringLists={() => setIsStarringListOpen(true)}
            onOpenCoinFlip={() => setIsCoinFlipOpen(true)}
            onOpenMidpoint={() => setIsMidpointOpen(true)}
            onOpenDietaryFilters={() => setIsDietaryOpen(true)}
            onOpenEvolvingIntel={() => setIsEvolvingIntelOpen(true)}
            onOpenShakeToPick={() => setIsShakeToPickOpen(true)}
            isPhoneFrame={isPhoneFrame}
            onTogglePhoneFrame={() => setIsPhoneFrame(!isPhoneFrame)}
            testedCount={gamification.placesTestedCount}
            userPoints={gamification.points}
            isToolsMenuOpen={isToolsMenuOpen}
            onToggleToolsMenu={setIsToolsMenuOpen}
          />



      {/* MAIN CONTAINER */}
      <main className="flex-1 w-full max-w-5xl mx-auto pb-28 sm:pb-32">
        {/* ================= TAB 1: FEED ================= */}
        {/* ================= TAB 1: RESTAURANTS FEED ================= */}
        {activeTab === "feed" && (
          <div className="flex flex-col gap-3">
            {/* 1. Main Direct Search Bar */}
            <div className="relative w-full">
              <input
                type="text"
                value={instantSearchQuery}
                onChange={(e) => {
                  setInstantSearchQuery(e.target.value);
                  if (aiResponse) handleClearAI();
                }}
                placeholder="Rechercher un restaurant, burger, poulet, sushi, adresse..."
                className="w-full py-3.5 pl-11 pr-10 rounded-2xl bg-[#111118] border border-amber-500/25 text-white text-sm placeholder:text-zinc-500 outline-none focus:border-amber-400 focus:shadow-[0_0_15px_rgba(245,158,11,0.18)] transition-all"
              />
              <div className="absolute left-3.5 top-3.5 text-amber-400">
                <Search className="w-4 h-4" />
              </div>
              {instantSearchQuery && (
                <button
                  onClick={() => setInstantSearchQuery("")}
                  className="absolute right-3.5 top-3 text-zinc-400 hover:text-white text-xs font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* 2. Arrondissements & Cities Horizontal Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[11px] font-bold text-amber-400/90 shrink-0 mr-1">
                Ville :
              </span>
              {allZones.map((z) => {
                const isSelected = selectedZone === z;
                return (
                  <button
                    key={z}
                    onClick={() => setSelectedZone(z)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20 border border-amber-300"
                        : "bg-[#12121A] text-zinc-300 border border-zinc-800/80 hover:border-amber-400/50 hover:text-white"
                    }`}
                  >
                    {z === "Toutes" ? "Toute l'IDF" : z}
                  </button>
                );
              })}
            </div>

            {/* 3. Essential Quick Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setOpenNowOnly(!openNowOnly)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  openNowOnly
                    ? "bg-emerald-400 text-slate-950 font-black shadow-sm"
                    : "bg-[#12121A] text-zinc-300 border border-zinc-800 hover:border-emerald-400"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${openNowOnly ? "bg-slate-950" : "bg-emerald-400 animate-pulse"}`} />
                <span>Ouvert</span>
              </button>

              <button
                onClick={() => setDietaryFilters((prev) => ({ ...prev, halalStrict: !prev.halalStrict }))}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  dietaryFilters.halalStrict
                    ? "bg-emerald-400 text-slate-950 font-black shadow-sm"
                    : "bg-[#12121A] text-zinc-300 border border-zinc-800 hover:border-emerald-400"
                }`}
              >
                <span>🕌</span>
                <span>100% Halal</span>
              </button>

              <button
                onClick={() => setMaxBudgetEur(maxBudgetEur === 10 ? null : 10)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  maxBudgetEur === 10
                    ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                    : "bg-[#12121A] text-zinc-300 border border-zinc-800 hover:border-amber-400"
                }`}
              >
                <span>🏷️</span>
                <span>≤ 10 €</span>
              </button>

              <button
                onClick={() => setDietaryFilters((prev) => ({ ...prev, topRatedOnly: !prev.topRatedOnly }))}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  dietaryFilters.topRatedOnly
                    ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                    : "bg-[#12121A] text-zinc-300 border border-zinc-800 hover:border-amber-400"
                }`}
              >
                <span>⭐</span>
                <span>4.8+</span>
              </button>

              {(selectedCategoryKey || selectedTaxIndex >= 0) && (
                <button
                  onClick={() => {
                    setSelectedCategoryKey(null);
                    setSelectedTaxIndex(-1);
                    setSelectedSubIndex(-1);
                  }}
                  className="shrink-0 px-3 py-1.5 rounded-full text-xs font-black bg-amber-400 text-slate-950 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>
                    {selectedCategoryKey
                      ? selectedCategoryKey
                      : `${TAXONOMY[selectedTaxIndex].e} ${TAXONOMY[selectedTaxIndex].k}${selectedSubIndex >= 0 ? ` · ${TAXONOMY[selectedTaxIndex].subs[selectedSubIndex][0]}` : ""}`}
                  </span>
                  <span>✕</span>
                </button>
              )}

              {(openNowOnly || dietaryFilters.halalStrict || maxBudgetEur !== null || dietaryFilters.topRatedOnly || selectedCategoryKey || selectedTaxIndex >= 0 || selectedZone !== "Toutes" || instantSearchQuery) && (
                <button
                  onClick={() => {
                    setOpenNowOnly(false);
                    setMaxBudgetEur(null);
                    setSelectedCategoryKey(null);
                    setSelectedTaxIndex(-1);
                    setSelectedSubIndex(-1);
                    setSelectedZone("Toutes");
                    setInstantSearchQuery("");
                    setDietaryFilters((prev) => ({ ...prev, halalStrict: false, topRatedOnly: false }));
                  }}
                  className="shrink-0 px-2.5 py-1.5 rounded-full text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/25 hover:text-white transition-all cursor-pointer"
                >
                  ✕ Tout effacer
                </button>
              )}
            </div>

            {/* 4. Address Count & View Mode Switcher */}
            <div className="flex items-center justify-between pt-1">
              <span className="font-sans font-black text-lg text-white">
                {currentResults.length} {currentResults.length > 1 ? "adresses trouvées" : "adresse trouvée"}
                {selectedZone !== "Toutes" && <span className="text-amber-400 text-sm font-bold"> à {selectedZone}</span>}
              </span>

              <div className="flex bg-[#12121A] border border-zinc-800 p-0.5 rounded-xl">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "list"
                      ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Liste
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "map"
                      ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Carte
                </button>
              </div>
            </div>

            {/* Subtle Filter Relax Notice */}
            {isFilterRelaxed && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between gap-2">
                <span>📍 Filtres élargis pour afficher les meilleures adresses disponibles.</span>
                <button
                  onClick={() => {
                    setSelectedZone("Toutes");
                    setSelectedCategoryKey(null);
                    setSelectedTaxIndex(-1);
                    setSelectedSubIndex(-1);
                    setInstantSearchQuery("");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-[11px] shrink-0 cursor-pointer"
                >
                  Réinitialiser
                </button>
              </div>
            )}

            {/* 6. Main View: Map or List */}
            {viewMode === "map" ? (
              <RealLeafletMap
                places={currentResults}
                userLat={userLocation.lat}
                userLng={userLocation.lng}
                onSelectPlace={(p) => setSelectedPlace(p)}
                selectedPlaceId={selectedPlace?.id}
                onRecenterGPS={handleRecenterGPS}
                isDark={isDark}
              />
            ) : (
              <div className="flex flex-col gap-3.5 pt-1">
                {currentResults.slice(0, resultLimit).map((place) => {
                  const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, place.la, place.lo);
                  const walkMin = Math.max(1, Math.round(dist / 0.08));
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.n + " " + place.a)}`;
                  const isFav = favorites.includes(place.id);

                  return (
                    <article
                      key={place.id}
                      onClick={() => setSelectedPlace(place)}
                      className="p-4 rounded-3xl bg-[#111118] border border-zinc-800/80 hover:border-amber-500/40 shadow-lg shadow-black/40 flex flex-col gap-3 cursor-pointer transition-all group"
                    >
                      {/* Top: Icon + Title + Meta + Favorite */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-amber-500/30"
                            style={{ background: artStyle(place) }}
                          >
                            <svg
                              className="w-8 h-8"
                              viewBox="0 0 100 100"
                              dangerouslySetInnerHTML={{ __html: FA_ICONS[foodKey(place)] }}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-black text-base text-white group-hover:text-amber-300 transition-colors leading-tight">
                                {place.n}
                              </h3>
                              {place.isHalal && (
                                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  🕌 Halal
                                </span>
                              )}
                            </div>

                            {/* Clean unboxed metadata with bullet separators */}
                            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1 flex-wrap">
                              <span className="text-amber-400 font-bold">★ {place.r.toFixed(1)}</span>
                              <span>({place.c.toLocaleString("fr-FR")} avis)</span>
                              <span>·</span>
                              <span className="text-zinc-300 font-medium">{place.sub}</span>
                              <span>·</span>
                              <span className="text-amber-200">{"€".repeat(place.pr)}</span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5 flex-wrap">
                              <span className="text-amber-300/90 font-medium truncate">📍 {place.a}</span>
                              <span>·</span>
                              <span className="text-zinc-400">{formatDistance(dist)}</span>
                              <span>·</span>
                              <span className="text-emerald-400 font-semibold">🚶 ~{walkMin} min</span>
                            </div>
                          </div>
                        </div>

                        {/* Favorite Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(place.id);
                          }}
                          className={`p-2 rounded-full shrink-0 transition-all cursor-pointer ${
                            isFav
                              ? "bg-rose-500/20 text-rose-500 border border-rose-500/40"
                              : "bg-[#181824] text-zinc-400 hover:text-white border border-zinc-800"
                          }`}
                          title="Ajouter aux Favoris"
                        >
                          <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
                        </button>
                      </div>

                      {/* Summary */}
                      {place.s && (
                        <p className="text-xs text-zinc-400 line-clamp-1 leading-relaxed">
                          {place.s}
                        </p>
                      )}

                      {/* Action Buttons: Google Maps IS #1 PRIMARY GOLD BUTTON */}
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 py-3 px-4 rounded-2xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer text-center"
                        >
                          <Navigation className="w-4 h-4 fill-current shrink-0" />
                          <span>Ouvrir sur Google Maps</span>
                        </a>

                        <button
                          onClick={() => setSelectedPlace(place)}
                          className="py-3 px-4 rounded-2xl text-xs font-bold text-zinc-300 bg-[#181824] border border-zinc-800 hover:border-amber-400/50 hover:text-white transition-all cursor-pointer shrink-0"
                        >
                          Détails
                        </button>
                      </div>
                    </article>
                  );
                })}

                {currentResults.length > resultLimit && (
                  <button
                    onClick={() => setResultLimit((prev) => prev + 24)}
                    className="w-full py-3.5 rounded-2xl bg-[#141420] border border-amber-500/30 text-amber-300 font-bold text-xs hover:border-amber-400 transition-all cursor-pointer my-2"
                  >
                    Afficher plus de restaurants (+{currentResults.length - resultLimit} restants)
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: CATÉGORIES ================= */}
        {activeTab === "categories" && (
          <div className="flex flex-col gap-5">
            {/* Top: Scrolling Quick Food Strip (Pizza, Sushi, Ramen, Poulet, Burger...) */}
            <UberEatsStyleCategories
              selectedCategory={selectedCategoryKey}
              onSelectCategory={(catKey) => {
                setSelectedCategoryKey(catKey);
                setSelectedTaxIndex(-1);
                setSelectedSubIndex(-1);
                setActiveTab("feed");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />

            {/* Bottom: Grandes Catégories (Viandes, Restau, Fast-food, Goûter, etc.) */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="font-sans font-black text-lg text-white">
                  Grandes Catégories
                </h2>
                <span className="text-xs text-zinc-400 font-semibold">
                  {allPlaces.length} adresses vérifiées
                </span>
              </div>

              {/* If a main category is expanded, show its subcategories cleanly */}
              {selectedTaxIndex >= 0 && (
                <div className="p-4 rounded-2xl bg-[#111118] border border-amber-500/40 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{TAXONOMY[selectedTaxIndex].e}</span>
                      <span className="font-black text-base text-white">
                        {TAXONOMY[selectedTaxIndex].k}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTaxIndex(-1);
                        setSelectedSubIndex(-1);
                      }}
                      className="text-xs text-zinc-400 hover:text-white font-bold px-2 py-1 cursor-pointer"
                    >
                      ✕ Fermer
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedCategoryKey(null);
                        setSelectedSubIndex(-1);
                        setActiveTab("feed");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs cursor-pointer"
                    >
                      Tout voir ({allPlaces.filter(TAXONOMY[selectedTaxIndex].m).length})
                    </button>

                    {TAXONOMY[selectedTaxIndex].subs.map(([label, emoji, filterFn], subIdx) => {
                      const subCount = allPlaces.filter((p) => TAXONOMY[selectedTaxIndex].m(p) && filterFn(p)).length;
                      if (subCount === 0) return null;
                      return (
                        <button
                          key={label}
                          onClick={() => {
                            setSelectedCategoryKey(null);
                            setSelectedSubIndex(subIdx);
                            setActiveTab("feed");
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="px-3 py-2 rounded-xl bg-[#181824] border border-zinc-800 hover:border-amber-400/60 text-zinc-200 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <span>{emoji}</span>
                          <span>{label}</span>
                          <span className="text-zinc-500">({subCount})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {TAXONOMY.map((tax, idx) => {
                  const count = allPlaces.filter(tax.m).length;
                  const isActive = selectedTaxIndex === idx;
                  return (
                    <button
                      key={tax.k}
                      onClick={() => {
                        setSelectedCategoryKey(null);
                        setSelectedTaxIndex(isActive ? -1 : idx);
                        setSelectedSubIndex(-1);
                      }}
                      className={`p-3.5 rounded-2xl text-left flex flex-col justify-between gap-2 transition-all cursor-pointer border ${
                        isActive
                          ? "bg-[#1A1A26] border-amber-400 shadow-md shadow-amber-500/10"
                          : "bg-[#111118] border-zinc-800/80 hover:border-amber-500/50"
                      }`}
                    >
                      <span className="text-2xl leading-none">{tax.e}</span>
                      <div>
                        <span className="font-black text-sm text-white block leading-tight">
                          {tax.k}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-medium">
                          {count} adresses
                        </span>
                      </div>
                    </button>
                  );
                })}

                <button
                  onClick={handleSurpriseMe}
                  className="col-span-2 sm:col-span-3 p-3.5 rounded-2xl bg-amber-400 text-slate-950 font-black text-left flex items-center justify-between cursor-pointer hover:brightness-105 transition-all"
                >
                  <div>
                    <span className="text-sm font-black block">🎲 Surprends-moi !</span>
                    <span className="text-xs font-semibold text-slate-900/80">
                      Choisis une bonne adresse au hasard
                    </span>
                  </div>
                  <span className="text-2xl">🎲</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: LE QG FAST-FOOD & DROPS ================= */}
        {activeTab === "fastfood" && (
          <div className="px-3 sm:px-4 py-4 flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🍔</span>
                  <h2 className="font-sans font-black text-2xl sm:text-3xl text-white tracking-tight">
                    Le QG Fast-Food <span className="text-gold-gradient font-black">& Drops Parisiens</span>
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-amber-200/70 mt-1">
                  Les grands fast-foods cultes, les boxs ≤ 10 € et les pépites boostées regroupés avec "Le Truc du Moment".
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBoxGeneratorOpen(true)}
                  className="px-3 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>⚡</span>
                  <span>Générateur de Box</span>
                </button>
                <button
                  onClick={() => setActiveTab("map")}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#141420] text-amber-300 border border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>🗺️</span>
                  <span>Sur la Carte</span>
                </button>
              </div>
            </div>

            <FastFoodMegaHub
              onSearchBrand={(brandQuery) => {
                setInstantSearchQuery(brandQuery);
                setActiveTab("feed");
                setFeedStep("res");
              }}
              onSelectDeal={(deal) => setSelectedTikTokDeal(deal)}
              onOpenBoxGenerator={() => setIsBoxGeneratorOpen(true)}
            />
          </div>
        )}

        {/* ================= TAB 3: CARTE ================= */}
        {activeTab === "map" && (
          <RealLeafletMap
            places={allPlaces}
            userLat={userLocation.lat}
            userLng={userLocation.lng}
            onSelectPlace={(p) => setSelectedPlace(p)}
            selectedPlaceId={selectedPlace?.id}
            onRecenterGPS={handleRecenterGPS}
            isDark={isDark}
          />
        )}

        {/* ================= TAB 3: BONS PLANS ================= */}
        {activeTab === "deals" && (
          <DealsHub
            places={allPlaces as any}
            userLat={userLocation.lat}
            userLng={userLocation.lng}
            onSelectPlace={(p) => setSelectedPlace(p as any)}
            onOpenTikTokModal={(deal) => setSelectedTikTokDeal(deal)}
          />
        )}

        {/* ================= TAB 4: FAVORIS ================= */}
        {activeTab === "favs" && (
          <div className="py-2 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="font-sans font-black text-xl text-white">
                  Favoris ({favorites.length})
                </h2>
                <p className="text-xs text-zinc-400">
                  Vos adresses sauvegardées
                </p>
              </div>
              <button
                onClick={() => setIsStarringListOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-black bg-[#141420] border border-amber-500/30 text-amber-300 hover:border-amber-400 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>⭐</span>
                <span>Mes Listes ({customLists.length})</span>
              </button>
            </div>

            {favorites.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Heart className="w-12 h-12 mx-auto mb-2 opacity-30 text-rose-500" />
                <p className="text-sm font-bold">Aucun favori enregistré</p>
                <p className="text-xs mt-1">Clique sur le cœur ou l'étoile d'un restaurant pour le retrouver ici.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allPlaces.filter((p) => favorites.includes(p.id)).map((place) => (
                  <div
                    key={place.id}
                    onClick={() => setSelectedPlace(place)}
                    className="p-3.5 rounded-2xl bg-[#12121A] border border-amber-500/25 hover:border-amber-400 flex items-center justify-between gap-3 shadow-md cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/20"
                        style={{ background: artStyle(place) }}
                      >
                        <svg
                          className="w-8 h-8"
                          viewBox="0 0 100 100"
                          dangerouslySetInnerHTML={{ __html: FA_ICONS[foodKey(place)] }}
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                          {place.n}
                        </h4>
                        <span className="text-xs text-zinc-400 block truncate">
                          <span className="text-amber-400 font-bold">★ {place.r.toFixed(1)}</span> · {place.sub} · {place.z}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlaceToStar(place);
                          setIsStarringListOpen(true);
                        }}
                        className="p-2 rounded-full text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 transition-colors"
                        title="Ajouter à une liste"
                      >
                        <Star className="w-4 h-4 fill-amber-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(place.id);
                        }}
                        className="p-2 rounded-full text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Persistent Bottom Tab Bar (5 Clean Tabs: Accueil, Catégories, Carte, Outils, Favoris) */}
      <nav className="fixed bottom-4 left-3 right-3 sm:left-4 sm:right-4 max-w-lg mx-auto z-40 bg-[#0A0A0F]/95 backdrop-blur-2xl border border-amber-500/30 rounded-2xl p-1.5 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center justify-between gap-1">
        {/* 1. Accueil */}
        <button
          onClick={() => {
            setActiveTab("feed");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
            activeTab === "feed"
              ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/25"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <span className="text-base leading-none">🏠</span>
          <span className="text-[10px] sm:text-[11px] font-black truncate">Accueil</span>
        </button>

        {/* 2. Catégories */}
        <button
          onClick={() => {
            setActiveTab("categories");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
            activeTab === "categories"
              ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/25"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <span className="text-base leading-none">🍽️</span>
          <span className="text-[10px] sm:text-[11px] font-black truncate">Catégories</span>
        </button>

        {/* 3. Carte GPS */}
        <button
          onClick={() => setActiveTab("map")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
            activeTab === "map"
              ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/25"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <span className="text-base leading-none">🗺️</span>
          <span className="text-[10px] sm:text-[11px] font-black truncate">Carte</span>
        </button>

        {/* 4. Outils */}
        <button
          onClick={() => setIsToolsMenuOpen(true)}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
            isToolsMenuOpen
              ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/25"
              : "text-amber-300 hover:text-white"
          }`}
        >
          <span className="text-base leading-none">⚡</span>
          <span className="text-[10px] sm:text-[11px] font-black truncate">Outils</span>
        </button>

        {/* 5. Favoris */}
        <button
          onClick={() => setActiveTab("favs")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
            activeTab === "favs"
              ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/25"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <span className="text-base leading-none">❤️</span>
          <span className="text-[10px] sm:text-[11px] font-black truncate">Favoris</span>
        </button>
      </nav>

      {/* Detail Sheet Modal */}
      {selectedPlace && (
        <div
          onClick={() => setSelectedPlace(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl max-h-[92vh] sm:max-h-[85vh] bg-[#0A0A10] rounded-t-3xl sm:rounded-3xl overflow-y-auto no-scrollbar shadow-[0_20px_70px_rgba(0,0,0,0.9)] border border-amber-500/30 relative flex flex-col text-white"
          >
            {/* Close Button Top Right */}
            <button
              onClick={() => setSelectedPlace(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/70 backdrop-blur-md text-zinc-300 hover:text-white border border-zinc-800 flex items-center justify-center hover:bg-black/90 transition-transform active:scale-95 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Visual Header */}
            <div
              className="relative w-full h-48 sm:h-56 flex items-center justify-center overflow-hidden shrink-0"
              style={{ background: artStyle(selectedPlace) }}
            >
              <svg
                className="w-28 h-28 drop-shadow-lg"
                viewBox="0 0 100 100"
                dangerouslySetInnerHTML={{ __html: FA_ICONS[foodKey(selectedPlace)] }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A10] via-black/40 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-zinc-950 shadow-md">
                    {selectedPlace.cat}
                  </span>
                  {selectedPlace.tiktokViral && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#FF0050] text-white">
                      🔥 VIRAL TIKTOK
                    </span>
                  )}
                  {selectedPlace.isHalal && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-xs">
                      <span>🕌</span>
                      <span>{selectedPlace.halalStatus || "100% Halal"}</span>
                    </span>
                  )}
                </div>
                <h3 className="font-sans font-black text-2xl sm:text-3xl leading-tight">
                  {selectedPlace.n}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex-1 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-400 flex-wrap">
                <span className="font-black text-amber-400">
                  ★ {selectedPlace.r.toFixed(1)} ({selectedPlace.c.toLocaleString("fr-FR")} avis Google)
                </span>
                <span>·</span>
                <span className="text-amber-200">{"€".repeat(selectedPlace.pr)}</span>
                <span>·</span>
                <span>{selectedPlace.sub}</span>
                <span>·</span>
                {(() => {
                  const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, selectedPlace.la, selectedPlace.lo);
                  const walkMin = Math.max(1, Math.round(dist / 0.08));
                  return (
                    <div className="inline-flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-amber-300">
                        {formatDistance(dist)} de toi
                      </span>
                      <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.2 rounded-full inline-flex items-center gap-1 shadow-xs">
                        🚶 ~{walkMin} min à pied
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Le Banger à commander absolument */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#161622] to-amber-500/10 border border-amber-500/40 flex items-center gap-3 shadow-md">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center text-xl shrink-0 font-black shadow-md shadow-amber-500/30">
                  🔥
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                    Le Banger à commander absolument :
                  </span>
                  <span className="text-sm font-black text-white block leading-snug">
                    {getSignatureBanger(selectedPlace)}
                  </span>
                </div>
              </div>

              {/* Transit Station (RATP / Transilien / Métro) */}
              {(() => {
                const transit = getNearestTransit(selectedPlace.la, selectedPlace.lo);
                if (!transit) return null;
                return (
                  <div className="p-3 rounded-2xl bg-[#12121A] border border-cyan-500/30 flex items-center gap-2.5 text-xs shadow-xs">
                    <span className="text-base shrink-0">🚇</span>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block">
                        Accès Transports en commun (RATP / Île-de-France Mobilités) :
                      </span>
                      <span className="text-white font-bold block mt-0.5">
                        {transit.formatted}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              {/* Primary #1 Big Action: Real Google Maps Button with Exact Destination Itinerary */}
              <div className="flex flex-col gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedPlace.a)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl font-black text-sm text-zinc-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 shadow-lg shadow-amber-500/25 text-center cursor-pointer transition-all active:scale-[0.99]"
                  title="Y aller directement sur Google Maps (Itinéraire direct & adresse exacte)"
                >
                  <Navigation className="w-5 h-5 text-zinc-950 fill-current" />
                  <span>Y aller direct sur Google Maps (Itinéraire & Fiche)</span>
                </a>

                {/* Sub-action: Exact Place Card & Photos on Google Maps */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPlace.a)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs bg-[#161624] text-amber-300 border border-amber-500/30 hover:bg-amber-500/15 cursor-pointer transition-all text-center"
                    title="Voir l'adresse exacte et le bâtiment sur Google Maps"
                  >
                    <span>📍</span>
                    <span>Adresse exacte sur Maps</span>
                  </a>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPlace.n + " " + selectedPlace.z)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs bg-[#161624] text-zinc-200 border border-zinc-800 hover:border-amber-400 cursor-pointer transition-all text-center"
                    title="Avis et photos du restaurant sur Google Maps"
                  >
                    <span>⭐</span>
                    <span>Photos & Avis Maps</span>
                  </a>
                </div>

                {/* Secondary Action Buttons Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <a
                    href={`https://citymapper.com/directions?endcoord=${selectedPlace.la},${selectedPlace.lo}&endname=${encodeURIComponent(selectedPlace.n)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm bg-[#14141E] text-emerald-300 border border-emerald-500/30 hover:bg-emerald-950/40 hover:border-emerald-400 cursor-pointer transition-all"
                    title="Itinéraire RATP Métro direct sur Citymapper"
                  >
                    <Navigation className="w-4 h-4 text-emerald-400 rotate-45" />
                    <span>Citymapper</span>
                  </a>

                  <button
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(`${selectedPlace.n}, ${selectedPlace.a}`);
                      }
                      showToast("📋 Adresse copiée dans le presse-papier !");
                    }}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm bg-[#14141E] text-zinc-200 border border-zinc-800 hover:border-amber-400 cursor-pointer transition-all"
                    title="Copier le nom et l'adresse"
                  >
                    <Copy className="w-4 h-4 text-amber-400" />
                    <span>Copier Adresse</span>
                  </button>

                  <button
                    onClick={() => {
                      const shareText = `On mange là ? 🍽️ *${selectedPlace.n}* (★ ${selectedPlace.r.toFixed(1)})\n📍 ${selectedPlace.a}\n🗺️ Itinéraire Google Maps : https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedPlace.a)}`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
                    }}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 cursor-pointer transition-all"
                    title="Partager sur WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp</span>
                  </button>

                  {selectedPlace.tel ? (
                    <a
                      href={`tel:${selectedPlace.tel}`}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-[#14141E] border border-amber-500/25 hover:border-amber-400 cursor-pointer transition-all"
                    >
                      <Phone className="w-4 h-4 text-amber-400" />
                      <span>Appeler</span>
                    </a>
                  ) : (
                    <div className="flex items-center justify-center text-xs text-zinc-500 bg-[#12121A] border border-zinc-800 rounded-2xl">
                      Pas de numéro
                    </div>
                  )}

                  <button
                    onClick={() => handleToggleFavorite(selectedPlace.id)}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm cursor-pointer transition-all ${
                      favorites.includes(selectedPlace.id)
                        ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        : "bg-[#14141E] text-zinc-300 border border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(selectedPlace.id) ? "fill-current" : ""}`} />
                    <span>Favori</span>
                  </button>

                  <button
                    onClick={() => {
                      setPlaceToStar(selectedPlace);
                      setIsStarringListOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm bg-[#14141E] text-amber-300 border border-amber-500/35 hover:border-amber-400 hover:bg-amber-500/10 cursor-pointer transition-all"
                  >
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>Starring List</span>
                  </button>

                  <button
                    onClick={() => setIsBillSplitterOpen(true)}
                    className="col-span-2 sm:col-span-2 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 cursor-pointer transition-all"
                  >
                    <span>🧮 Split Addition</span>
                  </button>
                </div>
              </div>

              {/* Halal Verification Notice */}
              {selectedPlace.isHalal && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="flex-1">
                    <span className="font-black text-emerald-300 block mb-0.5">
                      Certification Halal ({selectedPlace.halalStatus || "100% Halal"})
                    </span>
                    <span className="text-emerald-400/90 font-medium">
                      {selectedPlace.halalNotice || "Toutes les viandes servies sont certifiées Halal, préparations sans porc ni alcool."}
                    </span>
                  </div>
                </div>
              )}

              {/* Address & Hours */}
              <div className="p-3.5 rounded-2xl bg-[#12121A] border border-amber-500/20 flex flex-col gap-2">
                <div className="text-xs sm:text-sm text-zinc-100 flex items-start gap-2">
                  <Compass className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">{selectedPlace.a}</span>
                    <span className="block text-xs text-zinc-400">
                      {getNearestLandmark(selectedPlace.la, selectedPlace.lo)} · Zone : {selectedPlace.z}
                    </span>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-zinc-100 flex items-start gap-2 pt-2 border-t border-zinc-800">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className={`font-bold ${isCurrentlyOpen(selectedPlace.h) ? "text-emerald-400" : "text-rose-400"}`}>
                      {isCurrentlyOpen(selectedPlace.h) ? "🟢 Ouvert actuellement" : "🔴 Fermé actuellement"}
                    </span>
                    <span className="block text-xs text-zinc-400">
                      Horaires : {selectedPlace.h}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                  <button
                    onClick={() => {
                      try {
                        navigator.clipboard.writeText(`${selectedPlace.n} - ${selectedPlace.a}`);
                      } catch {}
                      showToast(`📍 Adresse de "${selectedPlace.n}" copiée !`);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 hover:bg-amber-400/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier l'adresse</span>
                  </button>
                  {selectedPlace.tel && (
                    <a
                      href={`tel:${selectedPlace.tel}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Appeler</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Reviews Summary */}
              <div className="p-4 rounded-2xl bg-[#12121A] border border-amber-500/20">
                <h4 className="font-black text-xs uppercase tracking-wider text-amber-400/80 mb-1.5">
                  Ce que disent les avis Google Maps :
                </h4>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {selectedPlace.s}
                </p>
              </div>

              {/* Live Crowd & Metro Info */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-[#12121A] border border-amber-500/20 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <span className="text-zinc-300 text-[11px] sm:text-xs">
                    <strong className="text-white">~{Math.floor(12 + (selectedPlace.id % 23))} gourmets</strong> sur ce spot
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[#12121A] border border-cyan-500/25 flex items-center gap-2">
                  <span className="text-base shrink-0">🚇</span>
                  <span className="text-zinc-300 text-[11px] sm:text-xs truncate">
                    Accès : <strong className="text-cyan-300">Métro ≤ 350m</strong>
                  </span>
                </div>
              </div>

              {/* Delivery and Photos Direct Actions */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(selectedPlace.n + " livraison Paris Deliveroo UberEats")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-2xl text-center text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>🛵</span>
                  <span>Livraison & À emporter</span>
                </a>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPlace.a)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-2xl text-center text-xs font-bold text-zinc-300 bg-[#141420] border border-zinc-800 hover:border-amber-400 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>📷</span>
                  <span>Photos & Avis Maps</span>
                </a>
              </div>

              {/* Direct GPS App Links: Google Maps, Citymapper, Waze */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedPlace.n + ", " + selectedPlace.a)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-2 rounded-xl text-center text-[11px] font-bold text-white bg-[#1A1A24] border border-zinc-800 hover:border-amber-400 transition-colors flex items-center justify-center gap-1"
                >
                  <span>🗺️</span>
                  <span>Google Maps</span>
                </a>
                <a
                  href={`https://citymapper.com/directions?endcoord=${selectedPlace.la}%2C${selectedPlace.lo}&endname=${encodeURIComponent(selectedPlace.n)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-2 rounded-xl text-center text-[11px] font-bold text-emerald-300 bg-emerald-950/30 border border-emerald-500/30 hover:border-emerald-400 transition-colors flex items-center justify-center gap-1"
                >
                  <span>🚇</span>
                  <span>Citymapper</span>
                </a>
                <a
                  href={`https://waze.com/ul?ll=${selectedPlace.la},${selectedPlace.lo}&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-2 rounded-xl text-center text-[11px] font-bold text-cyan-300 bg-cyan-950/30 border border-cyan-500/30 hover:border-cyan-400 transition-colors flex items-center justify-center gap-1"
                >
                  <span>🚗</span>
                  <span>Waze</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social, Group Vote & Story Modal */}
      <SocialAndGroupVote
        isOpen={isGroupVoteOpen}
        onClose={() => setIsGroupVoteOpen(false)}
        places={allPlaces as any}
        customLists={customLists}
        onCreateList={(title, desc, emo, pIds) => {
          const newList: CustomList = {
            id: "list-" + Date.now(),
            title,
            description: desc,
            emoji: emo,
            isPublic: true,
            placeIds: pIds,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setCustomLists([newList, ...customLists]);
        }}
        storyPlace={storyPlace as any}
        onCloseStoryPlace={() => setStoryPlace(null)}
      />

      {/* Food Diary Modal */}
      <FoodDiaryModal
        isOpen={isDiaryOpen}
        onClose={() => setIsDiaryOpen(false)}
        diaryEntries={diaryEntries}
        places={allPlaces as any}
        onAddEntry={(entry) => {
          const newEntry: FoodDiaryEntry = { ...entry, id: "diary-" + Date.now() };
          setDiaryEntries([newEntry, ...diaryEntries]);
        }}
        onDeleteEntry={(id) => {
          setDiaryEntries(diaryEntries.filter((d) => d.id !== id));
        }}
      />

      {/* Gamification Badges Modal */}
      <GamificationModal
        isOpen={isGamificationOpen}
        onClose={() => setIsGamificationOpen(false)}
        gamification={gamification}
      />

      {/* Widget Simulator Modal */}
      <WidgetSimulatorModal
        isOpen={isWidgetOpen}
        onClose={() => setIsWidgetOpen(false)}
        closestPlace={allPlaces[0] as any}
        userLat={userLocation.lat}
        userLng={userLocation.lng}
        onSelectPlace={(p) => setSelectedPlace(p as any)}
      />

      {/* Anti-Hesitation Roulette Modal */}
      <GourmetRouletteModal
        isOpen={isRouletteOpen}
        onClose={() => setIsRouletteOpen(false)}
        places={allPlaces}
        userLat={userLocation.lat}
        userLng={userLocation.lng}
        onSelectPlace={(p) => {
          setIsRouletteOpen(false);
          setSelectedPlace(p);
        }}
      />

      {/* TikTok Box & Video Stories Modal */}
      <TikTokBoxModal
        deal={selectedTikTokDeal}
        allDeals={FOOD_DEALS}
        places={allPlaces as any}
        userLat={userLocation.lat}
        userLng={userLocation.lng}
        isFavorite={
          selectedTikTokDeal
            ? (selectedTikTokDeal.placeId ? favorites.includes(selectedTikTokDeal.placeId) : (selectedTikTokDeal.restaurantIds?.[0] ? favorites.includes(selectedTikTokDeal.restaurantIds[0]) : false))
            : false
        }
        onToggleFavorite={(id) => handleToggleFavorite(id)}
        onClose={() => setSelectedTikTokDeal(null)}
        onSelectDeal={(deal) => setSelectedTikTokDeal(deal)}
        onSelectPlace={(place) => {
          setSelectedTikTokDeal(null);
          setSelectedPlace(place as any);
        }}
      />

      {/* TikTok Box ≤ 10€ Custom Generator Modal */}
      <BoxGeneratorModal
        isOpen={isBoxGeneratorOpen}
        onClose={() => setIsBoxGeneratorOpen(false)}
        places={allPlaces as any}
        userLat={userLocation.lat}
        userLng={userLocation.lng}
        onSelectPlace={(place) => {
          setIsBoxGeneratorOpen(false);
          setSelectedPlace(place as any);
        }}
        onSelectTikTokDeal={(deal) => {
          setIsBoxGeneratorOpen(false);
          setSelectedTikTokDeal(deal);
        }}
      />

      {/* PWA Phone Install Modal */}
      <PWAInstallModal
        isOpen={isPWAInstallOpen}
        onClose={() => setIsPWAInstallOpen(false)}
      />

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Food Duel (Tinder Swipe Mode) */}
      <FoodDuelModal
        isOpen={isFoodDuelOpen}
        onClose={() => setIsFoodDuelOpen(false)}
        places={allPlaces}
        userLat={userLocation.lat}
        userLng={userLocation.lng}
        onSelectPlace={(place) => {
          setIsFoodDuelOpen(false);
          setSelectedPlace(place);
        }}
      />

      {/* Bill Splitter & Tip Calculator */}
      <BillSplitterModal
        isOpen={isBillSplitterOpen}
        onClose={() => setIsBillSplitterOpen(false)}
        restaurantName={selectedPlace?.n}
      />

      {/* Paris Metro & RER Station Filter Modal */}
      <MetroFilterModal
        isOpen={isMetroFilterOpen}
        onClose={() => setIsMetroFilterOpen(false)}
        selectedStation={selectedMetroStation}
        onSelectStation={(st) => setSelectedMetroStation(st)}
        places={allPlaces}
        onSelectPlace={(place) => {
          setIsMetroFilterOpen(false);
          setSelectedPlace(place);
        }}
      />

      {/* 3-Step Food Tour Planner */}
      <FoodTourPlannerModal
        isOpen={isFoodTourOpen}
        onClose={() => setIsFoodTourOpen(false)}
        places={allPlaces}
        userLat={userLocation.lat}
        userLng={userLocation.lng}
        onSelectPlace={(place) => {
          setIsFoodTourOpen(false);
          setSelectedPlace(place);
        }}
      />

      {/* 24K Luxury Slot Machine Jackpot */}
      <GoldenJackpotModal
        isOpen={isJackpotOpen}
        onClose={() => setIsJackpotOpen(false)}
        places={allPlaces}
        userLat={userLocation.lat}
        userLng={userLocation.lng}
        onSelectPlace={(place) => {
          setIsJackpotOpen(false);
          setSelectedPlace(place);
        }}
      />

      {/* SOS Faim Nocturne Radar (22h - 06h) */}
      <NightRadarModal
        isOpen={isNightRadarOpen}
        onClose={() => setIsNightRadarOpen(false)}
        places={allPlaces}
        userLat={userLocation.lat}
        userLng={userLocation.lng}
        onSelectPlace={(place) => {
          setIsNightRadarOpen(false);
          setSelectedPlace(place);
        }}
      />

      {/* Add Restaurant Modal (User-created missing spots with live GPS) */}
      <AddRestaurantModal
        isOpen={isAddRestaurantOpen}
        onClose={() => setIsAddRestaurantOpen(false)}
        onAddPlace={handleAddCustomPlace}
        userLat={userLocation.lat}
        userLng={userLocation.lng}
      />

      {/* Starring Lists 24K Modal (User Starred Selections & Sharing) */}
      <StarringListModal
        isOpen={isStarringListOpen}
        onClose={() => {
          setIsStarringListOpen(false);
          setPlaceToStar(null);
        }}
        customLists={customLists}
        onUpdateLists={(nextLists) => {
          setCustomLists(nextLists);
          try {
            localStorage.setItem("gm-custom-lists", JSON.stringify(nextLists));
          } catch {}
          fetch("/api/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customLists: nextLists }),
          }).catch(() => {});
        }}
        places={allPlaces}
        onSelectPlace={(p) => setSelectedPlace(p)}
        activePlaceToStar={placeToStar}
        onClosePlaceToStar={() => setPlaceToStar(null)}
        onFilterByList={(list) => {
          setActiveTab("feed");
          setFeedStep("res");
        }}
      />

      {/* 24K Gold Coin Flip Surprise Modal */}
      <CoinFlipSurpriseModal
        isOpen={isCoinFlipOpen}
        onClose={() => setIsCoinFlipOpen(false)}
        places={allPlaces}
        userLat={userLocation.lat}
        userLng={userLocation.lng}
        onSelectPlace={(p) => setSelectedPlace(p)}
      />

      {/* Midpoint Meetup Modal (Où se retrouver à mi-chemin) */}
      <MidpointMeetupModal
        isOpen={isMidpointOpen}
        onClose={() => setIsMidpointOpen(false)}
        places={allPlaces}
        userLat={userLocation.lat}
        userLng={userLocation.lng}
        onSelectPlace={(p) => setSelectedPlace(p)}
      />

      {/* Dietary & Allergies Filters Modal */}
      <DietaryFiltersModal
        isOpen={isDietaryOpen}
        onClose={() => setIsDietaryOpen(false)}
        filters={dietaryFilters}
        onUpdateFilters={(newFilters) => {
          setDietaryFilters(newFilters);
          setFeedStep("res");
        }}
        totalMatchingCount={currentResults.length}
      />

      {/* Mode Express 3 Clics : On mange où ? */}
      <ExpressLunchDecisionModal
        isOpen={isExpressLunchOpen}
        onClose={() => setIsExpressLunchOpen(false)}
        places={allPlaces}
        userLat={userLocation.lat}
        userLng={userLocation.lng}
        onSelectPlace={(p) => setSelectedPlace(p)}
      />

      {/* Radar Évolutif & Veille Collective */}
      <EvolvingIntelModal
        isOpen={isEvolvingIntelOpen}
        onClose={() => setIsEvolvingIntelOpen(false)}
        places={allPlaces}
        onSelectPlace={(p) => setSelectedPlace(p)}
        onPlaceAddedNotification={(msg) => showToast(msg)}
      />

      {/* Shake to Pick Modal (Secoue & Déguste) */}
      <ShakeToPickModal
        isOpen={isShakeToPickOpen}
        onClose={() => setIsShakeToPickOpen(false)}
        places={allPlaces}
        userLat={userLocation.lat}
        userLng={userLocation.lng}
        onSelectPlace={(p) => {
          setIsShakeToPickOpen(false);
          setSelectedPlace(p);
        }}
      />



      {/* Floating Gold Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#12121C]/95 border border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.35)] text-amber-200 text-xs sm:text-sm font-black px-5 py-2.5 rounded-full flex items-center gap-2.5 animate-fadeIn backdrop-blur-xl">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
