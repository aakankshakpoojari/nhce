"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface NetworkSceneProps {
  scroll: React.RefObject<{ progress: number; velocity: number }>;
}

/* ── Node definitions ────────────────────────────────── */
const NODES = [
  { id: "user", pos: [-3.2, 1.8, 0.5], label: "USER" },
  { id: "wallet", pos: [-1.5, -0.2, 1.2], label: "WALLET" },
  { id: "contract", pos: [0.0, 1.6, -0.5], label: "CONTRACT" },
  { id: "escrow", pos: [1.6, -0.3, 0.8], label: "ESCROW" },
  { id: "settle", pos: [0.2, -1.8, -0.3], label: "SETTLEMENT" },
  { id: "receiver", pos: [3.2, -1.6, 0.3], label: "RECEIVER" },
  { id: "verify", pos: [-0.5, 0.8, 1.5], label: "VERIFY" },
  { id: "audit", pos: [2.8, 1.2, -0.8], label: "AUDIT" },
] as const;

const EDGES: [number, number][] = [
  [0, 1], // user → wallet
  [1, 2], // wallet → contract
  [1, 3], // wallet → escrow
  [2, 3], // contract → escrow
  [3, 4], // escrow → settlement
  [4, 5], // settlement → receiver
  [2, 4], // contract → settlement
  [6, 1], // verify → wallet
  [7, 3], // audit → escrow
  [0, 6], // user → verify
];

/**
 * Financial network visualization — appears during scroll phase 0.3-0.7.
 * Glowing nodes + connections with traveling pulses.
 * Represents the trustless escrow transaction flow.
 */
export default function NetworkScene({ scroll }: NetworkSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pulseRefs = useRef<THREE.Mesh[]>([]);

  // Node positions as Vector3
  const nodePositions = useMemo(
    () => NODES.map((n) => new THREE.Vector3(...n.pos)),
    []
  );

  // Line geometries for connections
  const lineGeometries = useMemo(
    () =>
      EDGES.map(([from, to]) => {
        const geo = new THREE.BufferGeometry().setFromPoints([
          nodePositions[from],
          nodePositions[to],
        ]);
        return geo;
      }),
    [nodePositions]
  );

  // Green line material
  const lineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color("#84CC16"),
        transparent: true,
        opacity: 0.4,
        linewidth: 1,
      }),
    []
  );

  // Connection lines as THREE.Line objects (rendered via <primitive>)
  const lines = useMemo(
    () => lineGeometries.map((geo) => new THREE.Line(geo, lineMaterial)),
    [lineGeometries, lineMaterial]
  );

  // Node sphere material
  const nodeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#84CC16"),
        emissive: new THREE.Color("#84CC16"),
        emissiveIntensity: 0.6,
        metalness: 0.5,
        roughness: 0.3,
        transparent: true,
      }),
    []
  );

  // Pulse material (bright green)
  const pulseMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#BEF264"),
        transparent: true,
        opacity: 0.9,
      }),
    []
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = scroll.current?.progress ?? 0;

    /* ── Visibility: fade in 0.3→0.45, hold, fade out 0.65→0.8 ── */
    let opacity = 0;
    if (t >= 0.3 && t < 0.45) {
      opacity = (t - 0.3) / 0.15;
    } else if (t >= 0.45 && t < 0.65) {
      opacity = 1;
    } else if (t >= 0.65 && t < 0.8) {
      opacity = 1 - (t - 0.65) / 0.15;
    }

    groupRef.current.visible = opacity > 0.01;
    if (!groupRef.current.visible) return;

    // Apply opacity to all materials
    nodeMaterial.opacity = opacity;
    lineMaterial.opacity = opacity * 0.4;
    pulseMaterial.opacity = opacity * 0.9;

    // Subtle rotation
    const time = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(time * 0.15) * 0.15;
    groupRef.current.rotation.x = Math.cos(time * 0.1) * 0.05;

    // Scale in with the fade
    const scale = THREE.MathUtils.lerp(0.6, 1, Math.min(opacity * 1.5, 1));
    groupRef.current.scale.setScalar(scale);

    // Animate pulses along edges
    pulseRefs.current.forEach((pulse, i) => {
      if (!pulse) return;
      const [fromIdx, toIdx] = EDGES[i];
      const from = nodePositions[fromIdx];
      const to = nodePositions[toIdx];

      // Each pulse travels at a different phase
      const speed = 0.4 + (i % 3) * 0.15;
      const phase = (i / EDGES.length) * Math.PI * 2;
      const progress = ((time * speed + phase) % (Math.PI * 2)) / (Math.PI * 2);

      pulse.position.lerpVectors(from, to, progress);
      pulse.scale.setScalar(0.8 + Math.sin(progress * Math.PI) * 0.4);
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, -1]}>
      {/* Nodes — small glowing spheres */}
      {NODES.map((node, i) => (
        <group key={node.id} position={nodePositions[i].toArray()}>
          <mesh material={nodeMaterial}>
            <sphereGeometry args={[0.12, 16, 16]} />
          </mesh>
          {/* Node label */}
          <Text
            position={[0, 0.28, 0]}
            fontSize={0.14}
            color="#A3A3A3"
            anchorX="center"
            anchorY="bottom"
            font="/fonts/inter-var.woff2"
          >
            {node.label}
          </Text>
          {/* Point light per node */}
          <pointLight color="#84CC16" intensity={0.3} distance={2} />
        </group>
      ))}

      {/* Edges — glowing connections */}
      {lines.map((line, i) => (
        <primitive key={`edge-${i}`} object={line} />
      ))}

      {/* Pulses traveling along edges */}
      {EDGES.map((_, i) => (
        <mesh
          key={`pulse-${i}`}
          ref={(el: THREE.Mesh) => {
            if (el) pulseRefs.current[i] = el;
          }}
          material={pulseMaterial}
        >
          <sphereGeometry args={[0.04, 8, 8]} />
        </mesh>
      ))}
    </group>
  );
}
