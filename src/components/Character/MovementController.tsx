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
  
  // Click/tap-to-move state
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

  // Unified pointer handler for both mouse and touch
  const handlePointer = useCallback((clientX: number, clientY: number) => {
    const rect = gl.domElement.getBoundingClientRect()
    
    // Calculate normalized device coordinates (-1 to +1)
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1

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
        
        logger.info('MovementController', 'Tap-to-move target set', {
          target: newTarget,
          currentPosition: currentPosition.current,
          isMobile: isMobile()
        })
      } else {
        logger.info('MovementController', 'Tap target is in collision area', {
          target: newTarget
        })
      }
    }
  }, [camera, gl.domElement, mouse, raycaster, checkCollision, onMovingChange])

  // Mouse click handler
  const handleClick = useCallback((event: MouseEvent) => {
    // Don't process clicks if we're interacting with UI elements
    if ((event.target as HTMLElement).closest('button, a, [role="button"]')) {
      return
    }
    handlePointer(event.clientX, event.clientY)
  }, [handlePointer])

  // Touch handler for mobile
  const handleTouch = useCallback((event: TouchEvent) => {
    // Prevent default to avoid scrolling and other touch behaviors
    event.preventDefault()
    
    // Only handle single touches for movement
    if (event.touches.length === 1) {
      const touch = event.touches[0]
      handlePointer(touch.clientX, touch.clientY)
    }
  }, [handlePointer])

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    // Don't clear keys for tap-to-move, only for the old left/right controls
  }, [])

  useEffect(() => {
    // Keyboard events
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // Pointer events based on device type
    if (isMobile()) {
      // Mobile: use touch events for tap-to-move
      gl.domElement.addEventListener('touchstart', handleTouch, { passive: false })
      gl.domElement.addEventListener('touchend', handleTouchEnd)
      gl.domElement.style.touchAction = 'none' // Prevent browser touch actions
    } else {
      // Desktop: use mouse click for click-to-move
      gl.domElement.addEventListener('click', handleClick)
      gl.domElement.style.cursor = 'pointer' // Show pointer cursor
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      gl.domElement.removeEventListener('click', handleClick)
      gl.domElement.removeEventListener('touchstart', handleTouch)
      gl.domElement.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleKeyDown, handleKeyUp, handleClick, handleTouch, handleTouchEnd, gl.domElement])

  useFrame((_, delta) => {
    const currentKeys = keys.current
    let isMoving = false

    // Handle tap/click-to-move movement
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
        logger.info('MovementController', 'Reached tap-to-move target', {
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
          // If we hit a collision, stop tap-to-move
          isMovingToTarget.current = false
          setTargetPosition(null)
          onMovingChange(false)
          logger.info('MovementController', 'Tap-to-move blocked by collision', {
            target: targetPosition,
            blockedAt: desiredPosition
          })
        }
      }
    }

    // Handle keyboard movement (prioritized over tap-to-move)
    if (currentKeys.size > 0) {
      // If keyboard keys are pressed, cancel tap-to-move
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