"use client"

import { useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float } from "@react-three/drei"
import * as THREE from "three"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

function Heart3D({ isHovered }: { isHovered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      meshRef.current.scale.setScalar(isHovered ? 1.3 : 1)
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <torusKnotGeometry args={[0.25, 0.08, 100, 16]} />
        <meshStandardMaterial
          color={isHovered ? "#ff6b9d" : "#ff8fab"}
          emissive={isHovered ? "#ff6b9d" : "#ff8fab"}
          emissiveIntensity={isHovered ? 0.6 : 0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </Float>
  )
}

function Particles() {
  const particlesRef = useRef<THREE.Points>(null)
  const count = 100

  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10

    colors[i * 3] = 1
    colors[i * 3 + 1] = 0.5 + Math.random() * 0.5
    colors[i * 3 + 2] = 0.7 + Math.random() * 0.3
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.1
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.15
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.6} />
    </points>
  )
}

function LogoScene({ isHovered }: { isHovered: boolean }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} color="#ff8fab" intensity={0.5} />
      <Heart3D isHovered={isHovered} />
      <Particles />
    </>
  )
}

export function InteractiveLogo() {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="flex items-center space-x-2 cursor-pointer group"
      onClick={() => router.push("/")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative w-12 h-12">
        <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
          <LogoScene isHovered={isHovered} />
        </Canvas>
      </div>
      <motion.h1
        className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent transition-all duration-300"
        animate={{
          backgroundPosition: isHovered ? "100%" : "0%",
        }}
        style={{
          backgroundImage: isHovered
            ? "linear-gradient(90deg, #ff6b9d, #ff8fab, #ff6b9d)"
            : "linear-gradient(90deg, var(--primary), var(--accent))",
          backgroundSize: "200% 100%",
        }}
      >
        LOVETRIP
      </motion.h1>
    </motion.div>
  )
}

