
export enum TreeMorphState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface PhotoData {
  id: string;
  url: string;
}

export interface ParticleData {
  scatterPos: [number, number, number];
  treePos: [number, number, number];
  color: string;
  size: number;
  phase: number;
}

export interface OrnamentData {
  scatterPos: [number, number, number];
  treePos: [number, number, number];
  color: 'pink' | 'gold';
  type: 'sphere' | 'cube' | 'pyramid';
}
