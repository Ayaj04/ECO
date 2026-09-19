"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function FourPillarTransition() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);
  const partnerTextRef = useRef<HTMLHeadingElement>(null);
  const ecovisTextRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!containerRef.current || !wordsRef.current || !partnerTextRef.current || !ecovisTextRef.current) return;

    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray('.pillar-word');
      const crosses = gsap.utils.toArray('.cross-mark');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=150%",
          scrub: 1,
          pin: true,
        },
      });

      // 1. Cleanly fade out crosses and initial words
      tl.to(crosses, {
        opacity: 0,
        duration: 0.3,
      }, 0);

      tl.to(words, {
        opacity: 0,
        scale: 0.85,
        duration: 0.6,
        ease: "power2.inOut",
      }, 0.2);

      // 2. Fade in ECOVIS RKCA only after initial words are cleared
      tl.fromTo(ecovisTextRef.current, 
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" },
        0.9
      );

      // 3. Fade out ECOVIS RKCA completely before showing final text
      tl.to(ecovisTextRef.current, {
        opacity: 0,
        y: -30,
        duration: 0.5,
      }, 1.8)
      .fromTo(partnerTextRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6 },
        2.4
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full h-screen bg-ecovis-white flex items-center justify-center overflow-hidden relative">
      
      {/* Initial 4 words state */}
      <div ref={wordsRef} className="absolute inset-0 flex items-center justify-center px-6 pointer-events-none">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 md:gap-8 font-heading font-bold text-2xl sm:text-4xl md:text-5xl text-ecovis-black uppercase tracking-tight">
          <div className="pillar-word">FINANCE</div>
          <div className="cross-mark text-ecovis-red text-xl sm:text-2xl font-light">×</div>
          <div className="pillar-word">TECHNOLOGY</div>
          <div className="cross-mark text-ecovis-red text-xl sm:text-2xl font-light">×</div>
          <div className="pillar-word">COMPLIANCE</div>
          <div className="cross-mark text-ecovis-red text-xl sm:text-2xl font-light">×</div>
          <div className="pillar-word">LEGAL</div>
        </div>
      </div>

      {/* Middle State */}
      <h2 
        ref={ecovisTextRef}
        className="absolute text-4xl sm:text-6xl md:text-8xl font-heading font-bold text-ecovis-black tracking-tight leading-[1.08] opacity-0 text-center px-6"
      >
        ECOVIS <span className="text-ecovis-red">RKCA</span>
      </h2>

      {/* Final State */}
      <div 
        ref={partnerTextRef}
        className="absolute text-center px-6 opacity-0"
      >
        <h2 className="text-3xl sm:text-5xl md:text-7xl font-heading font-bold text-ecovis-black leading-[1.08] tracking-tight uppercase">
          ONE PARTNER. <br />
          FOUR DIMENSIONS OF BUSINESS.
        </h2>
      </div>

    </section>
  );
}
