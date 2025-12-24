
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeMorphState } from '../types';
import { COLORS } from '../constants';

interface StarProps {
  morphState: TreeMorphState;
}

const Star: React.FC<StarProps> = ({ morphState }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = 1.0;
    const innerRadius = 0.45;
    const points = 5;

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({ 
    depth: 0.3, 
    bevelEnabled: true, 
    bevelThickness: 0.05, 
    bevelSize: 0.05 
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const targetY = morphState === TreeMorphState.SCATTERED ? 5 : 10.8;
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.06);
    meshRef.current.position.x = 0;
    meshRef.current.position.z = 0;

    meshRef.current.rotation.y += 0.01;

    if (morphState === TreeMorphState.SCATTERED) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef}>
      <extrudeGeometry args={[starShape, extrudeSettings]} />
      <meshStandardMaterial 
        color={COLORS.LUXURY_GOLD} 
        emissive={COLORS.LUXURY_GOLD} 
        emissiveIntensity={8.0} 
        metalness={1} 
        roughness={0.1} 
      />
      {/* Double glow effect for luxury feel */}
      <pointLight intensity={30} distance={25} color={COLORS.GOLD} decay={2} />
      <pointLight intensity={15} distance={10} color={COLORS.PINK} decay={2} />
    </mesh>
  );
};

export default Star;
