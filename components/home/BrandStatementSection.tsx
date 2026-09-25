"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function BrandStatementSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLHeadingElement>(null);
  const text2Ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!containerRef.current || !text1Ref.current || !text2Ref.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=150%",
          scrub: 1,
          pin: true,
        },
      });

      tl.to(text1Ref.current, {
        opacity: 0,
        y: -40,
        duration: 0.8,
      }, 0)
      .fromTo(text2Ref.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8 },
        1.1
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full h-screen bg-ecovis-black flex items-center justify-center overflow-hidden relative">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 w-full flex items-center justify-center">
        
        <h2 
          ref={text1Ref}
          className="absolute text-3xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-heading font-bold text-ecovis-white tracking-tight leading-[1.08] text-center px-6"
        >
          COMPLEXITY <br />
          NEEDS <span className="text-ecovis-red">CLARITY.</span>
        </h2>

        <h2 
          ref={text2Ref}
          className="absolute text-3xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-heading font-bold text-ecovis-white tracking-tight leading-[1.08] text-center px-6 opacity-0"
        >
          BUSINESS <br />
          NEEDS <span className="text-ecovis-red">ECOVIS RKCA.</span>
        </h2>

      </div>
    </section>
  );
}
