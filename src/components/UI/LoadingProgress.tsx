// src/components/UI/LoadingProgress.tsx
import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface LoadingProgressProps {
  onComplete?: () => void;
}

const LoadingProgress: React.FC<LoadingProgressProps> = ({ onComplete }) => {
  // Safe access to useProgress with fallbacks
  let progressData: { progress: number; active: boolean } | null = null;
  try {
    progressData = useProgress();
  } catch (error) {
    console.warn('LoadingProgress: useProgress failed', error);
  }
  
  const progress = progressData?.progress ?? 0;
  const active = progressData?.active ?? false;
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!active && progress === 100) {
      // Fade out after loading completes
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [active, progress, onComplete]);

  if (!isVisible || (!active && progress === 100)) {
    return null;
  }

  // Render as portal to overlay on top of everything
  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        transition: 'opacity 0.5s ease-out',
        opacity: isVisible ? 1 : 0
      }}
    >
      <div style={{ 
        fontSize: '24px', 
        marginBottom: '20px',
        fontWeight: 'bold'
      }}>
        Loading 3D Scene...
      </div>
      <div style={{
        width: '300px',
        height: '20px',
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '10px'
      }}>
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #4ecdc4, #44a08d)',
            transition: 'width 0.3s ease-out',
            borderRadius: '10px'
          }}
        />
      </div>
      <div style={{ fontSize: '18px' }}>
        {Math.round(progress)}%
      </div>
      {active && (
        <div style={{ 
          fontSize: '14px', 
          marginTop: '10px',
          opacity: 0.7
        }}>
          Loading textures and models...
        </div>
      )}
    </div>,
    document.body
  );
};

export default LoadingProgress;

