
import React, { useRef, useMemo } from 'react';
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

  // Memoize photo positions to prevent twitching when hand data updates
  const photoPositions = useMemo(() => {
    return photos.map((_, i) => {
      const treePos = getTreeConePosition();
      return {
        scatter: getPhotoRibbonPosition(i, photos.length),
        // Slightly offset from tree surface to be visible
        tree: [treePos[0] * 1.4, treePos[1], treePos[2] * 1.4] as [number, number, number]
      };
    });
  }, [photos.length]); // Only re-calculate if photo count changes

  useFrame(() => {
    if (!controlsRef.current) return;
    
    // Smoothly focus on the center of interest
    const targetY = morphState === TreeMorphState.SCATTERED ? 5 : 5;
    controlsRef.current.target.lerp(new THREE.Vector3(0, targetY, 0), 0.05);

    if (handData && handData.gesture === 'OPEN') {
      const rotY = (handData.x - 0.5) * Math.PI;
      controlsRef.current.setAzimuthalAngle(THREE.MathUtils.lerp(controlsRef.current.getAzimuthalAngle(), rotY, 0.05));
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 8, 32]} fov={45} />
      <OrbitControls 
        ref={controlsRef}
        enablePan={false} 
        minDistance={10} 
        maxDistance={60} 
        autoRotate={morphState === TreeMorphState.TREE_SHAPE}
        autoRotateSpeed={0.5}
        makeDefault
      />

      <Background />
      <Star morphState={morphState} />

      <TreeParticles morphState={morphState} />
      <Ornaments morphState={morphState} />

      {photos.map((photo, i) => (
        <Polaroid
          key={photo.id}
          url={photo.url}
          scatterPos={photoPositions[i].scatter}
          treePos={photoPositions[i].tree}
          morphState={morphState}
          index={i}
        />
      ))}

      <EffectComposer multisampling={4}>
        <Bloom 
          intensity={1.2} 
          luminanceThreshold={0.1} 
          luminanceSmoothing={0.9} 
          mipmapBlur 
        />
        <ChromaticAberration offset={new THREE.Vector2(0.0005, 0.0005)} />
        <Noise opacity={0.02} />
        <Vignette offset={0.3} darkness={0.9} />
      </EffectComposer>
    </>
  );
};

export default Experience;
