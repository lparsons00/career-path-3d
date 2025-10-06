// src/App.tsx
import { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import Scene from './components/Scene/Scene'
import { SimpleScene } from './components/Scene/SimpleScene'
import { createGoldenPath } from './components/utils/pathUtils'
import { logger } from './components/utils/logger'
import { monitorPerformance } from './components/utils/performance'
import './App.css'

const allowDebug = () => {
  if (import.meta.env.DEV) return true;
  if (typeof window === 'undefined') return false;
  const isLocalhost = window.location.hostname === 'localhost';
  const hasDebugParam = window.location.search.includes('debug=true');
  return isLocalhost || (hasDebugParam && import.meta.env.VITE_ALLOW_DEBUG === 'true');
}

function App() {
  const careerPoints = createGoldenPath()
  const canDebug = allowDebug()
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
      logger.error('App', 'Unhandled error', { message: event.error?.message });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      logger.error('App', 'Unhandled promise rejection', {
        reason: event.reason?.message || event.reason
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
          Luke's Interactive Portfolio
        </h2>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
          {useSimpleScene ? 'Simple 3D View' : 'Explore my career journey in 3D'}
        </p>
        {useSimpleScene && (
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#ff6b6b' }}>
            Using simplified scene due to loading issues
          </p>
        )}
      </div>

      {/* Debug controls */}
      {canDebug && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          zIndex: 1000,
          fontSize: '14px'
        }}>
          <button 
            onClick={() => setUseSimpleScene(!useSimpleScene)}
            style={{ 
              padding: '8px 12px', 
              marginBottom: '10px',
              background: '#007acc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {useSimpleScene ? 'Try Full Scene' : 'Use Simple Scene'}
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('glb_load_failed');
              window.location.reload();
            }}
            style={{ 
              padding: '8px 12px', 
              marginBottom: '10px',
              marginLeft: '10px',
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reset GLB Cache
          </button>
          <div>
            <div><strong>Mode:</strong> {useSimpleScene ? 'Simple' : 'Full'}</div>
            <div><strong>GLB Status:</strong> {useSimpleScene ? 'Failed' : 'Attempting'}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App