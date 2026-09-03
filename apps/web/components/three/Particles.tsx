"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticlesProps {
  mouse: React.RefObject<{ x: number; y: number }>;
  scroll: React.RefObject<{ progress: number; velocity: number }>;
}

/**
 * Controlled orbital particle system around the $ energy core.
 * ~40 particles in tight elliptical orbits — NOT cheesy full-screen particles.
 * Speed responds to mouse velocity. Bloomberg Terminal × Web3 aesthetic.
 */
export default function Particles({ mouse, scroll }: ParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 40;

  // Orbital parameters for each particle
  const orbitalData = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        radius: 0.8 + Math.random() * 0.6,
        speed: 0.3 + Math.random() * 0.4,
        phase: (i / count) * Math.PI * 2 + Math.random() * 0.5,
        heightAmp: 0.15 + Math.random() * 0.25,
        heightFreq: 0.4 + Math.random() * 0.5,
        eccentricity: 0.5 + Math.random() * 0.5,
      })),
    []
  );

  // Pre-allocate geometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.elapsedTime;
    const scrollT = scroll.current?.progress ?? 0;

    // Particles visible only during logo phase (0 → 0.65)
    const particleOpacity = scrollT < 0.5 ? 1 : Math.max(0, 1 - (scrollT - 0.5) / 0.15);
    pointsRef.current.visible = particleOpacity > 0.01;
    if (!pointsRef.current.visible) return;

    // $ position shifts forward with scroll decomposition
    const decompose = Math.min(scrollT / 0.3, 1);
    const dollarZ = THREE.MathUtils.lerp(0, 2, decompose);
    const dollarScale = THREE.MathUtils.lerp(1, 1.6, decompose);
    pointsRef.current.position.set(1.2, 0, dollarZ);

    // Mouse velocity adds speed boost
    const mouseVelMag = mouse.current
      ? Math.sqrt(mouse.current.x ** 2 + mouse.current.y ** 2)
      : 0;
    const speedBoost = 1 + mouseVelMag * 0.3;

    const posArray = geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const d = orbitalData[i];
      const angle = time * d.speed * speedBoost + d.phase;
      posArray[i * 3] = Math.cos(angle) * d.radius * dollarScale;
      posArray[i * 3 + 1] =
        Math.sin(time * d.heightFreq + d.phase) * d.heightAmp * dollarScale;
      posArray[i * 3 + 2] =
        Math.sin(angle) * d.radius * d.eccentricity * dollarScale;
    }
    geometry.attributes.position.needsUpdate = true;

    // Update material opacity
    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.opacity = particleOpacity * 0.85;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#84CC16"
        size={0.035}
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
