import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky } from '@react-three/drei'
import { Suspense, useState, useCallback } from 'react'
import type { CareerPoint } from '../../types/career'
import PathPoints from '../Path/PathPoints'
import PlayerCharacter from '../Character/PlayerCharacter'
import MovementController from '../Character/MovementController'
import CareerPopup from '../UI/CareerPopup'
import ControlsHelp from '../UI/ControlsHelp'
import { isMobile } from '../utils/pathUtils'
import GoldenPath from '../Path/GoldenPath'
import * as THREE from 'three'

interface SceneProps {
  careerPoints: CareerPoint[]
}

const Scene: React.FC<SceneProps> = ({ careerPoints }) => {
  const [selectedPoint, setSelectedPoint] = useState<CareerPoint | null>(null)
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>(careerPoints[0].position)
  const [isMoving, setIsMoving] = useState(false)

  const handlePointClick = useCallback((point: CareerPoint) => {
    setSelectedPoint(point)
  }, [])

  const handleClosePopup = useCallback(() => {
    setSelectedPoint(null)
  }, [])

  const mobile = isMobile()

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative',
      touchAction: 'none'
    }}>
      <Canvas
        camera={{
          position: [10, 25, 65],
          fov: 40,
          far: 1000,
          near: 0.1
        }}
        onCreated={({ camera, scene }) => {
          camera.lookAt(0, 0, 0)
          camera.updateProjectionMatrix()
          
          // Enhanced fog with exponential decay for more natural fade
          scene.fog = new THREE.FogExp2('#87CEEB', 0.002) // Exponential fog for smoother fade
        }}
      >
        <color attach="background" args={['#87CEEB']} />
        
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[20, 15, 0]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, 15, -10]} intensity={0.3} color="#4ecdc4" />
          
          <Sky 
            distance={1000}
            sunPosition={[100, 20, 100]}
            inclination={0.3}
            azimuth={0.25}
          />
          
          {/* Massive ground with subtle texture variation */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[1000, 1000, 100, 100]} /> {/* Even larger ground */}
            <meshStandardMaterial 
              color="#2E8B57" 
              roughness={0.9}
              metalness={0.05}
            />
          </mesh>

          {/* Distant mountains/hills for depth (optional) */}
          <mesh position={[0, -5, -200]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[800, 400, 20, 20]} />
            <meshStandardMaterial 
              color="#1a5c38" 
              roughness={1.0}
              metalness={0.0}
              transparent
              opacity={0.3}
            />
          </mesh>

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
            enablePan={true}
            enableRotate={true}
            minDistance={10}
            maxDistance={100}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.5}
            minAzimuthAngle={-Math.PI / 2}
            maxAzimuthAngle={Math.PI / 2}
            target={[0, 0, 0]}
            rotateSpeed={0.3}
          />
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
  )
}

export default Scene