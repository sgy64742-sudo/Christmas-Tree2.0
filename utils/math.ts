
import { TREE_HEIGHT, TREE_RADIUS, SCATTER_RADIUS } from '../constants';

export const getRandomPointInSphere = (radius: number): [number, number, number] => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  
  const r = radius * Math.pow(Math.random(), 1 / 3);
  
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.cos(phi) + 5; 
  const z = r * Math.sin(phi) * Math.sin(theta);
  
  return [x, y, z];
};

export const getTreeConePosition = (): [number, number, number] => {
  const t = Math.random();
  const h = t * TREE_HEIGHT;
  // Use sqrt for uniform distribution inside cone radius
  const radiusAtY = (1 - t) * TREE_RADIUS * Math.sqrt(Math.random()); 
  const theta = Math.random() * 2 * Math.PI;
  
  const x = radiusAtY * Math.cos(theta);
  const z = radiusAtY * Math.sin(theta);
  
  return [x, h, z];
};

/**
 * Tree mode photo distribution: Middle-lower section (y: 1.0 - 6.5)
 */
export const getTreePhotoPosition = (index: number, total: number): [number, number, number] => {
  const yMin = 1.0;
  const yMax = 6.5;
  
  // Spiral logic
  const angleStep = (Math.PI * 2 * 2.399); // Golden angle for even spacing
  const angle = index * angleStep;
  
  const t = index / total;
  const y = yMin + t * (yMax - yMin) + (Math.random() - 0.5) * 1.0;
  
  const normalizedY = Math.max(0, y / TREE_HEIGHT);
  const treeBaseRadius = (1 - normalizedY) * TREE_RADIUS;
  const safeRadius = treeBaseRadius + 5.8; // Far enough to be clearly visible
  
  return [
    safeRadius * Math.cos(angle),
    y,
    safeRadius * Math.sin(angle)
  ];
};

/**
 * Scatter mode: Ribbon spiral around the center axis
 */
export const getPhotoRibbonPosition = (index: number, total: number): [number, number, number] => {
  const t = index / total;
  const radius = 15.0 + Math.sin(t * Math.PI * 2) * 2.0;
  const angle = t * Math.PI * 5; // More turns for ribbon effect
  const y = 5 + (t - 0.5) * 12; // Centered around star (y=5)
  
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
