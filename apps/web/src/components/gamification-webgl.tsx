"use client"

import { useRef, useState, useEffect, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float } from "@react-three/drei"
import * as THREE from "three"
import { motion } from "framer-motion"

function LevelBadge3D({ level: _level, isAnimating }: { level: number; isAnimating: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (groupRef.current) {
      if (isAnimating) {
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.2
        groupRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1)
      } else {
        groupRef.current.rotation.y = hovered ? Math.sin(state.clock.elapsedTime) * 0.1 : 0
        groupRef.current.scale.setScalar(hovered ? 1.1 : 1)
      }
    }
  })

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
        <mesh>
          <torusGeometry args={[0.8, 0.2, 16, 32]} />
          <meshStandardMaterial
            color="#ff8fab"
            emissive="#ff6b9d"
            emissiveIntensity={hovered ? 0.8 : 0.4}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        <mesh position={[0, 0, 0.3]}>
          <ringGeometry args={[0.3, 0.5, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ff8fab"
            emissiveIntensity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Float>
    </group>
  )
}

function XPBar3D({ progress, isAnimating }: { progress: number; isAnimating: boolean }) {
  const barRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (barRef.current && isAnimating) {
      barRef.current.scale.x = progress
    }
  })

  return (
    <group position={[0, -1.5, 0]}>
      {/* 배경 바 */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.1, 0.1]} />
        <meshStandardMaterial color="#333" opacity={0.3} transparent />
      </mesh>
      {/* 진행 바 */}
      <mesh ref={barRef} position={[-1 + progress, 0, 0.01]} scale={[progress, 1, 1]}>
        <boxGeometry args={[2, 0.1, 0.1]} />
        <meshStandardMaterial
          color="#ff6b9d"
          emissive="#ff8fab"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  )
}

function Sparkles({ count = 50 }: { count?: number }) {
  const particlesRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4
    }
    return positions
  }, [count])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.5
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.01
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#ff8fab" transparent opacity={0.8} />
    </points>
  )
}

function GamificationScene({
  level,
  progress,
  isAnimating,
}: {
  level: number
  progress: number
  isAnimating: boolean
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#ff8fab" />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#ff6b9d" />
      <LevelBadge3D level={level} isAnimating={isAnimating} />
      <XPBar3D progress={progress} isAnimating={isAnimating} />
      <Sparkles count={30} />
    </>
  )
}

export function GamificationWebGL({
  level,
  currentXP,
  xpToNextLevel,
}: {
  level: number
  currentXP: number
  xpToNextLevel: number
}) {
  const [isAnimating, setIsAnimating] = useState(false)
  const progress = Math.min(currentXP / xpToNextLevel, 1)

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 2000)
    return () => clearTimeout(timer)
  }, [currentXP, level])

  return (
    <motion.div
      className="relative w-full h-64 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <GamificationScene level={level} progress={progress} isAnimating={isAnimating} />
      </Canvas>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <motion.div
          className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          Level {level}
        </motion.div>
        <div className="mt-4 text-sm text-muted-foreground">
          {currentXP} / {xpToNextLevel} XP
        </div>
      </div>
    </motion.div>
  )
}

