// src/components/utils/textureOptimizer.ts
import * as THREE from 'three';
import { isMobile } from './pathUtils';

/**
 * Optimizes textures for mobile devices
 * Reduces texture quality, sets appropriate filters, and manages memory
 */
export const optimizeTextureForMobile = (texture: THREE.Texture): void => {
  if (!isMobile()) return;

  // Set lower quality filters for mobile
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 1; // Lower anisotropy on mobile

  // Set texture format hints for compression
  texture.format = THREE.RGBAFormat;
  texture.type = THREE.UnsignedByteType;

  // Flush texture to GPU immediately to free CPU memory
  texture.needsUpdate = true;
};

/**
 * Preloads and optimizes textures before use
 */
export const preloadTexture = async (
  url: string,
  onProgress?: (progress: number) => void
): Promise<THREE.Texture> => {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    
    loader.load(
      url,
      (texture) => {
        optimizeTextureForMobile(texture);
        resolve(texture);
      },
      (progress) => {
        if (progress.total > 0 && onProgress) {
          onProgress((progress.loaded / progress.total) * 100);
        }
      },
      (error) => {
        reject(error);
      }
    );
  });
};

/**
 * Gets recommended texture size based on device capabilities
 */
export const getOptimalTextureSize = (): number => {
  if (!isMobile()) return 2048;
  
  // Check device pixel ratio and memory constraints
  const dpr = window.devicePixelRatio || 1;
  
  // Limit texture size on mobile to save memory
  if (dpr >= 3) return 1024; // High DPI devices
  if (dpr >= 2) return 1024;  // Medium DPI devices
  return 512;                 // Low DPI or constrained devices
};

