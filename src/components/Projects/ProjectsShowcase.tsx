// src/components/Projects/ProjectsShowcase.tsx
import { useState } from 'react'
import { isMobile } from '../utils/pathUtils'
import { logger } from '../utils/logger'
import './ProjectsShowcase.css'
import MenuButton from '../UI/MenuButton'

interface Project {
  id: number
  name: string
  description: string
  html_url: string
  language: string
  updated_at: string
  homepage?: string
  featured?: boolean
  technologies: string[]
  longDescription?: string
}

const ProjectsShowcase: React.FC = () => {
  const [projects] = useState<Project[]>([
    {
      id: 1,
      name: "Career Path 3D",
      description: "Interactive 3D portfolio showcasing my career journey using React Three.js and TypeScript",
      longDescription: "A modern 3D portfolio built with React, Three.js, and TypeScript featuring interactive career nodes, collision detection, and mobile-friendly controls. This project demonstrates advanced 3D web development skills and responsive design.",
      html_url: "https://github.com/lparsons00/career-path-3d",
      language: "TypeScript",
      updated_at: "2025-10-07",
      homepage: "https://www.lparsons.dev",
      featured: true,
      technologies: ["React", "Three.js", "TypeScript", "Vite", "Vercel"]
    },
    {
      id: 2,
      name: "Basketball Predictive Analysis",
      description: "Coming Soon",
      longDescription: "Coming Soon",
      html_url: "https://www.google.com",
      language: "Python",
      updated_at: "2024-10-11",
      featured: true,
      technologies: ["Python", "ML", "AI"]
    },
    {
      id: 3,
      name: "JUMPER SIM",
      description: "JumperSim is an alpha stage, open-source 3D skydiving physics simulator built with Three.js and TypeScript",
      longDescription: "JumperSim is an early alpha stage, open-source 3D skydiving physics simulator built with Three.js and TypeScript, designed for visualizing and analyzing jumper dynamics in both freefall and canopy flight. Featuring real-time weather data, layered wind modeling, and a full timeline playback system, JumperSim is built as a safety training and planning tool for skydivers, instructors, and dropzone operators.",
      html_url: "https://github.com/plaidroni/JumperSim",
      language: "TypeScript",
      updated_at: "2025-09-01",
      homepage: "https://www.jumpersim.com",
      featured: false,
      technologies: ["TypeScript", "ThreeJs", "Vite"]
    }
  ])

  const [filter, setFilter] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const mobile = isMobile()

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => 
        project.language?.toLowerCase() === filter.toLowerCase() ||
        project.technologies.some(tech => tech.toLowerCase() === filter.toLowerCase())
      )

  const languages = [...new Set(projects.flatMap(p => [p.language, ...p.technologies]))].filter(Boolean) as string[]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const openProjectDetail = (project: Project) => {
    setSelectedProject(project)
    logger.info('ProjectsShowcase', 'Project detail opened', { project: project.name })
  }

  const closeProjectDetail = () => {
    setSelectedProject(null)
  }

  return (
    <div className="projects-container">
      <MenuButton />
      
      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="project-modal">
          <div className="modal-content">
            <button className="modal-close" onClick={closeProjectDetail}>
              ×
            </button>
            
            <h2>{selectedProject.name}</h2>
            <p className="modal-description">{selectedProject.longDescription}</p>
            
            <div className="modal-technologies">
              <h4>Technologies Used:</h4>
              <div className="tech-tags">
                {selectedProject.technologies.map((tech, index) => (
                  <span key={index} className="tech-tag">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="modal-links">
              <a 
                href={selectedProject.html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="modal-link"
              >
                📁 View Code
              </a>
              {selectedProject.homepage && (
                <a 
                  href={selectedProject.homepage} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="modal-link primary"
                >
                  🌐 Live Demo
                </a>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="projects-scroll-container">
      <header className="projects-header">
        <h1>My Featured Projects</h1>
        <p>A curated selection of my most proud work and technical achievements</p>
      </header>

      {/* Filter Buttons */}
      <div className="filter-container">
        <button
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Projects
        </button>
        {languages.map(language => (
          <button
            key={language}
            className={`filter-button ${filter === language ? 'active' : ''}`}
            onClick={() => setFilter(language)}
          >
            {language}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className={`projects-grid ${mobile ? 'mobile' : ''}`}>
        {filteredProjects.map(project => (
          <div 
            key={project.id} 
            className={`project-card ${project.featured ? 'featured' : ''}`}
            onClick={() => openProjectDetail(project)}
          >
            {project.featured && (
              <div className="featured-badge">⭐ Featured</div>
            )}
            
            <div className="project-header">
              <h3 className="project-title">
                {project.name}
              </h3>
            </div>

            <p className="project-description">
              {project.description}
            </p>

            <div className="technologies">
              {project.technologies.slice(0, 4).map((tech, index) => (
                <span 
                  key={index}
                  className="tech-tag small"
                  style={{ 
                    backgroundColor: getLanguageColor(tech) 
                  }}
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 4 && (
                <span className="tech-tag small">
                  +{project.technologies.length - 4} more
                </span>
              )}
            </div>

            <div className="project-footer">
              <span className="project-language">
                <span 
                  className="language-dot"
                  style={{ 
                    backgroundColor: getLanguageColor(project.language) 
                  }}
                ></span>
                {project.language}
              </span>
              
              <span className="project-updated">
                Updated: {formatDate(project.updated_at)}
              </span>
            </div>

            <div className="project-actions">
              <a 
                href={project.html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="project-link-button"
                onClick={(e) => e.stopPropagation()}
              >
                View Code
              </a>
              {project.homepage && (
                <a 
                  href={project.homepage} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="project-link-button primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  Live Demo
                </a>
              )}
              <button 
                className="project-link-button secondary"
                onClick={(e) => {
                  e.stopPropagation()
                  openProjectDetail(project)
                }}
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="no-projects">
          <h3>No projects found</h3>
          <p>Try selecting a different filter</p>
        </div>
      )}
    </div>
    </div>
  )
}

// Enhanced language colors
const getLanguageColor = (language: string | null): string => {
  const colors: { [key: string]: string } = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Java: '#b07219',
    HTML: '#e34c26',
    CSS: '#563d7c',
    'C++': '#f34b7d',
    'C#': '#178600',
    'Vue.js': '#2c3e50',
    React: '#61dafb',
    'Node.js': '#339933',
    'React Native': '#61dafb',
    Firebase: '#FFCA28',
    PostgreSQL: '#336791',
    MongoDB: '#47A248',
    Docker: '#2496ED',
    WebSocket: '#010101',
    Stripe: '#635bff',
    JWT: '#000000',
    FastAPI: '#009688',
    OpenAI: '#412991',
    Redux: '#764ABC',
    Expo: '#000020',
    'D3.js': '#F9A03C',
    Vite: '#646CFF',
    Vercel: '#000000'
  }
  
  return colors[language || ''] || '#6c757d'
}

export default ProjectsShowcase