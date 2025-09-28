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
  const startZ = -30
  const spacing = 12
  
  const careerPoints: CareerPoint[] = [
    {
      id: 1,
      title: "Serco - Graduate Software Engineer",
      year: "2018",
      description: "Began career as full-stack developer working on web applications and building foundational programming skills.",
      position: [0, 0, startZ],
      type: "career",
      icon: "💻",
      color: "#3498db",
      skills: ["JavaScript", "React", "Node.js", "HTML/CSS", "Git"]
    },
    {
      id: 2,
      title: "Greenstone Financial Services - Junior Software Engineer",
      year: "2020",
      description: "Focused on machine learning projects, developing AI solutions and data processing pipelines.",
      position: [0, 0, startZ + spacing],
      type: "career",
      icon: "🤖",
      color: "#9b59b6",
      skills: ["Python", "TensorFlow", "Machine Learning", "Data Analysis", "Pandas"]
    },
    {
      id: 3,
      title: "CAE - Simulation Software Engineer",
      year: "2021",
      description: "Explored 3D web development, creating interactive experiences with Three.js and WebGL.",
      position: [0, 0, startZ + spacing * 2],
      type: "passion",
      icon: "🎮",
      color: "#e74c3c",
      skills: ["Three.js", "WebGL", "3D Modeling", "Shader Programming", "Animation"]
    },
    {
      id: 4,
      title: "Fletcher Building - Stream Lead Software Engineer",
      year: "2022",
      description: "Active open source contributor, collaborating with developers worldwide on innovative projects.",
      position: [0, 0, startZ + spacing * 3],
      type: "social",
      icon: "🌐",
      color: "#2ecc71",
      skills: ["GitHub", "Community", "Documentation", "Code Review"],
      link: "https://github.com"
    },
    // {
    //   id: 5,
    //   title: "Tech Leadership",
    //   year: "2023",
    //   description: "Leading development teams, mentoring junior developers, and architecting complex systems.",
    //   position: [0, 0, startZ + spacing * 4],
    //   type: "career",
    //   icon: "👨‍💼",
    //   color: "#f39c12",
    //   skills: ["Leadership", "System Architecture", "Project Management", "Mentoring"]
    // },
    {
      id: 5,
      title: "Future Vision",
      year: "2024+",
      description: "Exploring next generation web experiences including Web3, AR/VR, and immersive technologies.",
      position: [0, 0, startZ + spacing * 4],
      type: "passion",
      icon: "🚀",
      color: "#1abc9c",
      skills: ["Innovation", "Web3", "AR/VR", "Emerging Technologies"]
    }
  ]

  // Add hobby nodes on either side of the golden path
  const hobbyPoints: CareerPoint[] = [
    {
      id: 6,
      title: "Music & Spotify",
      year: "Always",
      description: "Music enthusiast with diverse tastes. Always coding with a soundtrack!",
      position: [-8, 0, startZ + spacing * 1.5], // Left side, between 2020 and 2021
      type: "hobby",
      icon: "🎵",
      color: "#1DB954", // Spotify green
      skills: ["Various Genres", "Playlist Curation", "Live Music"],
      link: "https://open.spotify.com"
    },
    {
      id: 7,
      title: "Strava",
      year: "Active",
      description: "Regular runner and fitness tracker. Staying active for better coding!",
      position: [8, 0, startZ + spacing * 2.5], // Right side, between 2021 and 2022
      type: "hobby",
      icon: "🏃",
      color: "#FC4C02", // Strava orange
      skills: ["Running", "Cycling", "Fitness Tracking"],
      link: "https://www.strava.com"
    },
    {
      id: 8,
      title: "GitHub Link",
      year: "Ongoing",
      description: "Personal coding projects and open source contributions in my spare time.",
      position: [-8, 0, startZ + spacing * 3.5], // Left side, between 2022 and 2023
      type: "hobby",
      icon: "💾",
      color: "#181717", // GitHub black
      skills: ["Side Projects", "Open Source", "Code Experiments"],
      link: "https://github.com"
    }//,
    // {
    //   id: 9,
    //   title: "Gaming & Tech",
    //   year: "Fun",
    //   description: "Gaming enthusiast and tech tinkerer. Love exploring new technologies!",
    //   position: [8, 0, startZ + spacing * 4.5], // Right side, between 2023 and 2024
    //   type: "hobby",
    //   icon: "🎮",
    //   color: "#9C27B0", // Purple
    //   skills: ["Gaming", "Tech Reviews", "Hardware"]
    // }
  ]

  return [...careerPoints, ...hobbyPoints]
}