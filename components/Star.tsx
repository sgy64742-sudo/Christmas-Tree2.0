
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
      // i=0 is the top point at PI/2 (90 degrees)
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
    
    // Position: Center (y=5) when scattered, Top of tree (y=10.8) when in tree shape
    const targetY = morphState === TreeMorphState.SCATTERED ? 5 : 10.8;
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.06);
    meshRef.current.position.x = 0;
    meshRef.current.position.z = 0;

    // Standard rotation
    meshRef.current.rotation.y += 0.01;

    // If scattered, keep upright posture (one point up) but with slight breathing motion
    if (morphState === TreeMorphState.SCATTERED) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
      // Ensure it stays upright (rotation.z near 0)
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, 0.1);
    } else {
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, 0.1);
    }
  });

  return (
    <mesh ref={meshRef}>
      <extrudeGeometry args={[starShape, extrudeSettings]} />
      <meshStandardMaterial 
        color={COLORS.LUXURY_GOLD} 
        emissive={COLORS.LUXURY_GOLD} 
        emissiveIntensity={1.2} 
        metalness={1} 
        roughness={0.1} 
      />
      <pointLight intensity={10} distance={15} color={COLORS.GOLD} />
    </mesh>
  );
};

export default Star;
