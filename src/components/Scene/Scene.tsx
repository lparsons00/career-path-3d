// src/components/Scene/Scene.tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Preload } from '@react-three/drei'
import { Suspense, useState, useCallback, useEffect, useRef } from 'react'
import type { CareerPoint } from '../../types/career'
import PathPoints from '../Path/PathPoints'
import PlayerCharacter from '../Character/PlayerCharacter'
import MovementController from '../Character/MovementController'
import CareerPopup from '../UI/CareerPopup'
import LinkedInPopup from '../UI/LinkedInPopup' // Add this import
import ControlsHelp from '../UI/ControlsHelp'
import { isMobile } from '../utils/pathUtils'
import GoldenPath from '../Path/GoldenPath'
import OptimizedGLTFScene from '../Scene/OptimizedGLTFScene'
import LoadingProgress from '../UI/LoadingProgress'
import GLTFErrorBoundary from '../Scene/GLTFErrorBoundary'
import * as THREE from 'three'
import { logger } from '../utils/logger'
import FollowCamera from '../Camera/FollowCamera'
import { CollisionProvider } from '../../context/CollisionContext'
import CollisionDebug from '../Debug/CollisionDebug'

interface SceneProps {
  careerPoints: CareerPoint[]
  onGLBFailure?: () => void
}

const Scene: React.FC<SceneProps> = ({ careerPoints, onGLBFailure }) => {
  const [selectedPoint, setSelectedPoint] = useState<CareerPoint | null>(null)
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([9, 1, 19])
  const [isMoving, setIsMoving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null)
  const [glbFailed, setGlbFailed] = useState(false)
  const [gltfUrl, setGltfUrl] = useState<string>('/models/town/town-draco.gltf') // Start with Draco version
  const [showLoading, setShowLoading] = useState(true)
  const [cameraTarget, setCameraTarget] = useState<[number, number, number]>(playerPosition)
  
  // LinkedIn popup state
  const [showLinkedInPopup, setShowLinkedInPopup] = useState(false)
  const [linkedInPoint, setLinkedInPoint] = useState<CareerPoint | null>(null)
  const triggeredPoints = useRef<Set<string>>(new Set()) // Track which points we've already triggered

  // Debug mode for collision boxes - set to true to see collision boxes
  const debugMode = false
  const mobile = isMobile()

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

  // Check if player is near any LinkedIn points
  useEffect(() => {
    const checkLinkedInProximity = () => {
      const linkedInPoints = careerPoints.filter(point => point.type === 'linkedin')
      
      for (const point of linkedInPoints) {
        const pointPosition = new THREE.Vector3(point.position[0], point.position[1], point.position[2])
        const playerPos = new THREE.Vector3(...playerPosition)
        const distance = playerPos.distanceTo(pointPosition)
        
        // If player is within 3 units of a LinkedIn point and we haven't triggered it yet
        if (distance < 3 && !triggeredPoints.current.has(point.id.toString())) {
          logger.info('Scene', 'Player near LinkedIn point', {
            pointId: point.id,
            distance: distance,
            pointPosition,
            playerPosition
          })
          
          setLinkedInPoint(point)
          setShowLinkedInPopup(true)
          triggeredPoints.current.add(point.id.toString()) // Mark as triggered
          break // Only trigger one at a time
        }
      }
    }

    // Check proximity every 500ms
    const interval = setInterval(checkLinkedInProximity, 500)
    return () => clearInterval(interval)
  }, [playerPosition, careerPoints])

  const handlePointClick = useCallback((point: CareerPoint) => {
    logger.info('Scene', 'Career point clicked', { 
      pointId: point.id, 
      pointTitle: point.title,
      pointType: point.type
    })
    
    // If it's a LinkedIn point, show the LinkedIn popup instead of career popup
    if (point.type === 'linkedin') {
      setLinkedInPoint(point)
      setShowLinkedInPopup(true)
      triggeredPoints.current.add(point.id.toString())
    } else {
      setSelectedPoint(point)
    }
  }, [])

  const handleClosePopup = useCallback(() => {
    setSelectedPoint(null)
  }, [])

  const handleCloseLinkedInPopup = useCallback(() => {
    setShowLinkedInPopup(false)
    setLinkedInPoint(null)
  }, [])

  const handleVisitLinkedIn = useCallback(() => {
    if (linkedInPoint?.link) {
      // Open LinkedIn in new tab
      window.open(linkedInPoint.link, '_blank', 'noopener,noreferrer')
      logger.info('Scene', 'Opening LinkedIn URL', { url: linkedInPoint.link })
    } else {
      // Fallback to your LinkedIn URL
      const defaultLinkedInUrl = 'https://www.linkedin.com/in/luke-parsons-49193b188/' // Replace with your actual LinkedIn URL
      window.open(defaultLinkedInUrl, '_blank', 'noopener,noreferrer')
      logger.info('Scene', 'Opening default LinkedIn URL', { url: defaultLinkedInUrl })
    }
  }, [linkedInPoint])

  const handleGLBFailure = useCallback(() => {
    // Try fallback to original GLTF if Draco version failed
    if (gltfUrl === '/models/town/town-draco.gltf') {
      logger.warn('Scene', 'Draco GLTF failed, trying original GLTF', { 
        dracoUrl: gltfUrl,
        fallbackUrl: '/models/town/town.gltf',
        currentOrigin: window.location.origin
      })
      setGltfUrl('/models/town/town.gltf')
      return // Don't mark as failed yet, try the fallback
    }
    
    // Both attempts failed
    logger.error('Scene', 'GLTF loading failed after all attempts', { 
      triedUrls: ['/models/town/town-draco.gltf', '/models/town/town.gltf'],
      currentOrigin: window.location.origin,
      userAgent: navigator.userAgent
    })
    setGlbFailed(true)
    onGLBFailure?.()
  }, [onGLBFailure, gltfUrl])

  const handleCanvasCreated = useCallback(({ gl, camera, scene }: { gl: THREE.WebGLRenderer; camera: THREE.Camera; scene: THREE.Scene }) => {
    try {
      // Validate WebGL context before proceeding
      const webglContext = gl.getContext();
      if (!webglContext) {
        throw new Error('WebGL context is null');
      }

      // Test context is usable - but handle errors gracefully
      try {
        const precisionFormat = webglContext.getShaderPrecisionFormat?.(
          webglContext.VERTEX_SHADER,
          webglContext.HIGH_FLOAT
        );
        if (!precisionFormat) {
          logger.warn('Scene', 'HIGH_FLOAT precision not available, using MEDIUM_FLOAT', {
            isMobile: mobile
          });
        }
      } catch (precisionError) {
        // Non-fatal - THREE.js will handle this
        logger.warn('Scene', 'Could not query shader precision (non-fatal)', {
          error: precisionError instanceof Error ? precisionError.message : 'Unknown',
          isMobile: mobile
        });
      }

      // Import context manager and memory monitor
      Promise.all([
        import('../utils/webglContextManager'),
        import('../utils/memoryMonitor')
      ]).then(([{ WebGLContextManager }, { MemoryMonitor }]) => {
        // Set up WebGL context management
        const contextManager = WebGLContextManager.getInstance();
        const canvas = gl.domElement;
        contextManager.initialize(canvas, gl);
        
        // Set up context loss recovery
        contextManager.onContextLost(() => {
          logger.error('Scene', 'WebGL context lost - attempting recovery');
          setError('WebGL context lost. The scene will attempt to recover...');
        });
        
        contextManager.onContextRestored(() => {
          logger.info('Scene', 'WebGL context restored');
          setError(null);
          // Force re-render
          window.location.reload();
        });
        
        // Set up memory monitoring on mobile
        if (mobile) {
          const memoryMonitor = MemoryMonitor.getInstance();
          memoryMonitor.startMonitoring();
          
          memoryMonitor.onLowMemory(() => {
            logger.warn('Scene', 'Low memory detected - reducing quality');
            // Could trigger quality reduction here
          });
        }
      });
      
      // Aggressive mobile optimizations
      if (mobile) {
        // Limit renderer capabilities
        gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        gl.shadowMap.enabled = false;
        
        // Don't try to access precision format on mobile - it can cause errors
        // THREE.js will handle precision automatically
      }
      
      camera.lookAt(0, 0, 0)
      
      if ('updateProjectionMatrix' in camera && typeof (camera as any).updateProjectionMatrix === 'function') {
        (camera as any).updateProjectionMatrix();
      }
      
      scene.fog = new THREE.FogExp2('#87CEEB', 0.002)
      scene.add(new THREE.AmbientLight(0xffffff, 0.4))
      
      logger.info('Scene', 'Canvas and Three.js scene initialized', { isMobile: mobile })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      logger.error('Scene', 'Failed to initialize canvas', { error: errorMsg })
      setError(errorMsg)
    }
  }, [mobile])

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

  // Remove or comment out the temporary GLTF debug
  // useEffect(() => {
  //   // Test if GLTF file is accessible
  //   fetch('/models/town/town.gltf')
  //     .then(response => {
  //       console.log('GLTF Response status:', response.status);
  //       console.log('GLTF Response ok:', response.ok);
  //       console.log('GLTF Content-Type:', response.headers.get('content-type'));
  //       return response.text();
  //     })
  //     .then(text => {
  //       console.log('GLTF first 200 chars:', text.substring(0, 200));
  //     })
  //     .catch(error => {
  //       console.error('GLTF Fetch error:', error);
  //     });
  // }, [])

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
        <Canvas
          camera={{
            position: [9, 1, 19],
            fov: 60,
            far: 10000,
            near: 0.1
          }}
          onCreated={handleCanvasCreated}
          onError={handleCanvasError}
          gl={{
            antialias: false,
            alpha: false,
            powerPreference: mobile ? 'low-power' : 'default', // Use low-power on mobile
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false,
            stencil: false, // Disable stencil buffer
            depth: true,
            premultipliedAlpha: false
          }}
          shadows={false}
          dpr={mobile ? Math.min(window.devicePixelRatio || 1, 1.5) : undefined} // Cap DPR at 1.5 on mobile
          frameloop={mobile ? 'demand' : 'always'} // Only render when needed on mobile
        >
          <color attach="background" args={['#87CEEB']} />
          
          <Suspense fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#888888" />
            </mesh>
          }>
            {/* Collision debug visualization - shows collision boxes when debugMode is true */}
            {debugMode && <CollisionDebug />}

            {/* Camera that follows player */}
            <FollowCamera target={cameraTarget} />

            {/* Debug: Test mesh to verify rendering works */}
            {mobile && (
              <mesh position={[0, 2, 0]}>
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial color="orange" />
              </mesh>
            )}

            {/* Only try to load GLTF if it hasn't failed before */}
            {!glbFailed ? (
              <GLTFErrorBoundary onError={handleGLBFailure}>
                <OptimizedGLTFScene 
                  url={gltfUrl}
                  position={[0, 0, 0]}
                  scale={1}
                  onError={() => {
                    logger.warn('Scene', 'GLTF loading failed, attempting fallback', { 
                      failedUrl: gltfUrl 
                    });
                    handleGLBFailure();
                  }}
                />
              </GLTFErrorBoundary>
            ) : (
              // Fallback geometry when GLTF fails
              <group>
                {/* Ground plane */}
                <mesh position={[0, -1, 0]} receiveShadow>
                  <planeGeometry args={[100, 100]} />
                  <meshStandardMaterial color="#2d5a27" />
                </mesh>
                
                {/* Main building */}
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[10, 2, 10]} />
                  <meshStandardMaterial color="#8B4513" />
                </mesh>
                <mesh position={[0, 1, 0]}>
                  <boxGeometry args={[4, 2, 4]} />
                  <meshStandardMaterial color="#CD853F" />
                </mesh>
                
                {/* Additional environment elements */}
                <mesh position={[15, 1, 5]}>
                  <boxGeometry args={[3, 2, 3]} />
                  <meshStandardMaterial color="#a0522d" />
                </mesh>
                <mesh position={[-10, 1, -8]}>
                  <boxGeometry args={[4, 2, 4]} />
                  <meshStandardMaterial color="#8b7355" />
                </mesh>
                <mesh position={[8, 0.5, -15]}>
                  <cylinderGeometry args={[1, 1, 3, 8]} />
                  <meshStandardMaterial color="#228B22" />
                </mesh>
              </group>
            )}

            <ambientLight intensity={0.6} />
            <directionalLight 
              position={[20, 30, 10]}
              intensity={0.8}
              castShadow
            />
            
            <Sky 
              distance={100000}
              sunPosition={[100, 20, 100]}
              inclination={0.3}
              azimuth={0.25}
            />

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
              playerPosition={playerPosition}
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

        {/* Career Popup */}
        {selectedPoint && (
          <CareerPopup 
            point={selectedPoint} 
            onClose={handleClosePopup} 
          />
        )}

        {/* LinkedIn Popup */}
        <LinkedInPopup 
          isOpen={showLinkedInPopup}
          onClose={handleCloseLinkedInPopup}
          onVisitLinkedIn={handleVisitLinkedIn}
          userName="your" // You can customize this
        />

        {!mobile && <ControlsHelp />}
        
        {/* Loading progress overlay */}
        {showLoading && (
          <LoadingProgress 
            onComplete={() => setShowLoading(false)}
          />
        )}
      </div>
    </CollisionProvider>
  )
}

export default Scene