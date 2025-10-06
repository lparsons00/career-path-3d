// src/components/Scene/GLBScene.tsx
import { useGLTF } from '@react-three/drei'
import { useEffect, useState } from 'react'
import { logger } from '../utils/logger'
import * as THREE from 'three';

interface GLBSceneProps {
  url: string
  position: [number, number, number]
  scale: number
}

const GLBScene: React.FC<GLBSceneProps> = ({ url, position, scale }) => {
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadTime, setLoadTime] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const startTime = Date.now()
  
  // useGLTF doesn't return loading and error states, so we need to handle them manually
  const scene = useGLTF(url)

  useEffect(() => {
    try {
      if (scene) {
        const endTime = Date.now();
        const loadDuration = endTime - startTime;
        setLoadTime(loadDuration);
        setIsLoading(false);
        
        logger.info('GLBScene', `Model loaded successfully: ${url}`, {
          loadTime: `${loadDuration}ms`,
          vertices: scene.scene.children.reduce((acc, child) => 
            acc + (child instanceof THREE.Mesh ? 
              (child.geometry.attributes.position?.count || 0) : 0), 0)
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown GLB load error';
      logger.error('GLBScene', `Failed to load model: ${url}`, { error: errorMsg });
      setLoadError(errorMsg);
      setIsLoading(false);
    }
  }, [scene, url, startTime]);

  useEffect(() => {
    if (isLoading) {
      logger.info('GLBScene', `Loading model: ${url}`);
    }
  }, [isLoading, url]);

  if (loadError) {
    logger.warn('GLBScene', `Model load issue: ${url}`, { error: loadError });
    return null;
  }

  if (!scene) {
    return null; // Still loading
  }

  return <primitive object={scene.scene} position={position} scale={scale} />;
}

// Preload the model
useGLTF.preload('/models/town/town.glb');

export default GLBScene;