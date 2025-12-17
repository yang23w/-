import * as THREE from 'three';

// Helper to generate random point in sphere
export const getRandomSpherePoint = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  
  const sinPhi = Math.sin(phi);
  const x = r * sinPhi * Math.cos(theta);
  const y = r * sinPhi * Math.sin(theta);
  const z = r * Math.cos(phi);
  
  return new THREE.Vector3(x, y, z);
};

// Helper to generate point on a cone surface (Christmas Tree shape)
export const getConePoint = (height: number, baseRadius: number, yOffset: number = 0): THREE.Vector3 => {
  // y goes from 0 to height
  const y = Math.random() * height;
  // Radius at this height (linear interpolation)
  // At y=0 (bottom), r = baseRadius. At y=height (top), r = 0.
  const currentRadius = baseRadius * (1 - y / height);
  
  const angle = Math.random() * Math.PI * 2;
  const radiusOffset = Math.random() * currentRadius; // Volumetric, not just shell
  
  const x = Math.cos(angle) * radiusOffset;
  const z = Math.sin(angle) * radiusOffset;
  
  return new THREE.Vector3(x, y + yOffset - (height/2), z);
};
