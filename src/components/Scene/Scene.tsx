// src/components/Scene/Scene.tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Preload } from '@react-three/drei'
import { Suspense, useState, useCallback } from 'react'
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

interface SceneProps {
  careerPoints: CareerPoint[]
}

const Scene: React.FC<SceneProps> = ({ careerPoints }) => {
  const [selectedPoint, setSelectedPoint] = useState<CareerPoint | null>(null)
  // Fix: Explicitly type the state as [number, number, number]
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([-55, 0, -22])
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
          position: [-230, 130, -130],
          fov: 50,
          far: 10000,
          near: 0.1
        }}
        onCreated={({ camera, scene }) => {
          camera.lookAt(0, 0, 0)
          camera.updateProjectionMatrix()
          
          // Enhanced fog
          scene.fog = new THREE.FogExp2('#87CEEB', 0.002)
          
          // Enable shadows
          scene.add(new THREE.AmbientLight(0xffffff, 0.4))
        }}
        shadows
      >
        <color attach="background" args={['#87CEEB']} />
        
        <Suspense fallback={null}>
          {/* Main GLB Scene - UPDATED PATH */}
          <GLBScene 
            url="/models/town/town.glb" 
            position={[0, 0, 0]}
            scale={1}
          />

          {/* Enhanced Lighting */}
          <ambientLight intensity={.4} />
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
    </div>
  )
}

export default Scene