// src/components/Scene/Scene.tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Preload } from '@react-three/drei'
import { Suspense, useState, useCallback, useEffect } from 'react'
import type { CareerPoint } from '../../types/career'
import PathPoints from '../Path/PathPoints'
import PlayerCharacter from '../Character/PlayerCharacter'
import MovementController from '../Character/MovementController'
import CareerPopup from '../ui/CareerPopup'
import ControlsHelp from '../ui/ControlsHelp'
import { isMobile } from '../utils/pathUtils'
import GoldenPath from '../Path/GoldenPath'
import GLBScene from './GLBScene'
import * as THREE from 'three'
import { logger } from '../utils/logger'

interface SceneProps {
  careerPoints: CareerPoint[]
}

// Safe debug check
const allowDebug = () => {
  if (import.meta.env.DEV) return true;
  
  if (typeof window === 'undefined') return false;
  
  const isLocalhost = window.location.hostname === 'localhost';
  const hasDebugParam = window.location.search.includes('debug=true');
  
  return isLocalhost || (hasDebugParam && import.meta.env.VITE_ALLOW_DEBUG === 'true');
}

const Scene: React.FC<SceneProps> = ({ careerPoints }) => {
  const [selectedPoint, setSelectedPoint] = useState<CareerPoint | null>(null)
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([-55, 0, -22])
  const [isMoving, setIsMoving] = useState(false)
  const [sceneLoaded, setSceneLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null)
  const canDebug = allowDebug()

  // Check WebGL support on component mount
  useEffect(() => {
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        const supported = !!gl
        setWebglSupported(supported)
        
        logger.info('Scene', 'WebGL support check', {
          supported,
          // Only log user agent in debug mode
          ...(canDebug && { userAgent: navigator.userAgent })
        })

        if (!supported) {
          setError('WebGL is not supported in your browser. Please try updating your browser or enable WebGL.')
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown WebGL error'
        logger.error('Scene', 'WebGL detection failed', { 
          error: errorMsg,
          // Only include additional context in debug mode
          ...(canDebug && { context: 'WebGL context creation failed' })
        })
        setWebglSupported(false)
        setError(`WebGL error: ${errorMsg}`)
      }
    }

    checkWebGL()
  }, [canDebug])

  useEffect(() => {
    logger.info('Scene', 'Component mounted', {
      careerPointsCount: careerPoints.length,
      environment: import.meta.env.MODE,
      webglSupported
    })
  }, [careerPoints.length, webglSupported])

  useEffect(() => {
    if (sceneLoaded) {
      logger.info('Scene', 'Scene fully loaded and rendered')
    }
  }, [sceneLoaded])

  const handlePointClick = useCallback((point: CareerPoint) => {
    logger.info('Scene', 'Career point clicked', { 
      pointId: point.id, 
      pointTitle: point.title 
    })
    setSelectedPoint(point)
  }, [])

  const handleClosePopup = useCallback(() => {
    setSelectedPoint(null)
  }, [])

  const mobile = isMobile()

  const handleCanvasCreated = useCallback(({ camera, scene, gl }: { camera: THREE.Camera; scene: THREE.Scene; gl: THREE.WebGLRenderer }) => {
    try {
      camera.lookAt(0, 0, 0)
      
      // Only call updateProjectionMatrix if it exists
      if ('updateProjectionMatrix' in camera && typeof (camera as any).updateProjectionMatrix === 'function') {
        (camera as any).updateProjectionMatrix();
      }
      
      // Enhanced fog
      scene.fog = new THREE.FogExp2('#87CEEB', 0.002)
      
      // Enable shadows
      scene.add(new THREE.AmbientLight(0xffffff, 0.4))
      
      const logData: any = {
        cameraPosition: [camera.position.x, camera.position.y, camera.position.z],
        cameraType: camera.type,
        fogEnabled: !!scene.fog
      };

      // Only include detailed camera info in debug mode
      if (canDebug) {
        logData.cameraDetails = {
          fov: (camera as any).fov,
          near: (camera as any).near,
          far: (camera as any).far
        };
      }

      logger.info('Scene', 'Canvas and Three.js scene initialized', logData)
      
      setSceneLoaded(true)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      logger.error('Scene', 'Failed to initialize canvas', { 
        error: errorMsg,
        // Only include additional context in debug mode
        ...(canDebug && { context: 'Canvas initialization failed' })
      })
      setError(errorMsg)
    }
  }, [canDebug])

  // Fixed: Use the correct event type for Canvas onError
  // The Canvas component from react-three/fiber has a specific onError signature
  const handleCanvasError = useCallback((event: any) => {
    // The Canvas onError can provide different types of events
    // We need to handle both Error objects and WebGL context events
    let errorMessage = 'Unknown canvas error';
    
    if (event instanceof Error) {
      errorMessage = event.message;
    } else if (event && event.type === 'webglcontextlost') {
      errorMessage = 'WebGL context was lost';
    } else if (event && event.type === 'webglcontextrestored') {
      errorMessage = 'WebGL context was restored';
    } else if (event && event.target && event.target instanceof HTMLCanvasElement) {
      errorMessage = 'Canvas rendering error';
    }
    
    logger.error('Scene', 'Canvas creation failed', { 
      error: errorMessage,
      // Only include additional context in debug mode
      ...(canDebug && { context: 'Canvas creation error' })
    })
    setError(`Canvas error: ${errorMessage}`)
  }, [canDebug])

  // Log any errors that occur
  useEffect(() => {
    if (error) {
      logger.error('Scene', 'Scene error state', { 
        error,
        // Only include additional context in debug mode
        ...(canDebug && { context: 'Scene error occurred' })
      })
    }
  }, [error, canDebug])

  // Show loading or error states
  if (webglSupported === false) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#87CEEB',
        color: 'white',
        flexDirection: 'column',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2>WebGL Not Supported</h2>
        <p>{error || 'Your browser does not support WebGL, which is required for this 3D experience.'}</p>
        <p style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>
          Try updating your browser or enabling WebGL in your settings.
        </p>
        <button 
          onClick={() => window.location.reload()}
          style={{ padding: '10px 20px', marginTop: '20px' }}
        >
          Reload Page
        </button>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#87CEEB',
        color: 'white',
        flexDirection: 'column',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2>3D Scene Failed to Load</h2>
        <p>Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{ padding: '10px 20px', marginTop: '10px' }}
        >
          Reload Page
        </button>
      </div>
    )
  }

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative',
      touchAction: 'none'
    }}>
      <Canvas
        camera={{
          position: [-230, 130, -130],
          fov: 50,
          far: 10000,
          near: 0.1
        }}
        onCreated={handleCanvasCreated}
        onError={handleCanvasError}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance'
        }}
        shadows
        dpr={[1, 2]} // Adaptive pixel ratio for performance
      >
        <color attach="background" args={['#87CEEB']} />
        
        <Suspense fallback={null}>
          <GLBScene 
            url="/models/town/town.glb" 
            position={[0, 0, 0]}
            scale={1}
          />

          {/* Enhanced Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[20, 30, 10]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <pointLight position={[-10, 15, -10]} intensity={0.3} color="#4ecdc4" />
          
          <Sky 
            distance={1000}
            sunPosition={[100, 20, 100]}
            inclination={0.3}
            azimuth={0.25}
          />

          {/* Career Elements */}
          <GoldenPath points={careerPoints} />
          <PathPoints 
            points={careerPoints} 
            onPointClick={handlePointClick}
            playerPosition={playerPosition}
          />
          
          <PlayerCharacter 
            position={playerPosition}
            isMoving={isMoving}
          />
          
          <MovementController
            onPositionChange={setPlayerPosition}
            onMovingChange={setIsMoving}
            careerPoints={careerPoints}
          />

          <OrbitControls
            enableZoom={true}
            enablePan={!mobile}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.1}
            target={new THREE.Vector3(...playerPosition)}
            rotateSpeed={0.3}
            makeDefault
          />

          <Preload all />
        </Suspense>
      </Canvas>

      {selectedPoint && (
        <CareerPopup 
          point={selectedPoint} 
          onClose={handleClosePopup} 
        />
      )}

      {!mobile && <ControlsHelp />}
      
      {/* Loading overlay - Fixed comparison */}
      {!sceneLoaded && webglSupported === true && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(135, 206, 235, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px',
          zIndex: 1000
        }}>
          <div style={{ textAlign: 'center' }}>
            <div>Loading 3D Experience...</div>
            <div style={{ fontSize: '14px', marginTop: '10px' }}>
              {webglSupported === null ? 'Checking WebGL support...' : 'Initializing scene...'}
            </div>
          </div>
        </div>
      )}
      
      {/* Debug overlay - only shows when debug is allowed */}
      {canDebug && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          <div>Scene: {sceneLoaded ? '✅ Loaded' : '🔄 Loading'}</div>
          <div>WebGL: {webglSupported === null ? 'Checking...' : webglSupported ? '✅ Supported' : '❌ Not Supported'}</div>
          <div>Points: {careerPoints.length}</div>
          <div>Player: {playerPosition.join(', ')}</div>
          {error && <div style={{ color: 'red' }}>Error: {error}</div>}
        </div>
      )}
    </div>
  )
}

export default Scene