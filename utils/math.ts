
import { TREE_HEIGHT, TREE_RADIUS, SCATTER_RADIUS } from '../constants';

export const getRandomPointInSphere = (radius: number): [number, number, number] => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  
  // Use cube root to ensure uniform distribution inside the sphere volume
  const r = radius * Math.pow(Math.random(), 1 / 3);
  
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.cos(phi) + 5; // Center Y at middle of the tree height
  const z = r * Math.sin(phi) * Math.sin(theta);
  
  return [x, y, z];
};

export const getTreeConePosition = (): [number, number, number] => {
  const y = Math.random() * TREE_HEIGHT;
  const normalizedY = y / TREE_HEIGHT;
  // Standard cone: radius decreases as height increases
  const radiusAtY = (1 - normalizedY) * TREE_RADIUS;
  const theta = Math.random() * 2 * Math.PI;
  
  const x = radiusAtY * Math.cos(theta);
  const z = radiusAtY * Math.sin(theta);
  
  return [x, y, z];
};

export const getPhotoRibbonPosition = (index: number, total: number): [number, number, number] => {
  const t = index / total;
  // Create a vertical spiral ribbon around the center axis
  const angle = t * Math.PI * 4; 
  const radius = 8 + Math.sin(t * Math.PI) * 2; 
  const y = (t - 0.5) * 12 + 5; 
  
  return [
    radius * Math.cos(angle),
    y,
    radius * Math.sin(angle)
  ];
};

export const getGroundScatterPoint = (radius: number): [number, number, number] => {
  const angle = Math.random() * Math.PI * 2;
  const r = Math.random() * radius + 5;
  return [Math.cos(angle) * r, 0.05, Math.sin(angle) * r];
};
