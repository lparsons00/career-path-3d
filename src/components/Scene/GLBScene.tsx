// src/components/Scene/GLBScene.tsx
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'

interface GLBSceneProps {
  url: string
  position?: [number, number, number]
  scale?: number
  onLoad?: (scene: THREE.Group) => void
}

const GLBScene: React.FC<GLBSceneProps> = ({ 
  url, 
  position = [0, 0, 0],
  scale = 1,
  onLoad
}) => {
  const { scene, materials, animations } = useGLTF(url)
  const sceneRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (sceneRef.current) {
      // Configure shadows and materials
      sceneRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
          
          // Optimize materials for better performance
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.roughness = 0.8
            child.material.metalness = 0.2
          }
        }
      })

      // Notify parent that scene is loaded
      if (onLoad) {
        onLoad(sceneRef.current)
      }

      console.log('GLB Scene loaded:', {
        materials: Object.keys(materials),
        animations: animations?.length || 0,
        children: sceneRef.current.children.length
      })
    }
  }, [scene, materials, animations, onLoad])

  useFrame(() => {
    // You can add any continuous animations or updates here
  })

  return (
    <primitive
      ref={sceneRef}
      object={scene}
      position={position}
      scale={scale}
      rotation={[0, 0, 0]}
    />
  )
}

// Preload the model for better performance
useGLTF.preload('/models/town/town.glb')

export default GLBScene