"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { STATS } from "@/lib/stats";

/** Every number takes this long to count up, so they all arrive together. */
const COUNT_SECONDS = 2.4;

/** Counts from 0 up to `to` the first time it scrolls into view. */
function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const count = useMotionValue(0);
  const text = useTransform(count, (v) => Math.round(v).toString());

  useEffect(() => {
    if (!inView) return;

    // Visitors who ask for less motion get the final number straight away.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      count.set(to);
      return;
    }

    const controls = animate(count, to, { duration: COUNT_SECONDS, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [inView, to, count]);

  return (
    <span ref={ref} className="tabular-nums">
      {/* Screen readers get the final figure once, not every number on the way up */}
      <span className="sr-only">{to}+</span>
      <span aria-hidden="true">
        <motion.span>{text}</motion.span>+
      </span>
    </span>
  );
}

export default function StatsSection() {
  return (
    <section className="w-full bg-ecovis-black py-32 px-6 md:px-12 border-t border-gray-800">
      <div className="max-w-[1920px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-12 md:gap-8">
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="flex flex-col items-center md:items-start text-center md:text-left"
          >
            <span className="text-5xl md:text-7xl font-heading font-bold text-ecovis-white tracking-tighter mb-4">
              <CountUp to={stat.value} />
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
