"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { MotionConfig, motion, useMotionValueEvent, useScroll } from "framer-motion";

interface PersonBioItem {
  heading?: string;
  text: string;
}

interface Person {
  name: string;
  role: string;
  photo: string;
  linkedin?: string;
  bioItems?: PersonBioItem[];
}

interface Stage {
  key: string;
  label: string;
  /** Width of each photo before the screen height limits it. Phones and small screens get a swipeable row. */
  photoClass: string;
  /** The row scrolls sideways below this breakpoint and is centred above it. */
  rowClass: string;
  /** Smaller type, for the group with the most cards, so names and roles stay on one line. */
  dense?: boolean;
  people: Person[];
}

const STAGES: Stage[] = [
  {
    key: "founders",
    label: "Founders",
    photoClass: "[--pw-base:min(62vw,240px)] md:[--pw-base:clamp(200px,21vw,300px)]",
    rowClass: "md:justify-center md:overflow-visible md:px-0",
    people: [
      {
        name: "Lt. R.L. Kabra",
        role: "Co-Founder",
        photo: "/images/board/rl-kabra.webp",
        linkedin: "https://www.linkedin.com/company/ecovis-rkca/",
        bioItems: [
          {
            heading: "FCA, Founding Patriarch",
            text: "40+ years in statutory audit, taxation, and pioneering corporate advisory ethics.",
          },
          {
            heading: "Co-Founder – RKCA Group",
            text: "Established the cornerstone principles of integrity, accuracy, and client stewardship.",
          },
          {
            heading: "Legacy of Mentorship",
            text: "Guided and inspired generations of financial leaders across India's industrial landscape.",
          },
        ],
      },
      {
        name: "Lt. R.S. Kela",
        role: "Co-Founder",
        photo: "/images/board/rs-kela.webp",
        linkedin: "https://www.linkedin.com/company/ecovis-rkca/",
        bioItems: [
          {
            heading: "FCA, Co-Founder",
            text: "40+ years in direct taxation, corporate structuring, and cross-border advisory.",
          },
          {
            heading: "Architect of Expansion",
            text: "Instrumental in expanding RKCA from a regional practice into a nationwide network.",
          },
          {
            heading: "Senior Trusted Counsel",
            text: "Strategic advisor to prominent industrial houses, institutions, and family offices.",
          },
        ],
      },
    ],
  },
  {
    key: "mentors",
    label: "Mentors",
    photoClass: "[--pw-base:min(62vw,240px)] md:[--pw-base:clamp(180px,19vw,270px)]",
    rowClass: "md:justify-center md:overflow-visible md:px-0",
    people: [
      {
        name: "Rohan Desai",
        role: "Mentor",
        photo: "/images/board/rohan-desai.webp",
        linkedin: "https://www.linkedin.com/company/ecovis-rkca/",
        bioItems: [
          {
            heading: "MBA, Senior Advisor",
            text: "28+ years in global strategy, private equity, and enterprise transformation.",
          },
          {
            heading: "Venture & Growth Strategy",
            text: "Advising leadership on global market expansion and operational excellence.",
          },
          {
            heading: "Ecosystem Builder",
            text: "Active participant in leadership forums and international advisory boards.",
          },
        ],
      },
      {
        name: "Priya Sharma",
        role: "Mentor",
        photo: "/images/board/priya-sharma.webp",
        linkedin: "https://www.linkedin.com/company/ecovis-rkca/",
        bioItems: [
          {
            heading: "Human Capital Strategist",
            text: "25+ years in organizational transformation, talent strategy, and board governance.",
          },
          {
            heading: "Executive Leadership Coach",
            text: "Specialist in enterprise agility, culture building, and succession planning.",
          },
          {
            heading: "Independent Board Member",
            text: "Advising civic bodies, technology firms, and social innovation platforms.",
          },
        ],
      },
      {
        name: "Karan Malhotra",
        role: "Mentor",
        photo: "/images/board/karan-malhotra.webp",
        linkedin: "https://www.linkedin.com/company/ecovis-rkca/",
        bioItems: [
          {
            heading: "CA, Financial Strategist",
            text: "30+ years in international trade, investment banking, and capital markets.",
          },
          {
            heading: "Global Investment Advisor",
            text: "Navigating cross-border M&A and institutional fund deployment across regions.",
          },
          {
            heading: "Industry Thought Leader",
            text: "Speaker at international economic forums and business chambers.",
          },
        ],
      },
    ],
  },
  {
    key: "leaders",
    label: "Leaders",
    photoClass: "[--pw-base:min(54vw,190px)] xl:[--pw-base:clamp(150px,13vw,230px)]",
    rowClass: "xl:justify-center xl:overflow-visible xl:px-0",
    dense: true,
    people: [
      {
        name: "Dheeraj Rathi",
        role: "Technical",
        photo: "/images/board/dheeraj-rathi.webp",
        linkedin: "https://www.linkedin.com/in/dheerajrathi/",
        bioItems: [
          {
            heading: "BE, MBA (SJMSOM, IIT Bombay)",
            text: "25+ years in Business Strategy, Technology, and Governance Consulting.",
          },
          {
            heading: "Managing Director – ECOVIS RKCA",
            text: "Leading international network integration, digital transformation, and corporate growth.",
          },
          {
            heading: "Active Mentor & Investor",
            text: "Advisor to high-growth tech ventures, skill building initiatives, and healthcare startups.",
          },
        ],
      },
      {
        name: "Deepa Rathi",
        role: "Compliance & Governance",
        photo: "/images/board/deepa-rathi.webp",
        linkedin: "https://www.linkedin.com/in/deepa-rathi-7b243b18/",
        bioItems: [
          {
            heading: "FCA, DISA (ICAI)",
            text: "24+ years in Financial Restructuring, Corporate Law, and Information Systems Audit.",
          },
          {
            heading: "GRC Authority & Partner",
            text: "Governance, Risk and Compliance specialist and registered Resolution Professional (IBBI).",
          },
          {
            heading: "Regulatory & Women Leader",
            text: "Advising multinational enterprises on SEBI compliance and corporate governance best practices.",
          },
        ],
      },
      {
        name: "D.Balasubramaniam",
        role: "Finance",
        photo: "/images/board/bala-subramanian.webp",
        linkedin: "https://www.linkedin.com/in/balasubramaniam-durgavarjhula-53603417/",
        bioItems: [
          {
            heading: "Registered Valuer & Finance Expert",
            text: "20+ years in Financial Advisory, Valuation, Capital Structuring, and Corporate Advisory.",
          },
          {
            heading: "Director – ECOVIS RKCA Advisors",
            text: "Leading cross-border transactions, independent business valuations, and M&A advisory.",
          },
          {
            heading: "Fintech & Supply Chain Advisor",
            text: "Advising multinational corporations, institutional funds, and innovative trade platforms.",
          },
        ],
      },
      {
        name: "Sanjeev Bindal",
        role: "Legal",
        photo: "/images/board/pankaj-bhargava.webp",
        linkedin: "https://www.linkedin.com/in/sanjeev-bindal-3a588b15/",
        bioItems: [
          {
            heading: "Advocate & Insolvency Professional",
            text: "23+ years in Corporate Litigation, M&A Legal Advisory, and Dispute Resolution.",
          },
          {
            heading: "Partner – RKCA (Law) Associates LLP",
            text: "Expert in joint ventures, IPOs, cross-border contracts, and company law compliance.",
          },
          {
            heading: "Tribunal & High Court Counsel",
            text: "Regularly representing corporate and institutional clients before NCLT and High Courts.",
          },
        ],
      },
      {
        name: "Pankaj Bhargava",
        role: "Strategic & Performance",
        photo: "/images/board/sanjeev-bindal.webp",
        linkedin: "https://www.linkedin.com/in/pankaj-bhargava-669b775/",
        bioItems: [
          {
            heading: "MBA (Strategy & Leadership)",
            text: "30+ years in Growth Consulting, HR Strategy, and Organizational Development.",
          },
          {
            heading: "Leader – Strategy & Performance",
            text: "Empowering enterprises across India, Middle East, and Southeast Asia to scale sustainably.",
          },
          {
            heading: "Corporate Director & Advisor",
            text: "Specialist in human capital transformation, executive coaching, and performance architectures.",
          },
        ],
      },
    ],
  },
];

/** Every portrait has this shape, so the photo box matches it and no face is cropped. */
const PHOTO_RATIO = 215 / 247;
/** A photo may be at most this tall, as a share of the screen height, so every group fits a short window. */
const PHOTO_MAX_SVH = 32;
/** The same limit as a width: the tallest photo the screen allows, times the shape above. */
const PHOTO_MAX_WIDTH = `${(PHOTO_MAX_SVH * PHOTO_RATIO).toFixed(2)}svh`;

/** Total height of the section, in screens. The page scrolls through it while the stage stays in view. */
const SECTION_SCREENS = 2.8;
/** How far through the section (0 to 1) each change happens: founders to mentors, then mentors to leaders. */
const BREAKS = [0.34, 0.67] as const;

const stageFor = (p: number) => (p < BREAKS[0] ? 0 : p < BREAKS[1] ? 1 : 2);

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// A stage that is not current sits above (already passed) or below (still to come) and fades out.
const layerVariants = {
  in: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT, delay: 0.25, delayChildren: 0.3, staggerChildren: 0.08 },
  },
  up: { opacity: 0, y: -30, transition: { duration: 0.28, ease: "easeIn" as const } },
  down: { opacity: 0, y: 30, transition: { duration: 0.28, ease: "easeIn" as const } },
};

const cardVariants = {
  in: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE_OUT } },
  up: { opacity: 0, y: -18, scale: 0.97, transition: { duration: 0.22 } },
  down: { opacity: 0, y: 18, scale: 0.97, transition: { duration: 0.22 } },
};

/** Thin curved lines in the corners, echoing the ribbon elsewhere on the site. */
function Swoosh({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg aria-hidden="true" viewBox="0 0 420 300" fill="none" className={className}>
      <defs>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#E10600" stopOpacity="0.07" />
          <stop offset="1" stopColor="#E10600" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="130" cy="135" rx="150" ry="75" fill={`url(#${id}-glow)`} />
      <path d="M0 268C120 240 230 170 330 90S392 28 420 0" stroke="#000" strokeOpacity="0.06" />
      <path d="M0 210C100 205 200 150 300 80S380 20 410 0" stroke="#000" strokeOpacity="0.07" />
      <path d="M0 175C90 190 180 150 260 95S362 22 402 0" stroke="#E10600" strokeWidth="2" />
    </svg>
  );
}

function PersonCard({ person, dense = false }: { person: Person; dense?: boolean }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.article
      variants={cardVariants}
      style={
        {
          "--pw": `min(var(--pw-base), ${PHOTO_MAX_WIDTH})`,
          width: "calc(var(--pw) + var(--pad) * 2)",
        } as React.CSSProperties
      }
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped((prev) => !prev)}
      className="group shrink-0 snap-center select-none [--pad:16px] md:[--pad:20px]"
    >
      <div className="relative w-full [perspective:1200px]">
        <div
          style={{
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
          }}
          className={clsx(
            "relative w-full rounded-2xl border border-black/[0.06] bg-white p-[var(--pad)] shadow-[0_14px_44px_-16px_rgba(0,0,0,0.1)] transition-transform duration-500 cursor-pointer hover:shadow-[0_26px_60px_-18px_rgba(0,0,0,0.18)] hover:-translate-y-1.5",
            isFlipped ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]",
          )}
        >
          {/* ================= FRONT SIDE ================= */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            className={clsx(
              "flex flex-col items-center text-center transition-opacity duration-300",
              isFlipped && "pointer-events-none opacity-0",
            )}
          >
            <div
              className="relative mx-auto w-[var(--pw)] overflow-hidden rounded-xl bg-[#e9e9e9]"
              style={{ aspectRatio: PHOTO_RATIO }}
            >
              <Image
                src={person.photo}
                alt={`Portrait of ${person.name}`}
                fill
                sizes="(min-width: 1280px) 300px, 72vw"
                unoptimized
                loading="eager"
                draggable={false}
                className="select-none object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            </div>

            <h3
              className={clsx(
                "mt-4 font-heading font-semibold tracking-tight text-ecovis-black md:mt-5",
                dense ? "text-[17px] md:text-[20px] xl:text-[clamp(15px,1.4vw,22px)]" : "text-[17px] md:text-[22px]",
              )}
            >
              {person.name}
            </h3>
            <p
              className={clsx(
                "mt-1 font-sans text-gray-500",
                dense ? "text-[13px] xl:text-[clamp(11.5px,0.95vw,14px)]" : "text-sm md:text-[15px]",
              )}
            >
              {person.role}
            </p>

            {/* Front indicator button */}
            <div className="mx-auto mt-3 flex items-center justify-center gap-2 md:mt-4">
              <span
                aria-label={`${person.name} on LinkedIn`}
                className="grid size-8 place-items-center rounded-lg bg-[#f05a22] font-heading text-sm font-bold text-white transition-transform duration-300 group-hover:scale-105 md:size-9"
              >
                in
              </span>
            </div>
          </div>

          {/* ================= BACK SIDE (Reference Image Layout) ================= */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              WebkitTransform: "rotateY(180deg)",
            }}
            className={clsx(
              "absolute inset-0 rounded-2xl bg-white p-[var(--pad)] flex flex-col text-left transition-opacity duration-300",
              !isFlipped ? "pointer-events-none opacity-0" : "opacity-100",
            )}
          >
            {/* Header: Name and Subtitle */}
            <div className="border-b border-gray-100 pb-2">
              <h3 className="font-heading font-bold text-[18px] leading-snug text-[#f05a22] md:text-[20px]">
                {person.name}
              </h3>
              <p className="mt-0.5 font-sans text-[12px] font-medium text-ecovis-black/80 md:text-[13px]">
                {person.role}
              </p>
            </div>

            {/* LinkedIn Badge Button matching reference image */}
            <div className="py-2.5">
              <a
                href={person.linkedin || "#"}
                target={person.linkedin ? "_blank" : undefined}
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!person.linkedin || person.linkedin === "#") {
                    e.preventDefault();
                  }
                  e.stopPropagation();
                }}
                aria-label={`${person.name} on LinkedIn`}
                className="group/in inline-flex size-8 items-center justify-center rounded-lg bg-[#f05a22] text-white font-heading text-sm font-bold shadow-sm transition-all duration-300 hover:scale-105 hover:bg-[#d94814] focus-visible:ring-2 focus-visible:ring-[#f05a22]/70"
                title={person.linkedin ? "Visit LinkedIn Profile" : "LinkedIn"}
              >
                in
              </a>
            </div>

            {/* Structured Credentials & Bio Highlights */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 [scrollbar-width:thin] text-left">
              {person.bioItems && person.bioItems.length > 0 ? (
                person.bioItems.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    {item.heading && (
                      <h4 className="font-heading text-[12.5px] md:text-[13.5px] font-bold text-ecovis-black leading-snug">
                        {item.heading}
                      </h4>
                    )}
                    <p className="font-sans text-[11px] md:text-[11.5px] leading-relaxed text-[#737373]">
                      {item.text}
                    </p>
                  </div>
                ))
              ) : (
                <p className="font-sans text-xs text-gray-400">Profile details coming soon.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function OurBoardSection() {
  const wrapRef = useRef<HTMLElement>(null);
  const [stage, setStage] = useState(0);

  // The page scrolls through the tall section while the stage inside it stays pinned to the screen.
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => setStage(stageFor(p)));

  // If the page is opened part-way down, pick up the right stage once layout is known.
  useEffect(() => {
    const id = requestAnimationFrame(() => setStage(stageFor(scrollYProgress.get())));
    return () => cancelAnimationFrame(id);
  }, [scrollYProgress]);

  const goTo = (index: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    const t = index === 0 ? 0.02 : BREAKS[index - 1] + 0.05;
    const y = top + travel * t;

    const lenis = (window as unknown as { lenis?: { scrollTo: (y: number, opts?: { duration?: number }) => void } }).lenis;
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={wrapRef}
        id="our-board"
        aria-label="Our board"
        className="relative w-full bg-white"
        style={{ height: `${SECTION_SCREENS * 100}svh` }}
      >
        <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center overflow-hidden py-[clamp(56px,8svh,96px)]">
          <Swoosh className="pointer-events-none absolute left-0 top-0 w-[clamp(200px,28vw,440px)]" />
          <Swoosh className="pointer-events-none absolute bottom-0 right-0 w-[clamp(200px,28vw,440px)] rotate-180" />

          <span className="relative mb-4 text-xs font-bold uppercase tracking-[0.3em] text-ecovis-red md:text-sm">
            Our People
          </span>

          {/* Every group stays in the page; only the current one is shown and reachable. */}
          <div className="relative grid w-full max-w-[1500px] grid-cols-[minmax(0,1fr)] justify-items-center">
            {STAGES.map((s, i) => {
              const state = i === stage ? "in" : i < stage ? "up" : "down";
              return (
                <motion.div
                  key={s.key}
                  inert={i !== stage}
                  initial={false}
                  animate={state}
                  variants={layerVariants}
                  className={clsx(
                    "col-start-1 row-start-1 flex w-full min-w-0 flex-col items-center",
                    i !== stage && "pointer-events-none",
                  )}
                >
                  <h2 className="text-center font-heading text-[clamp(2rem,4.6vw,4rem)] font-bold uppercase leading-[1.05] tracking-tight text-ecovis-black">
                    Our <span className="text-ecovis-red">{s.label}</span>
                  </h2>
                  <span aria-hidden="true" className="mt-4 h-[3px] w-12 bg-ecovis-red md:mt-5" />

                  <div
                    className={clsx(
                      "mt-[clamp(20px,4svh,44px)] flex w-full snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-6 pt-3 [scrollbar-width:none] md:gap-6 [&::-webkit-scrollbar]:hidden",
                      s.photoClass,
                      s.rowClass,
                    )}
                  >
                    {s.people.map((person) => (
                      <PersonCard key={person.name} person={person} dense={s.dense} />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <nav
            aria-label="Board groups"
            className="relative mt-[clamp(8px,2svh,24px)] flex items-start gap-4 sm:gap-8 md:gap-10"
          >
            {STAGES.map((s, i) => {
              const on = i === stage;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={on ? "step" : undefined}
                  className="group flex flex-col items-center gap-2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ecovis-red/70 focus-visible:ring-offset-4"
                >
                  <span
                    className={clsx(
                      "font-heading text-[10px] font-bold uppercase tracking-[0.12em] transition-colors duration-300 sm:text-[11px] sm:tracking-[0.22em]",
                      on ? "text-ecovis-black" : "text-gray-500 group-hover:text-gray-800",
                    )}
                  >
                    <span className={clsx("mr-1.5 tabular-nums sm:mr-2", on ? "text-ecovis-red" : "text-gray-400")}>
                      0{i + 1}
                    </span>
                    {s.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className={clsx(
                      "h-[2px] rounded-full transition-all duration-700 ease-in-out",
                      on ? "w-14 bg-ecovis-red" : "w-8 bg-gray-200 group-hover:bg-gray-300",
                    )}
                  />
                </button>
              );
            })}
          </nav>
        </div>
      </section>
    </MotionConfig>
  );
}
