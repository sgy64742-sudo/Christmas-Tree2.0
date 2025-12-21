
import { TREE_HEIGHT, TREE_RADIUS, SCATTER_RADIUS } from '../constants';

export const getRandomPointInSphere = (radius: number): [number, number, number] => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = radius * Math.pow(Math.random(), 1 / 3);
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta) + 5; // Center slightly elevated
  const z = r * Math.cos(phi);
  return [x, y, z];
};

export const getTreeConePosition = (): [number, number, number] => {
  const y = Math.random() * TREE_HEIGHT;
  const normalizedY = y / TREE_HEIGHT;
  const radiusAtY = (1 - normalizedY) * TREE_RADIUS;
  const theta = Math.random() * 2 * Math.PI;
  const x = radiusAtY * Math.cos(theta);
  const z = radiusAtY * Math.sin(theta);
  return [x, y, z];
};

export const getSpiralPosition = (t: number, height: number): [number, number, number] => {
  const angle = t * Math.PI * 4;
  const r = (1 - t / height) * TREE_RADIUS;
  return [
    r * Math.cos(angle),
    t,
    r * Math.sin(angle)
  ];
};

export const getPhotoRibbonPosition = (index: number, total: number): [number, number, number] => {
  const height = 10;
  const t = index / total;
  const angle = t * Math.PI * 6; // Spiral turns
  const radius = 6;
  const y = (t - 0.5) * height + 5; // Centered around Y=5
  return [
    radius * Math.cos(angle),
    y,
    radius * Math.sin(angle)
  ];
};
