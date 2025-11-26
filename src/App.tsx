// src/App.tsx
import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Scene from './components/Scene/Scene'
import { SimpleScene } from './components/Scene/SimpleScene'
import ProjectsShowcase from './components/Projects/ProjectsShowcase'
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
      const errorMessage = event.error?.message || event.message || 'Unknown error'
      
      // Handle specific WebGL context errors on mobile
      if (errorMessage.includes('getShaderPrecisionFormat') || 
          errorMessage.includes('null is not an object')) {
        logger.error('App', 'WebGL context precision error (mobile)', { 
          message: errorMessage,
          error: event.error
        })
        // Don't crash the app - this is often recoverable
        event.preventDefault()
        return
      }
      
      logger.error('App', 'Unhandled error', { message: errorMessage });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || event.reason
      const reasonStr = typeof reason === 'string' ? reason : JSON.stringify(reason)
      
      // Handle WebGL context errors in promise rejections
      if (reasonStr.includes('getShaderPrecisionFormat') || 
          reasonStr.includes('null is not an object')) {
        logger.error('App', 'WebGL context precision error in promise (mobile)', {
          reason: reasonStr
        })
        // Prevent unhandled rejection
        event.preventDefault()
        return
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

  // Scene component with all existing functionality
  const PortfolioScene = () => (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh'
    }}>
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
      
      {/* Keep your existing header */}
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
          {useSimpleScene ? 'Simple 3D View' : 'Interactive 3D Portfolio'}
        </p>
        {useSimpleScene && (
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#ff6b6b' }}>
            Using simplified scene due to loading issues
          </p>
        )}
      </div>
    </div>
  );

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
    <Router>
      <div className="App">
        <Analytics />
        
        <Routes>
          {/* 3D Portfolio Route */}
          <Route path="/" element={<PortfolioScene />} />
          
          {/* Projects Showcase Route */}
          <Route path="/projects" element={<ProjectsShowcase />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App