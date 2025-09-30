import type { CareerPoint } from '../../types/career'

interface CareerPopupProps {
  point: CareerPoint
  onClose: () => void
}

const CareerPopup: React.FC<CareerPopupProps> = ({ point, onClose }) => {
  const isHobby = point.type === 'hobby'
  const isSocial = point.type === 'social'

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0, 0, 0, 0.95)',
      color: 'white',
      padding: '2rem',
      borderRadius: '15px',
      maxWidth: '500px',
      width: '90%',
      backdropFilter: 'blur(10px)',
      border: `2px solid ${point.color}`,
      boxShadow: '0 0 30px rgba(0,0,0,0.5)',
      zIndex: 1000
    }}>
      <button 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '1.5rem',
          cursor: 'pointer'
        }}
      >
        ✕
      </button>
      
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '2rem', marginRight: '1rem' }}>{point.icon}</span>
        <div>
          <h2 style={{ color: point.color, margin: 0 }}>{point.title}</h2>
          <p style={{ margin: 0, opacity: 0.8 }}>
            {isHobby ? 'Personal Interest' : point.year}
          </p>
        </div>
      </div>
      
      <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>{point.description}</p>
      
      {point.skills && (
        <div>
          <h3 style={{ color: point.color, marginBottom: '0.5rem' }}>
            {isHobby ? 'Interests & Activities' : 'Skills & Technologies'}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {point.skills.map((skill, index) => (
              <span 
                key={index}
                style={{
                  background: 'rgba(249, 249, 249, 0.1)',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '15px',
                  fontSize: '0.9rem'
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {(isSocial || isHobby) && point.link && (
        <div style={{ marginTop: '1.5rem' }}>
          <a 
            href={point.link} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              color: point.color,
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              border: `1px solid ${point.color}`,
              borderRadius: '5px',
              display: 'inline-block'
            }}
          >
            Visit {point.title}
          </a>
        </div>
      )}
    </div>
  )
}

export default CareerPopup