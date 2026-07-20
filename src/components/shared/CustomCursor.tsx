"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [isMobile, setIsMobile] = useState(true);
  const [hoverState, setHoverState] = useState<"default" | "clickable" | "input" | "card" | "magnetic">("default");
  const [magneticButton, setMagneticButton] = useState<HTMLElement | null>(null);

  // Mouse coordinates for raw cursor (inner dot)
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Target coordinates for outer ring (can snap to button center)
  const targetRingX = useMotionValue(-100);
  const targetRingY = useMotionValue(-100);

  // Outer ring spring configuration for smooth interpolation
  const springConfig = { damping: 28, stiffness: 240, mass: 0.35 };
  const ringX = useSpring(targetRingX, springConfig);
  const ringY = useSpring(targetRingY, springConfig);

  // Custom styles for outer ring morphing
  const [ringStyle, setRingStyle] = useState({
    width: 32,
    height: 32,
    borderRadius: "50%",
  });

  useEffect(() => {
    // Check if the user is on mobile/tablet or touch device
    const checkMobile = () => {
      const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
      setIsMobile(coarsePointer);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      const clientX = e.clientX;
      const clientY = e.clientY;

      // Inner dot follows mouse directly
      mouseX.set(clientX);
      mouseY.set(clientY);

      if (magneticButton) {
        const rect = magneticButton.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Snapped ring coordinates to the button center
        targetRingX.set(centerX);
        targetRingY.set(centerY);
      } else {
        // Outer ring trails raw mouse coordinates
        targetRingX.set(clientX);
        targetRingY.set(clientY);
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const button = target.closest("button, a, [role='button'], [data-magnetic]") as HTMLElement | null;
      const input = target.closest("input, textarea, select") as HTMLElement | null;
      const card = target.closest(".glass, [class*='GlassCard'], .glass-strong, img") as HTMLElement | null;

      if (button) {
        setMagneticButton(button);
        setHoverState("magnetic");
        const rect = button.getBoundingClientRect();
        const padding = 0; // Fit the button boundary exactly
        setRingStyle({
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
          borderRadius: window.getComputedStyle(button).borderRadius || "12px",
        });
      } else if (input) {
        setMagneticButton(null);
        setHoverState("input");
        setRingStyle({
          width: 12,
          height: 24,
          borderRadius: "4px",
        });
      } else if (card) {
        setMagneticButton(null);
        setHoverState("card");
        setRingStyle({
          width: 56,
          height: 56,
          borderRadius: "50%",
        });
      } else {
        setMagneticButton(null);
        setHoverState("default");
        setRingStyle({
          width: 32,
          height: 32,
          borderRadius: "50%",
        });
      }
    };

    const handleScroll = () => {
      // Clear snapping state on scroll to avoid misalignment
      setMagneticButton(null);
      setHoverState("default");
      setRingStyle({
        width: 32,
        height: 32,
        borderRadius: "50%",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobile, magneticButton, mouseX, mouseY, targetRingX, targetRingY]);

  // Hidden on mobile/touch screens
  if (isMobile) return null;

  // Outer ring border color and background based on state
  let ringBorderColor = "rgba(59, 130, 246, 0.4)";
  let ringBg = "transparent";

  if (hoverState === "magnetic") {
    ringBorderColor = "rgba(124, 58, 237, 0.6)"; // Royal Purple
    ringBg = "rgba(124, 58, 237, 0.05)";
  } else if (hoverState === "input") {
    ringBorderColor = "rgba(34, 211, 238, 0.6)"; // Cyan highlight
    ringBg = "rgba(34, 211, 238, 0.02)";
  } else if (hoverState === "card") {
    ringBorderColor = "rgba(255, 255, 255, 0.2)";
    ringBg = "rgba(255, 255, 255, 0.02)";
  }

  return (
    <>
      {/* Outer Ring with spring physics, centered dynamically relative to targets */}
      <motion.div
        className="custom-cursor-ring"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          width: ringStyle.width,
          height: ringStyle.height,
          borderRadius: ringStyle.borderRadius,
          borderColor: ringBorderColor,
          backgroundColor: ringBg,
        }}
      />
    </>
  );
}
