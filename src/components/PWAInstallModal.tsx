import React, { useState } from "react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import {
  Smartphone,
  Download,
  Share2,
  PlusSquare,
  CheckCircle2,
  X,
  Sparkles,
  Zap,
  WifiOff,
  Copy,
  ExternalLink,
  QrCode,
  ShieldCheck,
  Check,
  ChevronRight,
} from "lucide-react";

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<"ios" | "android">(isIOS ? "ios" : "android");
  const [isInstalling, setIsInstalling] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [manualConfirmed, setManualConfirmed] = useState(false);

  if (!isOpen) return null;

  const appUrl =
    typeof window !== "undefined"
      ? window.location.href.replace(/\/$/, "")
      : "https://ais-pre-mwbdxiqt7y65uaatbjrw7j-26279492469.europe-west2.run.app";

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      if (isInstallable) {
        const success = await install();
        if (success) {
          setManualConfirmed(true);
        }
      } else {
        setActiveTab(isIOS ? "ios" : "android");
      }
    } catch (e) {
      console.warn("Installation handled gracefully:", e);
      setActiveTab(isIOS ? "ios" : "android");
    } finally {
      setIsInstalling(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-[#0A0A10] text-[#F9F9FB] rounded-3xl border border-amber-500/30 shadow-[0_15px_60px_rgba(0,0,0,0.85)] shadow-amber-500/10 overflow-hidden p-5 sm:p-6 max-h-[92vh] overflow-y-auto no-scrollbar animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Gold Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-24 bg-gradient-to-b from-amber-500/20 via-amber-600/10 to-transparent blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer border border-zinc-800"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with App Logo */}
        <div className="flex items-center gap-3.5 mb-5 relative">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/30 text-2xl font-black shrink-0 border border-amber-300">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-black text-xl tracking-tight text-white">
                Gour<span className="text-gold-gradient font-black">Map</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/35 shadow-sm">
                ⭐ Édition 24K
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">
              Comment installer l'app directement sur ton téléphone (iPhone ou Android)
            </p>
          </div>
        </div>

        {/* Confirmed State */}
        {isInstalled || manualConfirmed ? (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-400" />
            <div className="text-xs leading-relaxed text-zinc-200">
              <strong className="block font-bold text-sm text-emerald-400">
                Application prête sur ton mobile !
              </strong>
              GourMap est directement accessible en 1 clic sur ton écran d'accueil sans pub et sans barre de recherche.
            </div>
          </div>
        ) : null}

        {/* Value Props */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="p-3.5 rounded-2xl bg-[#12121A] border border-amber-500/20 shadow-sm">
            <Zap className="w-4 h-4 text-amber-400 mb-1.5" />
            <div className="text-xs font-bold text-zinc-100">1 Clic sur l'écran</div>
            <div className="text-[11px] text-zinc-400">
              Plein écran immersif sans Safari / Chrome
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#12121A] border border-emerald-500/20 shadow-sm">
            <WifiOff className="w-4 h-4 text-emerald-400 mb-1.5" />
            <div className="text-xs font-bold text-zinc-100">100% Hors-Ligne</div>
            <div className="text-[11px] text-zinc-400">
              Les 2 050 pépites marchent dans le métro
            </div>
          </div>
        </div>

        {/* Operating System Selector */}
        <div className="flex p-1 rounded-2xl bg-[#08080C] border border-zinc-800 mb-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab("ios")}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "ios"
                ? "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-zinc-950 shadow-md font-extrabold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>🍏 iPhone (Safari)</span>
          </button>
          <button
            onClick={() => setActiveTab("android")}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "android"
                ? "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-zinc-950 shadow-md font-extrabold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>🤖 Android (Chrome)</span>
          </button>
        </div>

        {/* Step-by-step instructions according to selected OS */}
        {activeTab === "ios" ? (
          <div className="p-4 rounded-2xl bg-[#12121A] border border-amber-500/25 space-y-3.5 mb-4 text-xs shadow-inner">
            <div className="flex items-center justify-between text-amber-300 font-bold text-xs uppercase tracking-wider pb-2 border-b border-zinc-800/80">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                Guide Express iPhone (Safari)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                10 secondes
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-zinc-950 flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-sm">
                1
              </div>
              <div className="text-zinc-200">
                Ouvre cette page avec <strong className="text-white">Safari</strong> sur ton iPhone (évite Chrome ou Instagram sur iOS).
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-zinc-950 flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-sm">
                2
              </div>
              <div className="text-zinc-200">
                En bas au centre de Safari, appuie sur le bouton <strong className="text-amber-300">Partager</strong> (le carré avec une flèche vers le haut <Share2 className="w-3.5 h-3.5 inline text-amber-400 font-bold" />).
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-zinc-950 flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-sm">
                3
              </div>
              <div className="text-zinc-200">
                Fais glisser le menu vers le bas et clique sur <strong className="text-amber-300">« Sur l'écran d'accueil »</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-emerald-400" />).
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-zinc-950 flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-sm">
                4
              </div>
              <div className="text-zinc-200">
                Appuie sur <strong className="text-amber-300">« Ajouter »</strong> en haut à droite. Voilà ! L'icône dorée GourMap est posée sur ton écran comme une appli de l'App Store.
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#12121A] border border-amber-500/25 space-y-3.5 mb-4 text-xs shadow-inner">
            <div className="flex items-center justify-between text-emerald-300 font-bold text-xs uppercase tracking-wider pb-2 border-b border-zinc-800/80">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                Guide Express Android (Chrome / Samsung)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                5 secondes
              </span>
            </div>

            {isInstallable && (
              <button
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-extrabold text-xs text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:brightness-110 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer mb-2"
              >
                <Download className="w-4 h-4 text-zinc-950" />
                <span>{isInstalling ? "Installation en cours..." : "Installer en 1 Clic Direct"}</span>
              </button>
            )}

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 text-zinc-950 flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-sm">
                1
              </div>
              <div className="text-zinc-200">
                Ouvre cette page dans <strong className="text-white">Google Chrome</strong> ou Samsung Internet sur ton smartphone.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 text-zinc-950 flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-sm">
                2
              </div>
              <div className="text-zinc-200">
                Appuie sur les <strong className="text-emerald-300">3 points verticaux (⋮)</strong> situés tout en haut à droite.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 text-zinc-950 flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-sm">
                3
              </div>
              <div className="text-zinc-200">
                Choisis <strong className="text-emerald-300">« Installer l'application »</strong> ou <strong className="text-emerald-300">« Ajouter à l'écran d'accueil »</strong>.
              </div>
            </div>
          </div>
        )}

        {/* Copy direct URL to send to phone via WhatsApp / AirDrop / Note */}
        <div className="p-3.5 rounded-2xl bg-[#08080C] border border-amber-500/20 flex items-center justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-wider block">
              Lien direct à envoyer sur ton téléphone :
            </span>
            <span className="text-xs text-zinc-300 font-mono truncate block mt-0.5">
              {appUrl}
            </span>
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#1A1A24] hover:bg-zinc-800 text-white shrink-0 transition-colors cursor-pointer border border-zinc-700"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>Copier</span>
              </>
            )}
          </button>
        </div>

        {/* Bottom confirmation button */}
        <button
          onClick={() => {
            setManualConfirmed(true);
            setTimeout(onClose, 400);
          }}
          className="w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm text-zinc-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          Parfait, j'ai compris ! Fermer
        </button>
      </div>
    </div>
  );
};
