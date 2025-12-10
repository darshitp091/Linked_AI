'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, Torus } from '@react-three/drei'
import * as THREE from 'three'

function AnimatedSphere({ position, color, speed = 1, distort = 0.3 }: { position: [number, number, number], color: string, speed?: number, distort?: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed
    }
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 32, 32]} position={position}>
        <MeshDistortMaterial
          color={color}
          distort={distort}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  )
}

function AnimatedTorus({ position, color }: { position: [number, number, number], color: string }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={2} floatIntensity={1}>
      <Torus ref={meshRef} args={[1, 0.4, 16, 32]} position={position}>
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.9}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </Torus>
    </Float>
  )
}

function Particles({ count = 100 }) {
  const points = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 20
      const y = (Math.random() - 0.5) * 20
      const z = (Math.random() - 0.5) * 20
      temp.push(x, y, z)
    }
    return new Float32Array(temp)
  }, [count])

  const pointsRef = useRef<THREE.Points>(null)

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.03
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
          args={[points, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#4f46e5" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

function GlowingRing({ position, color, scale = 1 }: { position: [number, number, number], color: string, scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.3
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <torusGeometry args={[1.5, 0.05, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  )
}

export function FloatingShapes() {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#8b5cf6" />
        <pointLight position={[10, -10, 5]} intensity={0.5} color="#3b82f6" />

        {/* Main shapes */}
        <AnimatedSphere position={[-4, 2, -2]} color="#3b82f6" distort={0.4} />
        <AnimatedSphere position={[4, -1, -3]} color="#8b5cf6" speed={0.8} distort={0.3} />
        <AnimatedTorus position={[3, 2, -1]} color="#06b6d4" />

        {/* Glowing rings */}
        <GlowingRing position={[0, 0, -5]} color="#3b82f6" scale={2} />
        <GlowingRing position={[2, 1, -4]} color="#8b5cf6" scale={1} />

        {/* Particles */}
        <Particles count={200} />
      </Canvas>
    </div>
  )
}
