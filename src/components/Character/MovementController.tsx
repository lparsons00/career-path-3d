// src/components/Character/MovementController.tsx
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useCallback, useState } from 'react'
import * as THREE from 'three'
import type { CareerPoint } from '../../types/career'
import { isMobile } from '../utils/pathUtils'
import { logger } from '../utils/logger'
import { useCollision } from '../../context/CollisionContext'

interface MovementControllerProps {
  onPositionChange: (position: [number, number, number]) => void
  onMovingChange: (isMoving: boolean) => void
  careerPoints: CareerPoint[]
  playerPosition: [number, number, number]
}

const MovementController: React.FC<MovementControllerProps> = ({
  onPositionChange,
  onMovingChange,
  careerPoints,
  playerPosition
}) => {
  const keys = useRef<Set<string>>(new Set())
  const { getValidPosition, checkCollision } = useCollision()
  const currentPosition = useRef<[number, number, number]>(playerPosition)
  const { raycaster, mouse, camera, gl } = useThree()
  
  // Click-to-move state
  const [targetPosition, setTargetPosition] = useState<[number, number, number] | null>(null)
  const isMovingToTarget = useRef(false)

  // Update ref when position changes
  useEffect(() => {
    currentPosition.current = playerPosition
  }, [playerPosition])

  const moveSpeed = 0.3
  const playerRadius = 0.5
  const playerHeight = 2

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    keys.current.add(event.key.toLowerCase())
  }, [])

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    keys.current.delete(event.key.toLowerCase())
  }, [])

  const handleTouchStart = useCallback((event: TouchEvent) => {
    // Simple touch controls
    const touch = event.touches[0]
    if (touch.clientX < window.innerWidth / 2) {
      keys.current.add('arrowleft')
    } else {
      keys.current.add('arrowright')
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    keys.current.clear()
  }, [])

  // Click-to-move handler
  const handleClick = useCallback((event: MouseEvent) => {
    // Don't process clicks if we're interacting with UI elements
    if ((event.target as HTMLElement).closest('button, a, [role="button"]')) {
      return
    }

    // Calculate mouse position in normalized device coordinates (-1 to +1)
    const rect = gl.domElement.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    // Update the raycaster
    raycaster.setFromCamera(mouse, camera)

    // Create a plane at y=0 for ground intersection
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const intersectionPoint = new THREE.Vector3()
    
    // Check intersection with ground plane
    if (raycaster.ray.intersectPlane(groundPlane, intersectionPoint)) {
      const newTarget: [number, number, number] = [
        intersectionPoint.x,
        0, // Ground level
        intersectionPoint.z
      ]

      // Check if target position is valid (not inside collision objects)
      if (!checkCollision(newTarget)) {
        setTargetPosition(newTarget)
        isMovingToTarget.current = true
        onMovingChange(true)
        
        logger.info('MovementController', 'Click-to-move target set', {
          target: newTarget,
          currentPosition: currentPosition.current
        })
      } else {
        logger.info('MovementController', 'Click target is in collision area', {
          target: newTarget
        })
      }
    }
  }, [camera, gl.domElement, mouse, raycaster, checkCollision, onMovingChange])

  useEffect(() => {
    // Keyboard events
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // Click events for click-to-move
    if (!isMobile()) { // Only enable click-to-move on desktop
      gl.domElement.addEventListener('click', handleClick)
      gl.domElement.style.cursor = 'pointer' // Show pointer cursor to indicate clickable
    }

    // Touch events for mobile
    if (isMobile()) {
      window.addEventListener('touchstart', handleTouchStart)
      window.addEventListener('touchend', handleTouchEnd)
      window.addEventListener('touchcancel', handleTouchEnd)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      gl.domElement.removeEventListener('click', handleClick)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [handleKeyDown, handleKeyUp, handleClick, handleTouchStart, handleTouchEnd, gl.domElement])

  useFrame((_, delta) => {
    const currentKeys = keys.current
    let isMoving = false

    // Handle click-to-move movement
    if (isMovingToTarget.current && targetPosition) {
      const [targetX, targetY, targetZ] = targetPosition
      const [currentX, currentY, currentZ] = currentPosition.current
      
      // Calculate direction to target
      const dx = targetX - currentX
      const dz = targetZ - currentZ
      const distance = Math.sqrt(dx * dx + dz * dz)

      // If we're close enough to target, stop moving
      if (distance < 0.5) {
        isMovingToTarget.current = false
        setTargetPosition(null)
        onMovingChange(false)
        logger.info('MovementController', 'Reached click-to-move target', {
          target: targetPosition,
          finalPosition: currentPosition.current
        })
      } else {
        // Calculate movement for this frame
        const moveDistance = moveSpeed * delta * 60
        const ratio = Math.min(moveDistance / distance, 1)
        
        const desiredPosition: [number, number, number] = [
          currentX + dx * ratio,
          currentY,
          currentZ + dz * ratio
        ]

        // Check collision for the desired position
        if (!checkCollision(desiredPosition)) {
          onPositionChange(desiredPosition)
          isMoving = true
        } else {
          // If we hit a collision, stop click-to-move
          isMovingToTarget.current = false
          setTargetPosition(null)
          onMovingChange(false)
          logger.info('MovementController', 'Click-to-move blocked by collision', {
            target: targetPosition,
            blockedAt: desiredPosition
          })
        }
      }
    }

    // Handle keyboard movement (prioritized over click-to-move)
    if (currentKeys.size > 0) {
      // If keyboard keys are pressed, cancel click-to-move
      if (isMovingToTarget.current) {
        isMovingToTarget.current = false
        setTargetPosition(null)
      }

      // Calculate desired movement
      let moveX = 0
      let moveZ = 0

      if (currentKeys.has('arrowup') || currentKeys.has('w')) {
        moveZ -= moveSpeed * delta * 60
        isMoving = true
      }
      if (currentKeys.has('arrowdown') || currentKeys.has('s')) {
        moveZ += moveSpeed * delta * 60
        isMoving = true
      }
      if (currentKeys.has('arrowleft') || currentKeys.has('a')) {
        moveX -= moveSpeed * delta * 60
        isMoving = true
      }
      if (currentKeys.has('arrowright') || currentKeys.has('d')) {
        moveX += moveSpeed * delta * 60
        isMoving = true
      }

      // Update moving state
      onMovingChange(isMoving)

      // If moving, calculate new position with collision detection
      if (isMoving) {
        const desiredPosition: [number, number, number] = [
          currentPosition.current[0] + moveX,
          currentPosition.current[1],
          currentPosition.current[2] + moveZ
        ]

        // Check if desired position would cause collision
        if (!checkCollision(desiredPosition)) {
          // No collision, move to desired position
          onPositionChange(desiredPosition)
        } else {
          // Try sliding along X axis only
          const slideX: [number, number, number] = [
            currentPosition.current[0] + moveX,
            currentPosition.current[1],
            currentPosition.current[2]
          ]
          if (!checkCollision(slideX)) {
            onPositionChange(slideX)
            isMoving = true
          } else {
            // Try sliding along Z axis only
            const slideZ: [number, number, number] = [
              currentPosition.current[0],
              currentPosition.current[1],
              currentPosition.current[2] + moveZ
            ]
            if (!checkCollision(slideZ)) {
              onPositionChange(slideZ)
              isMoving = true
            }
            // If both slides fail, don't move (character stops at obstacle)
          }
        }
      }
    }
  })

  // Optional: Visual indicator for target position (debug)
  // You can remove this if you don't want visual feedback
  const showTargetIndicator = targetPosition && isMovingToTarget.current

  return (
    <>
      {showTargetIndicator && (
        <mesh position={targetPosition}>
          <ringGeometry args={[0.3, 0.5, 16]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.5} />
        </mesh>
      )}
    </>
  )
}

export default MovementController