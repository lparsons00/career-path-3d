// src/utils/collisionDetection.ts
import * as THREE from 'three';

export interface CollisionBox {
  position: [number, number, number];
  size: [number, number, number];
  type?: 'building' | 'tree' | 'fence' | 'water';
}

export class CollisionSystem {
  private collisionBoxes: CollisionBox[] = [];
  private debug: boolean = false;
  private debugMeshes: THREE.Mesh[] = [];

  constructor(debug: boolean = false) {
    this.debug = debug;
  }

  addCollisionBox(box: CollisionBox): void {
    this.collisionBoxes.push(box);
    
    if (this.debug) {
      this.createDebugBox(box);
    }
  }

  addCollisionBoxes(boxes: CollisionBox[]): void {
    boxes.forEach(box => this.addCollisionBox(box));
  }

  private createDebugBox(box: CollisionBox): void {
    const geometry = new THREE.BoxGeometry(...box.size);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xff0000, 
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...box.position);
    
    this.debugMeshes.push(mesh);
  }

  getDebugMeshes(): THREE.Mesh[] {
    return this.debugMeshes;
  }

  clearDebugMeshes(): void {
    this.debugMeshes = [];
  }

  checkCollision(
    playerPosition: [number, number, number], 
    playerRadius: number = 0.8, // Increased radius for better collision
    playerHeight: number = 2
  ): boolean {
    
    const playerBox = new THREE.Box3();
    const playerMin = new THREE.Vector3(
      playerPosition[0] - playerRadius,
      playerPosition[1],
      playerPosition[2] - playerRadius
    );
    const playerMax = new THREE.Vector3(
      playerPosition[0] + playerRadius,
      playerPosition[1] + playerHeight,
      playerPosition[2] + playerRadius
    );
    playerBox.set(playerMin, playerMax);

    for (const box of this.collisionBoxes) {
      const collisionMin = new THREE.Vector3(
        box.position[0] - box.size[0] / 2,
        box.position[1] - box.size[1] / 2,
        box.position[2] - box.size[2] / 2
      );
      const collisionMax = new THREE.Vector3(
        box.position[0] + box.size[0] / 2,
        box.position[1] + box.size[1] / 2,
        box.position[2] + box.size[2] / 2
      );
      
      const collisionBox = new THREE.Box3(collisionMin, collisionMax);

      if (playerBox.intersectsBox(collisionBox)) {
        return true;
      }
    }

    return false;
  }

  clear(): void {
    this.collisionBoxes = [];
    this.clearDebugMeshes();
  }
}

// Only define obstacles, no boundaries - player can move freely otherwise
export const defaultCollisionBoxes: CollisionBox[] = [
  { position: [9, 1, 5], size: [12, 2, 7], type: 'building' },
   { position: [9, 3, -8], size: [8, 2, 7], type: 'building' },
   { position: [-9, 3, -8], size: [8, 2, 7], type: 'building' },


   { position: [8.5, 3, 14.5], size: [10.7, 2, 0.5], type: 'fence' },
   { position: [-8.5, 3, 3.5], size: [8.2, 2, 0.5], type: 'fence' },
   { position: [-5, 1, 21], size: [6.5, 2, 6.5], type: 'water' },

   { position: [-5, 1, 24], size: [60, 2, 1], type: 'fence' },
   { position: [-10, 1, -24], size: [20, 2, 1], type: 'fence' },
   { position: [-10, 1, -25], size: [60, 2, 1], type: 'fence' },
   { position: [15, 1, -24], size: [25, 2, 1], type: 'fence' },//-1, 1, 16

   { position: [24, 1, -26], size: [1, 2, 100], type: 'fence' },
   { position: [-22, 1, -26], size: [1, 2, 100], type: 'fence' },
];