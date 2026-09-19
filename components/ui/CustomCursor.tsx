"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [hoverText, setHoverText] = useState("");

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check for closest interactive element
      const interactiveEl = target.closest('a, button, [data-cursor]');
      
      if (interactiveEl) {
        setIsHovering(true);
        const cursorText = interactiveEl.getAttribute('data-cursor');
        setHoverText(cursorText || "");
      } else {
        setIsHovering(false);
        setHoverText("");
      }
    };

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  // Only show custom cursor on fine pointer devices (desktops)
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 bg-ecovis-red rounded-full pointer-events-none z-50 flex items-center justify-center mix-blend-difference"
        animate={{
          x: mousePosition.x - (isHovering && hoverText ? 40 : (isHovering ? 24 : 8)),
          y: mousePosition.y - (isHovering && hoverText ? 40 : (isHovering ? 24 : 8)),
          width: isHovering && hoverText ? 80 : (isHovering ? 48 : 16),
          height: isHovering && hoverText ? 80 : (isHovering ? 48 : 16),
          backgroundColor: isHovering ? "#FFFFFF" : "#E10600",
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
          mass: 0.5
        }}
      >
        {hoverText && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-ecovis-black text-[10px] font-bold tracking-widest uppercase text-center"
          >
            {hoverText}
          </motion.span>
        )}
      </motion.div>
    </>
  );
}
