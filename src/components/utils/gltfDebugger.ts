// src/components/utils/gltfDebugger.ts
import { logger } from './logger';

/**
 * Debug utility to check if GLTF file is accessible
 */
export const checkGLTFAccessibility = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    logger.info('GLTFDebugger', 'GLTF file accessibility check', {
      url,
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get('content-type')
    });
    return response.ok;
  } catch (error) {
    logger.error('GLTFDebugger', 'GLTF file not accessible', {
      url,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
};

/**
 * Check if binary file is accessible
 */
export const checkBinaryAccessibility = async (baseUrl: string, binaryUri: string): Promise<boolean> => {
  try {
    const binaryUrl = `${baseUrl.replace(/\/[^/]*\.gltf$/, '')}/${binaryUri}`;
    const response = await fetch(binaryUrl, { method: 'HEAD' });
    logger.info('GLTFDebugger', 'Binary file accessibility check', {
      binaryUrl,
      status: response.status,
      ok: response.ok,
      contentLength: response.headers.get('content-length')
    });
    return response.ok;
  } catch (error) {
    logger.error('GLTFDebugger', 'Binary file not accessible', {
      binaryUri,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return false;
  }
};

