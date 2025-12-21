
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeMorphState, ParticleData } from '../types';
import { PARTICLE_COUNT, COLORS, TREE_HEIGHT, TREE_RADIUS } from '../constants';
import { getRandomPointInSphere } from '../utils/math';

interface TreeParticlesProps {
  morphState: TreeMorphState;
}

const TreeParticles: React.FC<TreeParticlesProps> = ({ morphState }) => {
  const meshRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const data: ParticleData[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Tree position on a high-density spiral path
      const t = Math.random();
      const height = t * TREE_HEIGHT;
      const angle = t * Math.PI * 14 + (Math.random() * 0.4); 
      const radiusAtY = (1 - t) * TREE_RADIUS * (0.85 + Math.random() * 0.3);
      
      const tx = radiusAtY * Math.cos(angle);
      const ty = height;
      const tz = radiusAtY * Math.sin(angle);

      data.push({
        scatterPos: getRandomPointInSphere(15),
        treePos: [tx, ty, tz],
        color: Math.random() > 0.45 ? COLORS.PINK : COLORS.GOLD,
        size: Math.random() * 0.05 + 0.02,
        phase: Math.random() * Math.PI * 2
      });
    }
    return data;
  }, []);

  const { positions, colors, sizes } = useMemo(() => {
    const posArr = new Float32Array(PARTICLE_COUNT * 3);
    const colorArr = new Float32Array(PARTICLE_COUNT * 3);
    const sizeArr = new Float32Array(PARTICLE_COUNT);
    const colorObj = new THREE.Color();

    particles.forEach((p, i) => {
      posArr[i * 3] = p.scatterPos[0];
      posArr[i * 3 + 1] = p.scatterPos[1];
      posArr[i * 3 + 2] = p.scatterPos[2];

      colorObj.set(p.color);
      colorArr[i * 3] = colorObj.r;
      colorArr[i * 3 + 1] = colorObj.g;
      colorArr[i * 3 + 2] = colorObj.b;
      
      sizeArr[i] = p.size;
    });

    return { positions: posArr, colors: colorArr, sizes: sizeArr };
  }, [particles]);

  const geometryRef = useRef<THREE.BufferGeometry>(null);

  useFrame((state) => {
    if (!geometryRef.current) return;
    const posAttr = geometryRef.current.attributes.position as THREE.BufferAttribute;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      const targetX = morphState === TreeMorphState.SCATTERED ? p.scatterPos[0] : p.treePos[0];
      const targetY = morphState === TreeMorphState.SCATTERED ? p.scatterPos[1] : p.treePos[1];
      const targetZ = morphState === TreeMorphState.SCATTERED ? p.scatterPos[2] : p.treePos[2];

      const lerpSpeed = morphState === TreeMorphState.TREE_SHAPE ? 0.06 : 0.03;
      posAttr.array[i * 3] += (targetX - posAttr.array[i * 3]) * lerpSpeed;
      posAttr.array[i * 3 + 1] += (targetY - posAttr.array[i * 3 + 1]) * lerpSpeed;
      posAttr.array[i * 3 + 2] += (targetZ - posAttr.array[i * 3 + 2]) * lerpSpeed;

      // Dynamic motion logic
      if (morphState === TreeMorphState.TREE_SHAPE) {
        // Vertical breathing and slight pulse
        const pulse = Math.sin(time * 3 + p.phase) * 0.005;
        posAttr.array[i * 3 + 1] += pulse;
      } else {
        // Drifting effect in nebula mode
        const drift = Math.sin(time * 0.5 + p.phase) * 0.002;
        posAttr.array[i * 3] += drift;
        posAttr.array[i * 3 + 2] += drift;
      }
    }
    posAttr.needsUpdate = true;

    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={true}
      />
    </points>
  );
};

export default TreeParticles;
