// src/utils/strava.ts

export class StravaAPI {
  private accessToken: string;
  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;

  constructor(clientId?: string, clientSecret?: string, refreshToken?: string) {
    // Use provided values or get from Vite environment variables
    this.clientId = clientId || this.getEnvVariable('VITE_STRAVA_CLIENT_ID');
    this.clientSecret = clientSecret || this.getEnvVariable('VITE_STRAVA_CLIENT_SECRET');
    this.refreshToken = refreshToken || this.getEnvVariable('VITE_STRAVA_REFRESH_TOKEN');
    this.accessToken = '';

    // Debug logging
    console.log('Strava API Constructor - Environment Variables:', {
      clientId: this.clientId ? 'SET' : 'MISSING',
      clientSecret: this.clientSecret ? 'SET' : 'MISSING',
      refreshToken: this.refreshToken ? 'SET' : 'MISSING',
    });
  }

  private getEnvVariable(name: string): string {
    // Vite uses import.meta.env for environment variables
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const value = import.meta.env[name] || '';
      console.log(`Environment variable ${name}:`, value ? `"${value.substring(0, 5)}..."` : 'NOT FOUND');
      return value;
    }
    
    console.log(`import.meta.env not available for ${name}`);
    return '';
  }

  async authenticate(): Promise<string> {
    // Check if we have the required credentials
    if (!this.clientId || !this.clientSecret || !this.refreshToken) {
      throw new Error('Strava credentials missing. Please check your environment variables.');
    }

    try {
      const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.access_token) {
        this.accessToken = data.access_token;
        return this.accessToken;
      } else {
        throw new Error('Failed to authenticate with Strava: No access token received');
      }
    } catch (error) {
      console.error('Strava authentication error:', error);
      throw error;
    }
  }

  async getLatestActivity(): Promise<StravaActivity> {
    try {
      // Ensure we have a valid access token
      if (!this.accessToken) {
        await this.authenticate();
      }

      const response = await fetch(
        'https://www.strava.com/api/v3/athlete/activities?page=1&per_page=1',
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (response.status === 401) {
        // Token might be expired, try to re-authenticate
        await this.authenticate();
        return this.getLatestActivity();
      }

      if (!response.ok) {
        throw new Error(`Strava API error: ${response.status} ${response.statusText}`);
      }

      const activities = await response.json();
      
      if (activities.length === 0) {
        throw new Error('No activities found');
      }

      return activities[0];
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
    const pace = 1000 / (speed * 60); // min/km
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
  }
}

// Create instance with environment variables
export const stravaAPI = new StravaAPI();