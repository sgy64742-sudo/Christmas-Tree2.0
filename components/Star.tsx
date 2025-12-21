
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float } from '@react-three/drei';
import { TreeMorphState } from '../types';
import { COLORS } from '../constants';

interface StarProps {
  morphState: TreeMorphState;
}

const Star: React.FC<StarProps> = ({ morphState }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = 0.8;
    const innerRadius = 0.35;
    const points = 5;

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  const extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05 };

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // 散开时在屏幕中点 (y=5)，树形态在树顶 (y=10.5)
    const targetY = morphState === TreeMorphState.SCATTERED ? 5 : 10.5;
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.08);
    meshRef.current.rotation.y += 0.02;
    
    // 散开时面向摄像机，树形态时保持竖直旋转
    if (morphState === TreeMorphState.SCATTERED) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[0, 5, 0]}>
        <extrudeGeometry args={[starShape, extrudeSettings]} />
        <meshStandardMaterial 
          color={COLORS.LUXURY_GOLD} 
          emissive={COLORS.LUXURY_GOLD} 
          emissiveIntensity={2} 
          metalness={1} 
          roughness={0} 
        />
        <pointLight intensity={10} distance={15} color={COLORS.GOLD} />
      </mesh>
    </Float>
  );
};

export default Star;
