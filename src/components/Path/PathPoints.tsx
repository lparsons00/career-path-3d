// src/components/Path/PathPoints.tsx
import { useFrame } from '@react-three/fiber'
import { useRef, useMemo, useState } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { CareerPoint } from '../../types/career'

// Add Strava API import and interface
import { stravaAPI, type StravaActivity } from '../utils/strava'

interface PathPointsProps {
  points: CareerPoint[]
  onPointClick: (point: CareerPoint) => void
  playerPosition: [number, number, number]
}

const PathPoints: React.FC<PathPointsProps> = ({ 
  points, 
  onPointClick, 
  playerPosition 
}) => {
  const pointsRef = useRef<THREE.Group>(null)
  const textRefs = useRef<THREE.Group[]>([])
  
  // Add Strava state
  const [showStravaPopup, setShowStravaPopup] = useState(false)
  const [stravaActivity, setStravaActivity] = useState<StravaActivity | null>(null)
  const [isLoadingStrava, setIsLoadingStrava] = useState(false)
  const [stravaError, setStravaError] = useState<string | null>(null)
  
  // Memoize materials to prevent recreation on every render
  const materials = useMemo(() => {
    return points.map(point => 
      new THREE.MeshStandardMaterial({
        color: point.color || "#ff6b6b",
        emissive: 0x000000,
        metalness: 0.3,
        roughness: 0.4
      })
    )
  }, [points])

  // Add Strava click handler
  const handleStravaClick = async () => {
    setIsLoadingStrava(true)
    setStravaError(null)
    setShowStravaPopup(true)
    
    try {
      const activity = await stravaAPI.getLatestActivity()
      setStravaActivity(activity)
    } catch (error) {
      setStravaError(error instanceof Error ? error.message : 'Failed to load activity')
    } finally {
      setIsLoadingStrava(false)
    }
  }

  // Enhanced click handler
  const handlePointClick = (point: CareerPoint) => {
    // Check if this is a Strava point
    if (point.title.includes('Strava')) {
      handleStravaClick()
    } else {
      // Handle other points normally
      onPointClick(point)
    }
  }

  // Make text always face the camera
  useFrame((state) => {
    if (!pointsRef.current) return
    
    const playerPos = new THREE.Vector3(...playerPosition)
    const camera = state.camera
    
    pointsRef.current.children.forEach((pointGroup, index) => {
      const point = points[index]
      if (!point) return
      
      const pointPos = new THREE.Vector3(...point.position)
      const distance = pointPos.distanceTo(playerPos)
      
      // Find the mesh and update emissive based on distance
      pointGroup.children.forEach(child => {
        if (child instanceof THREE.Mesh && materials[index]) {
          if (distance < 5) {
            materials[index].emissive = new THREE.Color(0x4444ff)
          } else {
            materials[index].emissive = new THREE.Color(0x000000)
          }
        }
      })
      
      // Make text face the camera (billboarding)
      const textGroup = pointGroup.children.find(child => child.type === "Group")
      if (textGroup) {
        textGroup.lookAt(camera.position)
      }
    })
  })

  // Simple popup component (you can replace this with your more sophisticated one)
  const StravaPopup = () => {
    if (!showStravaPopup) return null

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}>
            <h2 style={{ margin: 0, color: '#fc4c02' }}>🏃‍♂️ Latest Strava Activity</h2>
            <button 
              onClick={() => setShowStravaPopup(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>

          {isLoadingStrava && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div>Loading your latest activity...</div>
            </div>
          )}

          {stravaError && (
            <div style={{ color: 'red', textAlign: 'center' }}>
              <p>Error: {stravaError}</p>
            </div>
          )}

          {stravaActivity && (
            <div>
              <h3 style={{ marginBottom: '15px' }}>{stravaActivity.name}</h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                marginBottom: '15px',
              }}>
                <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
                  <div style={{ fontSize: '12px', color: '#666' }}>Distance</div>
                  <div style={{ fontWeight: 'bold' }}>
                    {((stravaActivity.distance / 1000)).toFixed(2)} km
                  </div>
                </div>
                
                <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
                  <div style={{ fontSize: '12px', color: '#666' }}>Moving Time</div>
                  <div style={{ fontWeight: 'bold' }}>
                    {Math.floor(stravaActivity.moving_time / 60)}:
                    {(stravaActivity.moving_time % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                
                <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
                  <div style={{ fontSize: '12px', color: '#666' }}>Pace</div>
                  <div style={{ fontWeight: 'bold' }}>
                    {stravaActivity.average_speed 
                      ? `${Math.floor(1000 / (stravaActivity.average_speed * 60))}:${Math.round((1000 / (stravaActivity.average_speed * 60) - Math.floor(1000 / (stravaActivity.average_speed * 60))) * 60).toString().padStart(2, '0')}/km`
                      : 'N/A'
                    }
                  </div>
                </div>
                
                <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
                  <div style={{ fontSize: '12px', color: '#666' }}>Elevation</div>
                  <div style={{ fontWeight: 'bold' }}>
                    {stravaActivity.total_elevation_gain} m
                  </div>
                </div>
              </div>

              <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '5px' }}>
                <p><strong>Type:</strong> {stravaActivity.type}</p>
                <p><strong>Date:</strong> {new Date(stravaActivity.start_date_local).toLocaleDateString()}</p>
                {stravaActivity.average_heartrate && (
                  <p><strong>Avg HR:</strong> {Math.round(stravaActivity.average_heartrate)} bpm</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }



  //
return (
    <>
      <group ref={pointsRef}>
        {points.map((point, index) => (
          <group key={point.id} position={[point.position[0], point.position[1], point.position[2]]}>
            {/* Different geometry based on point type */}
            <mesh
              onClick={() => handlePointClick(point)}
              onPointerDown={() => handlePointClick(point)}
              castShadow
              receiveShadow
              material={materials[index]}
            >
              {point.type === 'linkedin' ? (
                // LinkedIn point: Box geometry (square)
                <boxGeometry args={[1.8, 3, .3]} />
              ) : (
                // Regular career point: Sphere geometry
                <sphereGeometry args={[1.5, 16, 16]} />
              )}
            </mesh>
            
            {/* Title label that will face camera */}
            <group ref={el => { if (el) textRefs.current[index] = el }}>
              <Text
                position={[0, 2.5, 0]}
                fontSize={0.75}
                color="white"
                anchorX="center"
                anchorY="bottom"
                fillOpacity={1}
              >
                {point.title || `Point ${point.id}`}
              </Text>
              {point.subtitle && (
                <Text
                  position={[0, 1.8, 0]}
                  fontSize={0.6}
                  color="#cccccc"
                  anchorX="center"
                  anchorY="bottom"
                  fillOpacity={0.8}
                >
                  {point.subtitle}
                </Text>
              )}
            </group>
          </group>
        ))}
      </group>

      {/* Render the Strava popup */}
      <StravaPopup />
    </>
  )
}

export default PathPoints
//   //
//   return (
//     <>
//       <group ref={pointsRef}>
//         {points.map((point, index) => (
//           <group key={point.id} position={point.position}>
//             {/* Sphere mesh with memoized material */}
//             <mesh
//               onClick={() => handlePointClick(point)}
//               onPointerDown={() => handlePointClick(point)}
//               castShadow
//               receiveShadow
//               material={materials[index]}
//             >
//               <sphereGeometry args={[1.5, 16, 16]} />
//             </mesh>
            
//             {/* Title label that will face camera */}
//             <group ref={el => { if (el) textRefs.current[index] = el }}>
//               <Text
//                 position={[0, 2, 0]}
//                 fontSize={0.75}
//                 color="white"
//                 anchorX="center"
//                 anchorY="bottom"
//                 fillOpacity={3}
//               >
//                 {point.title || `Point ${point.id}`}
//               </Text>
//               <Text
//                 position={[0, 1.5, 0]}
//                 fontSize={0.6}
//                 color="white"
//                 anchorX="center"
//                 anchorY="bottom"
//                 fillOpacity={1.75}
//               >
//                 {point.subtitle || ``}
//               </Text>
//             </group>
//           </group>
//         ))}
//       </group>

//       {/* Render the Strava popup */}
//       <StravaPopup />
//     </>
//   )
// }

// export default PathPoints