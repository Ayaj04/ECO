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
    <section className="relative w-full min-h-screen py-24 md:py-32 flex items-center bg-ecovis-white overflow-hidden">
      {/* Abstract Background Visual */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex items-center justify-center">
        {/* Subtle geometric structure using CSS/Framer Motion */}
        <motion.div 
          className="absolute w-[60vw] h-[60vw] border-[0.5px] border-ecovis-black rounded-full mix-blend-multiply"
          animate={{ rotate: 360, scale: [1, 1.05, 1] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute w-[40vw] h-[40vw] border-[1px] border-ecovis-red rounded-full mix-blend-multiply opacity-50"
          animate={{ rotate: -360, scale: [1, 1.1, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute w-full h-[1px] bg-ecovis-black top-1/2 left-0 transform -translate-y-1/2 opacity-30"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute h-full w-[1px] bg-ecovis-black left-1/2 top-0 transform -translate-x-1/2 opacity-30"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </div>

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
