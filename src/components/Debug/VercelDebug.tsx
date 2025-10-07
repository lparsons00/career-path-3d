// src/components/Debug/VercelDebug.tsx
import { useEffect, useState } from 'react';
import { logger } from '../utils/logger';

// Define the interface for debug info
interface DebugInfo {
  // Environment info
  isDevelopment: boolean;
  isProduction: boolean;
  
  // Window info
  host: string;
  hostname: string;
  protocol: string;
  origin: string;
  pathname: string;
  href?: string;
  
  // GLB file info
  glbUrl: string;
  absoluteGlbUrl: string;
  
  // GLB test results (optional properties)
  glbHeadStatus?: number;
  glbHeadOk?: boolean;
  glbBlobSize?: number;
  glbBlobType?: string | null;
  glbError?: string;
  
  // Other test results
  viteSvgStatus?: number;
  viteSvgError?: string;
  
  // Browser info
  userAgent: string;
  webglSupported: boolean;
}

const VercelDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    isDevelopment: false,
    isProduction: true,
    host: '',
    hostname: '',
    protocol: '',
    origin: '',
    pathname: '',
    glbUrl: '/models/town/town.glb',
    absoluteGlbUrl: '',
    userAgent: '',
    webglSupported: false,
  });

  useEffect(() => {
    const gatherDebugInfo = async () => {
      // Initialize with basic info
      const info: DebugInfo = {
        isDevelopment: window.location.hostname === 'localhost',
        isProduction: !window.location.hostname.includes('localhost'),
        host: window.location.host,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        origin: window.location.origin,
        pathname: window.location.pathname,
        href: window.location.href,
        glbUrl: '/models/town/town.glb',
        absoluteGlbUrl: window.location.origin + '/models/town/town.glb',
        userAgent: navigator.userAgent,
        webglSupported: !!window.WebGLRenderingContext,
      };

      // Test if GLB file exists
      try {
        const response = await fetch('/models/town/town.glb', { method: 'HEAD' });
        info.glbHeadStatus = response.status;
        info.glbHeadOk = response.ok;
        
        if (response.ok) {
          const blobResponse = await fetch('/models/town/town.glb');
          info.glbBlobSize = (await blobResponse.blob()).size;
          info.glbBlobType = blobResponse.headers.get('content-type');
        }
      } catch (error) {
        info.glbError = error instanceof Error ? error.message : 'Unknown error';
      }

      // Test public directory
      try {
        const testResponse = await fetch('/vite.svg', { method: 'HEAD' });
        info.viteSvgStatus = testResponse.status;
      } catch (error) {
        info.viteSvgError = error instanceof Error ? error.message : 'Unknown error';
      }

      setDebugInfo(info);
      logger.info('VercelDebug', 'Environment debug info', info);
      console.log('🚀 Vercel Debug Info:', info);
    };

    gatherDebugInfo();
  }, []);

  // Only show in development
  if (window.location.hostname !== 'localhost') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      fontSize: '12px',
      zIndex: 10000,
      maxWidth: '300px',
      maxHeight: '400px',
      overflow: 'auto',
      borderRadius: '5px',
    }}>
      <h4>Vercel Debug (Development Only)</h4>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  );
};

export default VercelDebug;