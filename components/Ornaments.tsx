
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeMorphState, OrnamentData } from '../types';
import { ORNAMENT_COUNT, COLORS, SCATTER_RADIUS } from '../constants';
import { getRandomPointInSphere, getTreeConePosition } from '../utils/math';

interface OrnamentsProps {
  morphState: TreeMorphState;
}

const Ornaments: React.FC<OrnamentsProps> = ({ morphState }) => {
  const sphereRef = useRef<THREE.InstancedMesh>(null);
  const cubeRef = useRef<THREE.InstancedMesh>(null);

  const data = useMemo(() => {
    const list: OrnamentData[] = [];
    for (let i = 0; i < ORNAMENT_COUNT; i++) {
      list.push({
        scatterPos: getRandomPointInSphere(SCATTER_RADIUS + 5),
        treePos: getTreeConePosition(),
        color: Math.random() > 0.5 ? 'pink' : 'gold',
        type: Math.random() > 0.6 ? 'sphere' : 'cube'
      });
    }
    return list;
  }, []);

  const dummy = new THREE.Object3D();
  const vPos = new THREE.Vector3();

  useFrame((state) => {
    let sphereIdx = 0;
    let cubeIdx = 0;
    const time = state.clock.getElapsedTime();

    data.forEach((item, i) => {
      const isSphere = item.type === 'sphere';
      const ref = isSphere ? sphereRef : cubeRef;
      const idx = isSphere ? sphereIdx++ : cubeIdx++;

      if (ref.current && idx < ORNAMENT_COUNT) {
        const targetPos = morphState === TreeMorphState.SCATTERED ? item.scatterPos : item.treePos;
        
        // We use a safe check and matrix manipulation
        dummy.position.set(targetPos[0], targetPos[1], targetPos[2]);
        
        // Add some floating animation
        dummy.position.y += Math.sin(time + i) * 0.05;
        dummy.rotation.y += 0.01;
        dummy.updateMatrix();
        
        ref.current.setMatrixAt(idx, dummy.matrix);
      }
    });

    if (sphereRef.current) sphereRef.current.instanceMatrix.needsUpdate = true;
    if (cubeRef.current) cubeRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={sphereRef} args={[undefined, undefined, ORNAMENT_COUNT]} castShadow>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial 
          color={COLORS.PINK} 
          metalness={0.9} 
          roughness={0.1} 
          emissive={COLORS.PINK} 
          emissiveIntensity={0.8} 
        />
      </instancedMesh>
      <instancedMesh ref={cubeRef} args={[undefined, undefined, ORNAMENT_COUNT]} castShadow>
        <boxGeometry args={[0.15, 0.15, 0.15]} />
        <meshStandardMaterial 
          color={COLORS.LUXURY_GOLD} 
          metalness={0.9} 
          roughness={0.1} 
          emissive={COLORS.GOLD} 
          emissiveIntensity={0.8} 
        />
      </instancedMesh>
    </group>
  );
};

export default Ornaments;
