"use client";

import { useEffect, useState } from "react";
import { CyberBackground3D } from "@/components/animations/cyber-background-3d";

export function PremiumBackground() {
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 30 });

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      const x = Math.round((e.clientX / window.innerWidth) * 100);
      const y = Math.round((e.clientY / window.innerHeight) * 100);
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Deep Indigo Base (#0E0E34) */}
      <div className="absolute inset-0 bg-[#0E0E34]" />

      {/* 2. Living Three.js 3D Cyber Network Mesh & Data Packets */}
      {mounted && <CyberBackground3D />}

      {/* 2. Top Hero Ambient Stage Light (Royal Blue #252E8A, Vibrant Cyan #00D2D3 & Periwinkle Blue #5A7FC8) */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-[780px] opacity-80"
        style={{
          background: "radial-gradient(ellipse 75% 60% at 50% 0%, rgba(90, 127, 200, 0.28) 0%, rgba(0, 210, 211, 0.20) 32%, rgba(37, 46, 138, 0.32) 58%, rgba(14, 14, 52, 0.6) 80%, transparent 95%)",
          filter: "blur(50px)",
        }}
      />

      {/* 3. Interactive Mouse Spotlight (Pearl White #F7F6F7 & Periwinkle #5A7FC8) */}
      {mounted && (
        <div
          className="absolute w-[640px] h-[640px] rounded-full opacity-40 transition-transform duration-700 ease-out"
          style={{
            left: `${mousePos.x}%`,
            top: `${mousePos.y}%`,
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(247, 246, 247, 0.15) 0%, rgba(90, 127, 200, 0.18) 35%, rgba(0, 210, 211, 0.08) 60%, transparent 75%)",
            filter: "blur(75px)",
          }}
        />
      )}

      {/* 4. Living Fluid Mesh Orbs (Royal Blue #252E8A, Vibrant Cyan #00D2D3, Periwinkle Blue #5A7FC8) */}
      <div 
        className="aurora-mesh-1 absolute top-24 -left-28 w-[650px] h-[650px] rounded-full opacity-45"
        style={{
          background: "radial-gradient(circle, rgba(37, 46, 138, 0.35) 0%, rgba(90, 127, 200, 0.18) 45%, transparent 70%)",
          filter: "blur(130px)",
        }}
      />

      <div 
        className="aurora-mesh-2 absolute top-[36%] -right-28 w-[620px] h-[620px] rounded-full opacity-45"
        style={{
          background: "radial-gradient(circle, rgba(0, 210, 211, 0.28) 0%, rgba(90, 127, 200, 0.15) 45%, transparent 70%)",
          filter: "blur(140px)",
        }}
      />

      <div 
        className="aurora-mesh-3 absolute bottom-24 left-[24%] w-[720px] h-[720px] rounded-full opacity-35"
        style={{
          background: "radial-gradient(circle, rgba(90, 127, 200, 0.22) 0%, rgba(37, 46, 138, 0.25) 40%, rgba(0, 210, 211, 0.15) 60%, transparent 75%)",
          filter: "blur(150px)",
        }}
      />

      {/* 5. Architectural Horizon Glow Arc (Periwinkle Blue & Vibrant Cyan) */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl h-[1.5px]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(37, 46, 138, 0.4) 15%, rgba(90, 127, 200, 0.8) 50%, rgba(0, 210, 211, 0.7) 85%, transparent 100%)",
          boxShadow: "0 0 35px 5px rgba(0, 210, 211, 0.45)",
        }}
      />

      {/* 6. Soft Constellation Geometric Grid */}
      <div 
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage: "radial-gradient(rgba(90, 127, 200, 0.28) 1.2px, transparent 1.2px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 90% 70% at 50% 35%, black 40%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 50% 35%, black 40%, transparent 85%)",
        }}
      />

      {/* 7. Subtle Velvet Film Noise Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 8. Vignette Falloff to Deep Indigo */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at center, transparent 40%, rgba(14, 14, 52, 0.6) 80%, #0E0E34 100%)",
        }}
      />
    </div>
  );
}
