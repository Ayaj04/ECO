"use client";

import { motion } from "framer-motion";

export default function TechnologySection() {
  return (
    <section className="w-full bg-ecovis-black text-ecovis-white py-16 md:py-24 px-6 md:px-12 relative overflow-hidden">
      {/* Decorative background grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '4rem 4rem' }} />
      
      <div className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center relative z-10">
        <div className="col-span-1 md:col-span-8 md:order-2">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="md:text-right"
          >
            <span className="text-sm font-bold tracking-[0.2em] uppercase text-ecovis-red block mb-8">
              Technology
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-ecovis-white leading-[1.08] tracking-tight uppercase">
              TECHNOLOGY <br />
              THAT MOVES BUSINESS.
            </h2>
          </motion.div>
        </div>
        
        <div className="col-span-1 md:col-span-4 md:order-1">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            <p className="text-lg text-gray-400 font-sans leading-relaxed">
              We leverage data intelligence, process automation, and digital transformation strategies to build the operational backbone of modern enterprises.
            </p>
            <ul className="flex flex-col gap-3 font-medium text-ecovis-gray border-t border-gray-800 pt-6">
              <li className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-ecovis-red rounded-sm" /> Digital Transformation</li>
              <li className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-ecovis-red rounded-sm" /> Business Intelligence</li>
              <li className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-ecovis-red rounded-sm" /> Process Automation</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
