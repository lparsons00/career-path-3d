// src/utils/arrayPatch.ts
/**
 * Patches Array methods to handle null/undefined gracefully on mobile
 * This prevents errors when THREE.js or other libraries call indexOf on null
 */

/**
 * Patches Array.prototype methods to handle edge cases
 */
export const patchArrayMethods = (): void => {
  if (typeof window === 'undefined') return;

  // Store original indexOf
  const originalIndexOf = Array.prototype.indexOf;

  // Override indexOf to handle null/undefined
  Array.prototype.indexOf = function(searchElement: any, fromIndex?: number): number {
    try {
      // If 'this' is null or undefined, return -1
      if (this == null) {
        console.warn('Array.indexOf called on null/undefined, returning -1');
        return -1;
      }

      // Call original method
      return originalIndexOf.call(this, searchElement, fromIndex);
    } catch (error) {
      console.warn('Error in Array.indexOf, returning -1:', error);
      return -1;
    }
  };

  // Also patch String.prototype.indexOf for safety
  const originalStringIndexOf = String.prototype.indexOf;
  String.prototype.indexOf = function(searchString: string, position?: number): number {
    try {
      if (this == null) {
        console.warn('String.indexOf called on null/undefined, returning -1');
        return -1;
      }
      return originalStringIndexOf.call(this, searchString, position);
    } catch (error) {
      console.warn('Error in String.indexOf, returning -1:', error);
      return -1;
    }
  };
};

