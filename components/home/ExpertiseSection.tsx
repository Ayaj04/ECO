"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

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
  return (
    <section id="expertise" className="w-full bg-ecovis-white pt-6 md:pt-10 pb-8 md:pb-12">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-heading font-bold mb-8 md:mb-10 uppercase tracking-tighter"
        >
          WHAT WE DO
        </motion.h2>

        <div className="flex flex-col border-t border-ecovis-black">
          {expertiseAreas.map((area, index) => (
            <motion.div
              initial="initial"
              whileHover="hover"
              key={index}
              className="group relative border-b border-ecovis-black overflow-hidden cursor-pointer"
              data-cursor={`EXPLORE ${area.title}`}
            >
              <div className="absolute inset-0 bg-ecovis-black translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 py-8 md:py-12 px-4 transition-colors duration-300 group-hover:text-ecovis-white">
                <div className="flex items-center gap-6 md:gap-8 flex-1">
                  <span className="text-xl md:text-2xl font-bold font-sans w-12 text-ecovis-red md:group-hover:text-ecovis-white transition-colors duration-300 shrink-0">
                    {area.num}
                  </span>
                  
                  <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight uppercase group-hover:scale-[1.02] transform origin-left transition-transform duration-500">
                    {area.title}
                  </h3>
                </div>
                
                <div className="flex items-center gap-6 md:gap-8 md:ml-auto">
                  <p className="max-w-xs md:max-w-sm text-sm md:text-base font-sans leading-relaxed opacity-0 -translate-x-6 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out">
                    {area.desc}
                  </p>

                  <div className="w-10 flex justify-end shrink-0">
                    <ArrowRight className="w-6 h-6 md:w-8 md:h-8 -rotate-45 group-hover:rotate-0 transition-transform duration-500 shrink-0" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
