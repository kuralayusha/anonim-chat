"use client";

import Link from "next/link";
import { useState } from "react";
import { translations, Language } from "../lib/translations";
import LanguageToggle from "../components/LanguageToggle";
import { IoCopy } from "react-icons/io5";
import { toast } from "react-toastify";

export default function Home() {
  const [lang, setLang] = useState<Language>("tr");
  const t = translations[lang];

  const toggleLanguage = () => {
    setLang((prev) => (prev === "tr" ? "en" : "tr"));
  };

  const handleCreateInviteLink = () => {
    const uuid = sessionStorage.getItem("userUUID");
    if (uuid) {
      const inviteLink = `${window.location.origin}/anonymous-chat?chat=${uuid}`;
      navigator.clipboard.writeText(inviteLink);
      toast.success(t.inviteLinkCopied);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="absolute top-4 right-4">
        <LanguageToggle currentLang={lang} onToggle={toggleLanguage} />
      </div>
      <div className="max-w-2xl text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">{t.title}</h1>
        <p className="text-xl mb-8">{t.description}</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/anonymous-chat"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-colors"
          >
            {t.startChat}
          </Link>
          <button
            onClick={handleCreateInviteLink}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors"
          >
            <IoCopy size={20} />
            {t.createInviteLink}
          </button>
        </div>
      </div>
    </main>
  );
}
