import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface PlayerCharacterProps {
  position: [number, number, number]
  isMoving: boolean
}

const PlayerCharacter: React.FC<PlayerCharacterProps> = ({ position, isMoving }) => {
  const groupRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.set(...position)
      
      if (bodyRef.current && isMoving) {
        bodyRef.current.position.y = Math.sin(state.clock.elapsedTime * 8) * 0.1
      }
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={bodyRef} position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.3, 1.5, 16]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      
      <mesh position={[0, 1.4, 0]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#2980b9" />
      </mesh>
      
      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

export default PlayerCharacter