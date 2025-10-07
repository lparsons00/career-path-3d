// src/components/Scene/Scene.tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Preload } from '@react-three/drei'
import { Suspense, useState, useCallback, useEffect } from 'react'
import type { CareerPoint } from '../../types/career'
import PathPoints from '../Path/PathPoints'
import PlayerCharacter from '../Character/PlayerCharacter'
import MovementController from '../Character/MovementController'
import CareerPopup from '../UI/CareerPopup'
import ControlsHelp from '../UI/ControlsHelp'
import { isMobile } from '../utils/pathUtils'
import GLBScene from './GLBScene'
import * as THREE from 'three'
import { logger } from '../utils/logger'
import FollowCamera from '../Camera/FollowCamera'
import { CollisionProvider } from '../../context/CollisionContext'
import CollisionDebug from '../Debug/CollisionDebug'
import VercelDebug from '../Debug/VercelDebug'

interface SceneProps {
  careerPoints: CareerPoint[]
  onGLBFailure?: () => void
}

const Scene: React.FC<SceneProps> = ({ careerPoints, onGLBFailure }) => {
  const [selectedPoint, setSelectedPoint] = useState<CareerPoint | null>(null)
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([9, 1, 18])
  const [isMoving, setIsMoving] = useState(false)
  const [sceneLoaded, setSceneLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null)
  const [glbFailed, setGlbFailed] = useState(false)
  const [cameraTarget, setCameraTarget] = useState<[number, number, number]>(playerPosition)

  // Debug mode for collision boxes - set to true to see collision boxes
  const debugMode = true

  useEffect(() => {
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        const supported = !!gl
        setWebglSupported(supported)
        
        logger.info('Scene', 'WebGL support check', { supported })

        if (!supported) {
          setError('WebGL is not supported in your browser.')
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown WebGL error'
        logger.error('Scene', 'WebGL detection failed', { error: errorMsg })
        setWebglSupported(false)
        setError(`WebGL error: ${errorMsg}`)
      }
    }

    checkWebGL()
  }, [])

  useEffect(() => {
    logger.info('Scene', 'Component mounted', {
      careerPointsCount: careerPoints.length,
      webglSupported
    })
  }, [careerPoints.length, webglSupported])

  // Update camera target when player moves
  useEffect(() => {
    setCameraTarget(playerPosition)
  }, [playerPosition])

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

  const handleGLBFailure = useCallback(() => {
    logger.error('Scene', 'GLB loading failed, will use fallback geometry')
    setGlbFailed(true)
    onGLBFailure?.()
  }, [onGLBFailure])

  const mobile = isMobile()

  const handleCanvasCreated = useCallback(({ camera, scene }: { camera: THREE.Camera; scene: THREE.Scene }) => {
    try {
      camera.lookAt(-1, 1, 16)
      
      if ('updateProjectionMatrix' in camera && typeof (camera as any).updateProjectionMatrix === 'function') {
        (camera as any).updateProjectionMatrix();
      }
      
      scene.fog = new THREE.FogExp2('#87CEEB', 0.002)
      scene.add(new THREE.AmbientLight(0xffffff, 0.4))
      
      logger.info('Scene', 'Canvas and Three.js scene initialized')
      setSceneLoaded(true)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      logger.error('Scene', 'Failed to initialize canvas', { error: errorMsg })
      setError(errorMsg)
    }
  }, [])

  const handleCanvasError = useCallback((event: any) => {
    let errorMessage = 'Unknown canvas error';
    
    if (event instanceof Error) {
      errorMessage = event.message;
    } else if (event && event.type === 'webglcontextlost') {
      errorMessage = 'WebGL context was lost';
    }
    
    logger.error('Scene', 'Canvas creation failed', { error: errorMessage })
    setError(`Canvas error: ${errorMessage}`)
  }, [])

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
        <p>{error || 'Your browser does not support WebGL.'}</p>
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
      </div>
    )
  }

  return (
    <CollisionProvider debug={debugMode}>
      <div style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        touchAction: 'none'
      }}>
        <VercelDebug />
        <Canvas
          camera={{
            position: [-55, 25, -22],
            fov: 58,
            far: 10000,
            near: 0.1
          }}
          onCreated={handleCanvasCreated}
          onError={handleCanvasError}
          gl={{
            antialias: false,
            alpha: false,
            powerPreference: 'default',
            preserveDrawingBuffer: false
          }}
          shadows={false}
          dpr={1}
        >
          <color attach="background" args={['#87CEEB']} />
          
          <Suspense fallback={null}>
            {/* Collision debug visualization - shows collision boxes when debugMode is true */}
            {debugMode && <CollisionDebug />}

            {/* Camera that follows player */}
            <FollowCamera target={cameraTarget} />

            {/* Only try to load GLB if it hasn't failed before */}
            {!glbFailed ? (
              <GLBScene 
                url="/models/town/town.glb" 
                position={[0, 0, 0]}
                scale={1}
                onError={handleGLBFailure}
              />
            ) : (
              // Fallback geometry when GLB fails
              <group>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[10, 2, 10]} />
                  <meshStandardMaterial color="#8B4513" />
                </mesh>
                <mesh position={[0, 1, 0]}>
                  <boxGeometry args={[4, 2, 4]} />
                  <meshStandardMaterial color="#CD853F" />
                </mesh>
              </group>
            )}

            <ambientLight intensity={0.6} />
            <directionalLight 
              position={[20, 30, 10]}
              intensity={0.8}
            />
            
            <Sky 
              distance={100000}
              sunPosition={[100, 20, 100]}
              inclination={0.3}
              azimuth={0.25}
            />

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
              playerPosition={playerPosition} // Pass current position
            />

            {/* Keep OrbitControls as fallback for manual camera control */}
            <OrbitControls
              enableZoom={true}
              enablePan={!mobile}
              enableRotate={true}
              minDistance={5}
              maxDistance={100}
              target={new THREE.Vector3(...cameraTarget)}
              rotateSpeed={0.3}
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
      </div>
    </CollisionProvider>
  )
}

export default Scene