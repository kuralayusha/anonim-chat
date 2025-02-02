"use client";

import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  // const [userUuid, setUserUuid] = useState<string>("");

  // useEffect(() => {
  //   // Sayfa yüklendiğinde yeni UUID oluştur
  //   const newUuid = uuidv4();
  //   setUserUuid(newUuid);

  //   // UUID'yi session storage'a kaydet
  //   sessionStorage.setItem("userUuid", newUuid);

  //   // Component unmount olduğunda UUID'yi temizle
  //   return () => {
  //     sessionStorage.removeItem("userUuid");
  //   };
  // }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-2xl text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Let's Chat Secretly
        </h1>
        <p className="text-xl mb-8">
          Güvenli ve anonim sohbet için hoş geldiniz. Mesajlarınız oturum
          sonunda silinir.
        </p>
        <Link
          href={`/anonymous-chat`}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-colors"
        >
          Sohbete Başla
        </Link>
      </div>
    </main>
  );
}
