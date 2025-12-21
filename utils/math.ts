
import { TREE_HEIGHT, TREE_RADIUS } from '../constants';

export const getRandomPointInSphere = (radius: number): [number, number, number] => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = radius * Math.pow(Math.random(), 1 / 3);
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta) + 5;
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

// 照片在散开状态下围绕中心五角星呈丝带状排布
export const getPhotoRibbonPosition = (index: number, total: number): [number, number, number] => {
  const t = index / total;
  const angle = t * Math.PI * 4; // 绕两圈
  const radius = 8; // 离中心五角星的距离
  const y = (t - 0.5) * 8 + 5; // 在中心点上下波动
  return [
    radius * Math.cos(angle),
    y,
    radius * Math.sin(angle)
  ];
};

// 获取地面散落点
export const getGroundScatterPoint = (radius: number): [number, number, number] => {
  const angle = Math.random() * Math.PI * 2;
  const r = Math.random() * radius + 5;
  return [Math.cos(angle) * r, 0.1, Math.sin(angle) * r];
};
