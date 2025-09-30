// import { CareerPoint } from '../types/career'
import type { CareerPoint } from '../../types/career'

export const calculateDistance = (pos1: [number, number, number], pos2: [number, number, number]): number => {
  const dx = pos1[0] - pos2[0]
  const dz = pos1[2] - pos2[2]
  return Math.sqrt(dx * dx + dz * dz)
}

export const isMobile = (): boolean => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

export const createGoldenPath = (): CareerPoint[] => {
  // Center the path in the massive scene
  const startZ = -27.7
  
  const careerPoints: CareerPoint[] = [
    {
      id: 1,
      title: "Serco - Graduate Software Engineer",
      year: "2021-2022",
      description: "Began career as full-stack developer working on web applications and building foundational programming skills.",
      position: [-60, 0, startZ],
      type: "career",
      icon: "🚢",
      color: "#dc2626",
      skills: ["C#", "JavaScript", "Node.js", "HTML/CSS", "Git", "SQL"]
    },
    {
      id: 2,
      title: "Greenstone Financial Services - Junior Software Engineer",
      year: "2022-2023",
      description: "Focused on growing my skills as a full-stack developer, learning more about C# & SQL optimization",
      position: [-50, 0, startZ],
      type: "career",
      icon: "🌐",
      color: "#ea580c",
      skills: ["C#", "SQL", "Code Optimization", "Data Analysis"]
    },
    {
      id: 3,
      title: "CAE - Simulation Software Engineer",
      year: "2023-2024",
      description: "Explored simulation software development, working with low-level code to create high-fidelity simulators.",
      position: [-40, 0, startZ],
      type: "career",
      icon: "✈️",
      color: "#d97706",
      skills: ["C++", "C", "Simulation Development", "FORTRAN"]
    },
    {
      id: 4,
      title: "Fletcher Building - Stream Lead Software Engineer",
      year: "2024-2025",
      description: "Re-designed entire system for Fletecher Building, including front-end and back-end utilizing .NET and React Native",
      position: [-30, 0, startZ],
      type: "career",
      icon: "🏗️",
      color: "#ca8a04",
      skills: ["React Native", "SQL", "C#", ".NET"],
    },
    // {
    //   id: 5,
    //   title: "Tech Leadership",
    //   year: "2023",
    //   description: "Leading development teams, mentoring junior developers, and architecting complex systems.",
    //   position: [0, 0, startZ + spacing * 4],
    //   type: "career",
    //   icon: "👨‍💼",
    //   color: "#ff9d00ff",
    //   skills: ["Leadership", "System Architecture", "Project Management", "Mentoring"]
    // },
    {
      id: 5,
      title: "Future Vision",
      year: "2024+",
      description: "Exploring the cutting edge of full-stack development, utilizing AI for complex solutions",
      position: [-20, 0, startZ],
      type: "career",
      icon: "🚀",
      color: "#65a30d",
      skills: ["Innovation", "LLM", "AI", "Emerging Technologies"]
    }
  ]

  // Add hobby nodes on either side of the golden path
  const hobbyPoints: CareerPoint[] = [
    {
      id: 6,
      title: "Spotify",
      year: "Always",
      description: "Music enthusiast with diverse tastes. Always coding with a soundtrack!",
      position: [-53.5, 0, startZ + 30],
      type: "hobby",
      icon: "🎵",
      color: "#3b82f6",
      skills: ["Various Genres", "Playlist Curation", "Live Music"],
      link: "https://open.spotify.com"
    },
    {
      id: 7,
      title: "Strava",
      year: "Active",
      description: "Regular runner and fitness tracker. Staying active for better coding!",
      position: [-31.5, 0, startZ - 10],
      type: "hobby",
      icon: "🏃",
      color: "#3b82f6", 
      skills: ["Running", "Cycling", "Fitness Tracking"],
      link: "https://www.strava.com"
    },
    {
      id: 8,
      title: "GitHub Link",
      year: "Ongoing",
      description: "Personal coding projects and open source contributions in my spare time.",
      position: [-75, 0, startZ],
      type: "hobby",
      icon: "💾",
      color: "#3b82f6", 
      skills: ["Side Projects", "Open Source", "Code Experiments"],
      link: "https://github.com/lparsons00"
    }
  ]

  return [...careerPoints, ...hobbyPoints]
}