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
import GLTFScene from '../Scene/GLTFScene'
import * as THREE from 'three'
import { logger } from '../utils/logger'
import FollowCamera from '../Camera/FollowCamera'
import { CollisionProvider } from '../../context/CollisionContext'
import CollisionDebug from '../Debug/CollisionDebug'
import MenuButton from '../UI/MenuButton'

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
        // Try WebGL2 first, then WebGL1, then experimental
        const gl = canvas.getContext('webgl2', { 
          alpha: false,
          antialias: false,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: false
        }) || canvas.getContext('webgl', { 
          alpha: false,
          antialias: false,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: false
        }) || canvas.getContext('experimental-webgl', {
          alpha: false,
          antialias: false,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: false
        })
        const supported = !!gl
        
        if (gl && 'createShader' in gl) {
          // Test if context is actually usable (WebGLRenderingContext)
          const webglContext = gl as WebGLRenderingContext
          try {
            const testShader = webglContext.createShader(webglContext.VERTEX_SHADER)
            if (testShader) {
              webglContext.deleteShader(testShader)
            }
          } catch (e) {
            // Context test failed, but context exists
            logger.warn('Scene', 'WebGL context test failed', { error: e })
          }
        }
        
        setWebglSupported(supported)
        
        logger.info('Scene', 'WebGL support check', { 
          supported,
          isMobile: mobile,
          userAgent: navigator.userAgent
        })

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
  }, [mobile])

  useEffect(() => {
    logger.info('Scene', 'Component mounted', {
      careerPointsCount: careerPoints.length,
      webglSupported
    })
  }, [careerPoints.length, webglSupported])

  // Handle WebGL context lost/restored events (common on mobile)
  useEffect(() => {
    const handleContextLost = (event: Event) => {
      event.preventDefault()
      logger.warn('Scene', 'WebGL context lost', { isMobile: mobile })
      setError('WebGL context was lost. Please refresh the page.')
    }

    const handleContextRestored = () => {
      logger.info('Scene', 'WebGL context restored', { isMobile: mobile })
      setError(null)
      // Force a re-render by checking WebGL again
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (gl) {
        setWebglSupported(true)
      }
    }

    // These events need to be on the window
    window.addEventListener('webglcontextlost', handleContextLost)
    window.addEventListener('webglcontextrestored', handleContextRestored)

    return () => {
      window.removeEventListener('webglcontextlost', handleContextLost)
      window.removeEventListener('webglcontextrestored', handleContextRestored)
    }
  }, [mobile])

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
    logger.error('Scene', 'GLTF loading failed after all attempts', { 
      gltfPath: '/models/town/town.gltf',
      currentOrigin: window.location.origin,
      userAgent: navigator.userAgent
    })
    setGlbFailed(true)
    onGLBFailure?.()
  }, [onGLBFailure])

  const handleCanvasCreated = useCallback(({ gl, camera, scene }: { gl: THREE.WebGLRenderer; camera: THREE.Camera; scene: THREE.Scene }) => {
    try {
      // Configure renderer for mobile
      if (mobile) {
        gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        gl.shadowMap.enabled = false
      }
      
      camera.lookAt(0, 0, 0)
      
      if ('updateProjectionMatrix' in camera && typeof (camera as any).updateProjectionMatrix === 'function') {
        (camera as any).updateProjectionMatrix();
      }
      
      scene.fog = new THREE.FogExp2('#87CEEB', 0.002)
      scene.add(new THREE.AmbientLight(0xffffff, 0.4))
      
      logger.info('Scene', 'Canvas and Three.js scene initialized', {
        isMobile: mobile,
        rendererInfo: {
          vendor: gl.getContext()?.getParameter(gl.getContext()?.VENDOR),
          renderer: gl.getContext()?.getParameter(gl.getContext()?.RENDERER)
        }
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      logger.error('Scene', 'Failed to initialize canvas', { error: errorMsg, isMobile: mobile })
      setError(errorMsg)
    }
  }, [mobile])

  const handleCanvasError = useCallback((event: any) => {
    let errorMessage = 'Unknown canvas error';
    
    if (event instanceof Error) {
      errorMessage = event.message;
    } else if (event && event.type === 'webglcontextlost') {
      errorMessage = 'WebGL context was lost';
    } else if (event && typeof event === 'object') {
      errorMessage = event.message || event.toString();
    }
    
    logger.error('Scene', 'Canvas creation failed', { 
      error: errorMessage,
      isMobile: mobile,
      userAgent: navigator.userAgent,
      event
    })
    setError(`Canvas error: ${errorMessage}`)
  }, [mobile])

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
        <MenuButton/>
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
            antialias: !mobile, // Disable antialiasing on mobile for better performance
            alpha: false,
            powerPreference: mobile ? 'high-performance' : 'default',
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false, // Don't fail on low-end devices
            stencil: false, // Disable stencil buffer for better mobile performance
            depth: true
          }}
          shadows={false}
          dpr={mobile ? Math.min(window.devicePixelRatio || 1, 2) : undefined} // Limit DPR on mobile to max 2 for performance
          frameloop="always"
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

            {/* Only try to load GLTF if it hasn't failed before */}
            {!glbFailed ? (
              <GLTFScene 
                url="/models/town/town.gltf"
                position={[0, 0, 0]}
                scale={1}
                onError={handleGLBFailure}
              />
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
      </div>
    </CollisionProvider>
  )
}

export default Scene