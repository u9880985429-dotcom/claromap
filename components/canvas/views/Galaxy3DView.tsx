'use client'

import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useMapStore, type NodeRow } from '@/stores/mapStore'

/**
 * Galaxy3DView — räumliche Darstellung der Knoten als Sphere-Galaxy.
 * - Wichtigster Knoten (kleinste Schritt-Nummer) sitzt im Zentrum
 * - Restliche Knoten verteilen sich auf einer 3D-Sphäre (Fibonacci-Lattice)
 * - Connections als Linien zwischen den Sphären
 * - Drag = Rotation, Scroll = Zoom (via OrbitControls)
 * - Click auf Knoten = selectNode
 */
export function Galaxy3DView() {
  const allNodes = useMapStore((s) => s.nodes)
  const connections = useMapStore((s) => s.connections)
  const selectedNodeId = useMapStore((s) => s.selectedNodeId)

  if (allNodes.length === 0) {
    return (
      <EmptyState message="Erst Knoten in der Workflow-Ansicht anlegen — sie verteilen sich dann hier als Sphere-Galaxy im 3D-Raum." />
    )
  }

  return (
    <div className="relative h-full w-full bg-bg">
      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-md border border-line2 bg-bg2/80 px-3 py-1.5 text-xs text-text3 backdrop-blur">
        🖱 Drag = Rotation · Scroll = Zoom · Klick auf Knoten = Auswahl
      </div>
      <Canvas camera={{ position: [0, 0, 12], fov: 55 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={1.0} />
          <directionalLight position={[-5, -3, -5]} intensity={0.4} />
          <Galaxy
            nodes={allNodes}
            connections={connections}
            selectedNodeId={selectedNodeId}
          />
          <OrbitControls
            enablePan={false}
            minDistance={4}
            maxDistance={30}
            rotateSpeed={0.6}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

function Galaxy({
  nodes,
  connections,
  selectedNodeId,
}: {
  nodes: NodeRow[]
  connections: {
    id: string
    from_node_id: string | null
    to_node_id: string | null
  }[]
  selectedNodeId: string | null
}) {
  const groupRef = useRef<THREE.Group>(null)

  // Auto-Rotation langsam, solange User nicht draggt (OrbitControls
  // pausiert via internal state — wir rotieren leicht weiter, das gibt
  // Galaxy-Vibe)
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.06
    }
  })

  // Positionen berechnen: Knoten 1 = Zentrum, Rest auf Fibonacci-Sphäre
  const positioned = useMemo(() => {
    const sorted = [...nodes].sort((a, b) => a.step_number - b.step_number)
    const center = sorted[0]
    const branches = sorted.slice(1)
    const result = new Map<string, [number, number, number]>()
    result.set(center.id, [0, 0, 0])

    const radius = 5 + branches.length * 0.05
    const N = branches.length
    const phi = Math.PI * (Math.sqrt(5) - 1) // golden angle

    for (let i = 0; i < N; i++) {
      const y = 1 - (i / Math.max(1, N - 1)) * 2 // y geht von 1 bis -1
      const r = Math.sqrt(1 - y * y)
      const theta = phi * i
      const x = Math.cos(theta) * r
      const z = Math.sin(theta) * r
      result.set(branches[i].id, [x * radius, y * radius, z * radius])
    }
    return result
  }, [nodes])

  return (
    <group ref={groupRef}>
      {/* Connections */}
      {connections.map((c) => {
        // Free-Connection (ohne node-Bindung) gibt's in 3D nicht — überspringen
        if (!c.from_node_id || !c.to_node_id) return null
        const from = positioned.get(c.from_node_id)
        const to = positioned.get(c.to_node_id)
        if (!from || !to) return null
        return <ConnectionLine3D key={c.id} from={from} to={to} />
      })}

      {/* Nodes */}
      {nodes.map((node) => {
        const pos = positioned.get(node.id)
        if (!pos) return null
        return (
          <NodeSphere
            key={node.id}
            node={node}
            position={pos}
            selected={selectedNodeId === node.id}
            isCenter={pos[0] === 0 && pos[1] === 0 && pos[2] === 0}
          />
        )
      })}
    </group>
  )
}

function NodeSphere({
  node,
  position,
  selected,
  isCenter,
}: {
  node: NodeRow
  position: [number, number, number]
  selected: boolean
  isCenter: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const baseRadius = isCenter ? 1.0 : 0.45
  const progressBoost = (node.progress / 100) * 0.15
  const radius = baseRadius + progressBoost

  // Knoten pulsiert leicht wenn ausgewählt
  useFrame((state) => {
    if (meshRef.current && selected) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.08
      meshRef.current.scale.set(s, s, s)
    } else if (meshRef.current) {
      meshRef.current.scale.set(1, 1, 1)
    }
  })

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation()
          useMapStore.getState().selectNode(node.id)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={node.color}
          emissive={selected ? node.color : '#000000'}
          emissiveIntensity={selected ? 0.4 : 0}
          roughness={0.5}
          metalness={0.15}
        />
      </mesh>

      {/* Ring um ausgewählten Knoten */}
      {selected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.3, radius * 1.4, 64]} />
          <meshBasicMaterial color="#F5A623" side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Label via HTML-Overlay (immer der Kamera zugewandt) */}
      <Html
        center
        distanceFactor={isCenter ? 6 : 8}
        position={[0, radius + 0.5, 0]}
        zIndexRange={[0, 0]}
      >
        <div
          className="pointer-events-none flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line2 bg-bg2/95 px-2 py-1 text-xs font-semibold text-text shadow-soft backdrop-blur"
          style={{ transform: 'translateY(-4px)' }}
        >
          <span className="text-sm leading-none">{node.emoji ?? '📌'}</span>
          <span>{node.name}</span>
          <span className="text-[10px] opacity-70">{node.status_icon}</span>
        </div>
      </Html>
    </group>
  )
}

function ConnectionLine3D({
  from,
  to,
}: {
  from: [number, number, number]
  to: [number, number, number]
}) {
  const points = useMemo(
    () => [new THREE.Vector3(...from), new THREE.Vector3(...to)],
    [from, to],
  )
  const geometry = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(points),
    [points],
  )

  return (
    <primitive
      object={
        new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({
            color: 0x9ca3af,
            transparent: true,
            opacity: 0.5,
          }),
        )
      }
    />
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center bg-bg p-8">
      <div className="max-w-md rounded-xl border border-dashed border-line2 bg-bg2 p-8 text-center">
        <p className="font-display text-lg">3D-Galaxy noch leer</p>
        <p className="mt-2 text-sm text-text3">{message}</p>
      </div>
    </div>
  )
}
