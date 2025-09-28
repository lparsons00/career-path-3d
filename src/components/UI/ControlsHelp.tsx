import { isMobile } from '../utils/pathUtils'

const ControlsHelp: React.FC = () => {
  const mobile = isMobile()

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      background: 'rgba(0, 0, 0, 0.85)',
      color: 'white',
      padding: '1rem',
      borderRadius: '10px',
      maxWidth: '300px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 215, 0, 0.3)'
    }}>
      <h3 style={{ marginBottom: '0.5rem', color: '#4ecdc4' }}>
        {mobile ? '📱 Career Timeline' : '🎮 Career Timeline'}
      </h3>
      
      {mobile ? (
        <>
          <p>• <strong>Tap anywhere</strong> to move character</p>
          <p>• <strong>Drag with one finger</strong> to rotate view</p>
          <p>• <strong>Drag with two fingers</strong> to pan</p>
          <p>• <strong>Pinch</strong> to zoom in/out</p>
        </>
      ) : (
        <>
          <p>• <strong>Click anywhere</strong> to move character</p>
          <p>• <strong>Left-click + drag</strong> to rotate view</p>
          <p>• <strong>Right-click + drag</strong> to pan</p>
          <p>• <strong>Scroll</strong> to zoom in/out</p>
        </>
      )}
      
      <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '10px' }}>
        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
          <strong>Timeline:</strong> Follow the golden path from early career (bottom) to recent (top)
        </p>
        <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '5px' }}>
          <strong>Walk to any node</strong> and click when close to learn more
        </p>
      </div>
    </div>
  )
}

export default ControlsHelp