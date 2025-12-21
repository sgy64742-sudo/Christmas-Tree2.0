
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
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
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      url,
      (tex) => {
        tex.minFilter = THREE.LinearFilter;
        setTexture(tex);
      },
      undefined,
      (err) => console.error("Texture load failed:", url, err)
    );
  }, [url]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const targetPos = morphState === TreeMorphState.SCATTERED 
      ? new THREE.Vector3(...scatterPos) 
      : new THREE.Vector3(...treePos);
    
    meshRef.current.position.lerp(targetPos, 0.08);

    if (morphState === TreeMorphState.SCATTERED) {
      meshRef.current.lookAt(state.camera.position);
    } else {
      // 在树形态下，照片向外侧稍微倾斜
      const normal = new THREE.Vector3().copy(meshRef.current.position).normalize();
      normal.y = 0;
      const lookAtTarget = new THREE.Vector3().addVectors(meshRef.current.position, normal);
      meshRef.current.lookAt(lookAtTarget);
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={meshRef} name={`photo-${index}`}>
        {/* 拍立得相框 */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[1.3, 1.6]} />
          <meshStandardMaterial color="#ffffff" metalness={0} roughness={1} />
        </mesh>
        
        {/* 照片主体 */}
        <mesh position={[0, 0.15, 0]}>
          <planeGeometry args={[1.15, 1.15]} />
          {texture ? (
            <meshBasicMaterial map={texture} transparent={true} />
          ) : (
            <meshStandardMaterial color="#f0f0f0" />
          )}
        </mesh>

        {/* 使用系统默认字体防止网络加载挂起导致黑屏 */}
        <Text
          position={[0, -0.58, 0.01]}
          fontSize={0.08}
          color="#222"
          anchorX="center"
          anchorY="middle"
        >
          Signature '24
        </Text>
      </group>
    </Float>
  );
};

export default Polaroid;
