"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";

const ShieldScene = dynamic(
  () => import("./shield-scene").then((m) => m.ShieldScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-24 h-24 rounded-full border border-blue-500/30 animate-pulse" />
      </div>
    ),
  },
);

export function ShieldWrapper({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [cursor, setCursor] = useState<"default" | "grab" | "grabbing">("default");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      setMouse({ x: (e.clientX - cx) / (rect.width / 2), y: -(e.clientY - cy) / (rect.height / 2) });
      setCursor("grabbing");
    };
    const onLeave = () => { setMouse({ x: 0, y: 0 }); setCursor("grab"); };
    const onEnter = () => setCursor("grab");
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
    <div ref={containerRef} className={className ?? "w-full h-full"} style={{ cursor }}>
      <ShieldScene mouseX={mouse.x} mouseY={mouse.y} />
    </div>
  );
}
