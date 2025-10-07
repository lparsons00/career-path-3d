// src/types/career.ts
export interface CareerPoint {
  id: number;
  title: string;
  subtitle?: string;
  year: string;
  description: string;
  position: [number, number, number];
  type: "career" | "passion" | "social" | "fitness";
  icon: string;
  color: string;
  skills: string[];
  link?: string;
}

export interface MovementState {
  position: [number, number, number];
  targetPosition: [number, number, number] | null;
  isMoving: boolean;
  direction: number;
}

