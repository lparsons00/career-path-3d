// src/utils/scenePlacement.ts
import * as THREE from 'three'
import type { CareerPoint } from '../../types/career'

/**
 * Helper to position career points at specific locations in your town
 * You'll need to adjust these coordinates based on your town layout
 */
export const getTownCareerPoints = (basePoints: CareerPoint[]): CareerPoint[] => {
  // Example positions - adjust these to place points at specific buildings/locations
  const townPositions: { [key: string]: [number, number, number] } = {
    'company-1': [10, 2, 5],    // Near a specific building
    'company-2': [-8, 2, -12],  // Another location
    'project-1': [15, 2, -5],
    'project-2': [-12, 2, 8],
    // Add more as needed
  }

  return basePoints.map(point => ({
    ...point,
    position: townPositions[point.id] || point.position
  }))
}

/**
 * Calculate scene boundaries based on your town size
 */
export const getTownBoundaries = () => {
  return {
    min: new THREE.Vector3(-50, 0, -50),  // Adjust based on your town size
    max: new THREE.Vector3(50, 0, 50)     // Adjust based on your town size
  }
}