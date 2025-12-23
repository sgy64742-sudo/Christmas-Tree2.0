
import React, { useRef, useMemo } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { TreeMorphState, PhotoData } from '../types';
import TreeParticles from './TreeParticles';
import Ornaments from './Ornaments';
import Background from './Background';
import Polaroid from './Polaroid';
import Star from './Star';
import { getPhotoRibbonPosition, getTreePhotoPosition } from '../utils/math';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '../constants';

interface ExperienceProps {
  morphState: TreeMorphState;
  photos: PhotoData[];
  handData?: { x: number; y: number; z: number; gesture: string };
}

const Experience: React.FC<ExperienceProps> = ({ morphState, photos, handData }) => {
  const controlsRef = useRef<any>(null);
  const trunkRef = useRef<THREE.Mesh>(null);

  const photoPositions = useMemo(() => {
    return photos.map((_, i) => {
      return {
        scatter: getPhotoRibbonPosition(i, photos.length),
        tree: getTreePhotoPosition(i, photos.length)
      };
    });
  }, [photos.length]);

  useFrame((state) => {
    if (!controlsRef.current) return;
    
    // Smooth camera target
    const targetY = morphState === TreeMorphState.TREE_SHAPE ? 4.5 : 5.0;
    controlsRef.current.target.lerp(new THREE.Vector3(0, targetY, 0), 0.05);

    if (trunkRef.current) {
      const targetScaleY = morphState === TreeMorphState.TREE_SHAPE ? 1.0 : 0.001;
      trunkRef.current.scale.y = THREE.MathUtils.lerp(trunkRef.current.scale.y, targetScaleY, 0.05);
      // Keep it visible once it starts growing
      trunkRef.current.visible = trunkRef.current.scale.y > 0.005;
    }

    if (handData && handData.gesture === 'OPEN') {
      const rotY = (handData.x - 0.5) * Math.PI;
      controlsRef.current.setAzimuthalAngle(THREE.MathUtils.lerp(controlsRef.current.getAzimuthalAngle(), rotY, 0.05));
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 6, 25]} fov={45} />
      <OrbitControls 
        ref={controlsRef}
        enablePan={false} 
        minDistance={12} 
        maxDistance={50} 
        autoRotate={morphState === TreeMorphState.TREE_SHAPE}
        autoRotateSpeed={0.5}
        makeDefault
      />

      <Background />
      <Star morphState={morphState} />

      {/* Solid Tree Trunk as a clear visual anchor */}
      <mesh ref={trunkRef} position={[0, 4.5, 0]} scale={[1, 0.001, 1]}>
        <cylinderGeometry args={[0.15, 0.8, 9, 16]} />
        <meshStandardMaterial 
          color="#150805" 
          metalness={0.4} 
          roughness={0.6} 
          emissive="#110502"
          emissiveIntensity={0.2}
        />
      </mesh>

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
          intensity={1.8} 
          luminanceThreshold={0.25} 
          luminanceSmoothing={0.9} 
          mipmapBlur 
        />
        <ChromaticAberration offset={new THREE.Vector2(0.0005, 0.0005)} />
        <Vignette offset={0.3} darkness={0.8} />
      </EffectComposer>
    </>
  );
};

export default Experience;
