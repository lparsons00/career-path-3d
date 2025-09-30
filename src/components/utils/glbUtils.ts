// src/utils/glbUtils.ts
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'

export const useGLBOptimizations = () => {
  const { scene } = useThree()

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Optimize materials
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material.roughness = 0.8
          child.material.metalness = 0.2
        }
        
        // Enable shadows
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene])
}