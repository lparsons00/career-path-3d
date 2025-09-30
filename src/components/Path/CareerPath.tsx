import { useRef, useMemo } from 'react'
import { BufferGeometry, Vector3, LineBasicMaterial, Line } from 'three'

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

  return (
    <primitive object={new Line(geometry, material)} ref={lineRef} />
  )
}

export default CareerPath