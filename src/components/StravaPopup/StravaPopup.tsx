// src/components/StravaPopup/StravaPopup.tsx
import React from 'react';
import type { StravaActivity } from '../utils/strava';
import './StravaPopup.css';

interface StravaPopupProps {
  activity: StravaActivity | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

const StravaPopup: React.FC<StravaPopupProps> = ({
  activity,
  isLoading,
  error,
  onClose,
}) => {
  if (!activity && !isLoading && !error) {
    return null;
  }

  return (
    <div className="popup-overlay">
      <div className="strava-popup">
        <div className="popup-header">
          <h2>🏃‍♂️ Latest Strava Activity</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="popup-content">
          {isLoading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading your latest activity...</p>
            </div>
          )}

          {error && (
            <div className="error">
              <p>⚠️ Failed to load activity</p>
              <p className="error-detail">{error}</p>
            </div>
          )}

          {activity && (
            <div className="activity-details">
              <h3 className="activity-name">{activity.name}</h3>
              
              <div className="activity-stats">
                <div className="stat">
                  <span className="stat-label">Distance</span>
                  <span className="stat-value">
                    {((activity.distance / 1000)).toFixed(2)} km
                  </span>
                </div>
                
                <div className="stat">
                  <span className="stat-label">Moving Time</span>
                  <span className="stat-value">
                    {Math.floor(activity.moving_time / 60)}:
                    {(activity.moving_time % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                
                <div className="stat">
                  <span className="stat-label">Pace</span>
                  <span className="stat-value">
                    {activity.average_speed 
                      ? `${Math.floor(1000 / (activity.average_speed * 60))}:${Math.round((1000 / (activity.average_speed * 60) - Math.floor(1000 / (activity.average_speed * 60))) * 60).toString().padStart(2, '0')}/km`
                      : 'N/A'
                    }
                  </span>
                </div>
                
                <div className="stat">
                  <span className="stat-label">Elevation</span>
                  <span className="stat-value">
                    {activity.total_elevation_gain} m
                  </span>
                </div>
              </div>

              <div className="activity-meta">
                <p><strong>Type:</strong> {activity.type}</p>
                <p><strong>Date:</strong> {new Date(activity.start_date_local).toLocaleDateString()}</p>
                {activity.average_heartrate && (
                  <p><strong>Avg HR:</strong> {Math.round(activity.average_heartrate)} bpm</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StravaPopup;