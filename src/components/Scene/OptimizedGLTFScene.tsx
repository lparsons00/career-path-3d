// src/components/Scene/OptimizedGLTFScene.tsx
import { useGLTF, useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { logger } from '../utils/logger';
import { isMobile } from '../utils/pathUtils';
// Texture optimization utilities imported but using aggressive version
import { aggressivelyOptimizeTexture, simplifyGeometry } from '../utils/webglContextManager';
import { preloadDracoDecoder } from '../utils/dracoLoader';
import { checkGLTFAccessibility } from '../utils/gltfDebugger';

interface OptimizedGLTFSceneProps {
  url: string;
  position: [number, number, number];
  scale: number;
  onError?: () => void;
  onLoadProgress?: (progress: number) => void;
}

const OptimizedGLTFScene: React.FC<OptimizedGLTFSceneProps> = ({ 
  url, 
  position, 
  scale, 
  onError,
  onLoadProgress 
}) => {
  const [hasError, setHasError] = useState(false);
  const [optimizationComplete, setOptimizationComplete] = useState(false);
  const mobile = isMobile();
  
  // Preload Draco decoder on mount for faster loading
  useEffect(() => {
    preloadDracoDecoder().catch(err => {
      logger.warn('OptimizedGLTFScene', 'Draco decoder preload failed', { error: err });
    });
    
    // Check if GLTF file is accessible
    checkGLTFAccessibility(url).then(isAccessible => {
      if (!isAccessible) {
        logger.error('OptimizedGLTFScene', 'GLTF file is not accessible', { url });
        setHasError(true);
        onError?.();
      }
    });
  }, [url, onError]);
  
  // Use drei's useProgress to track loading
  const { progress, active } = useProgress();
  
  // Report progress to parent (optional)
  useEffect(() => {
    if (onLoadProgress) {
      onLoadProgress(active ? progress : 100);
    }
  }, [progress, active, onLoadProgress]);

  // Use the GLTF hook with Draco compression support
  // The second parameter enables Draco decompression if the file is compressed
  // drei automatically handles the Draco decoder loading
  // Note: useGLTF can throw errors, but we can't wrap hooks in try-catch
  // Errors will be caught by ErrorBoundary and Suspense
  const gltf = useGLTF(url, true); // true = use draco decoder if file is compressed
  const scene = gltf?.scene;
  
  // Log when scene becomes available
  useEffect(() => {
    if (scene) {
      logger.info('OptimizedGLTFScene', 'GLTF scene available', { 
        url,
        childrenCount: scene.children.length,
        isMobile: mobile,
        sceneType: scene.type,
        sceneUuid: scene.uuid
      });
    } else if (gltf) {
      logger.warn('OptimizedGLTFScene', 'GLTF loaded but scene is null', { 
        url,
        gltfKeys: Object.keys(gltf)
      });
    }
  }, [scene, gltf, url, mobile]);

  // Optimize the loaded scene for mobile
  useEffect(() => {
    if (!scene || optimizationComplete) return;

    try {
      logger.info('OptimizedGLTFScene', 'Starting scene optimization', { 
        isMobile: mobile,
        url 
      });

      const startTime = performance.now();
      let meshCount = 0;
      let textureCount = 0;

      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          meshCount++;
          
          // Optimize geometry
          if (child.geometry) {
            // Merge vertices if possible
            if (!child.geometry.attributes.position) return;
            
            // Compute vertex normals if missing (for better lighting)
            if (!child.geometry.attributes.normal && mobile) {
              child.geometry.computeVertexNormals();
            }
            
            // Aggressively optimize geometry on mobile
            if (mobile) {
              // Simplify geometry to reduce memory
              simplifyGeometry(child.geometry, 0.3); // Reduce by 30%
              
              // Dispose of unused attributes
              const keepAttributes = ['position', 'normal', 'uv'];
              Object.keys(child.geometry.attributes).forEach(key => {
                if (!keepAttributes.includes(key)) {
                  child.geometry.deleteAttribute(key);
                }
              });
              
              // Disable expensive geometry features
              child.geometry.computeBoundingBox();
              child.geometry.computeBoundingSphere();
            }
          }

          // Optimize materials for mobile
          if (child.material) {
            const material = child.material as THREE.MeshStandardMaterial;
            
            // Reduce texture quality on mobile
            if (material.map) {
              textureCount++;
              const texture = material.map as THREE.Texture;
              
              // Aggressively optimize textures on mobile
              if (mobile) {
                aggressivelyOptimizeTexture(texture);
              } else {
                // Desktop: higher quality
                texture.anisotropy = 4;
                texture.minFilter = THREE.LinearMipmapLinearFilter;
                texture.magFilter = THREE.LinearFilter;
              }
            }
            
            // Optimize other texture maps
            const textureMaps = [
              material.normalMap,
              material.roughnessMap,
              material.metalnessMap,
              material.aoMap,
              material.emissiveMap
            ].filter(Boolean) as THREE.Texture[];
            
            textureMaps.forEach(texture => {
              if (mobile) {
                aggressivelyOptimizeTexture(texture);
              }
            });
            
            // On mobile, consider removing some texture maps entirely to save memory
            if (mobile) {
              // Remove less critical maps
              material.normalMap = null;
              material.roughnessMap = null;
              material.metalnessMap = null;
              // Keep only base color and maybe AO
            }

            // Simplify material properties on mobile
            if (mobile) {
              // Disable shadows on mobile for performance
              child.castShadow = false;
              child.receiveShadow = false;
              
              // Use simpler material settings
              if (material.roughness !== undefined) {
                material.roughness = Math.max(0.5, material.roughness);
              }
              if (material.metalness !== undefined) {
                material.metalness = Math.min(0.5, material.metalness);
              }
              
              // Disable expensive features
              material.envMapIntensity = 0;
            } else {
              // Desktop: enable shadows
              child.castShadow = true;
              child.receiveShadow = true;
            }
          }
        }
      });

      // Dispose of unused resources
      if (mobile) {
        // Remove unused textures from cache
        THREE.Cache.clear();
      }

      const endTime = performance.now();
      logger.info('OptimizedGLTFScene', 'Scene optimization complete', {
        isMobile: mobile,
        meshCount,
        textureCount,
        optimizationTime: `${(endTime - startTime).toFixed(2)}ms`
      });

      setOptimizationComplete(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown optimization error';
      logger.error('OptimizedGLTFScene', 'Optimization failed', { 
        error: errorMsg,
        isMobile: mobile 
      });
      // Don't fail completely, just log the error
    }
  }, [scene, mobile, optimizationComplete, url]);

  // Error handling with timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!scene && !hasError) {
        logger.error('OptimizedGLTFScene', 'GLTF loading failed - timeout', { url });
        setHasError(true);
        onError?.();
      }
    }, mobile ? 15000 : 10000); // Longer timeout on mobile

    return () => clearTimeout(timer);
  }, [scene, url, onError, hasError, mobile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scene) {
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) {
              child.geometry.dispose();
            }
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                  if (mat.map) mat.map.dispose();
                  mat.dispose();
                });
              } else {
                const mat = child.material as THREE.MeshStandardMaterial;
                if (mat.map) mat.map.dispose();
                mat.dispose();
              }
            }
          }
        });
      }
    };
  }, [scene]);

  if (hasError) {
    logger.error('OptimizedGLTFScene', 'Rendering null due to error', { url });
    return null;
  }

  if (!scene) {
    logger.warn('OptimizedGLTFScene', 'Scene is null, not rendering', { url });
    return null;
  }

  // Verify scene has content before rendering
  if (scene.children.length === 0) {
    logger.warn('OptimizedGLTFScene', 'Scene has no children', { url });
  }

  logger.info('OptimizedGLTFScene', 'Rendering scene', { 
    url,
    childrenCount: scene.children.length,
    position,
    scale,
    scenePosition: scene.position,
    sceneScale: scene.scale,
    sceneVisible: scene.visible
  });

  // Ensure scene is visible
  scene.visible = true;
  scene.position.set(...position);
  scene.scale.set(scale, scale, scale);

  return (
    <primitive 
      object={scene} 
    />
  );
};

export default OptimizedGLTFScene;

