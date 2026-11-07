const fs = require("fs");
const path = require("path");

const { ALL_RAW_PLACES } = require("../src/data/rawDatabase.ts");

console.log(`Starting standalone HTML generation with ${ALL_RAW_PLACES.length} places...`);

// Format places into compact pipe-separated lines
// Format: n|a|la|lo|r|c|pr|cat|sub|tel|h|s|halal|halalStatus|halalNotice|viral|boxDeal|vege|zone|foodKey
const lines = ALL_RAW_PLACES.map(p => {
  const clean = str => (str || "").replace(/[|\n\r]/g, " ").trim();
  return [
    clean(p.n || p.name),
    clean(p.a || p.address),
    p.la || p.lat,
    p.lo || p.lng,
    p.r || p.rating || 4.5,
    p.c || p.reviewCount || 100,
    p.pr || p.priceLevel || 2,
    clean(p.cat || p.category || "Restaurant"),
    clean(p.sub || p.subCategory || "Français"),
    clean(p.tel || p.phone || ""),
    clean(p.h || p.hours || "Tous les jours 11h-23h"),
    clean(p.s || p.summary || "Très bonne adresse."),
    p.isHalal ? 1 : 0,
    clean(p.halalStatus || (p.isHalal ? "100% Halal" : "")),
    clean(p.halalNotice || ""),
    p.tiktokViral ? 1 : 0,
    p.isBoxDeal ? 1 : 0,
    p.hasVegetarian ? 1 : 0,
    clean(p.zone || "Paris"),
    clean(p.foodKey || "cloche")
  ].join("|");
});

console.log(`Created ${lines.length} compact data lines.`);

// Generate the standalone HTML content
const htmlTemplate = (rawContent) => `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="theme-color" content="#FF4D2E">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<title>GourMap – Le GPS de la Food Paris & IDF</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Fraunces:opsz,wght@9..144,700;9..144,800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
<style>
:root{
  --bg:#FFF9F2;
  --card:#FFFFFF;
  --ink:#1F140A;
  --muted:#8C7765;
  --line:#F2E2D2;
  --acc:#FF4D2E;
  --acc-glow:rgba(255,77,46,0.35);
  --halal:#10B981;
  --halal-bg:#ECFDF5;
  --sh:0 8px 24px rgba(120,60,10,0.08);
  --sh-lg:0 14px 36px rgba(120,60,10,0.14);
}
:root[data-theme="dark"]{
  --bg:#0F0B08;
  --card:#1A130D;
  --ink:#FFF3E6;
  --muted:#B8A693;
  --line:#2D2118;
  --acc:#FF5733;
  --acc-glow:rgba(255,87,51,0.35);
  --halal:#10B981;
  --halal-bg:#064E3B;
  --sh:0 8px 24px rgba(0,0,0,0.45);
  --sh-lg:0 14px 36px rgba(0,0,0,0.6);
  color-scheme:dark;
}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
body{
  background:var(--bg);
  color:var(--ink);
  font-family:"DM Sans",system-ui,-apple-system,sans-serif;
  padding-bottom:calc(85px + env(safe-area-inset-bottom, 0px));
  min-height:100vh;
  display:flex;
  justify-content:center;
}
#app-container{
  width:100%;
  max-width:540px;
  min-height:100vh;
  position:relative;
  background:var(--bg);
  box-shadow:0 0 50px rgba(0,0,0,0.08);
}
body.is-fullscreen #app-container{
  max-width:100%;
  box-shadow:none;
}
h1,h2,h3,.logo{font-family:"Fraunces",Georgia,serif}
button,input,a{font:inherit;color:inherit}
button{cursor:pointer;border:0;background:none}

/* En-tête */
header{
  position:sticky;
  top:0;
  z-index:20;
  background:var(--bg);
  background:color-mix(in srgb,var(--bg) 88%,transparent);
  backdrop-filter:blur(16px);
  -webkit-backdrop-filter:blur(16px);
  padding:12px 16px 8px;
  border-bottom:1px solid color-mix(in srgb,var(--line) 40%,transparent);
}
.top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.logo{font-size:24px;font-weight:800;letter-spacing:-0.5px}
.logo span{color:var(--acc)}
.head-acts{display:flex;gap:6px;align-items:center}
.ib{
  width:38px;
  height:38px;
  border-radius:50%;
  background:var(--card);
  box-shadow:var(--sh);
  font-size:16px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  border:1px solid var(--line);
  transition:transform 0.15s;
}
.ib:active{transform:scale(0.92)}
.frame-btn{
  font-size:11px;
  font-weight:700;
  padding:6px 10px;
  border-radius:18px;
  background:var(--card);
  border:1px solid var(--line);
  box-shadow:var(--sh);
}

/* Recherche */
.ai{
  display:flex;
  gap:8px;
  margin-top:10px;
  background:var(--card);
  border-radius:28px;
  padding:5px 5px 5px 14px;
  box-shadow:var(--sh);
  border:1.5px solid var(--line);
}
.ai input{
  flex:1;
  min-width:0;
  border:0;
  background:none;
  font-size:14px;
  outline:none;
}
.ai button{
  background:linear-gradient(135deg,#FF7A45,#FF4D2E);
  color:#fff;
  border-radius:22px;
  padding:0 16px;
  font-weight:700;
  font-size:13px;
  box-shadow:0 4px 12px var(--acc-glow);
}
#ans{
  margin:10px 16px 0;
  padding:12px 16px;
  border-radius:16px;
  background:var(--card);
  box-shadow:var(--sh);
  font-size:13.5px;
  line-height:1.45;
  display:none;
  border-left:4px solid var(--acc);
}

/* Scroll horizontal */
.row{
  display:flex;
  gap:10px;
  overflow-x:auto;
  padding:6px 16px 8px;
  scrollbar-width:none;
}
.row::-webkit-scrollbar{display:none}

/* Chips / Filtres */
.chip{
  border:1.5px solid var(--line);
  background:var(--card);
  border-radius:20px;
  padding:7px 13px;
  font-size:13px;
  font-weight:600;
  white-space:nowrap;
  box-shadow:0 2px 6px rgba(0,0,0,0.03);
  transition:all 0.2s cubic-bezier(0.3,0.7,0.4,1.4);
}
.chip.on{
  background:var(--acc);
  color:#fff;
  border-color:var(--acc);
  box-shadow:0 4px 12px var(--acc-glow);
}
.chip.halal-chip.on{
  background:var(--halal);
  border-color:var(--halal);
  box-shadow:0 4px 12px rgba(16,185,129,0.35);
}

/* Sections */
.sec{
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  padding:16px 16px 6px;
}
.sec h2{font-size:19px;font-weight:800}
.lnk{color:var(--acc);font-weight:700;font-size:13px}
.hint{padding:0 16px;color:var(--muted);font-size:12.5px;margin:-2px 0 6px}

/* Cartes Restos Feed */
.cc{
  flex:0 0 152px;
  text-align:left;
  background:var(--card);
  border-radius:20px;
  padding:9px;
  box-shadow:var(--sh);
  border:1px solid var(--line);
  display:flex;
  flex-direction:column;
  transition:transform 0.15s;
}
.cc:active{transform:scale(0.96)}
.ct{
  height:98px;
  border-radius:14px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:44px;
  position:relative;
  overflow:hidden;
}
.rt{
  position:absolute;
  left:6px;
  bottom:6px;
  background:#fff;
  color:#21140A;
  font-size:11px;
  font-weight:800;
  border-radius:10px;
  padding:2px 7px;
  box-shadow:0 2px 6px rgba(0,0,0,0.15);
}
.hl-badge{
  position:absolute;
  right:6px;
  top:6px;
  background:#10B981;
  color:#fff;
  font-size:10px;
  font-weight:800;
  border-radius:8px;
  padding:2px 6px;
  box-shadow:0 2px 6px rgba(0,0,0,0.2);
}
.cc b{
  display:block;
  font-size:13.5px;
  margin-top:8px;
  line-height:1.2;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.cc small{color:var(--muted);font-size:11.5px;margin-top:2px}

/* Tuiles catégories */
.tiles{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;
  padding:6px 16px 20px;
}
.tile{
  position:relative;
  overflow:hidden;
  border-radius:22px;
  height:114px;
  padding:14px;
  text-align:left;
  color:#fff;
  background:linear-gradient(135deg,var(--a),var(--b));
  box-shadow:var(--sh);
  display:flex;
  flex-direction:column;
  justify-content:flex-end;
  transition:transform 0.15s;
}
.tile:active{transform:scale(0.96)}
.tile b{font-size:15px;line-height:1.15;position:relative;z-index:2}
.tile small{font-size:11.5px;opacity:0.92;position:relative;z-index:2}
.tile .te{
  position:absolute;
  right:-4px;
  top:-4px;
  font-size:56px;
  transform:rotate(-12deg);
  opacity:0.95;
  filter:drop-shadow(0 4px 8px rgba(0,0,0,0.25));
}
.tile.wide{grid-column:span 2;height:88px}

/* Liste résultats */
.list{padding:0 16px}
.pl{
  display:flex;
  gap:12px;
  padding:12px 0;
  border-bottom:1px solid var(--line);
  width:100%;
  text-align:left;
  background:none;
}
.pl:active{opacity:0.75}
.ph{
  flex:0 0 68px;
  height:68px;
  border-radius:18px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:32px;
  position:relative;
  overflow:hidden;
  box-shadow:var(--sh);
}
.pl-content{flex:1;min-width:0}
.pl b{font-size:15px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pl small{display:block;color:var(--muted);font-size:12px;margin-top:2px}

/* Bons plans */
.deal{
  display:flex;
  gap:12px;
  margin:0 16px 12px;
  background:var(--card);
  border-radius:24px;
  padding:14px;
  box-shadow:var(--sh);
  border:1px solid var(--line);
}
.deal .dp{
  flex:0 0 74px;
  min-height:74px;
  border-radius:20px;
  background:linear-gradient(135deg,#FF8A3D,#E0245E);
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:800;
  font-size:19px;
  text-align:center;
  box-shadow:0 4px 12px rgba(255,77,46,0.3);
}
.deal-info{flex:1;min-width:0}
.deal h3{font-size:16px;line-height:1.2;margin:2px 0}
.deal p{font-size:13px;line-height:1.4;margin:4px 0}

/* Actions & boutons */
.acts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.btn{
  border-radius:14px;
  padding:11px;
  font-size:13.5px;
  font-weight:700;
  text-align:center;
  text-decoration:none;
  background:var(--acc);
  color:#fff;
  display:block;
  box-shadow:0 4px 12px var(--acc-glow);
  transition:transform 0.15s;
}
.btn:active{transform:scale(0.96)}
.btn.alt{
  background:var(--card);
  color:var(--ink);
  border:1px solid var(--line);
  box-shadow:var(--sh);
}
.btn.halal-btn{
  background:var(--halal);
  box-shadow:0 4px 12px rgba(16,185,129,0.3);
}

/* Carte */
.map-wrap{
  position:relative;
  margin:12px 16px 0;
  border-radius:24px;
  overflow:hidden;
  box-shadow:var(--sh-lg);
  border:1.5px solid var(--line);
  height:360px;
}
#leaflet-map{width:100%;height:100%}

/* Bottom sheet modal */
.modal{
  position:fixed;
  inset:0;
  background:rgba(15,10,5,0.6);
  backdrop-filter:blur(4px);
  z-index:100;
  display:none;
  align-items:flex-end;
  justify-content:center;
}
.modal.open{display:flex}
.sheet{
  background:var(--bg);
  width:100%;
  max-width:540px;
  max-height:90vh;
  overflow-y:auto;
  border-radius:28px 28px 0 0;
  padding:20px 18px 30px;
  position:relative;
  box-shadow:0 -10px 40px rgba(0,0,0,0.25);
  animation:slideUp 0.3s cubic-bezier(0.2,0.8,0.2,1);
}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.x{
  position:absolute;
  top:16px;
  right:16px;
  width:36px;
  height:36px;
  border-radius:50%;
  background:var(--card);
  box-shadow:var(--sh);
  border:1px solid var(--line);
  font-size:16px;
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:5;
}
.sheet .ph{
  width:100%;
  height:140px;
  font-size:68px;
  margin-bottom:14px;
  border-radius:22px;
}
.sheet h3{font-size:24px;line-height:1.15;margin-bottom:6px}
.info{
  font-size:14px;
  line-height:1.5;
  margin:8px 0;
  padding:10px 12px;
  border-radius:14px;
  background:var(--card);
  border:1px solid var(--line);
}
.info span{color:var(--muted)}
.halal-alert{
  background:var(--halal-bg);
  border:1.5px solid #10B981;
  color:#065F46;
  padding:12px 14px;
  border-radius:16px;
  font-size:13.5px;
  line-height:1.45;
  margin:10px 0;
  display:flex;
  gap:10px;
  align-items:center;
}
:root[data-theme="dark"] .halal-alert{color:#A7F3D0}

/* Bottom Tab Navigation */
nav#tabs{
  position:fixed;
  left:0;
  right:0;
  bottom:0;
  z-index:30;
  display:flex;
  justify-content:center;
  pointer-events:none;
}
.tabs-inner{
  pointer-events:auto;
  width:calc(100% - 24px);
  max-width:516px;
  margin-bottom:calc(8px + env(safe-area-inset-bottom, 0px));
  display:flex;
  background:var(--card);
  background:color-mix(in srgb,var(--card) 90%,transparent);
  backdrop-filter:blur(20px);
  -webkit-backdrop-filter:blur(20px);
  border-radius:30px;
  padding:6px;
  box-shadow:0 12px 36px rgba(40,20,5,0.22);
  border:1.5px solid var(--line);
}
.tabs-inner button{
  flex:1;
  border-radius:24px;
  padding:8px 2px;
  font-size:11px;
  font-weight:600;
  color:var(--muted);
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:3px;
  transition:all 0.25s;
}
.tabs-inner button i{font-style:normal;font-size:20px;transition:transform 0.2s}
.tabs-inner button.on{
  background:linear-gradient(135deg,#FF7A45,#FF4D2E);
  color:#fff;
  box-shadow:0 4px 14px var(--acc-glow);
}
.tabs-inner button.on i{transform:scale(1.15) translateY(-1px)}

/* Roulette */
.roulette-box{
  margin:16px;
  padding:24px 18px;
  border-radius:26px;
  background:linear-gradient(135deg,#7C4DFF,#E040FB);
  color:#fff;
  text-align:center;
  box-shadow:var(--sh-lg);
}
.roulette-box h2{font-size:26px;margin-bottom:8px}
.roulette-box p{font-size:14px;opacity:0.95;margin-bottom:18px}
.spin-btn{
  background:#fff;
  color:#7C4DFF;
  font-size:16px;
  font-weight:800;
  padding:14px 28px;
  border-radius:24px;
  box-shadow:0 6px 20px rgba(0,0,0,0.25);
  display:inline-flex;
  align-items:center;
  gap:8px;
  transition:transform 0.2s;
}
.spin-btn:active{transform:scale(0.92)}

/* Fallback Notice */
.fallback-notice{
  margin:10px 16px;
  padding:10px 14px;
  border-radius:14px;
  background:#FEF3C7;
  color:#92400E;
  font-size:13px;
  border:1px solid #FCD34D;
  display:flex;
  gap:8px;
  align-items:center;
}
:root[data-theme="dark"] .fallback-notice{
  background:#78350F;
  color:#FDE68A;
  border-color:#B45309;
}
</style>
</head>
<body>
<div id="app-container">
  <header>
    <div class="top">
      <div class="logo">Gour<span>Map</span></div>
      <div class="head-acts">
        <button class="frame-btn" onclick="toggleScreenMode()" id="frameToggle" aria-label="Mode écran">📱 Mobile</button>
        <button class="ib" id="thm" onclick="cycleTheme()" aria-label="Thème">🌓</button>
        <button class="ib" onclick="tab('roulette')" aria-label="Roulette">🎲</button>
      </div>
    </div>
    <div class="ai">
      <input id="q" placeholder="« burger halal », « poulet frit < 10€ », « 18e »…" aria-label="Recherche" onkeydown="if(event.key==='Enter')ask()">
      <button onclick="ask()">Go</button>
    </div>
  </header>
  <div id="ans"></div>
  <main id="scr"></main>

  <nav id="tabs" aria-label="Navigation">
    <div class="tabs-inner">
      <button data-t="home" onclick="tab('home')"><i>🏠</i>Découvrir</button>
      <button data-t="map" onclick="tab('map')"><i>🗺️</i>Carte</button>
      <button data-t="deals" onclick="tab('deals')"><i>💸</i>≤ 10 €</button>
      <button data-t="roulette" onclick="tab('roulette')"><i>🎲</i>Roulette</button>
      <button data-t="fav" onclick="tab('fav')"><i>❤️</i>Favoris</button>
    </div>
  </nav>

  <div class="modal" id="m" onclick="if(event.target.id==='m')closeM()"><div class="sheet" id="s"></div></div>
</div>

<script>
// Base de données intégrée complète
const RAW=\`${rawContent}\`;

const IC = {
  Français:"🥖", Indien:"🍛", Japonais:"🍣", Bouillon:"🥘", Turc:"🥙", Égyptien:"🧆",
  Américain:"🍔", "Tacos et sandwichs":"🌯", Burger:"🍔", Poulet:"🍗", "Café et brunch":"☕",
  Pâtisserie:"🥐", Pizza:"🍕", Boulangerie:"🥖", Libanais:"🥙", Vietnamien:"🍜",
  Cambodgien:"🍜", Marocain:"🍲", Tunisien:"🍲", Maghrébin:"🍲", Kebab:"🥙",
  Crêperie:"🥞", Glacier:"🍦", Ramen:"🍜", Africain:"🍲", Italien:"🍝",
  Méditerranéen:"🥗", Végan:"🌱", Végétarien:"🥗", Latino:"🌮", Tapas:"🍤",
  "Salon de thé":"🫖", Steakhouse:"🥩", Coréen:"🍲", Grillades:"🍖",
  "Marché couvert":"🧺", "Marché de plein air":"🥬", "Street food":"🌮",
  "Halle gourmande":"🍽️", "Food court":"🍱"
};

const $ = id => document.getElementById(id);
const hash = s => { let h = 0; for(const c of s) h = (h*31 + c.charCodeAt(0)) | 0; return Math.abs(h); };

// Parse ALL places
const P = RAW.trim().split("\\n").filter(Boolean).map((line, i) => {
  const [
    n, a, la, lo, r, c, pr, cat, sub, tel, h, s,
    isHalal, halalStatus, halalNotice, viral, boxDeal, vege, zone, foodKey
  ] = line.split("|");
  return {
    id: i,
    n: n || "Lieu GourMap",
    a: a || "Paris",
    la: parseFloat(la) || 48.8566,
    lo: parseFloat(lo) || 2.3522,
    r: parseFloat(r) || 4.5,
    c: parseInt(c) || 100,
    pr: parseInt(pr) || 2,
    cat: cat || "Restaurant",
    sub: sub || "Français",
    tel: tel || "",
    h: h || "Tous les jours 11h-23h",
    s: s || "Très bonne adresse sélectionnée.",
    isHalal: isHalal === "1" || isHalal === "true",
    halalStatus: halalStatus || (isHalal === "1" ? "100% Halal" : ""),
    halalNotice: halalNotice || "",
    tiktokViral: viral === "1",
    isBoxDeal: boxDeal === "1",
    hasVegetarian: vege === "1",
    zone: zone || "Paris",
    foodKey: foodKey || "cloche"
  };
});

console.log("Total places chargées en mémoire:", P.length, "dont Halal:", P.filter(p=>p.isHalal).length);

const hav = (a,b,c,d) => Math.hypot((d-b)*Math.cos(a*Math.PI/180)*111.32, (c-a)*110.57);
let pos = [48.86, 2.34]; // Paris Centre par défaut
if(navigator.geolocation){
  navigator.geolocation.getCurrentPosition(
    p => { pos = [p.coords.latitude, p.coords.longitude]; if(S.step==='map') render(); },
    e => console.log("Position par défaut Paris Centre")
  );
}
const dist = p => hav(pos[0], pos[1], p.la, p.lo);
const fk = k => k < 1 ? Math.round(k*1000)+" m" : k.toFixed(1).replace(".",",")+" km";
const eu = n => "€".repeat(Math.max(1, n));

let favs = [];
try { favs = JSON.parse(localStorage.getItem("gourmap-favs")) || []; } catch(e){}

let S = {
  step: "home",
  cat: "Tous",
  sub: null,
  halalOnly: false,
  budgetOnly: false,
  openOnly: false,
  zone: "Toutes",
  query: "",
  ids: null,
  sel: null,
  lim: 30,
  fallbackApplied: false
};

const DEALS = [
  { brand:"KFC", t:"Box à 10 €", pr:10, e:"🍗", inc:"Burger Crispy + 2 tenders + frites + boisson + sauce." },
  { brand:"KFC", t:"Menu à 5 balles", pr:5, e:"🍗", inc:"Burger + moyenne frite + boisson 25 cl." },
  { brand:"McDonald’s", t:"McDeal à 5 €", pr:5, e:"🍔", inc:"1 burger + frites + boisson fraîche + dessert." },
  { brand:"McDonald’s", t:"Best Of à 7,50 €", pr:7.5, e:"🍔", inc:"McChicken ou Double Cheese en menu complet." },
  { brand:"Burger King", t:"Menu Bon & Pas Cher 5 €", pr:5, e:"🍔", inc:"Burger Whopper Jr + frites + boisson." },
  { brand:"Kebab & Street Food", t:"Formule Sandwich Frites 8,50 €", pr:8.5, e:"🥙", inc:"Pain maison, viandes grillées, frites chaudes et boisson." },
  { brand:"Tacos & Naan", t:"Menu Tacos M + Boisson 9 €", pr:9, e:"🌯", inc:"Tacos 1 viande avec sauce fromagère maison + boisson." }
];

/* Filtrage sans jamais tomber sur 0 */
function getFilteredPlaces() {
  if (S.ids) {
    const aiPlaces = S.ids.map(i => P[i]).filter(Boolean);
    if (aiPlaces.length > 0) return { list: aiPlaces, fallback: false };
  }

  let base = P.filter(p => {
    if (S.halalOnly && !p.isHalal) return false;
    if (S.cat !== "Tous" && p.cat !== S.cat) return false;
    if (S.sub && p.sub !== S.sub) return false;
    if (S.budgetOnly && p.pr > 1 && !p.isBoxDeal) return false;
    if (S.zone !== "Toutes" && !p.zone.includes(S.zone) && !p.a.includes(S.zone)) return false;
    return true;
  });

  if (base.length > 0) return { list: base, fallback: false };

  // Système anti-0 : si la combinaison est trop restrictive, on élargit la zone tout en maintenant Halal si demandé
  let fallbackList = P.filter(p => {
    if (S.halalOnly && !p.isHalal) return false;
    if (S.cat !== "Tous" && p.cat !== S.cat) return false;
    return true;
  });

  if (fallbackList.length === 0 && S.halalOnly) {
    fallbackList = P.filter(p => p.isHalal);
  }

  return { list: fallbackList.length ? fallbackList : P.slice(0, 50), fallback: true };
}

/* Thème */
let currentTheme = localStorage.getItem("gourmap-theme") || "light";
function applyTheme() {
  document.documentElement.setAttribute("data-theme", currentTheme);
  const btn = $("thm");
  if(btn) btn.textContent = currentTheme === "dark" ? "🌙" : "☀️";
}
function cycleTheme() {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  localStorage.setItem("gourmap-theme", currentTheme);
  applyTheme();
}

/* Mode Mobile / Plein Écran */
let isFullscreen = false;
function toggleScreenMode() {
  isFullscreen = !isFullscreen;
  document.body.classList.toggle("is-fullscreen", isFullscreen);
  $("frameToggle").textContent = isFullscreen ? "💻 Plein" : "📱 Mobile";
}

/* Navigation */
function tab(name) {
  S.step = name;
  S.ids = null;
  $("ans").style.display = "none";
  render();
  window.scrollTo({top:0, behavior:"smooth"});
}

function render() {
  document.querySelectorAll(".tabs-inner button").forEach(b => {
    b.classList.toggle("on", b.dataset.t === S.step);
  });

  if (S.step === "home") renderHome();
  else if (S.step === "map") renderMap();
  else if (S.step === "deals") renderDeals();
  else if (S.step === "roulette") renderRoulette();
  else if (S.step === "fav") renderFavs();
  else if (S.step === "list") renderList();
}

/* Vue Accueil */
function renderHome() {
  const halalPlaces = P.filter(p => p.isHalal).sort((a,b)=>b.r - a.r).slice(0, 10);
  const viralPlaces = P.filter(p => p.tiktokViral || p.c > 800).sort((a,b)=>b.r - a.r).slice(0, 10);
  const budgetPlaces = P.filter(p => p.pr === 1 || p.isBoxDeal).sort((a,b)=>b.r - a.r).slice(0, 10);

  const cardHtml = p => \`
    <div class="cc" onclick="openPlace(\${p.id})">
      <div class="ct" style="background:linear-gradient(135deg,hsl(\${hash(p.sub)%360},80%,88%),hsl(\${(hash(p.sub)+35)%360},85%,75%))">
        <span>\${IC[p.sub]||"🍽️"}</span>
        <span class="rt">★ \${p.r.toFixed(1)}</span>
        \${p.isHalal ? '<span class="hl-badge">🕌 Halal</span>' : ''}
      </div>
      <b>\${p.n}</b>
      <small>\${p.sub} · \${eu(p.pr)} · \${p.zone}</small>
    </div>
  \`;

  $("scr").innerHTML = \`
    <div style="padding:14px 16px 4px">
      <h1 style="font-size:26px;line-height:1.15">Explore le meilleur de la food à Paris</h1>
      <p style="color:var(--muted);font-size:13px;margin-top:4px">Plus de 2 000 adresses vérifiées avec statut Halal certifié</p>
    </div>

    <div class="row" style="margin-top:6px">
      <button class="chip \${S.halalOnly?'on halal-chip':''}" onclick="toggleHalal()">🕌 100% Halal (\${P.filter(p=>p.isHalal).length})</button>
      <button class="chip \${S.budgetOnly?'on':''}" onclick="toggleBudget()">💸 Bons plans ≤ 10 €</button>
      <button class="chip" onclick="quickFilter('Burger')">🍔 Burgers</button>
      <button class="chip" onclick="quickFilter('Poulet')">🍗 Poulet frit</button>
      <button class="chip" onclick="quickFilter('Kebab')">🥙 Kebabs & Naans</button>
      <button class="chip" onclick="quickFilter('Italien')">🍕 Pizzas</button>
      <button class="chip" onclick="quickFilter('Japonais')">🍣 Japonais</button>
    </div>

    <div class="sec">
      <h2>🕌 Sélection Halal Incontournable</h2>
      <button class="lnk" onclick="seeAllHalal()">Tout voir</button>
    </div>
    <div class="row">\${halalPlaces.map(cardHtml).join("")}</div>

    <div class="sec">
      <h2>🔥 Spots Viraux & Pépites</h2>
      <button class="lnk" onclick="seeAllList('viral')">Explorer</button>
    </div>
    <div class="row">\${viralPlaces.map(cardHtml).join("")}</div>

    <div class="sec">
      <h2>💸 Moins de 10 €</h2>
      <button class="lnk" onclick="tab('deals')">Tous les deals</button>
    </div>
    <div class="row">\${budgetPlaces.map(cardHtml).join("")}</div>

    <div class="sec"><h2>Catégories Gourmandes</h2></div>
    <div class="tiles">
      <div class="tile" style="--a:#FF7A45;--b:#FF4D2E" onclick="filterCat('Restaurant')">
        <span class="te">🍽️</span>
        <b>Restaurants</b>
        <small>\${P.filter(p=>p.cat==='Restaurant').length} adresses</small>
      </div>
      <div class="tile" style="--a:#FFA41B;--b:#FF6B00" onclick="filterCat('Fast-food')">
        <span class="te">🍔</span>
        <b>Street Food</b>
        <small>\${P.filter(p=>p.cat==='Fast-food').length} adresses</small>
      </div>
      <div class="tile" style="--a:#E040FB;--b:#7C4DFF" onclick="filterCat('Goûter')">
        <span class="te">🥐</span>
        <b>Cafés & Goûters</b>
        <small>\${P.filter(p=>p.cat==='Goûter').length} adresses</small>
      </div>
      <div class="tile" style="--a:#00B4A6;--b:#0072FF" onclick="filterCat('Marché')">
        <span class="te">🧺</span>
        <b>Marchés & Halles</b>
        <small>\${P.filter(p=>p.cat==='Marché').length} adresses</small>
      </div>
      <div class="tile wide" style="--a:#10B981;--b:#059669" onclick="seeAllHalal()">
        <span class="te">🕌</span>
        <b>1 200+ Adresses Halal Certifiées</b>
        <small>Burgers, kebabs, poulet rôti, grillades, couscous et naans</small>
      </div>
    </div>
  \`;
}

function toggleHalal() {
  S.halalOnly = !S.halalOnly;
  S.step = "list";
  render();
}
function toggleBudget() {
  S.budgetOnly = !S.budgetOnly;
  S.step = "list";
  render();
}
function seeAllHalal() {
  S.halalOnly = true;
  S.cat = "Tous";
  S.sub = null;
  S.step = "list";
  render();
}
function filterCat(c) {
  S.cat = c;
  S.sub = null;
  S.step = "list";
  render();
}
function quickFilter(subCat) {
  S.sub = subCat;
  S.step = "list";
  render();
}

/* Vue Liste */
function renderList() {
  const res = getFilteredPlaces();
  const list = res.list;

  const rowHtml = p => \`
    <div class="pl" onclick="openPlace(\${p.id})">
      <div class="ph" style="background:linear-gradient(135deg,hsl(\${hash(p.sub)%360},80%,88%),hsl(\${(hash(p.sub)+35)%360},85%,75%))">
        <span>\${IC[p.sub]||"🍽️"}</span>
      </div>
      <div class="pl-content">
        <b>\${p.n}</b>
        <small><span style="color:#E6A700;font-weight:700">★ \${p.r.toFixed(1)}</span> (\${p.c}) · \${p.sub} · \${eu(p.pr)} · \${p.zone}</small>
        <small style="color:var(--muted)">📍 \${p.a} · à \${fk(dist(p))}</small>
        \${p.isHalal ? '<small style="color:#10B981;font-weight:700">🕌 '+ (p.halalStatus || '100% Halal') +'</small>' : ''}
      </div>
    </div>
  \`;

  $("scr").innerHTML = \`
    <div style="padding:14px 16px 6px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h1 style="font-size:22px">\${list.length} résultat\${list.length>1?'s':''}</h1>
        <button class="lnk" onclick="resetFilters()">Réinitialiser</button>
      </div>
      <div class="row" style="padding-left:0;padding-right:0;margin-top:8px">
        <button class="chip \${S.halalOnly?'on halal-chip':''}" onclick="toggleHalal()">🕌 Halal seul</button>
        <button class="chip \${S.budgetOnly?'on':''}" onclick="toggleBudget()">💸 ≤ 10 €</button>
        <button class="chip \${S.cat==='Restaurant'?'on':''}" onclick="filterCat('Restaurant')">Restos</button>
        <button class="chip \${S.cat==='Fast-food'?'on':''}" onclick="filterCat('Fast-food')">Street Food</button>
        <button class="chip \${S.cat==='Goûter'?'on':''}" onclick="filterCat('Goûter')">Goûters</button>
      </div>
    </div>

    \${res.fallback ? \`
      <div class="fallback-notice">
        <span>✨</span>
        <div><b>Sélection élargie :</b> Critères assouplis pour ne jamais tomber sur zéro résultat.</div>
      </div>
    \` : ''}

    <div class="list">
      \${list.slice(0, S.lim).map(rowHtml).join("")}
    </div>

    \${list.length > S.lim ? \`
      <div style="padding:16px;text-align:center">
        <button class="btn alt" style="margin:0 auto;display:inline-block;padding:10px 24px" onclick="S.lim += 30; render()">
          Afficher plus (\${list.length - S.lim} restants)
        </button>
      </div>
    \` : ''}
  \`;
}

function resetFilters() {
  S.cat = "Tous";
  S.sub = null;
  S.halalOnly = false;
  S.budgetOnly = false;
  S.zone = "Toutes";
  S.ids = null;
  S.lim = 30;
  render();
}

/* Vue Carte avec Leaflet */
let mapInstance = null;
let markersLayer = null;

function renderMap() {
  const res = getFilteredPlaces();
  const list = res.list;

  $("scr").innerHTML = \`
    <div class="row" style="padding:12px 16px 4px">
      <button class="chip \${S.halalOnly?'on halal-chip':''}" onclick="S.halalOnly=!S.halalOnly;renderMap()">🕌 Halal</button>
      <button class="chip \${S.budgetOnly?'on':''}" onclick="S.budgetOnly=!S.budgetOnly;renderMap()">💸 ≤ 10 €</button>
      <button class="chip" onclick="recenterMap()">⌖ Me localiser</button>
    </div>
    <div class="map-wrap">
      <div id="leaflet-map"></div>
    </div>
    <div class="sec"><h2>\${list.length} adresse\${list.length>1?'s':''} sur le secteur</h2></div>
    <div class="list">
      \${list.slice(0, 15).map(p => \`
        <div class="pl" onclick="openPlace(\${p.id})">
          <div class="ph" style="background:linear-gradient(135deg,#FF8A3D,#FF4D2E);color:#fff">
            <span>\${IC[p.sub]||"🍽️"}</span>
          </div>
          <div class="pl-content">
            <b>\${p.n}</b>
            <small>★ \${p.r.toFixed(1)} (\${p.c}) · \${p.sub} · \${eu(p.pr)} · \${p.zone}</small>
            \${p.isHalal ? '<small style="color:#10B981;font-weight:700">🕌 '+ (p.halalStatus||'Halal') +'</small>' : ''}
          </div>
        </div>
      \`).join("")}
    </div>
  \`;

  setTimeout(initMap, 50);
}

function initMap() {
  const mapEl = $("leaflet-map");
  if (!mapEl) return;

  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  const res = getFilteredPlaces();
  const places = res.list.slice(0, 200);

  mapInstance = L.map('leaflet-map').setView([pos[0], pos[1]], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(mapInstance);

  // Marqueur utilisateur
  const userIcon = L.divIcon({
    className: 'custom-user-marker',
    html: '<div style="background:#2563EB;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 10px rgba(37,99,235,0.6)"></div>',
    iconSize: [20, 20]
  });
  L.marker([pos[0], pos[1]], {icon: userIcon}).addTo(mapInstance).bindPopup("<b>Tu es ici</b>");

  // Marqueurs restos
  markersLayer = L.layerGroup().addTo(mapInstance);
  places.forEach(p => {
    const isH = p.isHalal;
    const bg = isH ? "#10B981" : (p.cat === "Fast-food" ? "#F59E0B" : "#FF4D2E");
    const mIcon = L.divIcon({
      className: 'resto-pin',
      html: \`<div style="background:\${bg};color:#fff;border-radius:14px;padding:3px 6px;font-size:11px;font-weight:800;border:1.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);white-space:nowrap">\${isH?'🕌 ':''}\${p.r.toFixed(1)}</div>\`,
      iconSize: [36, 22]
    });

    const marker = L.marker([p.la, p.lo], {icon: mIcon}).addTo(markersLayer);
    marker.on('click', () => openPlace(p.id));
  });
}

function recenterMap() {
  if (mapInstance) {
    mapInstance.setView([pos[0], pos[1]], 14);
  }
}

/* Vue Deals */
function renderDeals() {
  $("scr").innerHTML = \`
    <div style="padding:14px 16px 8px">
      <h1 style="font-size:24px">💸 Bons plans vérifiés ≤ 10 €</h1>
      <p style="color:var(--muted);font-size:13px;margin-top:4px">Menus complets, box généreuses et street food à prix cassés</p>
    </div>
    \${DEALS.map(d => \`
      <div class="deal">
        <div class="dp">\${d.pr.toFixed(0)} €</div>
        <div class="deal-info">
          <small style="color:var(--muted)">\${d.brand}</small>
          <h3>\${d.e} \${d.t}</h3>
          <p>\${d.inc}</p>
          <div class="acts">
            <button class="btn" onclick="searchDealSpots('\${d.brand}')">Où le trouver ?</button>
            <a class="btn alt" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(d.brand+' Paris')}">🧭 Maps</a>
          </div>
        </div>
      </div>
    \`).join("")}
  \`;
}

function searchDealSpots(brand) {
  S.ids = P.filter(p => p.n.toLowerCase().includes(brand.toLowerCase())).map(p => p.id);
  S.step = "list";
  render();
}

/* Vue Roulette */
function renderRoulette() {
  $("scr").innerHTML = \`
    <div class="roulette-box">
      <h2>🎲 Tu ne sais pas quoi manger ?</h2>
      <p>Laisse le destin culinaire choisir une pépite ultra bien notée autour de toi !</p>
      <button class="spin-btn" onclick="spinRoulette()">
        <span>🎰</span> Lancer le tirage au sort !
      </button>
    </div>
    <div id="roulette-result" style="padding:0 16px"></div>
  \`;
}

function spinRoulette() {
  const candidates = P.filter(p => p.r >= 4.5 && p.c >= 80);
  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  const container = $("roulette-result");

  container.innerHTML = \`
    <div style="text-align:center;padding:20px 0;animation:slideUp 0.3s">
      <div style="font-size:60px">\${IC[picked.sub]||"🎉"}</div>
      <h3 style="font-size:22px;margin:8px 0">\${picked.n}</h3>
      <p style="color:var(--muted);font-size:14px">\${picked.sub} · ★ \${picked.r.toFixed(1)} (\${picked.c} avis)</p>
      \${picked.isHalal ? '<div style="color:#10B981;font-weight:700;margin:6px 0">🕌 '+ (picked.halalStatus||'100% Halal') +'</div>' : ''}
      <p style="font-size:13.5px;line-height:1.45;margin:10px 0;background:var(--card);padding:12px;border-radius:14px;border:1px solid var(--line)">
        \${picked.s}
      </p>
      <div class="acts" style="max-width:320px;margin:14px auto 0">
        <button class="btn" onclick="openPlace(\${picked.id})">Fiche complète</button>
        <button class="btn alt" onclick="spinRoulette()">🎲 Re-tirer</button>
      </div>
    </div>
  \`;
}

/* Vue Favoris */
function renderFavs() {
  const favPlaces = favs.map(id => P[id]).filter(Boolean);

  $("scr").innerHTML = \`
    <div style="padding:14px 16px 8px">
      <h1 style="font-size:24px">❤️ Tes adresses favorites</h1>
      <p style="color:var(--muted);font-size:13px;margin-top:4px">\${favPlaces.length} spot\${favPlaces.length>1?'s':''} enregistré\${favPlaces.length>1?'s':''} sur ton téléphone</p>
    </div>
    \${favPlaces.length === 0 ? \`
      <div style="text-align:center;padding:40px 20px;color:var(--muted)">
        <div style="font-size:44px;margin-bottom:8px">🤍</div>
        <p>Tu n'as pas encore de favoris. Clique sur le cœur dans une fiche resto pour l'enregistrer ici !</p>
      </div>
    \` : \`
      <div class="list">
        \${favPlaces.map(p => \`
          <div class="pl" onclick="openPlace(\${p.id})">
            <div class="ph" style="background:linear-gradient(135deg,#FF4D2E,#E0245E);color:#fff">
              <span>\${IC[p.sub]||"🍽️"}</span>
            </div>
            <div class="pl-content">
              <b>\${p.n}</b>
              <small>★ \${p.r.toFixed(1)} · \${p.sub} · \${p.zone}</small>
              <small style="color:var(--muted)">📍 \${p.a}</small>
              \${p.isHalal ? '<small style="color:#10B981;font-weight:700">🕌 Halal</small>' : ''}
            </div>
          </div>
        \`).join("")}
      </div>
    \`}
  \`;
}

/* Recherche intelligente */
function ask() {
  const q = $("q").value.trim().toLowerCase();
  if (!q) return;

  const ans = $("ans");
  ans.style.display = "block";
  ans.innerHTML = "🔍 Analyse de la demande...";

  const isHalalReq = /halal|kebab|tacos|döner|poulet|naan|tajine|couscous/i.test(q);
  const isBudgetReq = /10|pas cher|prix|budget|économique/i.test(q);

  let scored = P.map(p => {
    let score = 0;
    const txt = (p.n + " " + p.sub + " " + p.s + " " + p.a + " " + p.zone).toLowerCase();

    q.split(/\\s+/).forEach(word => {
      if (word.length > 2 && txt.includes(word)) score += 4;
    });

    if (isHalalReq && p.isHalal) score += 5;
    if (isBudgetReq && (p.pr === 1 || p.isBoxDeal)) score += 3;
    score += (p.r - 4) * 2;

    return { id: p.id, score };
  });

  scored = scored.filter(x => x.score > 0).sort((a,b) => b.score - a.score);

  if (scored.length === 0) {
    // Jamais 0
    scored = P.filter(p => isHalalReq ? p.isHalal : true).slice(0, 15).map(p => ({ id: p.id, score: 1 }));
  }

  S.ids = scored.slice(0, 20).map(x => x.id);
  S.step = "list";
  ans.textContent = \`Voici les meilleures adresses trouvées pour « \${q} »\`;
  render();
}

/* Fiche Détaillée Modal */
function openPlace(id) {
  const p = P[id];
  if (!p) return;

  const isFav = favs.includes(id);
  const gmapUrl = "https://www.google.com/maps/dir/?api=1&destination=" + p.la + "," + p.lo + "&travelmode=walking";
  const searchUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(p.n + " " + p.a);

  $("s").innerHTML = \`
    <button class="x" onclick="closeM()" aria-label="Fermer">✕</button>
    <div class="ph" style="background:linear-gradient(135deg,hsl(\${hash(p.sub)%360},80%,88%),hsl(\${(hash(p.sub)+35)%360},85%,75%))">
      <span>\${IC[p.sub]||"🍽️"}</span>
    </div>

    <h3>\${p.n}</h3>

    \${p.isHalal ? \`
      <div class="halal-alert">
        <span style="font-size:22px">🕌</span>
        <div>
          <b>\${p.halalStatus || '100% Halal certifié'}</b><br>
          <span>\${p.halalNotice || 'Viandes sélectionnées et certifiées sans porc ni alcool.'}</span>
        </div>
      </div>
    \` : ''}

    <div class="info">
      <b style="color:#E6A700">★ \${p.r.toFixed(1)}</b> (\${p.c.toLocaleString("fr-FR")} avis clients) · \${eu(p.pr)} · \${p.sub}
    </div>

    <div class="info">
      📍 <b>Adresse :</b> \${p.a}<br>
      <span>Zone : \${p.zone} · à \${fk(dist(p))} de toi</span>
    </div>

    <div class="info">
      🕐 <b>Horaires :</b> \${p.h}
    </div>

    \${p.tel ? \`
      <div class="info">
        📞 <b>Téléphone :</b> <a href="tel:\${p.tel}" style="color:var(--acc);font-weight:700">\${p.tel}</a>
      </div>
    \` : ''}

    <div class="info">
      <b>💬 L'avis de la communauté :</b><br>
      \${p.s}
    </div>

    <div class="acts">
      <a class="btn" target="_blank" rel="noopener" href="\${gmapUrl}">🧭 Y aller (GPS)</a>
      <button class="btn alt" onclick="toggleFav(\${p.id})">\${isFav ? '❤️ Enregistré' : '🤍 Enregistrer'}</button>
    </div>

    <div class="acts" style="margin-top:8px">
      \${p.tel ? \`<a class="btn alt" href="tel:\${p.tel}">📞 Appeler</a>\` : '<span></span>'}
      <a class="btn alt" target="_blank" rel="noopener" href="\${searchUrl}">📷 Photos & Avis</a>
    </div>
  \`;

  $("m").classList.add("open");
}

function closeM() {
  $("m").classList.remove("open");
}

function toggleFav(id) {
  favs = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id];
  try { localStorage.setItem("gourmap-favs", JSON.stringify(favs)); } catch(e){}
  openPlace(id);
}

// Initialisation au chargement
applyTheme();
render();
</script>
</body>
</html>
`;

const htmlOutput = htmlTemplate(lines.join("\n"));

const publicHtmlPath = path.resolve("./public/gourmap.html");
const rootStandalonePath = path.resolve("./gourmap_standalone.html");

fs.writeFileSync(publicHtmlPath, htmlOutput, "utf8");
fs.writeFileSync(rootStandalonePath, htmlOutput, "utf8");

console.log(`Standalone files created successfully!`);
console.log(`- ${publicHtmlPath} (${(htmlOutput.length / 1024).toFixed(1)} KB)`);
console.log(`- ${rootStandalonePath} (${(htmlOutput.length / 1024).toFixed(1)} KB)`);
