"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

function FloatingParticles({ count = 200 }: { count?: number }) {
  const meshRef = useRef<THREE.Points>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    const color = new THREE.Color()
    const primaryColor = new THREE.Color("#ff8fab")
    const accentColor = new THREE.Color("#ff6b9d")

    for (let i = 0; i < count; i++) {
      // 분산된 위치
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10

      // 그라데이션 색상
      const mixedColor = color.lerpColors(primaryColor, accentColor, Math.random())
      colors[i * 3] = mixedColor.r
      colors[i * 3 + 1] = mixedColor.g
      colors[i * 3 + 2] = mixedColor.b

      sizes[i] = Math.random() * 0.02 + 0.01
    }

    return { positions, colors, sizes }
  }, [count])

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime
      const positions = meshRef.current.geometry.attributes.position.array as Float32Array

      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        // 부드러운 움직임
        positions[i3 + 1] += Math.sin(time + positions[i3]) * 0.001
        positions[i3] += Math.cos(time + positions[i3 + 1]) * 0.001
      }

      meshRef.current.geometry.attributes.position.needsUpdate = true
    }

    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(state.clock.elapsedTime) * 5
      lightRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.5) * 5
    }
  })

  return (
    <>
      <pointLight ref={lightRef} position={[0, 0, 5]} intensity={0.5} color="#ff8fab" />
      <points ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  )
}

function AnimatedMesh() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -5]}>
      <torusGeometry args={[2, 0.5, 16, 100]} />
      <meshStandardMaterial
        color="#ff8fab"
        emissive="#ff6b9d"
        emissiveIntensity={0.3}
        transparent
        opacity={0.2}
        wireframe
      />
    </mesh>
  )
}

export function WebGLBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none opacity-30">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.3} />
        <FloatingParticles count={200} />
        <AnimatedMesh />
      </Canvas>
    </div>
  )
}

