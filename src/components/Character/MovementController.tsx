import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Raycaster, Vector2, Plane, Vector3 } from 'three'
import type { CareerPoint } from '../../types/career'
import { isMobile } from '../utils/pathUtils'

interface MovementControllerProps {
  onPositionChange: (position: [number, number, number]) => void
  onMovingChange: (moving: boolean) => void
  careerPoints: CareerPoint[]
}

const MovementController: React.FC<MovementControllerProps> = ({
  onPositionChange,
  onMovingChange,
  // careerPoints
}) => {
  const { camera, gl } = useThree()
  const targetPosition = useRef<[number, number, number] | null>(null)
  // const currentPosition = useRef<[number, number, number]>(careerPoints[0].position)
  const currentPosition = useRef<[number, number, number]>([-55,0,-22])
  const moveSpeed = 0.15
  const raycaster = new Raycaster()
  const mouse = new Vector2()
  const groundPlane = new Plane(new Vector3(0, 1, 0), 0)
  const mobile = isMobile()

  const handlePointerDown = (event: MouseEvent | TouchEvent) => {
    if (mobile) {
      event.preventDefault()
    }

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY

    const rect = gl.domElement.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 2 - 1
    const y = -((clientY - rect.top) / rect.height) * 2 + 1

    mouse.set(x, y)
    raycaster.setFromCamera(mouse, camera)

    const intersectionPoint = new Vector3()
    if (raycaster.ray.intersectPlane(groundPlane, intersectionPoint)) {
      targetPosition.current = [intersectionPoint.x, 0.5, intersectionPoint.z]
      onMovingChange(true)
    }
  }

  useEffect(() => {
    const canvas = gl.domElement

    if (mobile) {
      canvas.addEventListener('touchstart', handlePointerDown, { passive: false })
    } else {
      canvas.addEventListener('click', handlePointerDown)
    }

    return () => {
      if (mobile) {
        canvas.removeEventListener('touchstart', handlePointerDown)
      } else {
        canvas.removeEventListener('click', handlePointerDown)
      }
    }
  }, [gl.domElement, camera, mobile])

  useFrame(() => {
    if (targetPosition.current) {
      const dx = targetPosition.current[0] - currentPosition.current[0]
      const dz = targetPosition.current[2] - currentPosition.current[2]
      const distance = Math.sqrt(dx * dx + dz * dz)

      if (distance > moveSpeed) {
        currentPosition.current[0] += (dx / distance) * moveSpeed
        currentPosition.current[2] += (dz / distance) * moveSpeed
        onPositionChange([...currentPosition.current])
      } else {
        currentPosition.current = [...targetPosition.current]
        onPositionChange([...currentPosition.current])
        targetPosition.current = null
        onMovingChange(false)
      }
    }
  })

  return null
}

export default MovementController