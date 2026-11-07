export interface RestaurantPlace {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  priceLevel: 1 | 2 | 3 | 4; // 1 = €, 2 = €€, 3 = €€€, 4 = €€€€
  category: "Restaurant" | "Fast-food" | "Goûter" | "Marché";
  subCategory: string;
  phone?: string;
  hours: string;
  summary: string;
  pros: string[];
  cons: string[];
  tiktokViral?: boolean;
  tiktokTrendNote?: string;
  isHalal?: boolean;
  halalStatus?: "100% Halal" | "Viandes Halal certifiées" | "Options Halal disponibles";
  halalNotice?: string;
  hasVegetarian?: boolean;
  hasTerrace?: boolean;
  isOpenLate?: boolean;
  isKidFriendly?: boolean;
  isBoxDeal?: boolean;
  photoUrl?: string;
  zone: string;
  foodKey?: string;
  n?: string;
  a?: string;
  la?: number;
  lo?: number;
  r?: number;
  c?: number;
  pr?: number;
  cat?: "Restaurant" | "Fast-food" | "Goûter" | "Marché";
  sub?: string;
  tel?: string;
  h?: string;
  s?: string;
  z?: string;
}

export interface TaxonomyItem {
  key: string;
  emoji: string;
  gradient: [string, string];
  note?: string;
  matcher?: (p: RestaurantPlace) => boolean;
  subs: Array<{
    label: string;
    emoji: string;
    matcher: (p: RestaurantPlace) => boolean;
  }>;
}

export interface FoodDeal {
  id: string;
  brand: string;
  title: string;
  price: number;
  emoji: string;
  category: "Box" | "Poulet" | "Burger" | "Tacos" | "Enfant" | "Étudiant" | "Asie";
  included: string;
  note: string;
  source: string;
  isTiktokViral?: boolean;
  restaurantIds?: number[];
  placeId?: number;
  bannerGradient: [string, string];
  tiktokViews?: string;
  tiktokSound?: string;
  secretHack?: string;
  isHalal?: boolean;
}

export interface FoodDiaryEntry {
  id: string;
  placeId: number;
  placeName: string;
  visitedAt: string;
  rating: number; // 1-5
  favoriteDish: string;
  notes: string;
  costPaid?: number;
  tag: "Coup de cœur" | "À refaire" | "Sympa" | "Décevant";
}

export interface CustomList {
  id: string;
  title: string;
  description: string;
  emoji: string;
  isPublic: boolean;
  placeIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupVoteOption {
  placeId: number;
  votes: number;
  voterNames: string[];
}

export interface GroupSession {
  id: string;
  code: string;
  title: string;
  creatorName: string;
  createdAt: string;
  options: GroupVoteOption[];
  status: "open" | "closed";
  selectedWinnerId?: number;
}

export interface UserGamification {
  points: number;
  level: number;
  levelTitle: string;
  placesTestedCount: number;
  kilometersWalked: number;
  moneySavedEur: number;
  unlockedBadgeIds: string[];
}

export interface GourmetBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "exploration" | "budget" | "social" | "connoisseur";
  requirement: string;
}

export interface AISearchCriteria {
  openNow?: boolean;
  maxBudget?: number;
  category?: string;
  cuisine?: string;
  halal?: boolean;
  vegetarian?: boolean;
  kidFriendly?: boolean;
  groupFriendly?: boolean;
  romantic?: boolean;
  maxDistanceKm?: number;
  zone?: string;
  independentOnly?: boolean;
  tiktokViralOnly?: boolean;
  boxDealOnly?: boolean;
  lateNightOnly?: boolean;
}
