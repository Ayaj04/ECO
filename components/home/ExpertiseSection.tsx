"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";

const expertiseAreas = [
  {
    num: "01",
    title: "FINANCE",
    desc: "Financial advisory, accounting, reporting and strategic financial solutions that help businesses make better decisions.",
  },
  {
    num: "02",
    title: "TECHNOLOGY",
    desc: "Digital transformation, automation, and data intelligence to modernize operations and drive efficiency.",
  },
  {
    num: "03",
    title: "COMPLIANCE",
    desc: "Navigating complex regulatory environments to ensure your business remains secure and compliant.",
  },
  {
    num: "04",
    title: "LEGAL",
    desc: "Strategic legal advisory protecting your assets, structuring your growth, and securing your future.",
  }
];

export default function ExpertiseSection() {
  const [openArea, setOpenArea] = useState<number | null>(null);

  return (
    <section id="expertise" className="w-full bg-ecovis-white pt-6 md:pt-10 pb-8 md:pb-12">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-heading font-bold mb-8 md:mb-10 uppercase tracking-tighter"
        >
          OUR CORE ADVISORY SERVICES
        </motion.h2>

        <div className="flex flex-col border-t border-ecovis-black">
          {expertiseAreas.map((area, index) => {
            const isOpen = openArea === index;

            return (
              <motion.div
                initial="initial"
                whileHover="hover"
                key={area.num}
                className="group relative overflow-hidden border-b border-ecovis-black"
                data-cursor={`EXPLORE ${area.title}`}
              >
                {/* Compact tap-to-read row on phones. */}
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`expertise-description-${index}`}
                  onClick={() => setOpenArea((current) => (current === index ? null : index))}
                  className="relative z-10 flex w-full items-center gap-3 py-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ecovis-red md:hidden"
                >
                  <span className="w-10 shrink-0 font-sans text-lg font-bold text-ecovis-red">
                    {area.num}
                  </span>
                  <h3 className="min-w-0 flex-1 font-heading text-2xl font-bold uppercase tracking-tight min-[400px]:text-3xl">
                    {area.title}
                  </h3>
                  <ChevronDown
                    aria-hidden="true"
                    className={`size-5 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-ecovis-red" : ""}`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`expertise-description-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                      className="relative z-10 overflow-hidden md:hidden"
                    >
                      <p className="pb-6 pl-[3.25rem] pr-7 text-sm leading-relaxed text-gray-600">
                        {area.desc}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Original hover interaction on tablet and desktop. */}
                <div className="absolute inset-0 z-0 hidden translate-y-full bg-ecovis-black transition-transform duration-500 ease-out group-hover:translate-y-0 md:block" />

                <div className="relative z-10 hidden items-center justify-between gap-8 px-4 py-12 transition-colors duration-300 group-hover:text-ecovis-white md:flex">
                  <div className="flex flex-1 items-center gap-8">
                    <span className="w-12 shrink-0 font-sans text-2xl font-bold text-ecovis-red transition-colors duration-300 group-hover:text-ecovis-white">
                      {area.num}
                    </span>

                    <h3 className="origin-left transform font-heading text-5xl font-bold uppercase tracking-tight transition-transform duration-500 group-hover:scale-[1.02] lg:text-6xl">
                      {area.title}
                    </h3>
                  </div>

                  <div className="ml-auto flex items-center gap-8">
                    <p className="max-w-sm -translate-x-6 font-sans text-base leading-relaxed opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:opacity-100">
                      {area.desc}
                    </p>

                    <div className="flex w-10 shrink-0 justify-end">
                      <ArrowRight className="size-8 shrink-0 -rotate-45 transition-transform duration-500 group-hover:rotate-0" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
