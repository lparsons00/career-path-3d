// src/components/Debug/CollisionDebug.tsx
import { useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useCollision } from '../../context/CollisionContext';

const CollisionDebug: React.FC = () => {
  const { collisionSystem } = useCollision();
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    // Clear existing debug meshes
    while (groupRef.current.children.length > 0) {
      groupRef.current.remove(groupRef.current.children[0]);
    }

    // Add debug meshes from collision system
    const debugMeshes = collisionSystem.getDebugMeshes();
    debugMeshes.forEach(mesh => {
      groupRef.current?.add(mesh.clone());
    });
  }, [collisionSystem]);

  useFrame(() => {
    // Keep debug meshes updated (in case collision system changes)
    // This is a simple implementation - you might want to optimize this
  });

  return <group ref={groupRef} />;
};

export default CollisionDebug;