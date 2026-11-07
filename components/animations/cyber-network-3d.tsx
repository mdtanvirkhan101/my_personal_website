"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { ShieldCheck, Network, Activity, RefreshCw, Zap, Cpu, Radio } from "lucide-react";

interface CyberNetwork3DProps {
  centerImage?: string;
  centerTitle?: string;
  badge1Value?: string;
  badge1Label?: string;
  badge2Value?: string;
  badge2Label?: string;
  className?: string;
}

export function CyberNetwork3D({
  centerImage,
  centerTitle = "Core System Node",
  badge1Value = "99.99%",
  badge1Label = "Uptime SLA",
  badge2Value = "0-Trust",
  badge2Label = "Perimeter Security",
  className = "",
}: CyberNetwork3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [telemetry, setTelemetry] = useState({
    packetsPerSec: 1420,
    latencyMs: 14,
    threatsBlocked: 27,
    activeNodes: 42,
  });

  // Keep references for animation interactions
  const pingWaveRef = useRef<{ active: boolean; radius: number; maxRadius: number }>({
    active: false,
    radius: 0,
    maxRadius: 3.5,
  });

  // Trigger interactive network security ping
  const triggerPingScan = useCallback(() => {
    setIsScanning(true);
    pingWaveRef.current.active = true;
    pingWaveRef.current.radius = 0.2;

    // Jitter telemetry temporarily to simulate live scan
    setTelemetry((prev) => ({
      ...prev,
      packetsPerSec: Math.floor(Math.random() * 800 + 2200),
      latencyMs: Math.floor(Math.random() * 5 + 9),
      threatsBlocked: prev.threatsBlocked + 1,
    }));

    setTimeout(() => {
      setIsScanning(false);
      setTelemetry((prev) => ({
        ...prev,
        packetsPerSec: 1420,
        latencyMs: 14,
      }));
    }, 2000);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 450;
    const height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0x252e8a, 1.2);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00d2d3, 2.5, 20);
    cyanLight.position.set(4, 3, 5);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 2.5, 20);
    purpleLight.position.set(-4, -3, 4);
    scene.add(purpleLight);

    // Root Group for Mouse Parallax
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // 3. Network Topology Nodes & Connections
    const nodeCount = 42;
    const nodePositions: THREE.Vector3[] = [];
    const sphereRadius = 2.0;

    // Distribute nodes evenly on spherical cyber shell (Fibonacci Sphere Algorithm)
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle
    for (let i = 0; i < nodeCount; i++) {
      const y = 1 - (i / (nodeCount - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      // Add slight jitter for realistic organic network structure
      const jitter = 0.88 + Math.random() * 0.24;
      const x = Math.cos(theta) * radiusAtY * sphereRadius * jitter;
      const z = Math.sin(theta) * radiusAtY * sphereRadius * jitter;
      const finalY = y * sphereRadius * jitter;

      nodePositions.push(new THREE.Vector3(x, finalY, z));
    }

    // Node Points Geometry
    const nodeGeometry = new THREE.BufferGeometry();
    const nodeCoords = new Float32Array(nodeCount * 3);
    const nodeColors = new Float32Array(nodeCount * 3);

    for (let i = 0; i < nodeCount; i++) {
      const p = nodePositions[i];
      nodeCoords[i * 3] = p.x;
      nodeCoords[i * 3 + 1] = p.y;
      nodeCoords[i * 3 + 2] = p.z;

      // Color scheme: Cyan (secure gateway), Purple (core backbone), Emerald (monitored switch)
      if (i % 5 === 0) {
        // Emerald gateway
        nodeColors[i * 3] = 0.2;
        nodeColors[i * 3 + 1] = 0.9;
        nodeColors[i * 3 + 2] = 0.6;
      } else if (i % 2 === 0) {
        // Cyan
        nodeColors[i * 3] = 0.0;
        nodeColors[i * 3 + 1] = 0.82;
        nodeColors[i * 3 + 2] = 0.83;
      } else {
        // Purple
        nodeColors[i * 3] = 0.65;
        nodeColors[i * 3 + 1] = 0.35;
        nodeColors[i * 3 + 2] = 0.97;
      }
    }

    nodeGeometry.setAttribute("position", new THREE.BufferAttribute(nodeCoords, 3));
    nodeGeometry.setAttribute("color", new THREE.BufferAttribute(nodeColors, 3));

    // Particle sprite using procedural canvas texture for glowing soft circles
    const makeCircleTexture = () => {
      const c = document.createElement("canvas");
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext("2d");
      if (ctx) {
        const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
        grad.addColorStop(0, "rgba(255, 255, 255, 1)");
        grad.addColorStop(0.3, "rgba(0, 210, 211, 0.8)");
        grad.addColorStop(0.7, "rgba(139, 92, 246, 0.3)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(c);
    };

    const nodeMaterial = new THREE.PointsMaterial({
      size: 0.16,
      map: makeCircleTexture(),
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const nodePoints = new THREE.Points(nodeGeometry, nodeMaterial);
    worldGroup.add(nodePoints);

    // 4. Network Lines (Edges between nearby nodes)
    const linePairs: number[] = [];
    const maxConnectDist = 1.6;
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const d = nodePositions[i].distanceTo(nodePositions[j]);
        if (d < maxConnectDist) {
          linePairs.push(
            nodePositions[i].x, nodePositions[i].y, nodePositions[i].z,
            nodePositions[j].x, nodePositions[j].y, nodePositions[j].z
          );
        }
      }
    }

    const linesGeometry = new THREE.BufferGeometry();
    linesGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(linePairs, 3)
    );

    const linesMaterial = new THREE.LineBasicMaterial({
      color: 0x5a7fc8,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const networkLines = new THREE.LineSegments(linesGeometry, linesMaterial);
    worldGroup.add(networkLines);

    // 5. Data Packets (Traveling photons along network links)
    const packetCount = 18;
    const packetData: Array<{
      start: THREE.Vector3;
      end: THREE.Vector3;
      progress: number;
      speed: number;
    }> = [];

    // Pair nodes for packet travel
    for (let i = 0; i < packetCount; i++) {
      const idxA = Math.floor(Math.random() * nodeCount);
      let idxB = Math.floor(Math.random() * nodeCount);
      while (idxB === idxA) {
        idxB = Math.floor(Math.random() * nodeCount);
      }
      packetData.push({
        start: nodePositions[idxA],
        end: nodePositions[idxB],
        progress: Math.random(),
        speed: 0.004 + Math.random() * 0.007,
      });
    }

    const packetGeo = new THREE.BufferGeometry();
    const packetPositions = new Float32Array(packetCount * 3);
    packetGeo.setAttribute("position", new THREE.BufferAttribute(packetPositions, 3));

    const packetMat = new THREE.PointsMaterial({
      size: 0.22,
      color: 0x00d2d3,
      map: makeCircleTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const packetPoints = new THREE.Points(packetGeo, packetMat);
    worldGroup.add(packetPoints);

    // 6. Security Defense Shield (Outer Geodesic Wireframe)
    const shieldGeo = new THREE.IcosahedronGeometry(2.45, 1);
    const shieldWireframe = new THREE.WireframeGeometry(shieldGeo);
    const shieldMat = new THREE.LineBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const shieldMesh = new THREE.LineSegments(shieldWireframe, shieldMat);
    worldGroup.add(shieldMesh);

    // 7. Radar / SOC Security Perimeter Rings
    const ringMat1 = new THREE.LineBasicMaterial({
      color: 0x00d2d3,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const ringGeo1 = new THREE.BufferGeometry();
    const ringPoints1: number[] = [];
    const ringSegments = 64;
    for (let i = 0; i <= ringSegments; i++) {
      const theta = (i / ringSegments) * Math.PI * 2;
      ringPoints1.push(Math.cos(theta) * 2.3, 0, Math.sin(theta) * 2.3);
    }
    ringGeo1.setAttribute("position", new THREE.Float32BufferAttribute(ringPoints1, 3));
    const radarRing1 = new THREE.Line(ringGeo1, ringMat1);
    radarRing1.rotation.x = Math.PI / 3;
    radarRing1.rotation.y = Math.PI / 6;
    worldGroup.add(radarRing1);

    const ringMat2 = new THREE.LineBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const ringGeo2 = new THREE.BufferGeometry();
    const ringPoints2: number[] = [];
    for (let i = 0; i <= ringSegments; i++) {
      const theta = (i / ringSegments) * Math.PI * 2;
      ringPoints2.push(Math.cos(theta) * 2.6, 0, Math.sin(theta) * 2.6);
    }
    ringGeo2.setAttribute("position", new THREE.Float32BufferAttribute(ringPoints2, 3));
    const radarRing2 = new THREE.Line(ringGeo2, ringMat2);
    radarRing2.rotation.x = -Math.PI / 4;
    radarRing2.rotation.z = Math.PI / 5;
    worldGroup.add(radarRing2);

    // 8. Ping / Shockwave Ring (Dynamic expansion)
    const pingGeo = new THREE.RingGeometry(0.1, 0.15, 48);
    const pingMat = new THREE.MeshBasicMaterial({
      color: 0x00d2d3,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const pingMesh = new THREE.Mesh(pingGeo, pingMat);
    pingMesh.lookAt(camera.position);
    worldGroup.add(pingMesh);

    // 9. Mouse Parallax & Smooth Damping
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.targetX = nx * 0.45;
      mouse.targetY = ny * 0.35;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 10. Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 11. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth mouse damping
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Base planetary orbit
      worldGroup.rotation.y = elapsed * 0.12 + mouse.x;
      worldGroup.rotation.x = Math.sin(elapsed * 0.08) * 0.15 + mouse.y;

      // Radar rings differential rotation
      radarRing1.rotation.y += delta * 0.4;
      radarRing2.rotation.z += delta * 0.3;
      shieldMesh.rotation.y -= delta * 0.08;

      // Animate Traveling Data Packets
      const positions = packetGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < packetCount; i++) {
        const p = packetData[i];
        p.progress += p.speed;
        if (p.progress >= 1) {
          p.progress = 0;
          // Switch to another node on arrival
          p.start = p.end;
          p.end = nodePositions[Math.floor(Math.random() * nodeCount)];
        }
        // Linear interpolation with slight arc
        const currentPos = new THREE.Vector3().lerpVectors(p.start, p.end, p.progress);
        positions[i * 3] = currentPos.x;
        positions[i * 3 + 1] = currentPos.y;
        positions[i * 3 + 2] = currentPos.z;
      }
      packetGeo.attributes.position.needsUpdate = true;

      // Animate Ping / Shockwave Ring
      if (pingWaveRef.current.active) {
        pingWaveRef.current.radius += delta * 3.8;
        const progress = pingWaveRef.current.radius / pingWaveRef.current.maxRadius;
        if (progress >= 1) {
          pingWaveRef.current.active = false;
          pingMat.opacity = 0;
        } else {
          const scale = pingWaveRef.current.radius;
          pingMesh.scale.set(scale, scale, scale);
          pingMat.opacity = (1 - progress) * 0.75;
          // Flare the lines and nodes slightly during scan
          linesMaterial.opacity = 0.28 + (1 - progress) * 0.35;
        }
      } else {
        linesMaterial.opacity = 0.28;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 12. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();

      // Dispose Geometries & Materials
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      linesGeometry.dispose();
      linesMaterial.dispose();
      packetGeo.dispose();
      packetMat.dispose();
      shieldGeo.dispose();
      shieldWireframe.dispose();
      shieldMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      pingGeo.dispose();
      pingMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-square max-w-[480px] sm:max-w-[540px] flex items-center justify-center select-none ${className}`}
    >
      {/* Three.js Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-10 pointer-events-auto cursor-crosshair"
        onClick={triggerPingScan}
        title="Click to trigger Network Ping & Perimeter Scan"
      />

      {/* Center Mainframe Avatar / Core Node */}
      {centerImage ? (
        <div className="relative z-20 w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1.5 pointer-events-none group">
          {/* Glowing Aura Ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500 via-purple-600 to-indigo-600 blur-xl opacity-60 animate-pulse" />
          <div className="relative w-full h-full rounded-full border-2 border-cyan-400/50 p-1.5 bg-[#0e0e34]/90 backdrop-blur-md overflow-hidden shadow-2xl shadow-cyan-500/20">
            <img
              src={centerImage}
              alt={centerTitle}
              className="w-full h-full rounded-full object-cover object-top"
            />
          </div>

          {/* Central Target Reticle Indicator */}
          <div className="absolute -inset-2 rounded-full border border-cyan-400/25 border-dashed animate-spin-slow pointer-events-none" />
        </div>
      ) : null}

      {/* Floating Tactical Badge: Left (Uptime SLA) */}
      <div className="absolute top-6 -left-3 sm:-left-6 z-20 bg-[#141444]/90 backdrop-blur-md border border-purple-500/40 px-3.5 py-2.5 rounded-2xl shadow-xl text-left font-mono pointer-events-auto transition-transform hover:scale-105">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-sm sm:text-base font-bold text-white">{badge1Value}</span>
        </div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wider">{badge1Label}</div>
      </div>

      {/* Floating Tactical Badge: Right (Zero-Trust Security) */}
      <div className="absolute bottom-6 -right-3 sm:-right-6 z-20 bg-[#141444]/90 backdrop-blur-md border border-cyan-500/40 px-3.5 py-2.5 rounded-2xl shadow-xl text-left font-mono pointer-events-auto transition-transform hover:scale-105">
        <div className="flex items-center space-x-1.5 text-cyan-400">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-sm sm:text-base font-bold">{badge2Value}</span>
        </div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wider">{badge2Label}</div>
      </div>

      {/* Floating Bottom Telemetry Bar & Scan Trigger */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20 w-[92%] sm:w-auto flex items-center justify-between sm:justify-center space-x-3 px-4 py-2 rounded-2xl bg-[#0e0e34]/90 backdrop-blur-md border border-purple-500/30 text-[11px] font-mono text-slate-300 shadow-2xl">
        <div className="flex items-center space-x-2 text-cyan-400">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>{telemetry.latencyMs}ms</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center space-x-1.5 text-purple-300 hidden sm:flex">
          <Network className="w-3.5 h-3.5" />
          <span>{telemetry.activeNodes} Nodes</span>
        </div>
        <span className="text-slate-600 hidden sm:inline">|</span>
        <button
          onClick={triggerPingScan}
          disabled={isScanning}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <Zap className={`w-3 h-3 ${isScanning ? "animate-spin text-emerald-400" : ""}`} />
          <span>{isScanning ? "SCANNING..." : "PING SCAN"}</span>
        </button>
      </div>
    </div>
  );
}
