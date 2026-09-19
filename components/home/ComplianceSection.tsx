"use client";

import { motion } from "framer-motion";

export default function ComplianceSection() {
  return (
    <section className="w-full bg-ecovis-white py-32 md:py-48 px-6 md:px-12 relative overflow-hidden">
      <div className="absolute right-6 md:right-12 bottom-0 w-[1px] h-32 bg-ecovis-red" />
      
      <div className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        <div className="col-span-1 md:col-span-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-sm font-bold tracking-[0.2em] uppercase text-ecovis-red block mb-8">
              Compliance
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-ecovis-black leading-[1.08] tracking-tight uppercase">
              CONFIDENCE <br />
              THROUGH CLARITY.
            </h2>
          </motion.div>
        </div>
        
        <div className="col-span-1 md:col-span-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            <p className="text-lg text-ecovis-dark font-sans leading-relaxed">
              We view compliance not as a barrier, but as a strategic business function that builds resilience and protects your most valuable assets.
            </p>
            <ul className="flex flex-col gap-3 font-medium text-ecovis-black border-t border-gray-200 pt-6">
              <li className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-ecovis-black rounded-full" /> Regulatory Frameworks</li>
              <li className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-ecovis-black rounded-full" /> Risk Management</li>
              <li className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-ecovis-black rounded-full" /> Corporate Governance</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
