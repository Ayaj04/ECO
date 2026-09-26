"use client";

import { motion } from "framer-motion";

export default function IntroSection() {
  return (
    <section id="about" className="w-full bg-ecovis-white pt-8 md:pt-14 pb-8 md:pb-12 px-6 md:px-12 relative">
      <div className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="col-span-1 md:col-span-8">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-ecovis-black leading-[1.08] tracking-tight uppercase"
          >
            INTEGRATED PROFESSIONAL SERVICES ACROSS <br />
            <span className="text-ecovis-red">FINANCE, TECHNOLOGY, COMPLIANCE AND LEGAL.</span>
          </motion.h2>
        </div>
        
        <div className="col-span-1 md:col-span-4 md:mt-16">
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-ecovis-dark font-sans leading-relaxed"
          >
            ECOVIS RKCA brings finance, technology, compliance and legal expertise together to help organizations make informed decisions and build sustainable growth.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
