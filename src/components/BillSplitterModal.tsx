import React, { useState } from "react";
import {
  X,
  Calculator,
  Users,
  Copy,
  Check,
  Share2,
  Euro,
  Sparkles,
  Receipt,
  HeartHandshake,
} from "lucide-react";

interface BillSplitterModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName?: string;
}

export const BillSplitterModal: React.FC<BillSplitterModalProps> = ({
  isOpen,
  onClose,
  restaurantName,
}) => {
  const [totalBill, setTotalBill] = useState<string>("45");
  const [peopleCount, setPeopleCount] = useState<number>(3);
  const [tipPercent, setTipPercent] = useState<number>(5);
  const [copied, setCopied] = useState<boolean>(false);
  const [customNote, setCustomNote] = useState<string>("");

  if (!isOpen) return null;

  const billNum = parseFloat(totalBill.replace(",", ".")) || 0;
  const tipAmount = (billNum * tipPercent) / 100;
  const grandTotal = billNum + tipAmount;
  const perPerson = peopleCount > 0 ? grandTotal / peopleCount : 0;

  const generateShareText = () => {
    const resto = restaurantName ? `chez ${restaurantName}` : "au restaurant";
    return `🍽️ Note pour notre repas ${resto} :\n💰 Total : ${grandTotal.toFixed(2)} € (pour ${peopleCount} personnes)\n👉 C'est ${perPerson.toFixed(2)} € par personne !\n${customNote ? `💬 ${customNote}\n` : ""}📱 Merci de me virer via Lydia / Wero / Revolut ! ✨`;
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(generateShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#0D1322] text-[#F1F5F9] rounded-3xl border border-slate-700/80 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden p-5 sm:p-6 max-h-[92vh] overflow-y-auto no-scrollbar animate-slideUp"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-gradient-to-b from-amber-500/15 via-indigo-500/10 to-transparent blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-white">Partage de l'Addition</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Outil Utile
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {restaurantName ? `Calcul express pour ${restaurantName}` : "Calculez et partagez en 1 clic"}
            </p>
          </div>
        </div>

        {/* Main Result Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700/80 mb-5 text-center relative overflow-hidden">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Chacun paye
          </div>
          <div className="text-4xl sm:text-5xl font-black text-amber-400 tracking-tight">
            {perPerson.toFixed(2)} <span className="text-2xl text-amber-300/80">€</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-center gap-2">
            <span>Total : {grandTotal.toFixed(2)} €</span>
            <span>·</span>
            <span>{peopleCount} personnes</span>
            {tipPercent > 0 && (
              <>
                <span>·</span>
                <span className="text-emerald-400">+{tipAmount.toFixed(2)}€ pourboire</span>
              </>
            )}
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4 mb-5">
          {/* Bill Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Montant Total de l'Addition</span>
              <Receipt className="w-3.5 h-3.5 text-slate-400" />
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="0"
                value={totalBill}
                onChange={(e) => setTotalBill(e.target.value)}
                placeholder="Ex: 45"
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-lg font-bold text-white focus:outline-hidden focus:border-amber-400 pr-10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                €
              </span>
            </div>
          </div>

          {/* People Count Slider & Quick Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Nombre de personnes : <strong className="text-amber-400 text-sm font-extrabold">{peopleCount}</strong></span>
              <Users className="w-3.5 h-3.5 text-slate-400" />
            </label>
            <div className="flex items-center gap-2">
              {[2, 3, 4, 5, 6, 8].map((num) => (
                <button
                  key={num}
                  onClick={() => setPeopleCount(num)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    peopleCount === num
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25"
                      : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Tip / Extra */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Pourboire Serveur / Arrondi</span>
              <HeartHandshake className="w-3.5 h-3.5 text-slate-400" />
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 5, 10, 15].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setTipPercent(pct)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    tipPercent === pct
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                      : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {pct === 0 ? "0%" : `+${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Note (Lydia / IBAN link) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Lien de paiement ou message (optionnel)
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Ex: Mon Lydia : 06 12 34 56 78 ou lien Wero"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
            />
          </div>
        </div>

        {/* Action Buttons: Copy for WhatsApp / Lydia */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/25 transition-transform active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>Texte copié ! Prêt à coller sur WhatsApp</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-950" />
                <span>Copier le récap pour WhatsApp / SMS</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-500">
            Partage directement la somme exacte avec tes amis en un seul clic.
          </p>
        </div>
      </div>
    </div>
  );
};
