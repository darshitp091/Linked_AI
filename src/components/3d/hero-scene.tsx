'use client'

import { useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment, PresentationControls, RoundedBox, Sphere, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function LinkedInLogo() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={groupRef}>
        {/* LinkedIn-style box */}
        <RoundedBox args={[2, 2, 0.3]} radius={0.2} smoothness={4} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#0077b5"
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={0.9}
          />
        </RoundedBox>

        {/* "in" text representation */}
        <mesh position={[-0.4, 0.1, 0.2]}>
          <boxGeometry args={[0.15, 0.8, 0.1]} />
          <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.2} />
        </mesh>
        <mesh position={[-0.4, 0.6, 0.2]}>
          <sphereGeometry args={[0.12, 32, 32]} />
          <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.2} />
        </mesh>
        <mesh position={[0.2, -0.1, 0.2]}>
          <boxGeometry args={[0.15, 0.6, 0.1]} />
          <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.2} />
        </mesh>
        <mesh position={[0.5, 0.1, 0.2]}>
          <boxGeometry args={[0.15, 0.8, 0.1]} />
          <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.2} />
        </mesh>
      </group>
    </Float>
  )
}

function AIBrain() {
  const meshRef = useRef<THREE.Mesh>(null)
  const wireframeRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current && wireframeRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
      wireframeRef.current.rotation.y = state.clock.elapsedTime * 0.3
      wireframeRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1}>
      <group position={[3, 0, 0]}>
        <Sphere ref={meshRef} args={[1, 32, 32]}>
          <MeshDistortMaterial
            color="#8b5cf6"
            distort={0.4}
            speed={2}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
        <mesh ref={wireframeRef} scale={1.3}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#a855f7" wireframe transparent opacity={0.3} />
        </mesh>
      </group>
    </Float>
  )
}

function CalendarCube() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={1.5}>
      <group ref={groupRef} position={[-3, -0.5, 0]}>
        <RoundedBox args={[1.5, 1.5, 0.2]} radius={0.1} smoothness={4}>
          <meshStandardMaterial color="#10b981" metalness={0.8} roughness={0.2} />
        </RoundedBox>
        {/* Calendar grid lines */}
        {[...Array(3)].map((_, i) => (
          <mesh key={`h-${i}`} position={[0, 0.3 - i * 0.3, 0.11]}>
            <boxGeometry args={[1.3, 0.02, 0.01]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
        {[...Array(3)].map((_, i) => (
          <mesh key={`v-${i}`} position={[-0.3 + i * 0.3, 0, 0.11]}>
            <boxGeometry args={[0.02, 1.3, 0.01]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>
    </Float>
  )
}

function Particles({ count = 100 }) {
  const points = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 15
      const y = (Math.random() - 0.5) * 15
      const z = (Math.random() - 0.5) * 10 - 5
      temp.push(x, y, z)
    }
    return new Float32Array(temp)
  }, [count])

  const pointsRef = useRef<THREE.Points>(null)

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02
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
      <pointsMaterial size={0.05} color="#6366f1" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

function GlowingSphere({ position, color, scale = 1 }: { position: [number, number, number], color: string, scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(scale + Math.sin(state.clock.elapsedTime * 2) * 0.1)
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  )
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
          <pointLight position={[-5, 5, 5]} intensity={0.8} color="#3b82f6" />
          <pointLight position={[5, -5, 5]} intensity={0.5} color="#8b5cf6" />

          <PresentationControls
            global
            rotation={[0, 0, 0]}
            polar={[-0.2, 0.2]}
            azimuth={[-0.5, 0.5]}
          >
            <LinkedInLogo />
            <AIBrain />
            <CalendarCube />
          </PresentationControls>

          {/* Floating particles */}
          <Particles count={150} />

          {/* Glowing orbs */}
          <GlowingSphere position={[-4, 2, -3]} color="#3b82f6" scale={0.8} />
          <GlowingSphere position={[4, -2, -4]} color="#8b5cf6" scale={0.6} />
          <GlowingSphere position={[0, 3, -5]} color="#06b6d4" scale={0.5} />

          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  )
}
