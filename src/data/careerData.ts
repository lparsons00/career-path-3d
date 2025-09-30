import type { CareerPoint } from '../types/career'

export const careerPoints: CareerPoint[] = [
  {
    id: 1,
    title: "University",
    subtitle: "Computer Science Degree",
    description: "Completed my Bachelor's in Computer Science with focus on software engineering and algorithms.",
    year: "2015-2019",
    skills: ["Algorithms", "Data Structures", "OOP", "Java", "C++"],
    achievements: ["Graduated with Honors", "Senior Project Award"],
    position: [10, 0.5, -10],
    icon: "🎓",
    color: "#4ecdc4",
    type: 'career'
  },
  {
    id: 2,
    title: "First Job",
    subtitle: "Junior Developer at TechStart",
    description: "Started my career building web applications and learning industry best practices.",
    year: "2019-2021",
    skills: ["React", "Node.js", "TypeScript", "Agile", "Testing"],
    achievements: ["Employee of the Month", "Project Lead on E-commerce Platform"],
    position: [-50, 0.5, -5],
    icon: "💼",
    color: "#45b7d1",
    type: 'career'
  },
  {
    id: 3,
    title: "Second Job",
    subtitle: "Full Stack Developer at InnovateCo",
    description: "Advanced to full stack development working on scalable applications with modern technologies.",
    year: "2021-2023",
    skills: ["Three.js", "WebGL", "AWS", "Docker", "Microservices"],
    achievements: ["Architected 3D Visualization Platform", "Mentored 3 Junior Developers"],
    position: [-100, 0.5, 0],
    icon: "🚀",
    color: "#96ceb4",
    type: 'career'
  },
  {
    id: 4,
    title: "Current Role",
    subtitle: "Senior Software Engineer at FutureTech",
    description: "Leading development of interactive applications and mentoring team members.",
    year: "2023-Present",
    skills: ["Team Leadership", "System Architecture", "Performance Optimization", "CI/CD"],
    achievements: ["Reduced Load Times by 60%", "Implemented DevOps Pipeline"],
    position: [0, 0.5, 5],
    icon: "⭐",
    color: "#feca57",
    type: 'career'
  },
  {
    id: 5,
    title: "Future Goals",
    subtitle: "Tech Lead & Open Source Contributor",
    description: "Aspiring to lead engineering teams and contribute to meaningful open source projects.",
    year: "Future",
    skills: ["Leadership", "Open Source", "Public Speaking", "Mentoring"],
    achievements: ["Planned: Open Source Library", "Conference Speaking"],
    position: [0, 0.5, 10],
    icon: "🎯",
    color: "#ff9ff3",
    type: 'career'
  },
  {
    id: 6,
    title: "Spotify",
    subtitle: "My Music Taste",
    description: "Check out what I'm currently listening to and my favorite playlists.",
    year: "Live",
    skills: ["Music Discovery", "Playlist Curation", "Audio Programming"],
    achievements: ["500+ Followers", "Curated Coding Playlists"],
    position: [-6, 0.5, 0],
    icon: "🎵",
    color: "#1DB954",
    type: 'social',
    link: "https://open.spotify.com/user/your-profile"
  },
  {
    id: 7,
    title: "Strava",
    subtitle: "Running & Fitness",
    description: "Follow my running journey and fitness activities.",
    year: "Live",
    skills: ["Running", "Cycling", "Fitness Tracking", "Data Analysis"],
    achievements: ["1000+ km Run", "Marathon Finisher", "Consistent Training"],
    position: [6, 0.5, 0],
    icon: "🏃‍♂️",
    color: "#FC4C02",
    type: 'social',
    link: "https://www.strava.com/athletes/your-profile"
  }
]