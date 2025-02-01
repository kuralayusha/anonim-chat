import { IoLanguage } from "react-icons/io5";
import { Language } from "../lib/translations";

export default function LanguageToggle({
  currentLang,
  onToggle,
}: {
  currentLang: Language;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 p-2 w-full rounded bg-[#334155]/50 hover:bg-[#475569]/50 transition-colors text-sm text-[#94A3B8]"
    >
      <IoLanguage size={16} />
      <span>{currentLang.toUpperCase()}</span>
    </button>
  );
}
