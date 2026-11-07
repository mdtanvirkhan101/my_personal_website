"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface CyberRadar3DProps {
  size?: number;
  className?: string;
  statusText?: string;
}

export function CyberRadar3D({
  size = 280,
  className = "",
  statusText = "PERIMETER SHIELD: ACTIVE",
}: CyberRadar3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const group = new THREE.Group();
    scene.add(group);

    // 1. Concentric Holographic Radar Rings
    const ringMaterials: THREE.LineBasicMaterial[] = [];
    const radii = [1.2, 1.6, 2.0];

    radii.forEach((r, idx) => {
      const ringGeo = new THREE.BufferGeometry();
      const points: number[] = [];
      const segments = 64;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(Math.cos(theta) * r, Math.sin(theta) * r, 0);
      }
      ringGeo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
      const mat = new THREE.LineBasicMaterial({
        color: idx === 1 ? 0xa855f7 : 0x00d2d3,
        transparent: true,
        opacity: 0.35 + idx * 0.15,
        blending: THREE.AdditiveBlending,
      });
      ringMaterials.push(mat);
      const ring = new THREE.Line(ringGeo, mat);
      group.add(ring);
    });

    // 2. Rotating Sweeper Line (Radar beam)
    const sweepGeo = new THREE.BufferGeometry();
    sweepGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([0, 0, 0, 2.0, 0, 0], 3)
    );
    const sweepMat = new THREE.LineBasicMaterial({
      color: 0x00d2d3,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const sweepLine = new THREE.Line(sweepGeo, sweepMat);
    group.add(sweepLine);

    // 3. Central Core Node
    const coreGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00d2d3,
      transparent: true,
      opacity: 0.9,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // 4. Subtle Crosshairs
    const crossGeo = new THREE.BufferGeometry();
    crossGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([
        -2.1, 0, 0, 2.1, 0, 0,
        0, -2.1, 0, 0, 2.1, 0,
      ], 3)
    );
    const crossMat = new THREE.LineBasicMaterial({
      color: 0x5a7fc8,
      transparent: true,
      opacity: 0.25,
    });
    const crossLine = new THREE.LineSegments(crossGeo, crossMat);
    group.add(crossLine);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      sweepLine.rotation.z -= delta * 2.2;
      group.rotation.x = Math.sin(clock.getElapsedTime() * 0.5) * 0.15;
      group.rotation.y = Math.cos(clock.getElapsedTime() * 0.4) * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, [size]);

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <canvas ref={canvasRef} width={size} height={size} />
      {statusText && (
        <span className="text-[10px] font-mono text-cyan-400 mt-2 tracking-widest uppercase bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
          {statusText}
        </span>
      )}
    </div>
  );
}
