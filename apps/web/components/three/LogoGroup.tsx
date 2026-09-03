"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text3D, Center } from "@react-three/drei";
import * as THREE from "three";

interface LogoGroupProps {
  mouse: React.RefObject<{ x: number; y: number }>;
  scroll: React.RefObject<{ progress: number; velocity: number }>;
  fontUrl: string;
}

/**
 * 3D W$ Logo Assembly — the centrepiece of the hero.
 *
 * W — brushed silver/platinum metallic
 * $ — green energy core with emissive glow + orbiting point light
 *
 * Mouse: subtle inertia-damped rotation (lerp 0.04/frame)
 * Scroll: W drifts left, $ comes forward & scales up, then everything fades
 */
export default function LogoGroup({ mouse, scroll, fontUrl }: LogoGroupProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wRef = useRef<THREE.Group>(null);
  const dollarRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  // Inertia-smoothed mouse position
  const smoothed = useRef({ x: 0, y: 0 });

  // Silver metallic material for W
  const silverMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#E0E0DE"),
        metalness: 0.88,
        roughness: 0.12,
        envMapIntensity: 1.5,
      }),
    []
  );

  // Green emissive material for $
  const greenMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#84CC16"),
        emissive: new THREE.Color("#84CC16"),
        emissiveIntensity: 0.35,
        metalness: 0.72,
        roughness: 0.18,
        envMapIntensity: 1.2,
      }),
    []
  );

  useFrame((state, delta) => {
    if (!groupRef.current || !wRef.current || !dollarRef.current) return;

    const t = scroll.current?.progress ?? 0;

    /* ── Mouse inertia ─────────────────────────────────── */
    const lerp = 0.04;
    const mx = mouse.current?.x ?? 0;
    const my = mouse.current?.y ?? 0;
    smoothed.current.x += (mx - smoothed.current.x) * lerp;
    smoothed.current.y += (my - smoothed.current.y) * lerp;

    // Mouse influence fades as user scrolls into decomposition
    const mouseInfluence = Math.max(0, 1 - t * 3.5);
    groupRef.current.rotation.y =
      smoothed.current.x * 0.28 * mouseInfluence;
    groupRef.current.rotation.x =
      smoothed.current.y * 0.14 * mouseInfluence;

    /* ── Scroll-driven decomposition (0 → 0.3) ──────── */
    const decompose = Math.min(t / 0.3, 1);
    const easeDecompose = 1 - Math.pow(1 - decompose, 3); // ease-out cubic

    // W drifts left & back
    wRef.current.position.x = THREE.MathUtils.lerp(-1.0, -4.0, easeDecompose);
    wRef.current.position.z = THREE.MathUtils.lerp(0, -2, easeDecompose);
    wRef.current.rotation.y = THREE.MathUtils.lerp(0, -0.5, easeDecompose);
    wRef.current.position.y = THREE.MathUtils.lerp(0, 0.5, easeDecompose);

    // $ comes forward, scales up
    dollarRef.current.position.z = THREE.MathUtils.lerp(0, 2, easeDecompose);
    dollarRef.current.position.x = THREE.MathUtils.lerp(1.2, 0, easeDecompose);
    const dollarScale = THREE.MathUtils.lerp(1, 1.6, easeDecompose);
    dollarRef.current.scale.setScalar(dollarScale);

    // $ subtle continuous rotation (feels alive)
    dollarRef.current.rotation.y += delta * 0.25;

    /* ── Fade out after 0.55 ──────────────────────────── */
    const fadeOut = t > 0.55 ? Math.min((t - 0.55) / 0.15, 1) : 0;
    groupRef.current.position.y = THREE.MathUtils.lerp(0, -4, fadeOut);

    // Opacity via material (traverse all meshes)
    const opacity = 1 - fadeOut;
    groupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (mat.opacity !== undefined) {
          mat.transparent = true;
          mat.opacity = opacity;
        }
      }
    });

    // Glow intensity pulses
    if (glowRef.current) {
      glowRef.current.intensity =
        (1.5 + Math.sin(state.clock.elapsedTime * 2) * 0.5) * opacity;
    }
  });

  return (
    <group ref={groupRef}>
      {/* W — Brushed Platinum Metal */}
      <group ref={wRef} position={[-1.0, 0, 0]}>
        <Center>
          <Text3D
            font={fontUrl}
            size={1.6}
            height={0.35}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.025}
            bevelSize={0.018}
            bevelSegments={4}
            material={silverMaterial}
          >
            W
          </Text3D>
        </Center>
      </group>

      {/* $ — Green Energy Core */}
      <group ref={dollarRef} position={[1.2, 0, 0]}>
        <Center>
          <Text3D
            font={fontUrl}
            size={1.6}
            height={0.35}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.025}
            bevelSize={0.018}
            bevelSegments={4}
            material={greenMaterial}
          >
            $
          </Text3D>
        </Center>

        {/* Orbiting green point light — the "financial energy" */}
        <pointLight
          ref={glowRef}
          color="#84CC16"
          intensity={1.5}
          distance={8}
          position={[0, 0, -0.5]}
        />
      </group>
    </group>
  );
}
