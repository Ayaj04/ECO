"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import clsx from "clsx";
import CallButton from "./CallButton";
import ContactDialog from "./ContactDialog";

interface MenuItem {
  label: string;
  href: string;
}

type LinkEntry = { type: "link"; id: string; label: string };
type MenuEntry = {
  type: "menu";
  menuId: string;
  label: string;
  /** Which edge of the button the dropdown lines up with. */
  align: "left" | "right";
  items: MenuItem[];
  /** Section this menu is highlighted for while it is on screen. */
  spyId?: string;
};

/**
 * The navigation, in order. A "link" scrolls to a section. A "menu" opens a dropdown.
 * A menu item whose href is "#" is a placeholder until its page exists.
 */
const navEntries: Array<LinkEntry | MenuEntry> = [
  {
    type: "menu",
    menuId: "nav-who-menu",
    label: "Who We Are",
    align: "left",
    spyId: "#who-we-are",
    items: [{ label: "About Us", href: "#about" }],
  },
  { type: "link", id: "#expertise", label: "How We Execute" },
  {
    type: "menu",
    menuId: "nav-products-menu",
    label: "Products",
    align: "right",
    items: [
      { label: "ACE AI", href: "#" },
      { label: "Studio Agentic", href: "#" },
    ],
  },
];

/** Sections the scroll spy follows, in page order. */
const spyTargets = navEntries.flatMap((entry) =>
  entry.type === "link" ? [entry.id] : entry.spyId ? [entry.spyId] : [],
);

/** Smooth-scroll to a section (through Lenis when it is running) and record it in the address. */
function scrollToHash(targetId: string) {
  const targetEl = document.querySelector(targetId);
  if (!targetEl) return;

  const windowWithLenis = window as unknown as {
    lenis?: { scrollTo: (target: Element | string, opts?: { offset?: number }) => void };
  };
  if (windowWithLenis.lenis) {
    windowWithLenis.lenis.scrollTo(targetEl, { offset: -40 });
  } else {
    targetEl.scrollIntoView({ behavior: "smooth" });
  }

  window.history.pushState(null, "", targetId);
}

interface NavMenuProps {
  entry: MenuEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** True while the section this menu follows is the one being read. */
  active: boolean;
  onNavigate: (href: string) => void;
}

function NavMenu({ entry, open, onOpenChange, active, onNavigate }: NavMenuProps) {
  const { menuId, label, align, items, spyId } = entry;
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const lastPointer = useRef("");

  const openMenu = () => {
    window.clearTimeout(closeTimer.current);
    onOpenChange(true);
  };

  // A short delay lets the pointer cross the gap between the button and the panel.
  const closeSoon = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => onOpenChange(false), 140);
  };

  // While open: close on a press outside, or on Escape (and return focus to the button).
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) onOpenChange(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  return (
    <div
      ref={wrapRef}
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") openMenu();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") closeSoon();
      }}
      onBlur={(e) => {
        // Close when keyboard focus leaves the button and the panel.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onOpenChange(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onPointerDown={(e) => {
          lastPointer.current = e.pointerType;
        }}
        onKeyDown={() => {
          lastPointer.current = "key";
        }}
        onClick={() => {
          // With a mouse the menu is already open from hovering, so a click must not close it.
          if (lastPointer.current === "mouse") return;
          onOpenChange(!open);
        }}
        className={clsx(
          "relative flex items-center gap-1 rounded-full px-2 py-1.5 font-heading text-[9px] font-bold uppercase tracking-normal outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ecovis-red/70 min-[400px]:gap-1.5 min-[400px]:px-3 min-[400px]:text-[10px] min-[400px]:tracking-wider md:px-4 md:py-2 md:text-xs md:tracking-widest",
          active || open ? "text-ecovis-white" : "text-gray-300 hover:text-white",
          open && !active && "bg-white/15 ring-1 ring-inset ring-white/25",
        )}
      >
        {active && (
          <motion.div
            layoutId="activeTabIndicator"
            className="absolute inset-0 z-0 rounded-full border border-white/25 bg-white/15"
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
          />
        )}

        {/* Red status dot, for menus that follow a section */}
        {spyId && (
          <span
            className={clsx(
              "z-10 h-1.5 w-1.5 rounded-full transition-all duration-300",
              active ? "scale-100 bg-ecovis-red opacity-100" : "scale-0 bg-transparent opacity-0",
            )}
          />
        )}

        <span className="relative z-10 whitespace-nowrap">{label}</span>
        <ChevronDown
          aria-hidden="true"
          className={clsx("relative z-10 size-3 transition-transform duration-300", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{ transformOrigin: align === "left" ? "top left" : "top right" }}
            className={clsx("absolute top-full z-50 pt-5", align === "left" ? "left-0" : "right-0")}
          >
            <ul className="min-w-[13rem] rounded-2xl border border-white/15 bg-ecovis-black/95 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl">
              {items.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={(e) => {
                      if (item.href.startsWith("#")) {
                        e.preventDefault();
                        if (item.href !== "#") onNavigate(item.href);
                      }
                      onOpenChange(false);
                    }}
                    className="group flex items-center justify-between gap-6 rounded-xl px-4 py-3 font-heading text-[11px] font-bold uppercase tracking-widest text-gray-300 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:text-white md:text-xs"
                  >
                    <span className="whitespace-nowrap">{item.label}</span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [activeTab, setActiveTab] = useState<string>("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      // Section spy detection
      const scrollPosition = window.scrollY + window.innerHeight * 0.35;

      const sections = spyTargets.map((id) => {
        const el = document.querySelector(id);
        return {
          id,
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
    scrollToHash(targetId);
  };

  // Only one dropdown is open at a time. Closing only applies if that menu is still the open one.
  const setMenuOpen = (id: string, next: boolean) =>
    setOpenMenu((current) => (next ? id : current === id ? null : current));

  return (
    // reducedMotion="user" drops the slide and scale animations for visitors who ask for less motion
    <MotionConfig reducedMotion="user">
      <header className="fixed top-6 md:top-8 right-3 min-[400px]:right-6 md:right-10 z-40 flex flex-col items-end gap-3">
        <nav
          aria-label="Quick navigation"
          className={`relative z-20 flex items-center gap-0.5 min-[400px]:gap-1 md:gap-2 px-1.5 py-1.5 min-[400px]:px-2 md:px-3 md:py-2 rounded-full border transition-all duration-500 backdrop-blur-xl ${
            isScrolled
              ? "bg-ecovis-black/90 border-white/20 shadow-2xl shadow-black/40"
              : "bg-ecovis-black/80 border-black/10 shadow-lg shadow-black/20"
          }`}
        >
          {navEntries.map((entry) => {
            if (entry.type === "menu") {
              return (
                <NavMenu
                  key={entry.menuId}
                  entry={entry}
                  open={openMenu === entry.menuId}
                  onOpenChange={(next) => setMenuOpen(entry.menuId, next)}
                  active={Boolean(entry.spyId) && activeTab === entry.spyId}
                  onNavigate={scrollToHash}
                />
              );
            }

            const isActive = activeTab === entry.id;

            return (
              <a
                key={entry.id}
                href={entry.id}
                onClick={(e) => handleTabClick(e, entry.id)}
                data-cursor="GO TO"
                className={`relative px-2 min-[400px]:px-3 md:px-4 py-1.5 md:py-2 text-[9px] min-[400px]:text-[10px] md:text-xs font-heading font-bold uppercase tracking-normal min-[400px]:tracking-wider md:tracking-widest transition-colors duration-300 rounded-full flex items-center gap-1 min-[400px]:gap-1.5 ${
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
                  {entry.label}
                </span>
              </a>
            );
          })}
        </nav>

        <CallButton dimmed={openMenu !== null} onOpen={() => setContactOpen(true)} />
      </header>

      <ContactDialog open={contactOpen} onClose={() => setContactOpen(false)} />
    </MotionConfig>
  );
}
