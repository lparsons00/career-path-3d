// src/components/utils/dracoLoader.ts
/**
 * Draco loader utilities for GLTF compression
 * 
 * Note: drei's useGLTF automatically handles Draco decompression
 * when a Draco-compressed GLTF file is loaded. This file provides
 * optional preloading functionality.
 */

/**
 * Preloads Draco decoder for faster loading
 * drei automatically loads the decoder when needed, but preloading
 * can improve initial load time
 */
export const preloadDracoDecoder = async (): Promise<void> => {
  try {
    // drei uses three-stdlib which includes Draco support
    // The decoder is loaded automatically when needed
    // This preloads it explicitly for better performance
    const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');
    const dracoLoader = new DRACOLoader();
    
    // Use Google's CDN for Draco decoder (most reliable)
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    
    // Preload the decoder
    await new Promise<void>((resolve) => {
      dracoLoader.preload();
      // Give it a moment to load
      setTimeout(() => resolve(), 100);
    });
  } catch (error) {
    // Non-fatal - drei will load it when needed
    console.warn('Failed to preload Draco decoder (will load on demand):', error);
  }
};

