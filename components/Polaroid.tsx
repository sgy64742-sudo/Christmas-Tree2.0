
import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, Float } from '@react-three/drei';
import { TreeMorphState } from '../types';

interface PolaroidProps {
  url: string;
  scatterPos: [number, number, number];
  treePos: [number, number, number];
  morphState: TreeMorphState;
  index: number;
}

const Polaroid: React.FC<PolaroidProps> = ({ url, scatterPos, treePos, morphState, index }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Explicitly setting crossOrigin to 'anonymous' to avoid CORS issues with external images
  const texture = useLoader(THREE.TextureLoader, url, (loader) => {
    loader.setCrossOrigin('anonymous');
  });

  useFrame((state) => {
    if (!meshRef.current) return;

    const targetPos = morphState === TreeMorphState.SCATTERED 
      ? new THREE.Vector3(...scatterPos) 
      : new THREE.Vector3(...treePos);
    
    meshRef.current.position.lerp(targetPos, 0.05);

    // Look at camera in scattered mode, look outwards in tree mode
    if (morphState === TreeMorphState.SCATTERED) {
      meshRef.current.lookAt(state.camera.position);
    } else {
      const normal = new THREE.Vector3().copy(meshRef.current.position).normalize();
      normal.y = 0; // Keep it upright-ish
      const lookAtTarget = new THREE.Vector3().addVectors(meshRef.current.position, normal);
      meshRef.current.lookAt(lookAtTarget);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={meshRef} name={`photo-${index}`}>
        {/* White Polaroid Frame */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[1.2, 1.5]} />
          <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.2} />
        </mesh>
        {/* Photo Area */}
        <mesh position={[0, 0.15, 0]}>
          <planeGeometry args={[1.0, 1.0]} />
          <meshBasicMaterial map={texture} transparent={true} />
        </mesh>
        {/* Signature Area */}
        <Text
          position={[0, -0.55, 0.01]}
          fontSize={0.08}
          color="#333"
          font="https://fonts.gstatic.com/s/sacramento/v15/buE4poG65_v9tsuPhyRXL_WzS24.woff"
        >
          Christmas 2024
        </Text>
      </group>
    </Float>
  );
};

export default Polaroid;
