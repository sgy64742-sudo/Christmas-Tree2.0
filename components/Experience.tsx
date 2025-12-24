
import React, { useRef, useMemo, useState } from 'react';
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
import { Gesture } from '../hooks/useHandGestures';

interface ExperienceProps {
  morphState: TreeMorphState;
  photos: PhotoData[];
  handData?: { x: number; y: number; z: number; gesture: Gesture };
}

const Experience: React.FC<ExperienceProps> = ({ morphState, photos, handData }) => {
  const controlsRef = useRef<any>(null);
  const [nearestPhotoId, setNearestPhotoId] = useState<string | null>(null);

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

    // Calculate nearest photo to camera
    let minDistance = Infinity;
    let closestId = null;

    state.scene.traverse((obj) => {
      if (obj.name.startsWith('photo-')) {
        const distance = obj.position.distanceTo(state.camera.position);
        if (distance < minDistance) {
          minDistance = distance;
          const index = parseInt(obj.name.split('-')[1]);
          if (photos[index]) closestId = photos[index].id;
        }
      }
    });
    setNearestPhotoId(closestId);

    if (handData && handData.gesture === Gesture.OPEN) {
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
        autoRotate={morphState === TreeMorphState.TREE_SHAPE && (!handData || handData.gesture !== Gesture.POINT)}
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
          isFocused={nearestPhotoId === photo.id}
          isPointing={handData?.gesture === Gesture.POINT}
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
