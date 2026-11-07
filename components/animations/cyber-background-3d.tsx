"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface CyberBackground3DProps {
  nodeCount?: number;
  className?: string;
}

export function CyberBackground3D({
  nodeCount = 65,
  className = "",
}: CyberBackground3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Detect low-power or mobile devices
    const isMobile = window.innerWidth < 768;
    const actualNodeCount = isMobile ? Math.min(nodeCount, 35) : nodeCount;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = window.innerWidth;
    const height = window.innerHeight;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 28;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !isMobile,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // 2. Nodes Setup
    const positions = new Float32Array(actualNodeCount * 3);
    const velocities: Array<{ x: number; y: number; z: number }> = [];
    const colors = new Float32Array(actualNodeCount * 3);

    const bounds = { x: 32, y: 22, z: 16 };

    for (let i = 0; i < actualNodeCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * bounds.x * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * bounds.y * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * bounds.z * 2;

      velocities.push({
        x: (Math.random() - 0.5) * 0.025,
        y: (Math.random() - 0.5) * 0.025,
        z: (Math.random() - 0.5) * 0.015,
      });

      // Cyber palette: Vibrant Cyan (0, 210, 211) & Neon Purple (168, 85, 247) & Royal Blue (90, 127, 200)
      if (i % 3 === 0) {
        // Cyan
        colors[i * 3] = 0.0;
        colors[i * 3 + 1] = 0.82;
        colors[i * 3 + 2] = 0.83;
      } else if (i % 3 === 1) {
        // Purple
        colors[i * 3] = 0.66;
        colors[i * 3 + 1] = 0.33;
        colors[i * 3 + 2] = 0.97;
      } else {
        // Royal / Periwinkle
        colors[i * 3] = 0.35;
        colors[i * 3 + 1] = 0.5;
        colors[i * 3 + 2] = 0.85;
      }
    }

    // Procedural soft circle sprite
    const makeGlowTexture = () => {
      const c = document.createElement("canvas");
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext("2d");
      if (ctx) {
        const grad = ctx.createRadialGradient(32, 32, 1, 32, 32, 30);
        grad.addColorStop(0, "rgba(255, 255, 255, 1)");
        grad.addColorStop(0.3, "rgba(0, 210, 211, 0.9)");
        grad.addColorStop(0.7, "rgba(139, 92, 246, 0.4)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(c);
    };

    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    nodeGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const nodeMaterial = new THREE.PointsMaterial({
      size: isMobile ? 0.45 : 0.6,
      map: makeGlowTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const nodePoints = new THREE.Points(nodeGeometry, nodeMaterial);
    scene.add(nodePoints);

    // 3. Dynamic Connecting Lines (Network Links)
    const maxLines = (actualNodeCount * (actualNodeCount - 1)) / 2;
    const linePositions = new Float32Array(maxLines * 6);
    const lineColors = new Float32Array(maxLines * 6);

    const linesGeometry = new THREE.BufferGeometry();
    linesGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    linesGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

    const linesMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const networkLines = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(networkLines);

    // 4. Moving Data Packets on Links
    const packetCount = isMobile ? 8 : 16;
    const packetGeo = new THREE.BufferGeometry();
    const packetPositions = new Float32Array(packetCount * 3);
    packetGeo.setAttribute("position", new THREE.BufferAttribute(packetPositions, 3));

    const packetMat = new THREE.PointsMaterial({
      size: 0.8,
      color: 0x00d2d3,
      map: makeGlowTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const packetPoints = new THREE.Points(packetGeo, packetMat);
    scene.add(packetPoints);

    const packetRoutes: Array<{
      nodeA: number;
      nodeB: number;
      progress: number;
      speed: number;
    }> = [];

    for (let i = 0; i < packetCount; i++) {
      packetRoutes.push({
        nodeA: Math.floor(Math.random() * actualNodeCount),
        nodeB: Math.floor(Math.random() * actualNodeCount),
        progress: Math.random(),
        speed: 0.006 + Math.random() * 0.009,
      });
    }

    // 5. Mouse Parallax
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // 6. Window Resize
    const onResize = () => {
      if (!canvas || !renderer || !camera) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize, { passive: true });

    // 7. Animation Loop
    let animId: number;
    const maxConnectDistance = isMobile ? 7.5 : 8.8;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth mouse easing
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      scene.rotation.y = mouse.x * 0.15;
      scene.rotation.x = -mouse.y * 0.12;

      // Update node positions with gentle floating & boundary bounce
      const posArr = nodeGeometry.attributes.position.array as Float32Array;

      for (let i = 0; i < actualNodeCount; i++) {
        const vel = velocities[i];
        posArr[i * 3] += vel.x;
        posArr[i * 3 + 1] += vel.y;
        posArr[i * 3 + 2] += vel.z;

        // Bounce on boundary
        if (posArr[i * 3] < -bounds.x || posArr[i * 3] > bounds.x) vel.x *= -1;
        if (posArr[i * 3 + 1] < -bounds.y || posArr[i * 3 + 1] > bounds.y) vel.y *= -1;
        if (posArr[i * 3 + 2] < -bounds.z || posArr[i * 3 + 2] > bounds.z) vel.z *= -1;
      }
      nodeGeometry.attributes.position.needsUpdate = true;

      // Update connecting lines
      let lineIndex = 0;
      let colorIndex = 0;

      for (let i = 0; i < actualNodeCount; i++) {
        const x1 = posArr[i * 3];
        const y1 = posArr[i * 3 + 1];
        const z1 = posArr[i * 3 + 2];

        for (let j = i + 1; j < actualNodeCount; j++) {
          const x2 = posArr[j * 3];
          const y2 = posArr[j * 3 + 1];
          const z2 = posArr[j * 3 + 2];

          const dx = x1 - x2;
          const dy = y1 - y2;
          const dz = z1 - z2;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < maxConnectDistance) {
            const alpha = 1.0 - dist / maxConnectDistance;

            linePositions[lineIndex++] = x1;
            linePositions[lineIndex++] = y1;
            linePositions[lineIndex++] = z1;
            linePositions[lineIndex++] = x2;
            linePositions[lineIndex++] = y2;
            linePositions[lineIndex++] = z2;

            // Cyan to Purple line gradient
            lineColors[colorIndex++] = 0.0 * alpha;
            lineColors[colorIndex++] = 0.82 * alpha;
            lineColors[colorIndex++] = 0.83 * alpha;

            lineColors[colorIndex++] = 0.65 * alpha;
            lineColors[colorIndex++] = 0.35 * alpha;
            lineColors[colorIndex++] = 0.97 * alpha;
          }
        }
      }

      linesGeometry.setDrawRange(0, lineIndex / 3);
      linesGeometry.attributes.position.needsUpdate = true;
      linesGeometry.attributes.color.needsUpdate = true;

      // Update traveling data packets
      const packetPosArr = packetGeo.attributes.position.array as Float32Array;
      for (let p = 0; p < packetCount; p++) {
        const route = packetRoutes[p];
        route.progress += route.speed;
        if (route.progress >= 1) {
          route.progress = 0;
          route.nodeA = route.nodeB;
          route.nodeB = Math.floor(Math.random() * actualNodeCount);
        }

        const ax = posArr[route.nodeA * 3];
        const ay = posArr[route.nodeA * 3 + 1];
        const az = posArr[route.nodeA * 3 + 2];

        const bx = posArr[route.nodeB * 3];
        const by = posArr[route.nodeB * 3 + 1];
        const bz = posArr[route.nodeB * 3 + 2];

        packetPosArr[p * 3] = ax + (bx - ax) * route.progress;
        packetPosArr[p * 3 + 1] = ay + (by - ay) * route.progress;
        packetPosArr[p * 3 + 2] = az + (bz - az) * route.progress;
      }
      packetGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);

      nodeGeometry.dispose();
      nodeMaterial.dispose();
      linesGeometry.dispose();
      linesMaterial.dispose();
      packetGeo.dispose();
      packetMat.dispose();
      renderer.dispose();
    };
  }, [nodeCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-[1] opacity-70 ${className}`}
      style={{ mixBlendMode: "screen" }}
    />
  );
}
