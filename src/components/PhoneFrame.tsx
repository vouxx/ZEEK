"use client";

import { useCallback, useEffect, useState } from "react";
import { StatusBar } from "./StatusBar";
import { HomeIndicator } from "./HomeIndicator";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Intro } from "./Intro";

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem("zeek-intro-seen")) setShowIntro(true);
    } catch { /* 인앱 브라우저 등 storage 접근 불가 */ }
  }, []);

  const handleIntroDone = useCallback(() => {
    sessionStorage.setItem("zeek-intro-seen", "1");
    setShowIntro(false);
  }, []);

  return (
    <div className="relative w-[390px] h-[844px] flex flex-col rounded-[3rem] bg-white dark:bg-neutral-900 overflow-hidden shadow-2xl ring-[6px] ring-neutral-800">
      {showIntro && <Intro onDone={handleIntroDone} />}
      <StatusBar />
      <div className="phone-scroll flex-1 flex flex-col overflow-y-auto pt-12 pb-4 hide-scrollbar">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <HomeIndicator />
    </div>
  );
}
