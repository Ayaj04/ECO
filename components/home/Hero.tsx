"use client";

import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.4,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, clipPath: "inset(100% 0% 0% 0%)" },
  show: { 
    opacity: 1, 
    y: 0, 
    clipPath: "inset(0% 0% 0% 0%)",
    transition: { duration: 0.8, ease: "easeOut" as const } 
  },
};

const pillarVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" as const } 
  },
};

export default function Hero() {
  return (
    <section className="relative w-full min-h-[85vh] pt-28 md:pt-36 pb-10 md:pb-14 flex flex-col justify-center bg-ecovis-white overflow-hidden">

      <div className="max-w-[1920px] mx-auto px-6 md:px-12 w-full relative z-10 flex flex-col justify-center">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-6"
        >
          <motion.div variants={itemVariants} className="overflow-hidden">
            <h2 className="text-sm md:text-base font-semibold tracking-widest text-ecovis-dark uppercase mb-2">
              We help businesses move forward.
            </h2>
          </motion.div>

          <div className="flex flex-col text-fluid-hero text-ecovis-black font-heading leading-[1.05] tracking-tight">
            <motion.div variants={itemVariants} className="overflow-hidden pb-1">
              <span className="block">FINANCE.</span>
            </motion.div>
            <motion.div variants={itemVariants} className="overflow-hidden pb-1">
              <span className="block">TECHNOLOGY.</span>
            </motion.div>
            <motion.div variants={itemVariants} className="overflow-hidden pb-1">
              <span className="block">COMPLIANCE.</span>
            </motion.div>
            <motion.div variants={itemVariants} className="overflow-hidden pb-1">
              <span className="block text-ecovis-red">LEGAL.</span>
            </motion.div>
          </div>

          <motion.div variants={pillarVariants} className="mt-4 max-w-xl">
            <p className="text-base md:text-lg text-ecovis-dark leading-relaxed font-sans">
              Advisory, technology and professional solutions for businesses navigating complexity and growth.
            </p>
          </motion.div>

          <motion.div variants={pillarVariants} className="mt-6 flex flex-wrap gap-4 md:gap-6 items-center">
            <button 
              className="bg-ecovis-black text-ecovis-white px-8 py-4 font-semibold text-sm tracking-widest uppercase hover:bg-ecovis-red transition-colors duration-300 rounded-sm"
              data-cursor="EXPLORE"
            >
              Explore Our Expertise &rarr;
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
