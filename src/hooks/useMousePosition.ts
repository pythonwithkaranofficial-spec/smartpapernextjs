import { useState, useEffect } from "react";

export function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let frameId: number;

    const handleMouseMove = (event: MouseEvent) => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        // Set root CSS variables for high-performance cursor following and parallax effects
        const x = event.clientX;
        const y = event.clientY;
        document.documentElement.style.setProperty("--doc-mouse-x", `${x}px`);
        document.documentElement.style.setProperty("--doc-mouse-y", `${y}px`);
        document.documentElement.style.setProperty("--doc-mouse-percent-x", `${(x / window.innerWidth - 0.5) * 2}`);
        document.documentElement.style.setProperty("--doc-mouse-percent-y", `${(y / window.innerHeight - 0.5) * 2}`);

        setMousePosition({ x, y });
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return mousePosition;
}
