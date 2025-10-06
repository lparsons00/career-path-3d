// src/App.tsx
import { useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import Scene from './components/Scene/Scene'
import { createGoldenPath } from './components/utils/pathUtils'
import { logger } from './components/utils/logger'
import { monitorPerformance } from './components/utils/performance'
import './App.css'

// Safe debug check - only allow on localhost or with explicit permission
const allowDebug = () => {
  if (import.meta.env.DEV) return true;
  
  if (typeof window === 'undefined') return false;
  
  const isLocalhost = window.location.hostname === 'localhost';
  const hasDebugParam = window.location.search.includes('debug=true');
  
  // In production, only allow debug if explicitly enabled via environment
  return isLocalhost || (hasDebugParam && import.meta.env.VITE_ALLOW_DEBUG === 'true');
}

function App() {
  const careerPoints = createGoldenPath()
  const canDebug = allowDebug()

  useEffect(() => {
    // Initialize performance monitoring
    monitorPerformance();
    
    // Log application startup - sanitize data in production
    const logData: any = {
      careerPointsCount: careerPoints.length,
      environment: import.meta.env.MODE
    };

    // Only include sensitive data in debug mode
    if (canDebug) {
      logData.userAgent = navigator.userAgent;
      logData.viewport = `${window.innerWidth}x${window.innerHeight}`;
      logData.url = window.location.href;
    }

    logger.info('App', 'Application started', logData);

    // Log any unhandled errors
    const handleError = (event: ErrorEvent) => {
      const errorData: any = {
        message: event.error?.message
      };

      // Only include stack traces in debug mode
      if (canDebug) {
        errorData.stack = event.error?.stack;
        errorData.filename = event.filename;
        errorData.lineno = event.lineno;
        errorData.colno = event.colno;
      }

      logger.error('App', 'Unhandled error', errorData);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      logger.error('App', 'Unhandled promise rejection', {
        reason: event.reason?.message || event.reason
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    // Log WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const webgl2 = !!canvas.getContext('webgl2');
      
      logger.info('App', 'WebGL support check', {
        webgl: !!gl,
        webgl2,
        // Only log user agent in debug mode
        ...(canDebug && { userAgent: navigator.userAgent })
      });

      if (!gl) {
        logger.error('App', 'WebGL not supported in this browser');
      }
    } catch (error) {
      logger.error('App', 'WebGL detection failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [careerPoints.length, canDebug]);

  // Log career points data for debugging - only in debug mode
  useEffect(() => {
    if (canDebug) {
      logger.info('App', 'Career points loaded', {
        count: careerPoints.length,
        points: careerPoints.map(p => ({ id: p.id, title: p.title, position: p.position }))
      });
    } else {
      // In production, just log the count
      logger.info('App', 'Career points loaded', {
        count: careerPoints.length
      });
    }
  }, [careerPoints, canDebug]);

  return (
    <div className="App">
      {/* Vercel Analytics */}
      <Analytics />
      
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
      }}>
        <Scene careerPoints={careerPoints} />
      </div>
      
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        color: 'white',
        zIndex: 2,
        background: 'rgba(0,0,0,0.7)',
        padding: '1rem 2rem',
        borderRadius: '10px',
        backdropFilter: 'blur(10px)',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
          Luke's Interactive Portfolio
        </h2>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
          Explore my career journey in 3D
        </p>
      </div>

      {/* Debug info panel - only shows when debug is allowed */}
      {canDebug && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          fontSize: '12px',
          zIndex: 1000,
          maxWidth: '300px',
          fontFamily: 'monospace'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#4CAF50' }}>Debug Info</h4>
          <div style={{ lineHeight: '1.4' }}>
            <div><strong>Environment:</strong> {import.meta.env.MODE}</div>
            <div><strong>Career Points:</strong> {careerPoints.length}</div>
            <div><strong>Viewport:</strong> {window.innerWidth} x {window.innerHeight}</div>
            <div><strong>URL:</strong> {window.location.href}</div>
            <div><strong>Debug Mode:</strong> {canDebug ? 'Enabled' : 'Disabled'}</div>
            <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.7 }}>
              Check console for detailed logs
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App