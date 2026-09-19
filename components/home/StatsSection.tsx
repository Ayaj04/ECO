"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "XX+", label: "CLIENTS" },
  { value: "XX+", label: "YEARS EXPERIENCE" },
  { value: "XX+", label: "PROJECTS" },
  { value: "XX", label: "INDUSTRIES" },
];

export default function StatsSection() {
  return (
    <section className="w-full bg-ecovis-black py-32 px-6 md:px-12 border-t border-gray-800">
      <div className="max-w-[1920px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="flex flex-col items-center md:items-start text-center md:text-left"
          >
            <span className="text-5xl md:text-7xl font-heading font-bold text-ecovis-white tracking-tighter mb-4">
              {stat.value}
            </span>
            <span className="text-sm md:text-base font-bold tracking-[0.2em] uppercase text-ecovis-red">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
