// src/components/UI/MenuButton.tsx
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { isMobile } from '../utils/pathUtils'
import { logger } from '../utils/logger'

const MenuButton: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const mobile = isMobile()

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    logger.info('MenuButton', 'Menu toggled', { isOpen: !isMenuOpen, isMobile: mobile })
  }

  const handleProjectsClick = () => {
    navigate('/projects')
    setIsMenuOpen(false)
    logger.info('MenuButton', 'Navigating to projects')
  }

  const handleHomeClick = () => {
    navigate('/')
    setIsMenuOpen(false)
    logger.info('MenuButton', 'Navigating to home')
  }

  const isProjectsPage = location.pathname === '/projects'

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={toggleMenu}
        style={{
          position: 'fixed',
          top: mobile ? '16px' : '20px',
          left: mobile ? '16px' : '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          border: 'none',
          borderRadius: '50%',
          width: mobile ? '50px' : '60px',
          height: mobile ? '50px' : '60px',
          color: 'white',
          fontSize: mobile ? '24px' : '28px',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 119, 181, 0.9)'
          e.currentTarget.style.transform = 'scale(1.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        ☰
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: mobile ? '76px' : '90px',
            left: mobile ? '16px' : '20px',
            background: 'rgba(0, 0, 0, 0.95)',
            borderRadius: '12px',
            padding: mobile ? '16px' : '20px',
            minWidth: mobile ? '200px' : '250px',
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{
            color: 'white',
            fontSize: mobile ? '14px' : '16px',
            fontWeight: 'bold',
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            Navigation
          </div>

          <button
            onClick={handleHomeClick}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: isProjectsPage ? '#ccc' : '#0077B5',
              padding: mobile ? '12px 8px' : '14px 12px',
              textAlign: 'left',
              fontSize: mobile ? '14px' : '16px',
              cursor: 'pointer',
              borderRadius: '6px',
              marginBottom: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isProjectsPage) {
                e.currentTarget.style.background = 'rgba(0, 119, 181, 0.2)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none'
            }}
          >
            🏠 3D Portfolio
          </button>

          <button
            onClick={handleProjectsClick}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: isProjectsPage ? '#0077B5' : 'white',
              padding: mobile ? '12px 8px' : '14px 12px',
              textAlign: 'left',
              fontSize: mobile ? '14px' : '16px',
              cursor: 'pointer',
              borderRadius: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isProjectsPage) {
                e.currentTarget.style.background = 'rgba(0, 119, 181, 0.2)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none'
            }}
          >
            💻 Code Projects
          </button>

          {/* Add more menu items as needed */}
          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: mobile ? '12px' : '14px',
            color: '#888'
          }}>
            Built with React & Three.js
          </div>
        </div>
      )}
    </>
  )
}

export default MenuButton