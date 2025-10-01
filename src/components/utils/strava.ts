// src/utils/strava.ts
export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
}

class StravaService {
  private baseUrl: string;

  constructor() {
    // Use relative path in production, localhost in development
    if (import.meta.env.PROD) {
      // In production: use relative path to same Vercel deployment
      this.baseUrl = '/api/strava';
    } else {
      // In development: use local backend or mock
      this.baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api/strava';
    }
  }

  async getLatestActivity(): Promise<StravaActivity> {
    try {
      const endpoint = `${this.baseUrl}/activity`;
      console.log('Fetching from:', endpoint);
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const activity = await response.json();
      return activity;
    } catch (error) {
      console.error('Error fetching Strava activity:', error);
      throw error;
    }
  }

  formatDistance(distance: number): string {
    return `${(distance / 1000).toFixed(2)} km`;
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  formatPace(speed: number): string {
    const pace = 1000 / (speed * 60);
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
  }
}

export const stravaService = new StravaService();