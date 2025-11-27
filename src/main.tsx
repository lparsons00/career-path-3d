// CRITICAL: Patch WebGL context and Array methods BEFORE any other imports
// This must happen before THREE.js is loaded
if (typeof window !== 'undefined') {
  const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // Patch Array methods to handle null/undefined - CRITICAL for mobile
  // Note: This is a backup patch - index.html should patch it first
  const originalIndexOf = Array.prototype.indexOf;
  Array.prototype.indexOf = function(searchElement: any, fromIndex?: number): number {
    try {
      // CRITICAL: Check for null/undefined FIRST (typeof null === 'object' in JS!)
      if (this === null || this === undefined) {
        console.warn('[MAIN] Array.indexOf called on null/undefined, returning -1');
        return -1;
      }
      // Check if it's a primitive (not an object)
      if (typeof this !== 'object' && typeof this !== 'function') {
        console.warn('[MAIN] Array.indexOf called on primitive, returning -1');
        return -1;
      }
      // Try to call original - if it fails, return -1
      return originalIndexOf.call(this, searchElement, fromIndex);
    } catch (error) {
      // If original call fails (e.g., not array-like), return -1
      console.warn('[MAIN] Array.indexOf error, returning -1:', error);
      return -1;
    }
  };
  
  // Also patch String.indexOf for safety
  const originalStringIndexOf = String.prototype.indexOf;
  String.prototype.indexOf = function(searchString: string, position?: number): number {
    try {
      // CRITICAL: Check for null/undefined FIRST
      if (this === null || this === undefined) {
        console.warn('[MAIN] String.indexOf called on null/undefined, returning -1');
        return -1;
      }
      // Check if it's actually a string or string-like
      if (typeof this !== 'string' && typeof this !== 'object') {
        console.warn('[MAIN] String.indexOf called on non-string, returning -1');
        return -1;
      }
      return originalStringIndexOf.call(this, searchString, position);
    } catch (error) {
      console.warn('[MAIN] String.indexOf error, returning -1:', error);
      return -1;
    }
  };
  
  if (isMobileDevice) {
    // Patch WebGL context synchronously
    const originalGetShaderPrecisionFormat = WebGLRenderingContext.prototype.getShaderPrecisionFormat;
    
    WebGLRenderingContext.prototype.getShaderPrecisionFormat = function(
      shaderType: number,
      precisionType: number
    ): WebGLShaderPrecisionFormat | null {
      try {
        if (!this) {
          return { rangeMin: 127, rangeMax: 127, precision: 23 } as WebGLShaderPrecisionFormat;
        }
        if (this.isContextLost && this.isContextLost()) {
          return { rangeMin: 127, rangeMax: 127, precision: 23 } as WebGLShaderPrecisionFormat;
        }
        const result = originalGetShaderPrecisionFormat.call(this, shaderType, precisionType);
        return result || { rangeMin: 127, rangeMax: 127, precision: 23 } as WebGLShaderPrecisionFormat;
      } catch (error) {
        return { rangeMin: 127, rangeMax: 127, precision: 23 } as WebGLShaderPrecisionFormat;
      }
    };
    
    // Also patch WebGL2 if available
    if (typeof WebGL2RenderingContext !== 'undefined') {
      const originalGetShaderPrecisionFormat2 = WebGL2RenderingContext.prototype.getShaderPrecisionFormat;
      
      WebGL2RenderingContext.prototype.getShaderPrecisionFormat = function(
        shaderType: number,
        precisionType: number
      ): WebGLShaderPrecisionFormat | null {
        try {
          if (!this) {
            return { rangeMin: 127, rangeMax: 127, precision: 23 } as WebGLShaderPrecisionFormat;
          }
          if (this.isContextLost && this.isContextLost()) {
            return { rangeMin: 127, rangeMax: 127, precision: 23 } as WebGLShaderPrecisionFormat;
          }
          const result = originalGetShaderPrecisionFormat2.call(this, shaderType, precisionType);
          return result || { rangeMin: 127, rangeMax: 127, precision: 23 } as WebGLShaderPrecisionFormat;
        } catch (error) {
          return { rangeMin: 127, rangeMax: 127, precision: 23 } as WebGLShaderPrecisionFormat;
        }
      };
    }
  }
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Preload critical resources for faster mobile loading
if (typeof window !== 'undefined') {
  // Preconnect to external resources
  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = 'https://www.gstatic.com';
  document.head.appendChild(preconnect);
  
  // Preload Draco decoder if needed
  const dracoPreload = document.createElement('link');
  dracoPreload.rel = 'preload';
  dracoPreload.as = 'script';
  dracoPreload.href = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/draco_decoder.js';
  document.head.appendChild(dracoPreload);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)