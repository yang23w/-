import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTreeStore } from '../store';
import { getConePoint, getRandomSpherePoint } from '../utils/math';
import { easing } from 'maath';

const COUNT = 8000;
const TREE_HEIGHT = 12;
const TREE_RADIUS = 4.5;

// Custom Shader Material for the Particles
const FoliageMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uMorph: { value: 0 }, // 0 = Scattered, 1 = Tree
    uColor1: { value: new THREE.Color('#FFC0CB') }, // Light Pink
    uColor2: { value: new THREE.Color('#FF1493') }, // Deep Pink/Rose
    uSilver: { value: new THREE.Color('#FFFFFF') },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uMorph;
    
    attribute vec3 aTreePos;
    attribute vec3 aScatterPos;
    attribute float aRandom;
    
    varying vec2 vUv;
    varying float vRandom;
    varying float vDist;

    void main() {
      vUv = uv;
      vRandom = aRandom;
      
      // Interpolate position
      vec3 targetPos = mix(aScatterPos, aTreePos, uMorph);
      
      // Add "breathing" and wind effect
      float wind = sin(uTime * 2.0 + targetPos.y * 0.5 + aRandom * 10.0) * 0.1;
      targetPos.x += wind;
      targetPos.z += wind * 0.5;
      
      // Twinkle movement
      targetPos.y += sin(uTime * 3.0 + aRandom * 100.0) * 0.05;

      vec4 mvPosition = modelViewMatrix * vec4(targetPos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Size attenuation
      gl_PointSize = (12.0 * aRandom + 4.0) * (15.0 / -mvPosition.z);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uSilver;
    
    varying float vRandom;
    
    void main() {
      // Circular particle
      vec2 xy = gl_PointCoord.xy - vec2(0.5);
      float ll = length(xy);
      if (ll > 0.5) discard;
      
      // Soft edge
      float strength = 1.0 - smoothstep(0.3, 0.5, ll);
      
      // Gradient color based on random factor
      vec3 finalColor = mix(uColor1, uColor2, vRandom);
      
      // Silver rim highlight (simulating metallic reflection on needle tips)
      float rim = smoothstep(0.4, 0.5, ll);
      finalColor = mix(finalColor, uSilver, rim * 0.5); // Add subtle silver edge
      
      // High brightness for bloom
      gl_FragColor = vec4(finalColor * 2.5, strength); 
    }
  `
};

export const Foliage: React.FC = () => {
  const mode = useTreeStore((state) => state.mode);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const morphTarget = useRef(1); // 0 or 1

  const { positions, scatterPositions, randoms } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const scat = new Float32Array(COUNT * 3);
    const rnd = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      // Tree Shape
      const treeP = getConePoint(TREE_HEIGHT, TREE_RADIUS, 1);
      pos[i * 3] = treeP.x;
      pos[i * 3 + 1] = treeP.y;
      pos[i * 3 + 2] = treeP.z;

      // Scatter Shape
      const scatP = getRandomSpherePoint(15);
      scat[i * 3] = scatP.x;
      scat[i * 3 + 1] = scatP.y;
      scat[i * 3 + 2] = scatP.z;

      rnd[i] = Math.random();
    }
    return { positions: pos, scatterPositions: scat, randoms: rnd };
  }, []);

  useFrame((state, delta) => {
    if (!shaderRef.current) return;
    
    // Update Time
    shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    
    // Smooth Morph Transition
    const target = mode === 'TREE_SHAPE' ? 1 : 0;
    easing.damp(shaderRef.current.uniforms.uMorph, 'value', target, 1.5, delta);
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position" // This is just for bounding box calculation really
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={scatterPositions.length / 3}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        attach="material"
        args={[FoliageMaterial]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};