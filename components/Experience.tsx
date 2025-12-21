
import React, { Suspense, useRef, useState, useEffect } from 'react';
import { OrbitControls, PerspectiveCamera, Float, Stars } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { TreeMorphState, PhotoData } from '../types';
import TreeParticles from './TreeParticles';
import Ornaments from './Ornaments';
import Background from './Background';
import Polaroid from './Polaroid';
import { COLORS } from '../constants';
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
  const { scene, camera } = useThree();
  const [targetDist, setTargetDist] = useState(22);

  useFrame(() => {
    if (!controlsRef.current) return;

    if (handData && handData.gesture !== 'NONE') {
      // 🖐 OPEN: Interactive Navigation
      if (handData.gesture === 'OPEN') {
        const rotY = (handData.x - 0.5) * Math.PI * 2;
        controlsRef.current.setAzimuthalAngle(THREE.MathUtils.lerp(controlsRef.current.getAzimuthalAngle(), rotY, 0.05));
        
        const zoomDist = THREE.MathUtils.mapLinear(handData.z, -0.2, 0.2, 10, 35);
        setTargetDist(zoomDist);
      } 
      // 👉 POINT: Precision Focus on Gallery
      else if (handData.gesture === 'POINT') {
        let closestDist = Infinity;
        let closestObj: THREE.Object3D | null = null;
        
        scene.traverse((obj) => {
          if (obj.name.startsWith('photo-')) {
            const worldPos = new THREE.Vector3();
            obj.getWorldPosition(worldPos);
            const dist = worldPos.distanceTo(camera.position);
            if (dist < closestDist) {
              closestDist = dist;
              closestObj = obj;
            }
          }
        });

        if (closestObj) {
          const worldPos = new THREE.Vector3();
          closestObj.getWorldPosition(worldPos);
          controlsRef.current.target.lerp(worldPos, 0.08);
          // Auto-zoom in slightly when pointing
        }
      } 
    } else {
      // Return to global view center when no gesture is active
      controlsRef.current.target.lerp(new THREE.Vector3(0, 5, 0), 0.02);
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 6, 25]} fov={40} />
      <OrbitControls 
        ref={controlsRef}
        enablePan={false} 
        minDistance={5} 
        maxDistance={45} 
        autoRotate={true}
        autoRotateSpeed={morphState === TreeMorphState.TREE_SHAPE ? 0.8 : 0.4}
        target={[0, 5, 0]}
        makeDefault
      />

      <Background />

      {/* Signature Tree Topper */}
      <Float speed={3} rotationIntensity={1.5} floatIntensity={0.8}>
        <mesh position={[0, 10.5, 0]}>
          <octahedronGeometry args={[0.8, 0]} />
          <meshStandardMaterial 
            color={COLORS.GOLD} 
            emissive={COLORS.LUXURY_GOLD} 
            emissiveIntensity={4} 
            metalness={1}
            roughness={0}
          />
        </mesh>
      </Float>

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
            treePos={treePos}
            morphState={morphState}
            index={i}
          />
        );
      })}

      <EffectComposer multisampling={4}>
        <Bloom 
          intensity={1.8} 
          luminanceThreshold={0.1} 
          luminanceSmoothing={0.9} 
          mipmapBlur 
        />
        <ChromaticAberration offset={new THREE.Vector2(0.001, 0.001)} />
        <Noise opacity={0.03} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

export default Experience;
