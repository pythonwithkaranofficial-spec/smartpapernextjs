"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  glow?: boolean;
  strong?: boolean;
  subtle?: boolean;
  animate?: boolean;
  delay?: number;
}

export function GlassCard({
  children,
  className,
  hover = true,
  glow = true,
  strong = false,
  subtle = false,
  animate = false,
  delay = 0,
  ...props
}: GlassCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });

    if (hover) {
      // Calculate tilt: normalized offset from center * max degrees (3deg)
      const tiltX = ((y / rect.height) - 0.5) * -3;
      const tiltY = ((x / rect.width) - 0.5) * 3;
      setTilt({ x: tiltX, y: tiltY });
    }
  };

  const handleMouseLeave = () => {
    setOpacity(0);
    setTilt({ x: 0, y: 0 });
  };

  const CardBase = (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={glow ? () => setOpacity(1) : undefined}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: hover ? tilt.x : 0,
        rotateY: hover ? tilt.y : 0,
        y: hover && opacity > 0 ? -6 : 0,
      }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={cn(
        "rounded-2xl border transition-all duration-300 relative [perspective:1000px] [transform-style:preserve-3d]",
        strong ? "glass-strong" : subtle ? "glass-subtle" : "glass",
        hover && "hover:border-primary/30 dark:hover:border-primary/20 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.18)]",
        glow && "glow-border",
        className
      )}
      style={{
        ...props.style,
        // Define local custom CSS variables for children or absolute glows
        // @ts-expect-error: Custom CSS properties for mouse coordinate tracking
        "--mouse-x": `${coords.x}px`,
        "--mouse-y": `${coords.y}px`,
        "--mouse-opacity": opacity,
      }}
      {...props}
    >
      {/* Background glow layer - isolated and clipped to rounded corners inside the card */}
      {glow && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none -z-10">
          <div 
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: opacity * 0.15,
              background: `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, var(--color-primary), transparent 80%)`,
            }}
          />
        </div>
      )}
      {children}
    </motion.div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
        className="h-full w-full"
      >
        {CardBase}
      </motion.div>
    );
  }

  return CardBase;
}

