
import React, { useRef, useState, useEffect } from 'react';
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

    // 位置平滑过渡
    const targetPos = morphState === TreeMorphState.SCATTERED 
      ? new THREE.Vector3(...scatterPos) 
      : new THREE.Vector3(...treePos);
    
    groupRef.current.position.lerp(targetPos, 0.05);

    // 稳定转向逻辑
    if (morphState === TreeMorphState.SCATTERED) {
      // 散开时始终正面朝向相机
      rotationMatrix.lookAt(groupRef.current.position, state.camera.position, state.camera.up);
      targetQuaternion.setFromRotationMatrix(rotationMatrix);
    } else {
      // 树形态时面向外侧
      const normal = new THREE.Vector3().copy(groupRef.current.position).normalize();
      normal.y = 0;
      const lookAtTarget = new THREE.Vector3().addVectors(groupRef.current.position, normal);
      rotationMatrix.lookAt(groupRef.current.position, lookAtTarget, state.camera.up);
      targetQuaternion.setFromRotationMatrix(rotationMatrix);
    }
    
    // 使用 slerp 平滑旋转，消除抽搐
    groupRef.current.quaternion.slerp(targetQuaternion, 0.08);
  });

  return (
    <group ref={groupRef} name={`photo-${index}`}>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.4, 1.7]} />
        <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.8} />
      </mesh>
      
      <mesh position={[0, 0.15, 0]}>
        <planeGeometry args={[1.25, 1.25]} />
        {texture ? (
          <meshBasicMaterial map={texture} transparent={true} />
        ) : (
          <meshStandardMaterial color="#eeeeee" />
        )}
      </mesh>

      <Text
        position={[0, -0.6, 0.01]}
        fontSize={0.09}
        color="#333"
        anchorX="center"
        anchorY="middle"
        // 移除外部字体链接，使用系统字体防止挂起
      >
        Arix '24
      </Text>
    </group>
  );
};

export default Polaroid;
