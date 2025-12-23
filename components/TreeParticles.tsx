
import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeMorphState, ParticleData } from '../types';
import { PARTICLE_COUNT, COLORS, TREE_HEIGHT, TREE_RADIUS, SCATTER_RADIUS } from '../constants';
import { getRandomPointInSphere } from '../utils/math';

interface TreeParticlesProps {
  morphState: TreeMorphState;
}

const TreeParticles: React.FC<TreeParticlesProps> = ({ morphState }) => {
  const meshRef = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  const particles = useMemo(() => {
    const data: ParticleData[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = Math.random();
      const h = t * TREE_HEIGHT;
      // Core particles for density
      const isCore = Math.random() > 0.6;
      const spiralTurns = isCore ? 4 : 15;
      const angle = t * Math.PI * 2 * spiralTurns + (Math.random() * Math.PI); 
      
      const radiusAtY = (1 - t) * TREE_RADIUS * (isCore ? Math.random() * 0.3 : (0.3 + 0.7 * Math.sqrt(Math.random())));
      
      data.push({
        scatterPos: getRandomPointInSphere(SCATTER_RADIUS + 10),
        treePos: [radiusAtY * Math.cos(angle), h, radiusAtY * Math.sin(angle)],
        color: Math.random() > 0.5 ? COLORS.PINK : COLORS.LUXURY_GOLD,
        size: Math.random() * 0.15 + 0.05,
        phase: Math.random() * Math.PI * 2
      });
    }
    return data;
  }, []);

  const { positions, colors } = useMemo(() => {
    const posArr = new Float32Array(PARTICLE_COUNT * 3);
    const colorArr = new Float32Array(PARTICLE_COUNT * 3);
    const colorObj = new THREE.Color();

    particles.forEach((p, i) => {
      // Start at tree position if we want it to be visible immediately, or scatter
      posArr[i * 3] = p.scatterPos[0];
      posArr[i * 3 + 1] = p.scatterPos[1];
      posArr[i * 3 + 2] = p.scatterPos[2];

      colorObj.set(p.color);
      colorArr[i * 3] = colorObj.r;
      colorArr[i * 3 + 1] = colorObj.g;
      colorArr[i * 3 + 2] = colorObj.b;
    });

    return { positions: posArr, colors: colorArr };
  }, [particles]);

  useFrame((state) => {
    if (!geometryRef.current) return;
    const posAttr = geometryRef.current.attributes.position as THREE.BufferAttribute;
    const time = state.clock.getElapsedTime();
    const lerpSpeed = morphState === TreeMorphState.TREE_SHAPE ? 0.08 : 0.04;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      const targetX = morphState === TreeMorphState.SCATTERED ? p.scatterPos[0] : p.treePos[0];
      const targetY = morphState === TreeMorphState.SCATTERED ? p.scatterPos[1] : p.treePos[1];
      const targetZ = morphState === TreeMorphState.SCATTERED ? p.scatterPos[2] : p.treePos[2];

      posAttr.array[i * 3] += (targetX - posAttr.array[i * 3]) * lerpSpeed;
      posAttr.array[i * 3 + 1] += (targetY - posAttr.array[i * 3 + 1]) * lerpSpeed;
      posAttr.array[i * 3 + 2] += (targetZ - posAttr.array[i * 3 + 2]) * lerpSpeed;

      // Shimmer effect
      const shimmer = Math.sin(time * 3 + p.phase) * 0.02;
      posAttr.array[i * 3] += shimmer;
      posAttr.array[i * 3 + 1] += shimmer;
      posAttr.array[i * 3 + 2] += shimmer;
    }
    
    posAttr.needsUpdate = true;
    
    // Ensure the tree is never culled by the camera
    geometryRef.current.computeBoundingSphere();
    
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <points ref={meshRef} frustumCulled={false}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute 
          attach="attributes-position" 
          count={PARTICLE_COUNT} 
          array={positions} 
          itemSize={3} 
          usage={THREE.DynamicDrawUsage}
        />
        <bufferAttribute 
          attach="attributes-color" 
          count={PARTICLE_COUNT} 
          array={colors} 
          itemSize={3} 
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        vertexColors
        transparent
        opacity={1.0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={true}
      />
    </points>
  );
};

export default TreeParticles;
