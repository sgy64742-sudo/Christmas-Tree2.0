
import React from 'react';
import { MeshReflectorMaterial, Stars, ContactShadows } from '@react-three/drei';

const Background: React.FC = () => {
  return (
    <>
      <color attach="background" args={['#000000']} />
      
      {/* Stars in the distance */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Ground with high-quality reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
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
          color="#151515"
          metalness={0.5}
          mirror={1}
        />
      </mesh>

      {/* Soft ground glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial color="#ff69b4" transparent opacity={0.1} />
      </mesh>

      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffd700" />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#ff69b4" />
      
      <ContactShadows 
        opacity={0.4} 
        scale={20} 
        blur={2.4} 
        far={10} 
        resolution={256} 
        color="#ff69b4" 
      />
    </>
  );
};

export default Background;
