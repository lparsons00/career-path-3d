// src/App.tsx
import { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import Scene from './components/Scene/Scene'
import { SimpleScene } from './components/Scene/SimpleScene'
import { createGoldenPath } from './components/utils/pathUtils'
import { logger } from './components/utils/logger'
import { monitorPerformance } from './components/utils/performance'
import './App.css'

function App() {
  const careerPoints = createGoldenPath()
  const [useSimpleScene, setUseSimpleScene] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    monitorPerformance();
    
    logger.info('App', 'Application started', {
      careerPointsCount: careerPoints.length,
      environment: import.meta.env.MODE
    });

    // Auto-switch to simple scene if GLB fails repeatedly
    const hasGLBFailed = localStorage.getItem('glb_load_failed');
    if (hasGLBFailed === 'true') {
      setUseSimpleScene(true);
      logger.warn('App', 'Auto-switching to simple scene due to previous GLB failures');
    }

    setLoading(false);

    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.error?.message || event.message || 'Unknown error';
      const errorStack = event.error?.stack || '';
      
      // Handle WebGL precision format errors specifically
      if (errorMessage.includes('getShaderPrecisionFormat') || 
          errorMessage.includes('null is not an object')) {
        logger.error('App', 'WebGL precision format error (mobile)', { 
          message: errorMessage,
          stack: errorStack,
          error: event.error
        });
        // Prevent default error handling - we've patched this
        event.preventDefault();
        return;
      }
      
      // Handle indexOf errors (likely THREE.js internal)
      if (errorMessage.includes('indexOf') || errorStack.includes('indexOf') || 
          errorMessage.includes('null is not an object') && errorMessage.includes('indexOf')) {
        logger.warn('App', 'indexOf error caught (suppressed)', { 
          message: errorMessage,
          stack: errorStack,
          error: event.error,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
        // Prevent error from propagating - we've patched this
        event.preventDefault();
        event.stopPropagation();
        return true; // Suppress the error
      }
      
      logger.error('App', 'Unhandled error', { 
        message: errorMessage,
        stack: errorStack,
        filename: event.filename,
        lineno: event.lineno
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || event.reason;
      const reasonStr = typeof reason === 'string' ? reason : JSON.stringify(reason);
      
      // Handle WebGL precision format errors in promises
      if (reasonStr.includes('getShaderPrecisionFormat') || 
          reasonStr.includes('null is not an object')) {
        logger.warn('App', 'WebGL precision format error in promise (suppressed)', {
          reason: reasonStr
        });
        // Prevent unhandled rejection
        event.preventDefault();
        return;
      }
      
      // Handle indexOf errors in promises
      if (reasonStr.includes('indexOf')) {
        logger.warn('App', 'indexOf error in promise (suppressed)', {
          reason: reasonStr
        });
        // Prevent unhandled rejection
        event.preventDefault();
        return;
      }
      
      logger.error('App', 'Unhandled promise rejection', {
        reason: reasonStr
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [careerPoints.length]);

  useEffect(() => {
    logger.info('App', 'Career points loaded', {
      count: careerPoints.length
    });
  }, [careerPoints]);

  if (loading) {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#87CEEB',
        color: 'white',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="App">
      <Analytics />
      
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
      }}>
        {useSimpleScene ? (
          <SimpleScene />
        ) : (
          <Scene 
            careerPoints={careerPoints} 
            onGLBFailure={() => {
              logger.error('App', 'GLB load failed, switching to simple scene');
              localStorage.setItem('glb_load_failed', 'true');
              setUseSimpleScene(true);
            }}
          />
        )}
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
          Luke's Portfolio
        </h2>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
          {useSimpleScene ? 'Simple 3D View' : ''}
        </p>
        {useSimpleScene && (
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#ff6b6b' }}>
            Using simplified scene due to loading issues
          </p>
        )}
      </div>
      )
    </div>
  )
}

export default App