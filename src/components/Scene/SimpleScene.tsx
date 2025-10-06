// src/components/Scene/SimpleScene.tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
// import * as THREE from 'three'

export const SimpleScene: React.FC = () => {
  return (
    <Canvas
      camera={{ position: [5, 5, 5], fov: 50 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'default'
      }}
    >
      <color attach="background" args={['#87CEEB']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Test with simple geometry instead of GLB */}
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      
      <mesh position={[0, -2, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="green" />
      </mesh>

      <OrbitControls />
    </Canvas>
  )
}