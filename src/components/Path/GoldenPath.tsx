import { useMemo } from 'react'
import type { CareerPoint } from '../../types/career'

interface GoldenPathProps {
  points: CareerPoint[]
}

const GoldenPath: React.FC<GoldenPathProps> = ({ points }) => {
  // Filter to only include career-related points (exclude hobby nodes)
  const careerPoints = useMemo(() => {
    return points.filter(point => 
      point.type === 'career'
    )
  }, [points])

  // Sort points by year to ensure proper path order
  const sortedPoints = useMemo(() => {
    return [...careerPoints].sort((a, b) => parseInt(a.year) - parseInt(b.year))
  }, [careerPoints])

  const pathPoints = useMemo(() => {
    return sortedPoints.map(point => [point.position[0], 0.1, point.position[2]] as [number, number, number])
  }, [sortedPoints])

  return (
    <group>
      {/* Create connecting paths between consecutive career points only */}
      {pathPoints.slice(0, -1).map((point, index) => {
        const nextPoint = pathPoints[index + 1]
        
        // Calculate distance and midpoint
        const dx = nextPoint[0] - point[0]
        const dz = nextPoint[2] - point[2]
        const distance = Math.sqrt(dx * dx + dz * dz)
        const midPoint = [
          (point[0] + nextPoint[0]) / 2,
          0.1,
          (point[2] + nextPoint[2]) / 2
        ]
        
        // Calculate rotation angle
        const angle = Math.atan2(dz, dx)

        return (
          <group key={index}>
            {/* Main golden path */}
            <mesh 
              position={midPoint as [number, number, number]} 
              rotation={[0, -angle, 0]}
            >
              <boxGeometry args={[distance, 0.1, 0.4]} />
              <meshStandardMaterial 
                color="#FFD700" 
                emissive="#FFA500"
                emissiveIntensity={0.3}
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
            
            {/* Subtle glow effect underneath */}
            <mesh 
              position={[midPoint[0], 0.05, midPoint[2]]} 
              rotation={[0, -angle, 0]}
            >
              <boxGeometry args={[distance + 0.2, 0.02, 0.5]} />
              <meshBasicMaterial 
                color="#FFA500"
                transparent
                opacity={0.2}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export default GoldenPath