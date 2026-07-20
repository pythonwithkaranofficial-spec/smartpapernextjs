"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface PointerGlowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PointerGlow({ children, className, ...props }: PointerGlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn("relative overflow-hidden group", className)}
      style={{
        // Define local custom CSS variables for children or absolute glows
        // @ts-expect-error: Custom CSS properties for mouse coordinates
        "--mouse-x": `${coords.x}px`,
        "--mouse-y": `${coords.y}px`,
        "--mouse-opacity": opacity,
      }}
      {...props}
    >
      {/* Background glow layer */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 -z-10"
        style={{
          opacity: opacity * 0.15,
          background: `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, var(--color-primary), transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
}
