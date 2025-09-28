export interface CareerPoint {
  id: number
  title: string
  year: string
  description: string
  subtitle?: string
  position: [number, number, number]
  type: 'career' | 'education' | 'passion' | 'social' | 'hobby'
  icon: string
  color: string
  skills?: string[]
  achievements?: string[]
  link?: string
}

export interface CareerData {
  points: CareerPoint[]
}