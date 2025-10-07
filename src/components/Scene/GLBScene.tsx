// src/components/Scene/GLBScene.tsx
import { useGLTF } from '@react-three/drei';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { logger } from '../utils/logger';

interface GLBSceneProps {
  url: string;
  position: [number, number, number];
  scale: number;
  onError?: () => void;
}

const GLBScene: React.FC<GLBSceneProps> = ({ url, position, scale, onError }) => {
  const [loadState, setLoadState] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [attemptedUrls, setAttemptedUrls] = useState<string[]>([]);

  // Try different URL strategies
  const urlStrategies = [
    url, // Original path
    window.location.origin + url, // Absolute URL
    './models/town.glb', // Relative path from root
    '/career-path-3d/models/town.glb', // If deployed to subpath
  ];

  const currentUrl = urlStrategies[attemptedUrls.length] || url;

  // Use GLTF with error handling
  const gltf = useGLTF(currentUrl, true);
  const scene = gltf.scene;

  useEffect(() => {
    logger.info('GLBScene', 'Attempting to load GLB', {
      currentUrl,
      attemptedUrls: attemptedUrls.length,
      allStrategies: urlStrategies
    });

    // Check if scene loaded successfully
    if (scene) {
      setLoadState('success');
      logger.info('GLBScene', 'GLB loaded successfully', {
        url: currentUrl,
        sceneChildren: scene.children.length
      });

      // Configure the loaded scene
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.transparent = false;
          }
        }
      });
    }
  }, [scene, currentUrl, attemptedUrls, urlStrategies]);

  // Handle loading errors with a timeout approach
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!scene && loadState === 'loading') {
        // If scene hasn't loaded after a reasonable time, consider it an error
        const errorMsg = `Timeout loading GLB from ${currentUrl}`;
        setErrorMessage(errorMsg);
        logger.error('GLBScene', 'GLB load timeout', {
          url: currentUrl,
          attemptedUrls
        });

        // Try next strategy
        if (attemptedUrls.length < urlStrategies.length - 1) {
          const nextAttempt = attemptedUrls.length + 1;
          logger.info('GLBScene', 'Trying next URL strategy', {
            nextUrl: urlStrategies[nextAttempt],
            attempt: nextAttempt + 1
          });
          setAttemptedUrls(prev => [...prev, currentUrl]);
        } else {
          // All strategies failed
          setLoadState('error');
          logger.error('GLBScene', 'All GLB load strategies failed', {
            attemptedUrls: [...attemptedUrls, currentUrl]
          });
          onError?.();
        }
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, [scene, loadState, currentUrl, attemptedUrls, urlStrategies, onError]);

  // Log loading state changes
  useEffect(() => {
    logger.info('GLBScene', 'Load state changed', {
      state: loadState,
      currentUrl,
      errorMessage
    });
  }, [loadState, currentUrl, errorMessage]);

  if (loadState === 'error') {
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

// Preload for better performance
useGLTF.preload('/models/town.glb');

export default GLBScene;