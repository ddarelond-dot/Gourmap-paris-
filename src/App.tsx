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
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem("gourmap-theme") === "dark";
  });

  // GPS User location (defaults to Saint-Denis / Paris center)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 48.924,
    lng: 2.348,
  });

  // Main navigation tab: Accueil (feed), Fast-Food (fastfood), Bons Plans (deals), Carte GPS (map), Favoris (favs)
  const [activeTab, setActiveTab] = useState<"feed" | "fastfood" | "map" | "deals" | "favs" | "group">("feed");
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(false);

  // Original 3-click browsing step in Feed: "home" | "sub" | "bud" | "res"
  const [feedStep, setFeedStep] = useState<"home" | "sub" | "bud" | "res">("home");
  const [selectedTaxIndex, setSelectedTaxIndex] = useState<number>(-1);
  const [selectedSubIndex, setSelectedSubIndex] = useState<number>(-1);
  const [selectedBudget, setSelectedBudget] = useState<number>(0);
  const [selectedZone, setSelectedZone] = useState<string>("Toutes");
  const [activeWishes, setActiveWishes] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [resultLimit, setResultLimit] = useState<number>(24);

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

  // Sync theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("gourmap-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("gourmap-theme", "light");
    }
  }, [isDark]);

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
        explanation: "Voici les meilleurs choix sélectionnés par l'IA GourMap.",
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

  // Calculate filtered results for step-by-step browsing with Anti-0 Result guarantee across 150,000+ spots
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

    // 1. Strict filter pass
    let strict = allPlaces.filter((p) => {
      if (q && !p.n.toLowerCase().includes(q) && !p.sub.toLowerCase().includes(q) && !p.s.toLowerCase().includes(q) && !p.a.toLowerCase().includes(q)) return false;
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
      if (selectedZone !== "Toutes" && !p.z.toLowerCase().includes(selectedZone.toLowerCase()) && p.z !== selectedZone) return false;
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

    // 2. Anti-0 Guarantee Fallback A: Keep category and wishes, but widen to all zones
    const widenedZone = allPlaces.filter((p) => {
      if (t && !t.m(p)) return false;
      if (sp && !sp(p)) return false;
      if (selectedBudget > 0) {
        if (selectedBudget === 3 && p.pr < 3) return false;
        if (selectedBudget < 3 && p.pr !== selectedBudget) return false;
      }
      if (isHalalUserWant && !p.isHalal) return false;
      if (activeWishes.some((w) => !WISHES[w](p))) return false;
      return true;
    });

    if (widenedZone.length > 0) {
      return { results: sortPlaces(widenedZone), isRelaxed: true };
    }

    // 3. Anti-0 Guarantee Fallback B: Keep zone and category, relax wishes (strictly keep Halal if requested!)
    const relaxedWishes = allPlaces.filter((p) => {
      if (t && !t.m(p)) return false;
      if (sp && !sp(p)) return false;
      if (isHalalUserWant && !p.isHalal) return false;
      if (selectedZone !== "Toutes" && !p.z.toLowerCase().includes(selectedZone.toLowerCase()) && p.z !== selectedZone) return false;
      return true;
    });

    if (relaxedWishes.length > 0) {
      return { results: sortPlaces(relaxedWishes), isRelaxed: true };
    }

    // 4. Anti-0 Guarantee Fallback C: If Halal was wanted, return top Halal spots in Paris!
    if (isHalalUserWant) {
      const halalGems = allPlaces.filter((p) => p.isHalal);
      return { results: sortPlaces(halalGems).slice(0, 35), isRelaxed: true };
    }

    // 5. Ultimate fallback: Top rated places nearest to user (never 0!)
    return { results: sortPlaces(allPlaces.filter((p) => p.r >= 4.5)).slice(0, 35), isRelaxed: true };
  }, [allPlaces, aiMatchedIds, activeTab, favorites, selectedTaxIndex, selectedSubIndex, selectedBudget, selectedZone, distanceRadiusKm, activeWishes, userLocation, selectedMetroStation, instantSearchQuery, maxBudgetEur, sortMode, openNowOnly, dietaryFilters]);

  // Zone list across all 150,000+ spots
  const allZones = useMemo(() => ["Toutes", ...Array.from(new Set(allPlaces.map((p) => p.z))).sort()], [allPlaces]);

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
          : "bg-[#F8FAFC] dark:bg-[#090D16]"
      } text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-amber-400/20`}
    >
      <div
        className={`w-full ${
          isPhoneFrame
            ? "max-w-[420px] h-[92vh] max-h-[890px] rounded-[52px] shadow-2xl border-[10px] border-slate-800 dark:border-slate-850 bg-[#F8FAFC] dark:bg-[#090D16] overflow-hidden flex flex-col relative"
            : "min-h-screen flex flex-col pb-24"
        }`}
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
            isDark={isDark}
            onToggleTheme={() => setIsDark(!isDark)}
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

      {/* Proactive Contextual Notification Banner */}
      <ProactiveNotificationBanner
        places={allPlaces as any}
        onSelectPlace={(place) => setSelectedPlace(place as any)}
      />

      {/* AI Conversational Search Bar */}
      <AISearchBar
        onSearch={handleAISearch}
        isLoading={isAiLoading}
        aiResponse={aiResponse}
        onClearAI={handleClearAI}
      />

      {/* MAIN CONTAINER */}
      <main className="flex-1 w-full max-w-5xl mx-auto pb-28 sm:pb-32">
        {/* ================= TAB 1: FEED ================= */}
        {activeTab === "feed" && (
          <div className="flex flex-col gap-4">
            {/* Breadcrumb Navigation when exploring deeper */}
            {feedStep !== "home" && (
              <div className="px-4 pt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-bold">
                <button
                  onClick={() => {
                    setFeedStep("home");
                    setSelectedTaxIndex(-1);
                    setSelectedSubIndex(-1);
                    setSelectedBudget(0);
                    handleClearAI();
                  }}
                  className="px-3 py-1.5 rounded-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#10B981]"
                >
                  🏠 Accueil
                </button>

                {selectedTaxIndex >= 0 && (
                  <button
                    onClick={() => setFeedStep("sub")}
                    className="px-3 py-1.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold"
                  >
                    {TAXONOMY[selectedTaxIndex].e} {TAXONOMY[selectedTaxIndex].k}
                  </button>
                )}

                {selectedTaxIndex >= 0 && selectedSubIndex >= 0 && (
                  <button
                    onClick={() => setFeedStep("bud")}
                    className="px-3 py-1.5 rounded-full bg-[#10B981] text-slate-950 font-black shadow-sm"
                  >
                    {TAXONOMY[selectedTaxIndex].subs[selectedSubIndex][0]}
                  </button>
                )}

                {selectedBudget > 0 && (
                  <span className="px-3 py-1.5 rounded-full bg-[#06B6D4] text-slate-950 font-black">
                    {"€".repeat(selectedBudget)}
                  </span>
                )}
              </div>
            )}

            {/* Active Metro Station Filter Alert Banner */}
            {selectedMetroStation && (
              <div className="mx-4 p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base">🚇</span>
                  <span>
                    Filtre actif : <strong className="text-cyan-300">{selectedMetroStation.name}</strong> (spots à ≤ 800m à pied)
                  </span>
                </div>
                <button
                  onClick={() => setSelectedMetroStation(null)}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-bold cursor-pointer transition-colors"
                >
                  ✕ Effacer
                </button>
              </div>
            )}

            {/* STEP 1: HOME FEED */}
            {feedStep === "home" && (
              <div className="flex flex-col gap-6">
                {/* 24K Gold & Obsidian Hero Header */}
                <div className="px-4 pt-2">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Édition Noire & Or 24K · 100% Pépites Vérifiées (Paris & IDF)
                    </span>
                    {customPlaces.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        👑 {customPlaces.length} pépite{customPlaces.length > 1 ? "s" : ""} perso ajoutée{customPlaces.length > 1 ? "s" : ""}
                      </span>
                    )}
                    {customLists.length > 0 && (
                      <button
                        onClick={() => setIsStarringListOpen(true)}
                        className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/35 hover:bg-amber-400/30 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        ⭐ {customLists.length} Starring Lists
                      </button>
                    )}
                    <button
                      onClick={() => setIsEvolvingIntelOpen(true)}
                      className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/25 to-cyan-500/20 text-emerald-300 border border-emerald-400/40 hover:bg-emerald-500/30 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>🧠 Radar Évolutif (Live)</span>
                    </button>
                  </div>
                  <h1 className="font-sans font-black text-2xl sm:text-4xl leading-tight text-white tracking-tight">
                    Toutes les vraies pépites d'Île-de-France. <span className="text-gold-gradient font-black">Zéro déchet.</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-amber-200/70 mt-1 max-w-2xl">
                    Sélection exigeante des meilleures adresses testées à Paris et dans toute l'Île-de-France (75, 77, 78, 91, 92, 93, 94, 95) : uniquement des lieux vivants et réputés, spots viraux, box ≤ 10 €, adresses 100% Halal certifiées et bouillons authentiques.
                  </p>
                </div>

                {/* Barre Ultra-Pratique d'Action Rapide (Distance & Proximité) */}
                <div className="px-4">
                  <div className="bg-[#101018] border border-amber-500/25 rounded-2xl p-2.5 flex flex-col gap-2 shadow-lg">
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                      <span className="flex items-center gap-1.5 text-amber-300">
                        <span>⚡</span>
                        <span>Accès Rapide Foodie :</span>
                      </span>
                      <span className="text-zinc-500">
                        {distanceRadiusKm ? `Filtre actif : < ${distanceRadiusKm} km` : "Toute l'Île-de-France"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      <button
                        onClick={() => {
                          setDistanceRadiusKm(distanceRadiusKm === 1.2 ? null : 1.2);
                          setFeedStep("res");
                          showToast(distanceRadiusKm === 1.2 ? "Filtre distance retiré" : "📍 Restos à moins de 15 min à pied (< 1.2 km)");
                        }}
                        className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
                          distanceRadiusKm === 1.2
                            ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20"
                            : "bg-[#161622] text-zinc-300 border border-zinc-800 hover:border-amber-400/40"
                        }`}
                      >
                        <span>🚶</span>
                        <span>&lt; 15 min à pied</span>
                      </button>

                      <button
                        onClick={() => {
                          setDistanceRadiusKm(distanceRadiusKm === 3.0 ? null : 3.0);
                          setFeedStep("res");
                          showToast(distanceRadiusKm === 3.0 ? "Filtre distance retiré" : "🚲 Restos à moins de 3 km");
                        }}
                        className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
                          distanceRadiusKm === 3.0
                            ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20"
                            : "bg-[#161622] text-zinc-300 border border-zinc-800 hover:border-amber-400/40"
                        }`}
                      >
                        <span>🚲</span>
                        <span>&lt; 3 km quartier</span>
                      </button>

                      <button
                        onClick={() => {
                          setOpenNowOnly(!openNowOnly);
                          setFeedStep("res");
                          showToast(!openNowOnly ? "🟢 Affichage des adresses ouvertes en ce moment" : "Filtre horaires retiré");
                        }}
                        className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
                          openNowOnly
                            ? "bg-emerald-400 text-slate-950 font-black shadow-md shadow-emerald-500/20"
                            : "bg-[#161622] text-emerald-300 border border-emerald-500/30 hover:border-emerald-400"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${openNowOnly ? "bg-slate-950" : "bg-emerald-400 animate-pulse"}`} />
                        <span>Ouvert direct</span>
                      </button>

                      <button
                        onClick={() => {
                          setSortMode(sortMode === "rating" ? "smart" : "rating");
                          setFeedStep("res");
                          showToast(sortMode === "rating" ? "Tri réinitialisé" : "⭐ Tri par les mieux notés (4.8+)");
                        }}
                        className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
                          sortMode === "rating"
                            ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20"
                            : "bg-[#161622] text-zinc-300 border border-zinc-800 hover:border-amber-400/40"
                        }`}
                      >
                        <span>⭐</span>
                        <span>Top Notés (4.8+)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Instant Live Search & Budget Filter Toolbar */}
                <div className="px-4 flex flex-col gap-2.5">
                  <div className="relative">
                    <input
                      type="text"
                      value={instantSearchQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInstantSearchQuery(val);
                        if (val.trim().length > 0) {
                          setSelectedTaxIndex(-1);
                          setSelectedSubIndex(-1);
                          setFeedStep("res");
                        }
                      }}
                      placeholder="🔍 Chercher Buffalo Grill, Five Guys, tacos, smash burger, 93200..."
                      className="w-full py-3 pl-10 pr-10 rounded-2xl bg-[#141420] border border-amber-500/30 text-white text-xs sm:text-sm placeholder:text-zinc-500 outline-none focus:border-amber-400 focus:shadow-[0_0_20px_rgba(245,158,11,0.18)] transition-all"
                    />
                    <div className="absolute left-3.5 top-3.5 text-amber-400">
                      <Search className="w-4 h-4" />
                    </div>
                    {instantSearchQuery && (
                      <button
                        onClick={() => setInstantSearchQuery("")}
                        className="absolute right-3.5 top-3 text-zinc-400 hover:text-white text-xs font-bold p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Catégories Rapides en 1-Clic (Style Uber Eats) */}
                  <UberEatsStyleCategories
                    onSelectCategory={(query) => {
                      setInstantSearchQuery(query);
                      setSelectedTaxIndex(-1);
                      setSelectedSubIndex(-1);
                      setSelectedBudget(0);
                      setFeedStep("res");
                    }}
                    allPlaces={allPlaces}
                    selectedTaxIndex={selectedTaxIndex}
                  />

                  {/* Instant 1-Tap Filter Chips Bar */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    <button
                      onClick={() => setOpenNowOnly(!openNowOnly)}
                      className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        openNowOnly
                          ? "bg-emerald-400 text-slate-950 font-black shadow-sm"
                          : "bg-[#141420] text-zinc-300 border border-emerald-500/30 hover:border-emerald-400"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${openNowOnly ? "bg-slate-950" : "bg-emerald-400 animate-pulse"}`} />
                      <span>Ouvert direct</span>
                    </button>

                    <button
                      onClick={() => setDietaryFilters((prev) => ({ ...prev, halalStrict: !prev.halalStrict }))}
                      className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        dietaryFilters.halalStrict
                          ? "bg-emerald-400 text-slate-950 font-black shadow-sm"
                          : "bg-[#141420] text-zinc-300 border border-emerald-500/30 hover:border-emerald-400"
                      }`}
                    >
                      <span>🕌</span>
                      <span>100% Halal</span>
                    </button>

                    <button
                      onClick={() => setMaxBudgetEur(maxBudgetEur === 10 ? null : 10)}
                      className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        maxBudgetEur === 10
                          ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                          : "bg-[#141420] text-zinc-300 border border-amber-500/20 hover:border-amber-400"
                      }`}
                    >
                      <span>💸</span>
                      <span>≤ 10 €</span>
                    </button>

                    <button
                      onClick={() => setDietaryFilters((prev) => ({ ...prev, terrace: !prev.terrace }))}
                      className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        dietaryFilters.terrace
                          ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                          : "bg-[#141420] text-zinc-300 border border-amber-500/20 hover:border-amber-400"
                      }`}
                    >
                      <span>☀️</span>
                      <span>Terrasse</span>
                    </button>

                    <button
                      onClick={() => setDietaryFilters((prev) => ({ ...prev, topRatedOnly: !prev.topRatedOnly }))}
                      className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        dietaryFilters.topRatedOnly
                          ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                          : "bg-[#141420] text-zinc-300 border border-amber-500/20 hover:border-amber-400"
                      }`}
                    >
                      <span>⭐</span>
                      <span>Top Noté 4.8+</span>
                    </button>

                    {(openNowOnly || dietaryFilters.halalStrict || maxBudgetEur !== null || dietaryFilters.terrace || dietaryFilters.topRatedOnly) && (
                      <button
                        onClick={() => {
                          setOpenNowOnly(false);
                          setMaxBudgetEur(null);
                          setDietaryFilters({
                            halalStrict: false,
                            vegetarian: false,
                            terrace: false,
                            lateNight: false,
                            budgetUnder10: false,
                            fastService: false,
                            tiktokViral: false,
                            topRatedOnly: false,
                          });
                        }}
                        className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold text-rose-400 hover:text-white bg-rose-500/10 border border-rose-500/25 transition-all cursor-pointer"
                      >
                        ✕ Réinitialiser
                      </button>
                    )}
                  </div>

                  {/* Quick Budget Filters */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/80 shrink-0">
                      Budget max :
                    </span>
                    {[
                      { label: "Tous", val: null },
                      { label: "≤ 10 € 💸", val: 10 },
                      { label: "≤ 15 € 🍔", val: 15 },
                      { label: "≤ 25 € 🍷", val: 25 },
                    ].map((b) => (
                      <button
                        key={b.label}
                        onClick={() => {
                          setMaxBudgetEur(b.val);
                          if (b.val !== null) setFeedStep("res");
                        }}
                        className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          maxBudgetEur === b.val
                            ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                            : "bg-[#141420] text-zinc-400 border border-white/5 hover:border-amber-400/40 hover:text-white"
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>

                  {/* Quick Food Inspiration Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/80 shrink-0">
                      Envie de :
                    </span>
                    {[
                      { label: "🍔 Smash", q: "smash" },
                      { label: "🫓 Cheese Naan", q: "naan" },
                      { label: "🍗 Poulet Frit", q: "poulet" },
                      { label: "🌮 Tacos / Birria", q: "tacos" },
                      { label: "🍜 Ramen", q: "ramen" },
                      { label: "🍕 Pizza Napolitaine", q: "pizza" },
                      { label: "🥞 Brunch", q: "brunch" },
                      { label: "🥐 Cookies XXL", q: "cookie" },
                      { label: "🥙 Kebab Berlinois", q: "kebab" },
                      { label: "🥘 Couscous", q: "couscous" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          setInstantSearchQuery(item.q);
                          setFeedStep("res");
                        }}
                        className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          instantSearchQuery.toLowerCase() === item.q.toLowerCase()
                            ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                            : "bg-[#141420] text-zinc-300 border border-amber-500/20 hover:border-amber-400/50 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode Express 3 Clics : On mange où ? */}
                <div className="px-4">
                  <div
                    onClick={() => setIsExpressLunchOpen(true)}
                    className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-amber-500/20 via-[#141424] to-cyan-500/15 border border-amber-500/35 hover:border-amber-400 transition-all flex items-center justify-between gap-3 shadow-lg shadow-amber-500/10 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform shrink-0">
                        ⚡
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/15 px-2 py-0.2 rounded-full border border-amber-400/30">
                            Express 3 Clics
                          </span>
                          <span className="text-[11px] font-bold text-zinc-400">On mange où ce midi / ce soir ?</span>
                        </div>
                        <h3 className="font-sans font-black text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors truncate mt-0.5">
                          Décide pour moi sans hésiter → <span className="text-amber-300 font-bold">3 pépites parfaites</span>
                        </h3>
                      </div>
                    </div>
                    <span className="shrink-0 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs group-hover:brightness-110 shadow-md transition-all">
                      Choisir ⚡
                    </span>
                  </div>
                </div>

                {/* Direct Tools Access Bar (No horizontal scroll needed: 100% visible immediately) */}
                <div className="px-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <span>⚡</span>
                      <span>Outils Gourmands en 1-Clic</span>
                    </span>
                    <button
                      onClick={() => setIsToolsMenuOpen(true)}
                      className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Tous les outils (8+) →</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* 1. All Tools Drawer */}
                    <button
                      onClick={() => setIsToolsMenuOpen(true)}
                      className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 via-[#141420] to-[#141420] border border-amber-400/40 hover:border-amber-300 transition-all flex items-center gap-2.5 text-left group cursor-pointer shadow-md"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-base shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                        ⚡
                      </div>
                      <div className="min-w-0">
                        <strong className="text-xs font-black text-white group-hover:text-amber-300 block truncate">
                          Boîte à Outils
                        </strong>
                        <span className="text-[10px] text-amber-200/70 block truncate">
                          Tous les 8+ modules
                        </span>
                      </div>
                    </button>

                    {/* 2. Midpoint Meetup */}
                    <button
                      onClick={() => setIsMidpointOpen(true)}
                      className="p-3 rounded-2xl bg-[#12121A] border border-cyan-500/35 hover:border-cyan-400 transition-all flex items-center gap-2.5 text-left group cursor-pointer shadow-sm"
                    >
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-black text-base shrink-0 group-hover:scale-105 transition-transform border border-cyan-500/30">
                        🤝
                      </div>
                      <div className="min-w-0">
                        <strong className="text-xs font-black text-cyan-300 group-hover:text-cyan-200 block truncate">
                          À Mi-Chemin
                        </strong>
                        <span className="text-[10px] text-zinc-400 block truncate">
                          RDV équidistant potes
                        </span>
                      </div>
                    </button>

                    {/* 3. Dietary & Halal */}
                    <button
                      onClick={() => setIsDietaryOpen(true)}
                      className="p-3 rounded-2xl bg-[#12121A] border border-emerald-500/35 hover:border-emerald-400 transition-all flex items-center gap-2.5 text-left group cursor-pointer shadow-sm"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black text-base shrink-0 group-hover:scale-105 transition-transform border border-emerald-500/30">
                        🛡️
                      </div>
                      <div className="min-w-0">
                        <strong className="text-xs font-black text-emerald-300 group-hover:text-emerald-200 block truncate">
                          Filtres & Halal
                        </strong>
                        <span className="text-[10px] text-zinc-400 block truncate">
                          Certifié, Végé, Terrasse
                        </span>
                      </div>
                    </button>

                    {/* 4. Golden Jackpot */}
                    <button
                      onClick={() => setIsJackpotOpen(true)}
                      className="p-3 rounded-2xl bg-[#12121A] border border-yellow-500/35 hover:border-yellow-400 transition-all flex items-center gap-2.5 text-left group cursor-pointer shadow-sm"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center font-black text-base shrink-0 group-hover:scale-105 group-hover:rotate-6 transition-all shadow-sm">
                        🎰
                      </div>
                      <div className="min-w-0">
                        <strong className="text-xs font-black text-yellow-300 group-hover:text-yellow-200 block truncate">
                          Jackpot 24K
                        </strong>
                        <span className="text-[10px] text-zinc-400 block truncate">
                          Machine à sous surprise
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Live Weekly Spotlight & Continuous Time-Based Evolution Banner */}
                <WeeklyEvolutionBanner
                  onSearchTopic={(query) => {
                    setInstantSearchQuery(query);
                    setFeedStep("res");
                  }}
                />

                {/* Direct Jump Banners to Dedicated Hubs (Fast-Food & Boxs) */}
                <div className="px-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setActiveTab("fastfood")}
                    className="p-3.5 rounded-3xl bg-gradient-to-r from-amber-500/20 via-[#141424] to-[#12121A] border border-amber-500/35 hover:border-amber-400 transition-all flex items-center justify-between gap-3 shadow-md cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-black text-2xl group-hover:scale-105 transition-transform shrink-0 border border-amber-400/30">
                        🍔
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/15 px-1.5 py-0.2 rounded-md">
                            QG Dédié
                          </span>
                          <span className="text-[10px] text-zinc-400">Grands connus & pépites</span>
                        </div>
                        <h4 className="font-sans font-black text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                          Le QG Fast-Food & "Trucs du Moment" →
                        </h4>
                      </div>
                    </div>
                    <span className="text-xs font-black text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0">
                      Ouvrir →
                    </span>
                  </div>

                  <div
                    onClick={() => setActiveTab("deals")}
                    className="p-3.5 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-[#141424] to-[#12121A] border border-emerald-500/35 hover:border-emerald-400 transition-all flex items-center justify-between gap-3 shadow-md cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black text-2xl group-hover:scale-105 transition-transform shrink-0 border border-emerald-500/30">
                        📦
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/15 px-1.5 py-0.2 rounded-md">
                            Bons Plans
                          </span>
                          <span className="text-[10px] text-zinc-400">TikTok Reels & Hacks</span>
                        </div>
                        <h4 className="font-sans font-black text-sm text-white group-hover:text-emerald-300 transition-colors truncate">
                          Les Boxs & Menus ≤ 10 € →
                        </h4>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0">
                      Voir tout →
                    </span>
                  </div>
                </div>

                {/* Instant Paris Arrondissements & Suburbs Navigator */}
                <ArrondissementQuickBar
                  selectedZone={selectedZone}
                  onSelectZone={(zone) => {
                    setSelectedZone(zone);
                    if (zone !== "Toutes") {
                      setFeedStep("res");
                    }
                  }}
                  placesCount={currentResults.length}
                />

                {/* Viandes, Smash Burgers & Grillades d'Exception */}
                <div className="flex flex-col gap-2">
                  <div className="px-4 flex items-center justify-between">
                    <div>
                      <h2 className="font-sans font-black text-xl text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>🥩 Viandes, Smash & Grillades</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                          Pépites croustillantes & braisées
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Smash burgers coulants, poulet frit doré, viandes maturées & brochettes naan
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTaxIndex(1);
                        setSelectedSubIndex(-1);
                        setSelectedBudget(0);
                        setFeedStep("sub");
                      }}
                      className="text-xs font-bold text-amber-400 hover:underline shrink-0"
                    >
                      Tout voir →
                    </button>
                  </div>
                  <div className="flex items-center gap-3 px-4 overflow-x-auto no-scrollbar pb-2">
                    {allPlaces
                      .filter((p) => TAXONOMY[1].m(p) && (p.r >= 4.6 || p.tiktokViral))
                      .slice(0, 10)
                      .map((place) => (
                        <button
                          key={place.id}
                          onClick={() => setSelectedPlace(place)}
                          className="shrink-0 w-36 text-left bg-white dark:bg-[#0F172A] rounded-2xl p-2.5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-400/50 hover:shadow-md transition-all cursor-pointer"
                        >
                          <div
                            className="w-full h-24 rounded-xl flex items-center justify-center relative overflow-hidden"
                            style={{ background: artStyle(place) }}
                          >
                            <svg
                              className="w-14 h-14"
                              viewBox="0 0 100 100"
                              dangerouslySetInnerHTML={{ __html: FA_ICONS[foodKey(place)] }}
                            />
                            <span className="absolute left-1.5 bottom-1.5 px-1.5 py-0.5 rounded-lg bg-black/80 backdrop-blur-xs text-white font-black text-[10px] shadow-xs">
                              ★ {place.r.toFixed(1)}
                            </span>
                            {place.isHalal && (
                              <span className="absolute right-1.5 top-1.5 px-1.5 py-0.5 rounded-md bg-emerald-500/90 text-slate-950 font-black text-[9px]">
                                🕌 Halal
                              </span>
                            )}
                          </div>
                          <span className="font-black text-xs text-slate-900 dark:text-white block truncate mt-2">
                            {place.n}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                            {place.sub} · {place.z}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Tendances autour de toi */}
                <div className="flex flex-col gap-2">
                  <div className="px-4 flex items-center justify-between">
                    <h2 className="font-sans font-black text-xl text-slate-900 dark:text-white">
                      🔥 Tendances autour de toi
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 px-4 overflow-x-auto no-scrollbar pb-2">
                    {hotPlaces.map((place) => (
                      <button
                        key={place.id}
                        onClick={() => setSelectedPlace(place)}
                        className="shrink-0 w-36 text-left bg-white dark:bg-[#0F172A] rounded-2xl p-2.5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#10B981]/50 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div
                          className="w-full h-24 rounded-xl flex items-center justify-center relative overflow-hidden"
                          style={{ background: artStyle(place) }}
                        >
                          <svg
                            className="w-14 h-14"
                            viewBox="0 0 100 100"
                            dangerouslySetInnerHTML={{ __html: FA_ICONS[foodKey(place)] }}
                          />
                          <span className="absolute left-1.5 bottom-1.5 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-xs text-white font-black text-[11px] shadow-xs">
                            ★ {place.r.toFixed(1)}
                          </span>
                        </div>
                        <span className="font-black text-xs text-slate-900 dark:text-white block truncate mt-2">
                          {place.n}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                          {place.sub} · {"€".repeat(place.pr)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pépites Halal de la Capitale & 93 */}
                <div className="flex flex-col gap-2">
                  <div className="px-4 flex items-center justify-between">
                    <div>
                      <h2 className="font-sans font-black text-xl text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>🕌 Pépites Halal de Paris & 93</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#10B981] text-slate-950">
                          1 200+ adresses
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Poulet frit croustillant, smash burgers, naans & grillades certifiés
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 overflow-x-auto no-scrollbar pb-2">
                    {allPlaces.filter((p) => p.isHalal && (p.r >= 4.7 || p.tiktokViral)).slice(0, 10).map((place) => (
                      <button
                        key={place.id}
                        onClick={() => setSelectedPlace(place)}
                        className="shrink-0 w-36 text-left bg-white dark:bg-[#0F172A] rounded-2xl p-2.5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#10B981]/50 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div
                          className="w-full h-24 rounded-xl flex items-center justify-center relative overflow-hidden"
                          style={{ background: artStyle(place) }}
                        >
                          <svg
                            className="w-14 h-14"
                            viewBox="0 0 100 100"
                            dangerouslySetInnerHTML={{ __html: FA_ICONS[foodKey(place)] }}
                          />
                          <span className="absolute left-1.5 bottom-1.5 px-1.5 py-0.5 rounded-lg bg-[#10B981] text-slate-950 font-black text-[10px] shadow-xs flex items-center gap-0.5">
                            ★ {place.r.toFixed(1)}
                          </span>
                          <span className="absolute right-1.5 top-1.5 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white font-black text-[9px]">
                            🕌 Halal
                          </span>
                        </div>
                        <span className="font-black text-xs text-slate-900 dark:text-white block truncate mt-2">
                          {place.n}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                          {place.sub} · {place.z}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Marchés Parisiens & Halles Couvertes */}
                <div className="flex flex-col gap-2">
                  <div className="px-4 flex items-center justify-between">
                    <div>
                      <h2 className="font-sans font-black text-xl text-slate-900 dark:text-white">
                        🏛️ Marchés Parisiens & Halles Cultes
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Enfants Rouges, Aligre, Batignolles, Belleville, Saint-Denis...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 overflow-x-auto no-scrollbar pb-2">
                    {allPlaces.filter((p) => p.cat === "Marché" || /marché|halle|food court/i.test((p.n || "") + " " + (p.sub || ""))).slice(0, 8).map((place) => (
                      <button
                        key={place.id}
                        onClick={() => setSelectedPlace(place)}
                        className="shrink-0 w-36 text-left bg-[#12121A] rounded-2xl p-2.5 border border-amber-500/25 shadow-sm hover:border-amber-400 hover:shadow-md hover:shadow-amber-500/10 transition-all cursor-pointer"
                      >
                        <div
                          className="w-full h-24 rounded-xl flex items-center justify-center relative overflow-hidden"
                          style={{ background: artStyle(place) }}
                        >
                          <svg
                            className="w-14 h-14"
                            viewBox="0 0 100 100"
                            dangerouslySetInnerHTML={{ __html: FA_ICONS[foodKey(place)] }}
                          />
                          <span className="absolute left-1.5 bottom-1.5 px-1.5 py-0.5 rounded-lg bg-black/85 backdrop-blur-xs text-amber-300 border border-amber-500/30 font-black text-[10px] shadow-xs">
                            ★ {place.r.toFixed(1)}
                          </span>
                        </div>
                        <span className="font-black text-xs text-white block truncate mt-2">
                          {place.n}
                        </span>
                        <span className="text-[11px] text-zinc-400 block truncate">
                          {place.sub} · {place.z}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tea Time, Goûter & Pâtisseries d'Exception */}
                <div className="flex flex-col gap-2">
                  <div className="px-4 flex items-center justify-between">
                    <div>
                      <h2 className="font-sans font-black text-xl text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>🫖 Tea Time, Goûter & Pâtisseries</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-500/20 text-pink-300 border border-pink-500/30">
                          Douceurs & Salons
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Salons de thé intimistes, coffee shops de spécialité, brunchs & cookies XXL
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTaxIndex(3);
                        setSelectedSubIndex(-1);
                        setSelectedBudget(0);
                        setFeedStep("sub");
                      }}
                      className="text-xs font-bold text-pink-400 hover:underline shrink-0"
                    >
                      Tout voir →
                    </button>
                  </div>
                  <div className="flex items-center gap-3 px-4 overflow-x-auto no-scrollbar pb-2">
                    {allPlaces.filter((p) => p.cat === "Goûter" || /brunch|pâtisserie|boulangerie/i.test(p.sub)).slice(0, 8).map((place) => (
                      <button
                        key={place.id}
                        onClick={() => setSelectedPlace(place)}
                        className="shrink-0 w-36 text-left bg-[#12121A] rounded-2xl p-2.5 border border-amber-500/25 shadow-sm hover:border-amber-400 hover:shadow-md hover:shadow-amber-500/10 transition-all cursor-pointer"
                      >
                        <div
                          className="w-full h-24 rounded-xl flex items-center justify-center relative overflow-hidden"
                          style={{ background: artStyle(place) }}
                        >
                          <svg
                            className="w-14 h-14"
                            viewBox="0 0 100 100"
                            dangerouslySetInnerHTML={{ __html: FA_ICONS[foodKey(place)] }}
                          />
                          <span className="absolute left-1.5 bottom-1.5 px-1.5 py-0.5 rounded-lg bg-black/85 backdrop-blur-xs text-amber-300 border border-amber-500/30 font-black text-[10px] shadow-xs">
                            ★ {place.r.toFixed(1)}
                          </span>
                        </div>
                        <span className="font-black text-xs text-white block truncate mt-2">
                          {place.n}
                        </span>
                        <span className="text-[11px] text-zinc-400 block truncate">
                          {place.sub} · {place.z}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 12 Categories Grid ("Toutes les cuisines") */}
                <div className="px-4 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-sans font-black text-xl text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>🍽️ Toutes les grandes cuisines</span>
                    </h2>
                    <span className="text-xs text-amber-300 font-bold">12 univers</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {TAXONOMY.map((tax, idx) => (
                      <button
                        key={tax.k}
                        onClick={() => {
                          setSelectedTaxIndex(idx);
                          setSelectedSubIndex(-1);
                          setSelectedBudget(0);
                          setFeedStep("sub");
                        }}
                        className="group relative h-28 rounded-3xl p-3.5 text-white text-left flex flex-col justify-end overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-97 cursor-pointer"
                        style={{
                          background: `linear-gradient(135deg, ${tax.c[0]}, ${tax.c[1]})`,
                        }}
                      >
                        <span className="absolute right-1 -top-1 text-5xl opacity-80 group-hover:scale-115 transition-transform duration-300">
                          {tax.e}
                        </span>
                        <span className="font-black text-base leading-tight relative z-10">
                          {tax.k}
                        </span>
                        <span className="text-xs opacity-90 relative z-10">
                          {allPlaces.filter(tax.m).length} adresses
                        </span>
                      </button>
                    ))}

                    {/* Surprise me tile */}
                    <button
                      onClick={handleSurpriseMe}
                      className="col-span-2 h-24 rounded-3xl p-3.5 text-slate-950 font-black text-left flex items-center justify-between overflow-hidden shadow-md active:scale-97 cursor-pointer bg-gradient-to-r from-[#10B981] to-[#06B6D4]"
                    >
                      <div>
                        <span className="font-black text-lg block leading-tight text-slate-950">
                          🎲 Surprends-moi !
                        </span>
                        <span className="text-xs font-semibold text-slate-900/80">
                          Une excellente adresse tirée au sort près de toi
                        </span>
                      </div>
                      <span className="text-4xl">🎲</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: SUB-CATEGORY SELECTION */}
            {feedStep === "sub" && selectedTaxIndex >= 0 && (
              <div className="px-4 flex flex-col gap-3">
                <h2 className="font-sans font-black text-2xl text-slate-900 dark:text-white">
                  {TAXONOMY[selectedTaxIndex].e} {TAXONOMY[selectedTaxIndex].k} : quel style ?
                </h2>
                {TAXONOMY[selectedTaxIndex].note && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {TAXONOMY[selectedTaxIndex].note}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  {/* View all in category */}
                  <button
                    onClick={() => {
                      setSelectedSubIndex(-1);
                      setFeedStep("bud");
                    }}
                    className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#12121A] border-2 border-amber-400/80 text-left shadow-md hover:bg-amber-500/10 transition-all cursor-pointer"
                  >
                    <span className="text-2xl">✨</span>
                    <div>
                      <span className="font-black text-sm text-white block">
                        Tout voir
                      </span>
                      <span className="text-xs text-amber-300/80">
                        {allPlaces.filter(TAXONOMY[selectedTaxIndex].m).length} adresses
                      </span>
                    </div>
                  </button>

                  {TAXONOMY[selectedTaxIndex].subs.map(([label, emoji, filterFn], i) => {
                    const count = allPlaces.filter((p) => TAXONOMY[selectedTaxIndex].m(p) && filterFn(p)).length;
                    if (count === 0) return null;

                    return (
                      <button
                        key={label}
                        onClick={() => {
                          setSelectedSubIndex(i);
                          setFeedStep("bud");
                        }}
                        className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#12121A] border border-amber-500/25 hover:border-amber-400 text-left shadow-sm hover:shadow-amber-500/10 transition-all cursor-pointer group"
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform">{emoji}</span>
                        <div>
                          <span className="font-black text-sm text-white block leading-snug group-hover:text-amber-300 transition-colors">
                            {label}
                          </span>
                          <span className="text-xs text-zinc-400">
                            {count} adresses
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: BUDGET SELECTION */}
            {feedStep === "bud" && (
              <div className="px-4 flex flex-col gap-3">
                <h2 className="font-sans font-black text-2xl text-white flex items-center gap-2">
                  <span>Ton budget ?</span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">24K</span>
                </h2>

                <div className="flex flex-col gap-2.5">
                  {BUDGET_STEPS.map((step) => (
                    <button
                      key={step.val}
                      onClick={() => {
                        setSelectedBudget(step.val);
                        setFeedStep("res");
                      }}
                      className="flex items-center gap-3.5 p-4 rounded-3xl bg-[#12121A] border border-amber-500/25 hover:border-amber-400 text-left shadow-md hover:shadow-amber-500/10 transition-all cursor-pointer group"
                    >
                      <span className="text-3xl group-hover:scale-115 transition-transform">{step.emoji}</span>
                      <div className="flex-1">
                        <span className="font-black text-base text-white block group-hover:text-amber-300 transition-colors">
                          {step.label}
                        </span>
                        <span className="text-xs text-zinc-400">
                          {step.desc}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-amber-400/70 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: RESULTS VIEW */}
            {feedStep === "res" && (
              <div className="flex flex-col gap-4">
                {/* Header with count and view mode toggle */}
                <div className="px-4 flex items-center justify-between">
                  <h2 className="font-sans font-black text-2xl text-white flex items-center gap-2">
                    <span>{currentResults.length.toLocaleString("fr-FR")} adresse{currentResults.length > 1 ? "s" : ""}</span>
                    <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Vérifiées
                    </span>
                  </h2>

                  <div className="flex bg-[#0D0D14] border border-amber-500/25 p-1 rounded-xl shadow-inner">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        viewMode === "list"
                          ? "bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-black shadow-md"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Liste
                    </button>
                    <button
                      onClick={() => setViewMode("map")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        viewMode === "map"
                          ? "bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-black shadow-md"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Carte GPS
                    </button>
                  </div>
                </div>

                {/* Zones Row */}
                <div className="px-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <span className="text-xs font-bold text-amber-400/80 shrink-0">Où ?</span>
                  {allZones.map((z) => (
                    <button
                      key={z}
                      onClick={() => setSelectedZone(z)}
                      className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        selectedZone === z
                          ? "bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/20"
                          : "bg-[#12121A] text-zinc-300 border border-amber-500/20 hover:border-amber-400"
                      }`}
                    >
                      {z === "Toutes" ? "Partout" : z}
                    </button>
                  ))}
                </div>

                {/* Wishes Pills Row */}
                <div className="px-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <span className="text-xs font-bold text-amber-400/80 shrink-0">Envies :</span>
                  {Object.keys(WISHES).map((w) => {
                    const isOn = activeWishes.includes(w);
                    return (
                      <button
                        key={w}
                        onClick={() => {
                          setActiveWishes(isOn ? activeWishes.filter((x) => x !== w) : [...activeWishes, w]);
                        }}
                        className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          isOn
                            ? "bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/20"
                            : "bg-[#12121A] text-zinc-300 border border-amber-500/20 hover:border-amber-400"
                        }`}
                      >
                        {w}
                      </button>
                    );
                  })}
                </div>

                {/* 24K Luxury Sort Mode Selector */}
                <div className="px-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <span className="text-xs font-bold text-amber-400/80 shrink-0">Trier par :</span>
                  {[
                    { id: "smart", label: "⚡ Smart 24K" },
                    { id: "distance", label: "🚶 Le + Proche" },
                    { id: "rating", label: "⭐ Note ★ 4.8+" },
                    { id: "popular", label: "🔥 + Populaire" },
                    { id: "price", label: "💸 Moins cher" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSortMode(s.id as any)}
                      className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        sortMode === s.id
                          ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black shadow-sm"
                          : "bg-[#141420] text-zinc-400 border border-amber-500/15 hover:border-amber-400/50 hover:text-white"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Anti-0 Guarantee Banner */}
                {isFilterRelaxed && (
                  <div className="mx-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 shadow-xs">
                    <span className="text-xl shrink-0">✨</span>
                    <div className="text-xs flex-1">
                      <span className="font-black text-emerald-800 dark:text-emerald-300 block mb-0.5">
                        Garantie Anti-Zéro Résultat active !
                      </span>
                      <span className="text-emerald-700 dark:text-emerald-400 leading-relaxed block">
                        Aucune adresse ne cochait 100% de ces filtres stricts en même temps. GourMap a intelligemment élargi la zone pour vous présenter les meilleures pépites {activeWishes.includes("Halal") || activeWishes.includes("🕌 Halal") ? "Halal " : ""}disponibles !
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setActiveWishes([]);
                        setSelectedZone("Toutes");
                        setSelectedBudget(0);
                      }}
                      className="shrink-0 px-2.5 py-1 rounded-xl bg-[#10B981] hover:bg-[#059669] text-slate-950 text-[11px] font-black cursor-pointer"
                    >
                      Réinitialiser
                    </button>
                  </div>
                )}

                {/* Switch Between Real Leaflet Map and List */}
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
                  <div className="px-4 flex flex-col gap-4">
                    {/* Top 3 Podiums */}
                    {currentResults.slice(0, 3).map((place, idx) => (
                      <article
                        key={place.id}
                        onClick={() => setSelectedPlace(place)}
                        className="p-4 rounded-3xl bg-[#12121A] border border-amber-500/25 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col gap-3 cursor-pointer hover:border-amber-400 hover:shadow-amber-500/10 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden shrink-0 border border-amber-500/30"
                              style={{ background: artStyle(place) }}
                            >
                              <span className="absolute top-1 left-1 text-base drop-shadow-sm">
                                {["🥇", "🥈", "🥉"][idx]}
                              </span>
                              <svg
                                className="w-10 h-10"
                                viewBox="0 0 100 100"
                                dangerouslySetInnerHTML={{ __html: FA_ICONS[foodKey(place)] }}
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="font-black text-base text-white group-hover:text-amber-300 transition-colors">
                                  {place.n}
                                </h3>
                                {place.tiktokViral && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FF0050] text-white">
                                    TIKTOK
                                  </span>
                                )}
                                {place.isHalal && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 flex items-center gap-0.5 shadow-xs">
                                    <span>🕌</span>
                                    <span>{place.halalStatus || "Halal"}</span>
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-zinc-400">
                                <span className="text-amber-400 font-bold">★ {place.r.toFixed(1)}</span> ({place.c.toLocaleString("fr-FR")} avis) · {place.sub} · <span className="text-amber-200">{"€".repeat(place.pr)}</span>
                              </span>
                              {(() => {
                                const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, place.la, place.lo);
                                const walkMin = Math.max(1, Math.round(dist / 0.08));
                                return (
                                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <span className="text-xs font-bold text-amber-300/90">
                                      {formatDistance(dist)} de toi · {place.z}
                                    </span>
                                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.2 rounded-full inline-flex items-center gap-1 shadow-xs">
                                      🚶 ~{walkMin} min à pied
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                try {
                                  navigator.clipboard.writeText(`${place.n} - ${place.a}`);
                                } catch {}
                                showToast(`📍 Adresse de "${place.n}" copiée !`);
                              }}
                              className="p-2 rounded-full text-amber-300 bg-amber-400/10 hover:bg-amber-400/25 transition-colors cursor-pointer"
                              title="Copier l'adresse"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const shareText = `On mange là ? 🍽️ *${place.n}* (★ ${place.r.toFixed(1)})\n📍 ${place.a}\n🗺️ Itinéraire : https://www.google.com/maps/dir/?api=1&destination=${place.la},${place.lo}`;
                                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
                              }}
                              className="p-2 rounded-full text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                              title="Inviter des potes sur WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPlaceToStar(place);
                                setIsStarringListOpen(true);
                              }}
                              className="p-2 rounded-full text-amber-400 bg-amber-400/10 hover:bg-amber-400/25 transition-colors cursor-pointer"
                              title="Ajouter à une Starring List"
                            >
                              <Star className="w-4 h-4 fill-amber-400/80" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(place.id);
                              }}
                              className="p-2 rounded-full text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition-colors cursor-pointer"
                              title="Ajouter aux Favoris"
                            >
                              <Heart className={`w-4 h-4 ${favorites.includes(place.id) ? "fill-current" : ""}`} />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                          {place.s}
                        </p>

                        {/* Signature Banger */}
                        <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2 text-xs">
                          <span className="text-base shrink-0">🔥</span>
                          <span className="text-amber-300 font-black text-[10px] uppercase shrink-0">Banger :</span>
                          <span className="text-white font-bold truncate">{getSignatureBanger(place)}</span>
                        </div>

                        {/* Nearest Transit Station */}
                        {(() => {
                          const transit = getNearestTransit(place.la, place.lo);
                          if (!transit) return null;
                          return (
                            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                              <span>{transit.formatted}</span>
                            </div>
                          );
                        })()}

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => setSelectedPlace(place)}
                            className="flex-1 py-2.5 rounded-xl text-xs font-black text-zinc-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 text-center shadow-md shadow-amber-500/15 transition-all cursor-pointer"
                          >
                            Voir la fiche
                          </button>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${place.la},${place.lo}&travelmode=walking`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1A1A24] border border-zinc-800 hover:border-amber-400 transition-all cursor-pointer"
                          >
                            <Navigation className="w-3.5 h-3.5 text-amber-400" />
                            <span>Itinéraire</span>
                          </a>
                        </div>
                      </article>
                    ))}

                    {/* Rest of the List */}
                    {currentResults.length > 3 && (
                      <div className="flex flex-col divide-y divide-zinc-800/80">
                        {currentResults.slice(3, 3 + resultLimit).map((place) => {
                          const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, place.la, place.lo);
                          const walkMin = Math.max(1, Math.round(dist / 0.08));
                          return (
                            <div
                              key={place.id}
                              onClick={() => setSelectedPlace(place)}
                              className="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#14141E] rounded-2xl px-2 transition-colors border border-transparent hover:border-amber-500/20"
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
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h4 className="font-black text-sm text-white truncate">
                                      {place.n}
                                    </h4>
                                    {place.isHalal && (
                                      <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-400 font-black text-[10px] flex items-center gap-0.5">
                                        <span>🕌</span>
                                        <span>{place.halalStatus || "Halal"}</span>
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-zinc-400 block truncate">
                                    <span className="text-amber-400 font-bold">★ {place.r.toFixed(1)}</span> · {place.sub} · {place.z}
                                  </span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[11px] font-bold text-amber-300">
                                      {formatDistance(dist)} de toi
                                    </span>
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded-md">
                                      🚶 ~{walkMin} min
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-zinc-300 block truncate mt-0.5">
                                    🔥 <strong className="text-amber-200 font-medium">{getSignatureBanger(place)}</strong>
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const shareText = `On mange là ? 🍽️ *${place.n}* (★ ${place.r.toFixed(1)})\n📍 ${place.a}\n🗺️ https://www.google.com/maps/dir/?api=1&destination=${place.la},${place.lo}`;
                                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
                                  }}
                                  className="p-1.5 rounded-lg text-emerald-400/80 hover:text-emerald-400 hover:bg-emerald-500/15 transition-colors cursor-pointer"
                                  title="Partager sur WhatsApp"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </button>
                                <ChevronRight className="w-4 h-4 text-amber-400/60" />
                              </div>
                            </div>
                          );
                        })}

                        {currentResults.length > 3 + resultLimit && (
                          <button
                            onClick={() => setResultLimit((prev) => prev + 30)}
                            className="mt-3 py-3 rounded-2xl font-black text-xs bg-[#141420] border border-amber-500/20 text-white hover:border-amber-400 hover:text-amber-300 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                          >
                            <span>Charger plus d'adresses</span>
                            <span className="text-[11px] font-bold text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              +{(currentResults.length - 3 - resultLimit).toLocaleString("fr-FR")} restantes
                            </span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
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

        {/* ================= TAB 4: FAVORIS & LISTES ================= */}
        {activeTab === "favs" && (
          <div className="px-4 py-4 flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="font-sans font-black text-2xl text-white">
                  Mes Favoris & Listes ⭐
                </h2>
                <p className="text-xs text-amber-200/70">
                  Synchronisés en temps réel sur ton compte et partageables en 1-clic.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsStarringListOpen(true)}
                  className="px-3 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-md shadow-amber-500/25 hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>⭐</span>
                  <span>Starring Lists ({customLists.length})</span>
                </button>
                <span className="text-xs font-black text-[#10B981] bg-[#10B981]/15 px-3 py-1.5 rounded-full border border-emerald-500/30">
                  {favorites.length} favori{favorites.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Quick Banner for Starring Lists */}
            <div
              onClick={() => setIsStarringListOpen(true)}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#141420] to-[#141420] border border-amber-500/30 hover:border-amber-400 transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-md"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-lg shrink-0 border border-amber-400/30">
                  ⭐
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                    Mes Starring Lists ({customLists.length} listes actives)
                  </h4>
                  <p className="text-xs text-zinc-400 truncate">
                    Gérez vos sélections thématiques, marquez les restos testés et partagez sur WhatsApp
                  </p>
                </div>
              </div>
              <span className="text-xs font-black text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0">
                Ouvrir →
              </span>
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

      {/* Floating Mobile Switcher: Map <-> List */}
      <div className="fixed bottom-20 right-4 z-40 sm:hidden">
        {activeTab === "feed" ? (
          <button
            onClick={() => setActiveTab("map")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-xs shadow-2xl shadow-black/40 border border-slate-700 dark:border-slate-200 active:scale-95 transition-transform cursor-pointer"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Carte GPS (2 050+)</span>
          </button>
        ) : activeTab === "map" ? (
          <button
            onClick={() => setActiveTab("feed")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-xs shadow-2xl shadow-black/40 border border-slate-700 dark:border-slate-200 active:scale-95 transition-transform cursor-pointer"
          >
            <span>📋 Voir Liste</span>
          </button>
        ) : null}
      </div>

      {/* Persistent Bottom Tab Bar (Black & Gold Luxury Dock with Direct Shortcuts) */}
      <nav className="fixed bottom-4 left-2.5 right-2.5 sm:left-4 sm:right-4 max-w-lg mx-auto z-40 bg-[#0A0A0F]/95 backdrop-blur-2xl border border-amber-500/30 rounded-2xl p-1.5 shadow-[0_0_35px_rgba(245,158,11,0.22)] flex items-center justify-between transition-all">
        {/* 1. Accueil (Catégories) */}
        <button
          onClick={() => {
            if (activeTab === "feed" && feedStep === "home") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              setActiveTab("feed");
              setFeedStep("home");
              handleClearAI();
            }
          }}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
            activeTab === "feed"
              ? "bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/25"
              : "text-amber-200/60 hover:text-white"
          }`}
          title="Accueil & Catégories GourMap (Tape pour remonter en haut)"
        >
          <span className="text-base leading-none">🧭</span>
          <span className="text-[10px] sm:text-[11px] font-black truncate">Accueil</span>
        </button>

        {/* 2. Fast-Food & Drops */}
        <button
          onClick={() => setActiveTab("fastfood")}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
            activeTab === "fastfood"
              ? "bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/25"
              : "text-amber-200/60 hover:text-white"
          }`}
          title="Le QG Fast-Food, Grands connus & Drops"
        >
          <span className="text-base leading-none">🍔</span>
          <span className="text-[10px] sm:text-[11px] font-black truncate">Fast-Food</span>
        </button>

        {/* 3. Boxs ≤ 10€ */}
        <button
          onClick={() => setActiveTab("deals")}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
            activeTab === "deals"
              ? "bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/25"
              : "text-amber-200/60 hover:text-white"
          }`}
          title="Menus & Boxs virales ≤ 10 €"
        >
          <span className="text-base leading-none">📦</span>
          <span className="text-[10px] sm:text-[11px] font-black truncate">Boxs ≤10€</span>
        </button>

        {/* 4. Carte GPS */}
        <button
          onClick={() => setActiveTab("map")}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
            activeTab === "map"
              ? "bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/25"
              : "text-amber-200/60 hover:text-white"
          }`}
          title="Carte interactive GPS de Paris & IDF"
        >
          <span className="text-base leading-none">🗺️</span>
          <span className="text-[10px] sm:text-[11px] font-black truncate">Carte</span>
        </button>

        {/* 5. Tous les Outils (Accès direct en 1 clic) */}
        <button
          onClick={() => setIsToolsMenuOpen(true)}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
            isToolsMenuOpen
              ? "bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/25"
              : "text-amber-300 hover:text-white"
          }`}
          title="Ouvrir la boîte à outils (Jackpot, Roulette, Split note, etc.)"
        >
          <span className="text-base leading-none">⚡</span>
          <span className="text-[10px] sm:text-[11px] font-black truncate">Outils (8+)</span>
        </button>

        {/* 6. Favoris */}
        <button
          onClick={() => setActiveTab("favs")}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
            activeTab === "favs"
              ? "bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/25"
              : "text-amber-200/60 hover:text-white"
          }`}
          title="Mes Favoris & Starring Lists"
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.la},${selectedPlace.lo}&travelmode=walking`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm text-zinc-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 shadow-md shadow-amber-500/20 text-center cursor-pointer transition-all"
                >
                  <Navigation className="w-4 h-4 text-zinc-950" />
                  <span>Google Maps</span>
                </a>

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
                    const shareText = `On mange là ? 🍽️ *${selectedPlace.n}* (★ ${selectedPlace.r.toFixed(1)})\n📍 ${selectedPlace.a}\n🗺️ Itinéraire : https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.la},${selectedPlace.lo}`;
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
                  onClick={() => setIsBillSplitterOpen(true)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 cursor-pointer transition-all"
                >
                  <span>🧮 Split Addition</span>
                </button>
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
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPlace.n + " " + selectedPlace.a)}`}
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
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.la},${selectedPlace.lo}&travelmode=walking`}
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
