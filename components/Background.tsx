
import React, { useMemo } from 'react';
import { Stars, MeshReflectorMaterial } from '@react-three/drei';
import { getGroundScatterPoint } from '../utils/math';
import { COLORS } from '../constants';
import { TreeMorphState } from '../types';

interface BackgroundProps {
  morphState: TreeMorphState;
}

const Background: React.FC<BackgroundProps> = ({ morphState }) => {
  const isTree = morphState === TreeMorphState.TREE_SHAPE;

  const groundDecor = useMemo(() => {
    const items = [];
    for (let i = 0; i < 30; i++) {
      items.push({
        pos: getGroundScatterPoint(20),
        type: Math.random() > 0.5 ? 'cube' : 'pyramid',
        scale: Math.random() * 0.3 + 0.1,
        rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]
      });
    }
    return items;
  }, []);

  return (
    <>
      <color attach="background" args={['#000000']} />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0.5} fade speed={1} />

      {/* 仅在树形态时显示地面和倒影 */}
      {isTree && (
        <>
          {/* 高保真倒影地面 */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
            <planeGeometry args={[100, 100]} />
            <MeshReflectorMaterial
              blur={[300, 100]}
              resolution={1024}
              mixBlur={1}
              mixStrength={40}
              roughness={1}
              depthScale={1.2}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color="#101010"
              metalness={0.5}
              mirror={1}
            />
          </mesh>

          {/* 地面散落的几何体 */}
          {groundDecor.map((d, i) => (
            <mesh key={i} position={d.pos} rotation={d.rot as any} scale={d.scale}>
              {d.type === 'cube' ? <boxGeometry /> : <coneGeometry args={[1, 1, 4]} />}
              <meshStandardMaterial color={COLORS.LUXURY_GOLD} metalness={0.9} roughness={0.1} />
            </mesh>
          ))}
        </>
      )}

      <ambientLight intensity={0.4} />
      <spotLight position={[10, 20, 10]} angle={0.15} penumbra={1} intensity={2} color={COLORS.GOLD} castShadow />
      <pointLight position={[-10, -10, -10]} color={COLORS.PINK} intensity={1} />
    </>
  );
};

export default Background;
