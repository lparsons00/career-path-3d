// src/components/utils/webglContextManager.ts
import * as THREE from 'three';
import { logger } from './logger';
import { isMobile } from './pathUtils';

/**
 * Manages WebGL context loss and recovery
 */
export class WebGLContextManager {
  private static instance: WebGLContextManager | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private contextLostHandlers: Set<() => void> = new Set();
  private contextRestoredHandlers: Set<() => void> = new Set();
  private isContextLost = false;

  static getInstance(): WebGLContextManager {
    if (!WebGLContextManager.instance) {
      WebGLContextManager.instance = new WebGLContextManager();
    }
    return WebGLContextManager.instance;
  }

  initialize(canvas: HTMLCanvasElement, renderer: THREE.WebGLRenderer) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.setupContextListeners();
  }

  private setupContextListeners() {
    if (!this.canvas) return;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      this.isContextLost = true;
      logger.warn('WebGLContextManager', 'Context lost', { isMobile: isMobile() });
      
      // Notify all handlers
      this.contextLostHandlers.forEach(handler => {
        try {
          handler();
        } catch (err) {
          logger.error('WebGLContextManager', 'Error in context lost handler', { error: err });
        }
      });
    };

    const handleContextRestored = () => {
      this.isContextLost = false;
      logger.info('WebGLContextManager', 'Context restored', { isMobile: isMobile() });
      
      // Reinitialize renderer if needed
      if (this.renderer) {
        try {
          this.renderer.forceContextRestore();
        } catch (err) {
          logger.warn('WebGLContextManager', 'Could not force context restore', { error: err });
        }
      }
      
      // Notify all handlers
      this.contextRestoredHandlers.forEach(handler => {
        try {
          handler();
        } catch (err) {
          logger.error('WebGLContextManager', 'Error in context restored handler', { error: err });
        }
      });
    };

    this.canvas.addEventListener('webglcontextlost', handleContextLost);
    this.canvas.addEventListener('webglcontextrestored', handleContextRestored);

    // Also listen on window for broader coverage
    window.addEventListener('webglcontextlost', handleContextLost);
    window.addEventListener('webglcontextrestored', handleContextRestored);
  }

  onContextLost(handler: () => void) {
    this.contextLostHandlers.add(handler);
    return () => this.contextLostHandlers.delete(handler);
  }

  onContextRestored(handler: () => void) {
    this.contextRestoredHandlers.add(handler);
    return () => this.contextRestoredHandlers.delete(handler);
  }

  getIsContextLost(): boolean {
    return this.isContextLost;
  }

  dispose() {
    this.contextLostHandlers.clear();
    this.contextRestoredHandlers.clear();
    this.canvas = null;
    this.renderer = null;
  }
}

/**
 * Aggressively reduces texture memory usage
 */
export const aggressivelyOptimizeTexture = (texture: THREE.Texture): void => {
  if (!isMobile()) return;

  // Set very low quality settings
  texture.minFilter = THREE.LinearFilter; // No mipmaps to save memory
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false; // Disable mipmaps to save memory
  texture.anisotropy = 1;
  
  // Force lower resolution if possible
  if (texture.image && (texture.image.width > 512 || texture.image.height > 512)) {
    // Note: Actual resizing requires canvas manipulation
    // For now, we use the lowest quality filters
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
  }
  
  texture.needsUpdate = true;
};

/**
 * Simplifies geometry by reducing vertex count (simplified version)
 */
export const simplifyGeometry = (geometry: THREE.BufferGeometry, targetReduction: number = 0.5): void => {
  if (!isMobile()) return;
  
  // For now, we just optimize attributes
  // Full simplification would require more complex algorithms
  // This is a placeholder for future enhancement
  
  // Remove unnecessary attributes
  const keepAttributes = ['position', 'normal', 'uv'];
  Object.keys(geometry.attributes).forEach(key => {
    if (!keepAttributes.includes(key)) {
      geometry.deleteAttribute(key);
    }
  });
  
  // Normalize attributes to reduce precision if needed
  if (geometry.attributes.position) {
    geometry.attributes.position.normalized = false;
  }
};

