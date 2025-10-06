// src/components/Scene/GLBScene.tsx
import { useGLTF } from '@react-three/drei'
import { useEffect, useState } from 'react'
import { logger } from '../utils/logger'

interface GLBSceneProps {
  url: string
  position: [number, number, number]
  scale: number
  onError?: () => void
}

const GLBScene: React.FC<GLBSceneProps> = ({ url, position, scale, onError }) => {
  const [loadError, setLoadError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  
  let scene = null;
  try {
    // useGLTF from drei handles GLTF/GLB loading automatically
    scene = useGLTF(url)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown GLB load error';
    logger.error('GLBScene', `Failed to load GLB (attempt ${attempts + 1}): ${url}`, { error: errorMsg });
    
    if (!loadError && attempts < 2) {
      setLoadError(errorMsg);
      setAttempts(prev => prev + 1);
      
      // Retry once after a short delay
      setTimeout(() => {
        setLoadError(null);
      }, 1000);
    } else if (attempts >= 2) {
      // Final failure after retries
      onError?.();
    }
  }

  useEffect(() => {
    if (scene && !loadError) {
      logger.info('GLBScene', `GLB loaded successfully: ${url}`);
    }
  }, [scene, url, loadError]);

  if (loadError && attempts >= 2) {
    return null; // Final failure, let parent handle fallback
  }

  if (!scene) {
    return null; // Still loading or failed
  }

  return <primitive object={scene.scene} position={position} scale={scale} />;
}

// Preload the model
useGLTF.preload('/models/town/town.glb');

export default GLBScene;