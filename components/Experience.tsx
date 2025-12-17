import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';

export const Experience: React.FC = () => {
  return (
    <Canvas
      dpr={[1, 2]} // Support high DPI
      gl={{ 
        antialias: false, // Post-processing handles AA usually, or we accept alias for perf with bloom
        toneMappingExposure: 1.2 
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 4, 20]} fov={50} />
      
      {/* Controls - Restricted to keep the best angle */}
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 2}
        minDistance={10}
        maxDistance={40}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />

      {/* Lighting */}
      <ambientLight intensity={0.2} color="#ffc0cb" />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={1000} 
        color="#ffdfea" 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={500} color="#00ffff" />

      {/* Environment */}
      <Environment preset="lobby" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Content */}
      <group position={[0, -5, 0]}>
        <Foliage />
        <Ornaments />
      </group>

      {/* Post Processing for the "Cinematic Glow" */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.8} // Only very bright things glow (metals, lights)
          mipmapBlur 
          intensity={1.2} 
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};