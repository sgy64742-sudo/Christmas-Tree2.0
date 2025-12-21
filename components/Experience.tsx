
import React, { useRef } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { TreeMorphState, PhotoData } from '../types';
import TreeParticles from './TreeParticles';
import Ornaments from './Ornaments';
import Background from './Background';
import Polaroid from './Polaroid';
import Star from './Star';
import { getPhotoRibbonPosition, getTreeConePosition } from '../utils/math';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ExperienceProps {
  morphState: TreeMorphState;
  photos: PhotoData[];
  handData?: { x: number; y: number; z: number; gesture: string };
}

const Experience: React.FC<ExperienceProps> = ({ morphState, photos, handData }) => {
  const controlsRef = useRef<any>(null);
  const { scene } = useThree();

  useFrame(() => {
    if (!controlsRef.current) return;
    
    // 相机目标始终平滑锁定在树或星的中心
    const targetY = morphState === TreeMorphState.SCATTERED ? 5 : 5;
    controlsRef.current.target.lerp(new THREE.Vector3(0, targetY, 0), 0.05);

    if (handData && handData.gesture === 'OPEN') {
      const rotY = (handData.x - 0.5) * Math.PI;
      controlsRef.current.setAzimuthalAngle(THREE.MathUtils.lerp(controlsRef.current.getAzimuthalAngle(), rotY, 0.05));
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 8, 32]} fov={40} />
      <OrbitControls 
        ref={controlsRef}
        enablePan={false} 
        minDistance={15} 
        maxDistance={60} 
        autoRotate={true}
        autoRotateSpeed={0.4}
        makeDefault
      />

      <Background />
      <Star morphState={morphState} />

      <TreeParticles morphState={morphState} />
      <Ornaments morphState={morphState} />

      {photos.map((photo, i) => {
        const ribbonPos = getPhotoRibbonPosition(i, photos.length);
        const treePos = getTreeConePosition();
        return (
          <Polaroid
            key={photo.id}
            url={photo.url}
            scatterPos={ribbonPos}
            treePos={[treePos[0] * 1.5, treePos[1], treePos[2] * 1.5]} // 略微浮在树表面
            morphState={morphState}
            index={i}
          />
        );
      })}

      <EffectComposer multisampling={4}>
        <Bloom 
          intensity={0.6} // 降低 Bloom 强度从 1.2 到 0.6
          luminanceThreshold={0.5} 
          luminanceSmoothing={0.5} 
          mipmapBlur 
        />
        <ChromaticAberration offset={new THREE.Vector2(0.0003, 0.0003)} />
        <Noise opacity={0.015} />
        <Vignette offset={0.1} darkness={1.2} />
      </EffectComposer>
    </>
  );
};

export default Experience;
