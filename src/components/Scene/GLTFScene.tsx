// src/components/Scene/GLTFScene.tsx
import { useGLTF } from '@react-three/drei';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { logger } from '../utils/logger';

interface GLTFSceneProps {
  url: string;
  position: [number, number, number];
  scale: number;
  onError?: () => void;
}

const GLTFScene: React.FC<GLTFSceneProps> = ({ url, position, scale, onError }) => {
  const [hasError, setHasError] = useState(false);

  // Use the GLTF hook - drei will handle the loading
  const gltf = useGLTF(url);
  const scene = gltf.scene;

  useEffect(() => {
    if (scene) {
      logger.info('GLTFScene', 'GLTF model loaded successfully', { url });
      
      // Configure the scene
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [scene, url]);

  // Simple error handling with timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!scene) {
        logger.error('GLTFScene', 'GLTF loading failed - timeout', { url });
        setHasError(true);
        onError?.();
      }
    }, 8000); // 8 second timeout

    return () => clearTimeout(timer);
  }, [scene, url, onError]);

  if (hasError) {
    return null;
  }

  return scene ? (
    <primitive 
      object={scene} 
      position={position} 
      scale={scale}
    />
  ) : null;
};

export default GLTFScene;