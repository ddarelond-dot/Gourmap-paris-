import React, { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  if (showReconnected) {
    return (
      <div className="fixed bottom-20 left-4 right-4 md:left-6 md:right-auto z-50 flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xl animate-fade-in">
        <Wifi className="w-4 h-4 shrink-0" />
        <span>Connexion rétablie ! Données synchronisées.</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-6 md:right-auto z-50 flex items-center gap-2 rounded-2xl bg-slate-900 border border-emerald-500/40 px-4 py-2 text-xs font-bold text-white shadow-xl animate-fade-in backdrop-blur-md">
      <WifiOff className="w-4 h-4 text-emerald-400 shrink-0" />
      <span>Mode Hors-Ligne activé — Les 2 050 adresses restent accessibles !</span>
    </div>
  );
};
