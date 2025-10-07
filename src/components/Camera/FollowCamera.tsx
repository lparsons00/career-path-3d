// src/components/Camera/FollowCamera.tsx
import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { logger } from '../utils/logger'

interface FollowCameraProps {
  target: [number, number, number]
  height?: number
  distance?: number
  smoothness?: number
}

const FollowCamera: React.FC<FollowCameraProps> = ({ 
  target, 
  height = 28, 
  distance = 15,
  smoothness = 0.1 
}) => {
  const { camera } = useThree()
  const targetVec = useRef(new THREE.Vector3(...target))
  const currentPos = useRef(new THREE.Vector3())
  const currentLookAt = useRef(new THREE.Vector3())

  // Initialize current position to camera's starting position
  useEffect(() => {
    currentPos.current.copy(camera.position)
    currentLookAt.current.copy(new THREE.Vector3(...target))
    logger.info('FollowCamera', 'Camera initialized', { 
      startPosition: currentPos.current.toArray(),
      target: target 
    })
  }, [camera.position])

  useFrame(() => {
    if (!camera) return

    const [targetX, targetY, targetZ] = target
    
    // Calculate ideal camera position (top-down view)
    const idealPosition = new THREE.Vector3(
      targetX,
      targetY + height,
      targetZ + distance
    )

    // Calculate ideal look-at point (slightly ahead of player for better view)
    const idealLookAt = new THREE.Vector3(
      targetX,
      targetY + 2, // Look at player's upper body
      targetZ - 5  // Look slightly ahead in the direction player is facing
    )

    // Smoothly interpolate current position towards ideal position
    currentPos.current.lerp(idealPosition, smoothness)
    currentLookAt.current.lerp(idealLookAt, smoothness)

    // Apply the smoothed position and look-at
    camera.position.copy(currentPos.current)
    camera.lookAt(currentLookAt.current)

    // Ensure camera update
    if ('updateProjectionMatrix' in camera && typeof (camera as any).updateProjectionMatrix === 'function') {
      (camera as any).updateProjectionMatrix()
    }
  })

  return null
}

export default FollowCamera