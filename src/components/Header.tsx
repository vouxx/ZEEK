"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "./ThemeProvider";

const NAV_ITEMS = [
  { href: "/", label: "최신" },
  { href: "/archive", label: "아카이브" },
  { href: "/subscribe", label: "구독" },
  { href: "/about", label: "소개" },
];

export function Header() {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const container = document.querySelector(".phone-scroll");
    if (!container) return;

    function onScroll() {
      const y = container!.scrollTop;
      setVisible(y < lastY.current || y < 10);
      lastY.current = y;
    }

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header
      className={`sticky top-0 z-10 border-b border-neutral-100 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-5">
        <Link href="/" className="font-mono text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          ZEEK
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`transition-colors ${
                isActive(href)
                  ? "text-neutral-900 dark:text-neutral-100 font-medium"
                  : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
              }`}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={toggle}
            className="ml-1 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            aria-label="다크모드 전환"
          >
            {theme === "light" ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 12.5a5.5 5.5 0 01 0-11v11z" fill="currentColor"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 1v2m0 10v2m-7-7h2m10 0h2m-2.05-4.95-1.41 1.41m-7.08 7.08-1.41 1.41m0-9.9 1.41 1.41m7.08 7.08 1.41 1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
