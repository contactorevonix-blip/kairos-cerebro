"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";

const ShieldScene = dynamic(() => import("./ShieldScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-20 h-20 rounded-full border border-blue-500/30 animate-pulse" />
    </div>
  ),
});

export default function ShieldWrapper() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [cursor, setCursor] = useState<"default" | "grab" | "grabbing">("default");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      setMouse({
        x:  (e.clientX - cx) / (rect.width  / 2),
        y: -(e.clientY - cy) / (rect.height / 2),
      });
      setCursor("grabbing");
    }

    function onLeave() {
      setMouse({ x: 0, y: 0 });
      setCursor("grab");
    }

    function onEnter() { setCursor("grab"); }

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("mouseenter", onEnter);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full select-none"
      style={{ cursor }}
    >
      <ShieldScene mouseX={mouse.x} mouseY={mouse.y} />
    </div>
  );
}
