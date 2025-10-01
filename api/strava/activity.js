import axios from 'axios';

export default async function handler(request, response) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN } = process.env;

    if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) {
      return response.status(500).json({ 
        error: 'Strava credentials not configured',
        details: 'Please check your environment variables in Vercel'
      });
    }

    console.log('Authenticating with Strava...');

    // Step 1: Get access token using refresh token
    const tokenResponse = await axios.post('https://www.strava.com/oauth/token', {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      refresh_token: STRAVA_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    });

    const accessToken = tokenResponse.data.access_token;
    console.log('Successfully authenticated with Strava');

    // Step 2: Get the latest activity
    const activityResponse = await axios.get(
      'https://www.strava.com/api/v3/athlete/activities?page=1&per_page=1',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (activityResponse.data.length === 0) {
      return response.status(404).json({ error: 'No activities found' });
    }

    const activity = activityResponse.data[0];
    console.log('Found activity:', activity.name);

    // Step 3: Return safe activity data
    const safeActivity = {
      id: activity.id,
      name: activity.name,
      distance: activity.distance,
      moving_time: activity.moving_time,
      elapsed_time: activity.elapsed_time,
      total_elevation_gain: activity.total_elevation_gain,
      type: activity.type,
      sport_type: activity.sport_type,
      start_date: activity.start_date,
      start_date_local: activity.start_date_local,
      average_speed: activity.average_speed,
      max_speed: activity.max_speed,
      average_heartrate: activity.average_heartrate,
      max_heartrate: activity.max_heartrate,
    };

    response.status(200).json(safeActivity);
  } catch (error) {
    console.error('Error in Strava API:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return response.status(401).json({ 
        error: 'Strava authentication failed',
        details: 'Please check your refresh token'
      });
    }

    response.status(500).json({ 
      error: 'Failed to fetch Strava activity',
      details: error.response?.data || error.message 
    });
  }
}