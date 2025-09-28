import Scene from './components/Scene/Scene'
import { createGoldenPath } from '../src/components/utils/pathUtils'
import './App.css'

function App() {
  const careerPoints = createGoldenPath()

  return (
    <div className="App">
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
      }}>
        <Scene careerPoints={careerPoints} />
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
        backdropFilter: 'blur(10px)'
      }}>
        <h1>My Career Journey</h1>
        <p>Explore my professional path in 3D</p>
      </div>
    </div>
  )
}

export default App