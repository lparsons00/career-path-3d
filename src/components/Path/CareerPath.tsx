import { useRef, useMemo } from 'react'
import { BufferGeometry, Vector3, LineBasicMaterial, Line } from 'three'
import { useFrame } from '@react-three/fiber'

interface CareerPathProps {
  points: [number, number, number][]
}

const CareerPath: React.FC<CareerPathProps> = ({ points }) => {
  const lineRef = useRef<Line>(null)
  
  // Create geometry from points
  const geometry = useMemo(() => {
    const geom = new BufferGeometry()
    const vectors = points.map(point => new Vector3(...point))
    geom.setFromPoints(vectors)
    return geom
  }, [points])

  const material = useMemo(() => 
    new LineBasicMaterial({ 
      color: 0xFFD700, // Gold color
      linewidth: 4,
      transparent: true,
      opacity: 0.9
    }), 
  [])

  useFrame((state) => {
    if (lineRef.current) {
      // Subtle pulsing animation
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 1
      lineRef.current.scale.set(pulse, pulse, pulse)
    }
  })

  return (
    <primitive object={new Line(geometry, material)} ref={lineRef} />
  )
}

export default CareerPath