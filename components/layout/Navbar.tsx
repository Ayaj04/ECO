"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface NavTab {
  id: string;
  label: string;
}

const navTabs: NavTab[] = [
  { id: "#how-we-are", label: "How We Are" },
  { id: "#expertise", label: "What We Do" },
];

export default function Navbar() {
  const [activeTab, setActiveTab] = useState<string>("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      // Section spy detection
      const scrollPosition = window.scrollY + window.innerHeight * 0.35;
      
      const sections = navTabs.map(tab => {
        const el = document.querySelector(tab.id);
        return {
          id: tab.id,
          top: el ? (el as HTMLElement).offsetTop : 0,
          height: el ? (el as HTMLElement).offsetHeight : 0,
        };
      });

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (scrollPosition >= section.top - 100) {
          setActiveTab(section.id);
          return;
        }
      }

      if (window.scrollY < 200) {
        setActiveTab("");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setActiveTab(targetId);

    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;

    // Use Lenis smooth scroll if available
    const windowWithLenis = window as unknown as { lenis?: { scrollTo: (target: Element | string, opts?: { offset?: number }) => void } };
    if (windowWithLenis.lenis) {
      windowWithLenis.lenis.scrollTo(targetEl, { offset: -40 });
    } else {
      targetEl.scrollIntoView({ behavior: "smooth" });
    }

    window.history.pushState(null, "", targetId);
  };

  return (
    <header className="fixed top-6 md:top-8 right-6 md:right-10 z-40">
      <nav
        aria-label="Quick navigation"
        className={`flex items-center gap-1 md:gap-2 px-2 py-1.5 md:px-3 md:py-2 rounded-full border transition-all duration-500 backdrop-blur-xl ${
          isScrolled
            ? "bg-ecovis-black/90 border-white/20 shadow-2xl shadow-black/40"
            : "bg-ecovis-black/80 border-black/10 shadow-lg shadow-black/20"
        }`}
      >
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <a
              key={tab.id}
              href={tab.id}
              onClick={(e) => handleTabClick(e, tab.id)}
              data-cursor="GO TO"
              className={`relative px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-heading font-bold uppercase tracking-wider md:tracking-widest transition-colors duration-300 rounded-full flex items-center gap-1.5 ${
                isActive
                  ? "text-ecovis-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-white/15 border border-white/25 rounded-full z-0"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}

              {/* Red status indicator for active tab */}
              <span
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 z-10 ${
                  isActive
                    ? "bg-ecovis-red scale-100 opacity-100"
                    : "bg-transparent scale-0 opacity-0"
                }`}
              />

              <span className="relative z-10 whitespace-nowrap">
                {tab.label}
              </span>
            </a>
          );
        })}
      </nav>
    </header>
  );
}
