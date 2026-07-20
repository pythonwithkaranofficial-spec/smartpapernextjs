"use client";

import React from "react";
import { useMousePosition } from "@/hooks/useMousePosition";

export function AnimatedBackground() {
  // Activate mouse listener to update CSS variables on document.documentElement
  useMousePosition();

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-50 select-none bg-background">
      {/* Premium subtle noise overlay */}
      <div 
        className="absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Subtle overlay grid lines */}
      <div 
        className="absolute inset-0 [background-size:32px_32px] opacity-80"
        style={{
          backgroundImage: "radial-gradient(var(--grid-color) 1px, transparent 1px)"
        }}
      />

      {/* Floating Glowing Blobs with Cursor Parallax */}
      <div 
        className="absolute top-[10%] left-[5%] w-[45vw] h-[45vw] min-w-[300px] min-h-[300px] rounded-full bg-blue-600/10 blur-[100px] blob-float-1 transition-transform duration-300 ease-out"
        style={{
          transform: "translate(calc(var(--doc-mouse-percent-x, 0) * -20px), calc(var(--doc-mouse-percent-y, 0) * -20px))",
        }}
      />
      <div 
        className="absolute top-[35%] right-[5%] w-[40vw] h-[40vw] min-w-[280px] min-h-[280px] rounded-full bg-purple-600/10 blur-[110px] blob-float-2 transition-transform duration-300 ease-out"
        style={{
          transform: "translate(calc(var(--doc-mouse-percent-x, 0) * 15px), calc(var(--doc-mouse-percent-y, 0) * 15px))",
        }}
      />
      <div 
        className="absolute bottom-[5%] left-[15%] w-[35vw] h-[35vw] min-w-[250px] min-h-[250px] rounded-full bg-cyan-500/10 blur-[90px] blob-float-3 transition-transform duration-300 ease-out"
        style={{
          transform: "translate(calc(var(--doc-mouse-percent-x, 0) * -15px), calc(var(--doc-mouse-percent-y, 0) * 25px))",
        }}
      />
      <div 
        className="absolute bottom-[25%] right-[25%] w-[38vw] h-[38vw] min-w-[260px] min-h-[260px] rounded-full bg-indigo-600/10 blur-[100px] blob-float-4 transition-transform duration-300 ease-out"
        style={{
          transform: "translate(calc(var(--doc-mouse-percent-x, 0) * 25px), calc(var(--doc-mouse-percent-y, 0) * -10px))",
        }}
      />
    </div>
  );
}
