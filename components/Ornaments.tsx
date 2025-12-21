
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeMorphState, OrnamentData } from '../types';
import { ORNAMENT_COUNT, COLORS } from '../constants';
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
        scatterPos: getRandomPointInSphere(12),
        treePos: getTreeConePosition(),
        color: Math.random() > 0.5 ? 'pink' : 'gold',
        type: Math.random() > 0.7 ? 'cube' : 'sphere'
      });
    }
    return list;
  }, []);

  const dummy = new THREE.Object3D();
  const vPos = new THREE.Vector3();

  useFrame(() => {
    let sphereIdx = 0;
    let cubeIdx = 0;

    data.forEach((item) => {
      const targetPos = morphState === TreeMorphState.SCATTERED ? item.scatterPos : item.treePos;
      const ref = item.type === 'sphere' ? sphereRef : cubeRef;
      const idx = item.type === 'sphere' ? sphereIdx++ : cubeIdx++;

      if (ref.current) {
        ref.current.getMatrixAt(idx, dummy.matrix);
        dummy.matrix.decompose(vPos, dummy.quaternion, dummy.scale);
        
        vPos.lerp(new THREE.Vector3(...targetPos), 0.05);
        dummy.position.copy(vPos);
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
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={COLORS.PINK} metalness={0.8} roughness={0.2} emissive={COLORS.DEEP_PINK} emissiveIntensity={0.5} />
      </instancedMesh>
      <instancedMesh ref={cubeRef} args={[undefined, undefined, ORNAMENT_COUNT]} castShadow>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color={COLORS.GOLD} metalness={0.9} roughness={0.1} emissive={COLORS.LUXURY_GOLD} emissiveIntensity={0.5} />
      </instancedMesh>
    </group>
  );
};

export default Ornaments;
