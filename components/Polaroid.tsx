
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { TreeMorphState } from '../types';

interface PolaroidProps {
  url: string;
  scatterPos: [number, number, number];
  treePos: [number, number, number];
  morphState: TreeMorphState;
  index: number;
}

const Polaroid: React.FC<PolaroidProps> = ({ url, scatterPos, treePos, morphState, index }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  
  const targetQuaternion = new THREE.Quaternion();
  const rotationMatrix = new THREE.Matrix4();
  const vTemp = new THREE.Vector3();

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(url, (tex) => {
      tex.minFilter = THREE.LinearFilter;
      setTexture(tex);
    });
  }, [url]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const targetPos = morphState === TreeMorphState.SCATTERED 
      ? new THREE.Vector3(...scatterPos) 
      : new THREE.Vector3(...treePos);
    
    groupRef.current.position.lerp(targetPos, 0.06);

    if (morphState === TreeMorphState.SCATTERED) {
      rotationMatrix.lookAt(groupRef.current.position, state.camera.position, state.camera.up);
      targetQuaternion.setFromRotationMatrix(rotationMatrix);
    } else {
      const outDirection = new THREE.Vector3(
        groupRef.current.position.x,
        0,
        groupRef.current.position.z
      ).normalize();
      
      vTemp.addVectors(groupRef.current.position, outDirection);
      vTemp.y += 0.8; 

      rotationMatrix.lookAt(groupRef.current.position, vTemp, state.camera.up);
      const faceOutQuat = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);
      
      rotationMatrix.lookAt(groupRef.current.position, state.camera.position, state.camera.up);
      const faceCamQuat = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);
      
      targetQuaternion.copy(faceOutQuat).slerp(faceCamQuat, 0.4);
    }
    
    groupRef.current.quaternion.slerp(targetQuaternion, 0.1);

    if (morphState === TreeMorphState.SCATTERED) {
      groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.8 + index) * 0.008;
    }
  });

  return (
    <group ref={groupRef} name={`photo-${index}`}>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.6, 2.0]} />
        <meshStandardMaterial color="#ffffff" metalness={0.05} roughness={0.9} />
      </mesh>
      
      <mesh position={[0, 0.18, 0.005]}>
        <planeGeometry args={[1.48, 1.48]} />
        {texture ? (
          <meshBasicMaterial map={texture} transparent={false} />
        ) : (
          <meshStandardMaterial color="#dddddd" />
        )}
      </mesh>

      <Suspense fallback={null}>
        <Text
          position={[0, -0.68, 0.01]}
          fontSize={0.11}
          color="#222"
          anchorX="center"
          anchorY="middle"
        >
          Arix Memory
        </Text>
      </Suspense>
    </group>
  );
};

export default Polaroid;
