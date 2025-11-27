// src/utils/threejsPatch.ts
/**
 * Patches THREE.js to handle mobile WebGL context issues gracefully
 * This prevents errors when getShaderPrecisionFormat is called on a null context
 */

import * as THREE from 'three';
import { isMobile } from '../components/utils/pathUtils';

/**
 * Patches WebGLRenderingContext to handle null precision format gracefully
 */
export const patchWebGLContext = (): void => {
  if (typeof window === 'undefined' || !isMobile()) return;

  // Store original getShaderPrecisionFormat
  const originalGetShaderPrecisionFormat = WebGLRenderingContext.prototype.getShaderPrecisionFormat;

  // Override to handle null context
  WebGLRenderingContext.prototype.getShaderPrecisionFormat = function(
    shaderType: number,
    precisionType: number
  ): WebGLShaderPrecisionFormat | null {
    try {
      // Check if context is valid - if 'this' is null/undefined, return default
      if (!this) {
        console.warn('WebGL context is null, returning default precision');
        return {
          rangeMin: 127,
          rangeMax: 127,
          precision: 23
        } as WebGLShaderPrecisionFormat;
      }

      // Check if context is lost
      if (this.isContextLost && this.isContextLost()) {
        console.warn('WebGL context is lost, returning default precision');
        return {
          rangeMin: 127,
          rangeMax: 127,
          precision: 23
        } as WebGLShaderPrecisionFormat;
      }

      // Try to call original method
      const result = originalGetShaderPrecisionFormat.call(this, shaderType, precisionType);
      
      // If result is null, return default
      if (!result) {
        console.warn('getShaderPrecisionFormat returned null, using default');
        return {
          rangeMin: 127,
          rangeMax: 127,
          precision: 23
        } as WebGLShaderPrecisionFormat;
      }

      return result;
    } catch (error) {
      // If any error occurs (including null reference), return default
      console.warn('Error in getShaderPrecisionFormat, using default:', error);
      return {
        rangeMin: 127,
        rangeMax: 127,
        precision: 23
      } as WebGLShaderPrecisionFormat;
    }
  };

  // Also patch WebGL2RenderingContext if available
  if (typeof WebGL2RenderingContext !== 'undefined') {
    const originalGetShaderPrecisionFormat2 = WebGL2RenderingContext.prototype.getShaderPrecisionFormat;
    
    WebGL2RenderingContext.prototype.getShaderPrecisionFormat = function(
      shaderType: number,
      precisionType: number
    ): WebGLShaderPrecisionFormat | null {
      try {
        if (!this) {
          console.warn('WebGL2 context is null, returning default precision');
          return {
            rangeMin: 127,
            rangeMax: 127,
            precision: 23
          } as WebGLShaderPrecisionFormat;
        }

        if (this.isContextLost && this.isContextLost()) {
          console.warn('WebGL2 context is lost, returning default precision');
          return {
            rangeMin: 127,
            rangeMax: 127,
            precision: 23
          } as WebGLShaderPrecisionFormat;
        }

        const result = originalGetShaderPrecisionFormat2.call(this, shaderType, precisionType);
        
        if (!result) {
          console.warn('getShaderPrecisionFormat returned null, using default');
          return {
            rangeMin: 127,
            rangeMax: 127,
            precision: 23
          } as WebGLShaderPrecisionFormat;
        }

        return result;
      } catch (error) {
        console.warn('Error in getShaderPrecisionFormat (WebGL2), using default:', error);
        return {
          rangeMin: 127,
          rangeMax: 127,
          precision: 23
        } as WebGLShaderPrecisionFormat;
      }
    };
  }
};

/**
 * Patches THREE.js WebGLRenderer to handle context initialization errors
 */
export const patchTHREEWebGLRenderer = (): void => {
  if (typeof window === 'undefined' || !isMobile()) return;

  // Store original WebGLRenderer
  const OriginalWebGLRenderer = THREE.WebGLRenderer;

  // Create a wrapper that handles errors during initialization
  class SafeWebGLRenderer extends OriginalWebGLRenderer {
    constructor(parameters?: THREE.WebGLRendererParameters) {
      try {
        super(parameters);
      } catch (error: any) {
        // If initialization fails due to precision format error, try with safer settings
        if (error?.message?.includes('getShaderPrecisionFormat') || 
            error?.message?.includes('null is not an object')) {
          console.warn('WebGLRenderer initialization failed, retrying with safer settings');
          
          // Try again with more conservative settings
          const safeParams: THREE.WebGLRendererParameters = {
            ...parameters,
            powerPreference: 'low-power',
            failIfMajorPerformanceCaveat: false,
            precision: 'mediump' as any, // Force medium precision
          };

          try {
            return new OriginalWebGLRenderer(safeParams) as any;
          } catch (retryError) {
            console.error('WebGLRenderer retry also failed:', retryError);
            throw retryError;
          }
        }
        throw error;
      }
    }
  }

  // Replace THREE.WebGLRenderer with our safe version
  // Note: This is a workaround - we can't directly replace it, so we'll handle it in the Canvas component
}

