// src/context/CollisionContext.tsx
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CollisionSystem, type CollisionBox, defaultCollisionBoxes } from '../components/utils/CollisionDetection';

interface CollisionContextType {
  collisionSystem: CollisionSystem;
  addCollisionBox: (box: CollisionBox) => void;
  addCollisionBoxes: (boxes: CollisionBox[]) => void;
  checkCollision: (position: [number, number, number]) => boolean;
  getValidPosition: (
    currentPosition: [number, number, number],
    desiredPosition: [number, number, number]
  ) => [number, number, number];
  clearCollisions: () => void;
  debugMode: boolean;
  setDebugMode: (debug: boolean) => void;
}

const CollisionContext = createContext<CollisionContextType | undefined>(undefined);

export const CollisionProvider: React.FC<{ children: React.ReactNode; debug?: boolean }> = ({ 
  children, 
  debug = false 
}) => {
  const collisionSystemRef = useRef(new CollisionSystem(debug));
  const [debugMode, setDebugMode] = useState(debug);

  const addCollisionBox = useCallback((box: CollisionBox) => {
    collisionSystemRef.current.addCollisionBox(box);
  }, []);

  const addCollisionBoxes = useCallback((boxes: CollisionBox[]) => {
    collisionSystemRef.current.addCollisionBoxes(boxes);
  }, []);

  const checkCollision = useCallback((position: [number, number, number]): boolean => {
    return collisionSystemRef.current.checkCollision(position);
  }, []);

  const getValidPosition = useCallback((
    currentPosition: [number, number, number],
    desiredPosition: [number, number, number]
  ): [number, number, number] => {
    // For now, just check if desired position is valid, otherwise return current
    // We'll implement sliding in the MovementController instead
    if (!collisionSystemRef.current.checkCollision(desiredPosition)) {
      return desiredPosition;
    }
    return currentPosition;
  }, []);

  const clearCollisions = useCallback(() => {
    collisionSystemRef.current.clear();
  }, []);

  // Initialize with default collision boxes
  React.useEffect(() => {
    collisionSystemRef.current.addCollisionBoxes(defaultCollisionBoxes);
  }, []);

  const value: CollisionContextType = {
    collisionSystem: collisionSystemRef.current,
    addCollisionBox,
    addCollisionBoxes,
    checkCollision,
    getValidPosition,
    clearCollisions,
    debugMode,
    setDebugMode
  };

  return (
    <CollisionContext.Provider value={value}>
      {children}
    </CollisionContext.Provider>
  );
};

export const useCollision = (): CollisionContextType => {
  const context = useContext(CollisionContext);
  if (context === undefined) {
    throw new Error('useCollision must be used within a CollisionProvider');
  }
  return context;
};