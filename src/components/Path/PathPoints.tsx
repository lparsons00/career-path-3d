import { useState } from 'react'
import { Text } from '@react-three/drei'
import type { CareerPoint } from '../../types/career'
import { calculateDistance } from '../utils/pathUtils'

interface PathPointsProps {
  points: CareerPoint[]
  onPointClick: (point: CareerPoint) => void
  playerPosition: [number, number, number]
}

const PathPoints: React.FC<PathPointsProps> = ({ points, onPointClick, playerPosition }) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  const handlePointClick = (point: CareerPoint) => {
    const distance = calculateDistance(playerPosition, point.position)
    if (distance <= 3) {
      if ((point.type === 'social' || point.type === 'hobby') && point.link) {
        window.open(point.link, '_blank')
      } else {
        onPointClick(point)
      }
    }
  }

  return (
    <group>
      {points.map((point) => {
        const distance = calculateDistance(playerPosition, point.position)
        const isClose = distance <= 3
        const isHovered = hoveredPoint === point.id
        const isSocial = point.type === 'social'
        const isHobby = point.type === 'hobby'

        // Different scaling for different node types
        let scale: [number, number, number] = [1, 1.5, 1]
        if (isSocial) scale = [1.2, 1.8, 1.2]
        if (isHobby) scale = [0.9, 1.3, 0.9] // Slightly smaller for hobby nodes

        return (
          <group key={point.id} position={point.position}>
            {/* Base platform - different colors for hobby nodes */}
            <mesh 
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -0.3, 0]}
            >
              <circleGeometry args={[1, 16]} />
              <meshStandardMaterial 
                color={point.color}
                transparent
                opacity={isHobby ? 0.1 : 0.15} // More subtle for hobbies
              />
            </mesh>

            {/* Glow effect when close */}
            {isClose && (
              <mesh 
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.2, 0]}
              >
                <ringGeometry args={[0.8, 1.2, 32]} />
                <meshBasicMaterial 
                  color={point.color}
                  transparent
                  opacity={isHobby ? 0.2 : 0.3}
                />
              </mesh>
            )}

            {/* Main point - different appearance for hobby nodes */}
            <mesh 
              onClick={() => handlePointClick(point)}
              onPointerEnter={() => setHoveredPoint(point.id)}
              onPointerLeave={() => setHoveredPoint(null)}
              scale={scale}
              castShadow
            >
              <cylinderGeometry args={[0.6, 0.6, 1.5, 16]} />
              <meshStandardMaterial 
                color={point.color}
                emissive={isClose ? point.color : "#000000"}
                emissiveIntensity={isClose ? (isHobby ? 0.2 : 0.3) : 0}
                transparent
                opacity={isHovered ? 0.9 : (isHobby ? 0.7 : 0.8)}
              />
            </mesh>

            {/* Icon */}
            <Text
              position={[0, 2, 0]}
              fontSize={1.0}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {point.icon}
            </Text>

            {/* Title */}
            <Text
              position={[0, 3.5, 0]}
              fontSize={0.4}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              maxWidth={4}
            >
              {point.title}
            </Text>

            {/* Year for career/passion nodes, different label for hobbies */}
            {!isSocial && !isHobby && (
              <Text
                position={[0, -0.8, 0]}
                fontSize={0.35}
                color="#FFD700"
                anchorX="center"
                anchorY="middle"
              >
                {point.year}
              </Text>
            )}

            {isHobby && (
              <Text
                position={[0, -0.8, 0]}
                fontSize={0.3}
                color="#AAAAAA"
                anchorX="center"
                anchorY="middle"
              >
                Hobby
              </Text>
            )}

            {/* Interaction hint */}
            {isClose && (
              <Text
                position={[0, -1.2, 0]}
                fontSize={0.3}
                color="#00ff00"
                anchorX="center"
                anchorY="middle"
              >
                {isSocial || isHobby ? "Click to visit" : "Click to learn more"}
              </Text>
            )}
          </group>
        )
      })}
    </group>
  )
}

export default PathPoints