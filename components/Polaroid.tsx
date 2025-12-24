
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
  isFocused: boolean;
  isPointing: boolean;
}

const Polaroid: React.FC<PolaroidProps> = ({ url, scatterPos, treePos, morphState, index, isFocused, isPointing }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  
  const targetPos = new THREE.Vector3();
  const targetQuaternion = new THREE.Quaternion();
  const dummy = new THREE.Object3D();
  const currentScale = useRef(new THREE.Vector3(1, 1, 1));

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

    // Base target position
    targetPos.set(
      morphState === TreeMorphState.SCATTERED ? scatterPos[0] : treePos[0],
      morphState === TreeMorphState.SCATTERED ? scatterPos[1] : treePos[1],
      morphState === TreeMorphState.SCATTERED ? scatterPos[2] : treePos[2]
    );

    // Zoom effect: If focused and pointing, move closer and scale up
    const zoomMode = isFocused && isPointing;
    const targetScale = zoomMode ? 2.5 : 1.0;
    
    if (zoomMode) {
      // Move slightly towards camera to prevent clipping and emphasize
      const toCam = new THREE.Vector3().subVectors(state.camera.position, targetPos).normalize();
      targetPos.add(toCam.multiplyScalar(2));
    }

    groupRef.current.position.lerp(targetPos, 0.08);
    
    // Scale animation
    currentScale.current.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    groupRef.current.scale.copy(currentScale.current);

    // Orient towards camera (+Z axis faces target)
    dummy.position.copy(groupRef.current.position);
    dummy.lookAt(state.camera.position);
    targetQuaternion.copy(dummy.quaternion);
    
    groupRef.current.quaternion.slerp(targetQuaternion, 0.1);

    // Floating animation in scattered mode (only if not zooming)
    if (morphState === TreeMorphState.SCATTERED && !zoomMode) {
      groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.8 + index) * 0.008;
    }
  });

  return (
    <group ref={groupRef} name={`photo-${index}`}>
      {/* 
        Standard Orientation: +Z is Front.
        The Frame is centered at Z=-0.025 with 0.05 thickness (extends from -0.05 to 0).
        Content is placed at small positive Z offsets to be visible on top of the frame.
      */}
      
      {/* White 3D Frame */}
      <mesh position={[0, 0, -0.025]}>
        <boxGeometry args={[1.6, 2.0, 0.05]} />
        <meshStandardMaterial color="#ffffff" metalness={0.05} roughness={0.8} />
      </mesh>
      
      {/* Front Photo Layer (Visible on +Z side) */}
      <mesh position={[0, 0.18, 0.001]}>
        <planeGeometry args={[1.48, 1.48]} />
        {texture ? (
          <meshBasicMaterial map={texture} transparent={false} side={THREE.FrontSide} />
        ) : (
          <meshStandardMaterial color="#eeeeee" />
        )}
      </mesh>

      {/* Label Text Layer (Visible on +Z side) */}
      <Suspense fallback={null}>
        <Text
          position={[0, -0.68, 0.005]}
          fontSize={0.11}
          color="#111111"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
        >
          Arix Memory
        </Text>
      </Suspense>

      {/* Plain Back Layer */}
      <mesh position={[0, 0, -0.051]}>
        <planeGeometry args={[1.6, 2.0]} />
        <meshStandardMaterial color="#f0f0f0" metalness={0} roughness={1} />
      </mesh>
    </group>
  );
};

export default Polaroid;
