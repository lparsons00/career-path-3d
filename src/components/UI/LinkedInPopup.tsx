// src/components/UI/LinkedInPopup.tsx
import { useState, useEffect } from 'react'
import { logger } from '../utils/logger'

interface LinkedInPopupProps {
  isOpen: boolean
  onClose: () => void
  onVisitLinkedIn: () => void
  userName?: string
}

const LinkedInPopup: React.FC<LinkedInPopupProps> = ({ 
  isOpen, 
  onClose, 
  onVisitLinkedIn,
  userName = "my" 
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      logger.info('LinkedInPopup', 'Popup opened')
    } else {
      // Add delay for close animation
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleVisitLinkedIn = () => {
    logger.info('LinkedInPopup', 'User chose to visit LinkedIn')
    onVisitLinkedIn()
    onClose()
  }

  const handleClose = () => {
    logger.info('LinkedInPopup', 'User closed LinkedIn popup')
    onClose()
  }

  if (!isVisible && !isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      opacity: isOpen ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out'
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        transform: isOpen ? 'scale(1)' : 'scale(0.9)',
        transition: 'transform 0.3s ease-in-out'
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: '#0077B5' // LinkedIn blue
        }}>
          📬 Connect with Me
        </div>
        
        <p style={{
          marginBottom: '24px',
          fontSize: '16px',
          lineHeight: '1.5',
          color: '#333'
        }}>
          Would you like to visit my LinkedIn profile to learn more about my professional experience and connect?
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleVisitLinkedIn}
            style={{
              background: '#0077B5',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.2s',
              minWidth: '140px'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#005885'}
            onMouseOut={(e) => e.currentTarget.style.background = '#0077B5'}
          >
            Yes, Visit LinkedIn
          </button>
          
          <button
            onClick={handleClose}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'background 0.2s',
              minWidth: '140px'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#545b62'}
            onMouseOut={(e) => e.currentTarget.style.background = '#6c757d'}
          >
            Maybe Later
          </button>
        </div>

        <div style={{
          marginTop: '16px',
          fontSize: '12px',
          color: '#666'
        }}>
          You can always come back to this point later
        </div>
      </div>
    </div>
  )
}

export default LinkedInPopup