"use client";

import { motion } from "framer-motion";

export default function FinanceSection() {
  return (
    <section className="w-full bg-ecovis-white pt-0 pb-16 md:pb-24 px-6 md:px-12 relative overflow-hidden">
      <div className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        <div className="col-span-1 md:col-span-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-sm font-bold tracking-[0.2em] uppercase text-ecovis-red block mb-8">
              Finance
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-ecovis-black leading-[1.08] tracking-tight uppercase">
              TURNING NUMBERS <br />
              INTO DECISIONS.
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
              Our financial advisory transcends basic accounting. We provide the structural reporting, tax strategy, and deep financial analysis required for sustainable corporate growth.
            </p>
            <ul className="flex flex-col gap-3 font-medium text-ecovis-black border-t border-gray-200 pt-6">
              <li className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-ecovis-red rounded-full" /> Financial Advisory</li>
              <li className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-ecovis-red rounded-full" /> Business Planning</li>
              <li className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-ecovis-red rounded-full" /> Tax & Reporting</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
