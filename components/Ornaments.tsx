import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTreeStore } from '../store';
import { getConePoint, getRandomSpherePoint } from '../utils/math';
import { easing } from 'maath';

// Types of Ornaments
enum OrnamentType {
  BAUBLE_LARGE,
  BAUBLE_SMALL,
  GIFT_BOX
}

interface OrnamentData {
  type: OrnamentType;
  treePos: THREE.Vector3;
  scatterPos: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  color: THREE.Color;
}

const COUNT = 150;
const TREE_HEIGHT = 12;
const TREE_RADIUS = 4.2; // Slightly smaller than foliage to sit inside/on-surface

export const Ornaments: React.FC = () => {
  const mode = useTreeStore((state) => state.mode);
  
  // Refs for InstancedMeshes
  const baubleMeshRef = useRef<THREE.InstancedMesh>(null);
  const giftMeshRef = useRef<THREE.InstancedMesh>(null);
  
  // Create data model
  const data = useMemo(() => {
    const items: OrnamentData[] = [];
    const palette = [
      new THREE.Color('#FF007F'), // Hot Pink
      new THREE.Color('#E0E0E0'), // Silver
      new THREE.Color('#FFB7C5'), // Cherry Blossom
      new THREE.Color('#C0C0C0'), // Metallic Silver
    ];

    for (let i = 0; i < COUNT; i++) {
      const type = Math.random() > 0.8 ? OrnamentType.GIFT_BOX : (Math.random() > 0.5 ? OrnamentType.BAUBLE_LARGE : OrnamentType.BAUBLE_SMALL);
      
      const treeP = getConePoint(TREE_HEIGHT, TREE_RADIUS, 1);
      // Push slightly outward for ornaments
      const dir = new THREE.Vector3(treeP.x, 0, treeP.z).normalize();
      treeP.add(dir.multiplyScalar(0.2));

      const scatterP = getRandomSpherePoint(18);
      
      items.push({
        type,
        treePos: treeP,
        scatterPos: scatterP,
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
        scale: type === OrnamentType.BAUBLE_SMALL ? 0.25 : (type === OrnamentType.BAUBLE_LARGE ? 0.4 : 0.5),
        color: palette[Math.floor(Math.random() * palette.length)],
      });
    }
    return items;
  }, []);

  const baubles = useMemo(() => data.filter(d => d.type !== OrnamentType.GIFT_BOX), [data]);
  const gifts = useMemo(() => data.filter(d => d.type === OrnamentType.GIFT_BOX), [data]);

  // Temp variables for matrix updates
  const tempObj = useMemo(() => new THREE.Object3D(), []);
  
  // Animation loop
  useFrame((state, delta) => {
    const isTree = mode === 'TREE_SHAPE';
    const time = state.clock.elapsedTime;

    // Helper to update a specific mesh group
    const updateMesh = (mesh: THREE.InstancedMesh, items: OrnamentData[]) => {
      items.forEach((item, i) => {
        // 1. Calculate Position interpolation
        // We do this "manually" here to allow for some noise/sway in scattered mode
        
        // Current interpolated position state (we use a hacky way to store 'current' pos in the object user data if we wanted perfect physics, 
        // but for visual morphing, direct interpolation is okay)
        
        // NOTE: In a real physics engine we'd use velocities. Here we just lerp based on a global progress variable 
        // But since we want per-object control, we calculate target every frame and lerp the tempObj position.
        
        // Determine target based on mode
        let targetX, targetY, targetZ;
        
        if (isTree) {
           targetX = item.treePos.x;
           targetY = item.treePos.y;
           targetZ = item.treePos.z;
        } else {
           // Add floaty movement in scattered mode
           targetX = item.scatterPos.x + Math.sin(time + i) * 0.5;
           targetY = item.scatterPos.y + Math.cos(time * 0.8 + i) * 0.5;
           targetZ = item.scatterPos.z;
        }
        
        // We use damping on the object's current matrix position to smooth it out
        // However, extracting position from matrix every frame is expensive. 
        // A cleaner visual trick for this specific "morph" requirement without physics engine:
        // We maintain a "currentPos" vector in a closure? No, let's use the 'morph' factor approach 
        // but since we are in JS, we need to store the current lerp value.
        // Simplified approach: Just calculate the mixed vector.
        
        // To make it smooth, we need a persistent value for the "mix" factor, but that's global.
        // Let's use `easing.damp3` on the tempObj position if we had a reference state. 
        // Instead, we will assume the store's mode switch triggers a transition period.
        // But for React Three Fiber + Maath, let's just calc the mix.
        
      });
    };
    
    // BETTER APPROACH FOR INSTANCES:
    // Update the matrix directly.
    const t = isTree ? 1 : 0;
    // We need a ref to track the current animation progress to damp it.
    // Storing it in a userData or local var isn't ideal in FC. 
    // Let's use `easing.damp` on a local ref value isn't enough for per-particle if we want staggered.
    // For this demo, global damping is sufficient for high fidelity.
    
    // Let's animate Baubles
    baubles.forEach((item, i) => {
      // Get current interpolated factor. 
      // To make it interesting, add a slight offset based on index to stagger animations
      // However, we can't easily preserve state this way without a physics store.
      // We will interpolate the Vector3 directly using damp3 which modifies the 'current' vector towards 'target'.
      
      // We use the matrix to get current position? Too slow.
      // Strategy: Just Lerp vectors based on a smooth global `uMorph` equivalent value.
    });

    // Actually, let's do the simplest robust loop:
    // We need a persistent "current position" for every item to damp towards.
    // But since we don't have a physics store, we will calculate the 'ideal' position for the current time
    // and just place it there. The 'damp' happens on the transition factor.
  });

  // Since we can't easily use hooks inside the loop, we use a ref to store current positions
  const baublePositions = useRef(new Float32Array(baubles.length * 3));
  const giftPositions = useRef(new Float32Array(gifts.length * 3));

  // Initialize positions
  useLayoutEffect(() => {
     baubles.forEach((item, i) => {
        baublePositions.current[i*3] = item.treePos.x;
        baublePositions.current[i*3+1] = item.treePos.y;
        baublePositions.current[i*3+2] = item.treePos.z;
     });
     gifts.forEach((item, i) => {
        giftPositions.current[i*3] = item.treePos.x;
        giftPositions.current[i*3+1] = item.treePos.y;
        giftPositions.current[i*3+2] = item.treePos.z;
     });
  }, [baubles, gifts]);

  useFrame((state, delta) => {
    const isTree = mode === 'TREE_SHAPE';
    const time = state.clock.elapsedTime;

    // Process Baubles
    if (baubleMeshRef.current) {
        baubles.forEach((item, i) => {
            const idx = i * 3;
            // Define Target
            let tx, ty, tz;
            if (isTree) {
                tx = item.treePos.x;
                ty = item.treePos.y;
                tz = item.treePos.z;
            } else {
                tx = item.scatterPos.x + Math.sin(time * 0.5 + i) * 0.5;
                ty = item.scatterPos.y + Math.cos(time * 0.3 + i) * 0.5;
                tz = item.scatterPos.z + Math.sin(time * 0.2 + i) * 0.5;
            }

            // Damp current pos towards target
            // Using a simple lerp for perf
            const smooth = 2.5 * delta;
            baublePositions.current[idx] += (tx - baublePositions.current[idx]) * smooth;
            baublePositions.current[idx+1] += (ty - baublePositions.current[idx+1]) * smooth;
            baublePositions.current[idx+2] += (tz - baublePositions.current[idx+2]) * smooth;

            tempObj.position.set(
                baublePositions.current[idx],
                baublePositions.current[idx+1],
                baublePositions.current[idx+2]
            );
            
            // Rotation - slow spin
            tempObj.rotation.copy(item.rotation);
            tempObj.rotation.y += time * 0.1;
            tempObj.rotation.x += time * 0.05;

            tempObj.scale.setScalar(item.scale);
            tempObj.updateMatrix();
            baubleMeshRef.current!.setMatrixAt(i, tempObj.matrix);
        });
        baubleMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Process Gifts (Heavier, slightly slower smooth)
    if (giftMeshRef.current) {
        gifts.forEach((item, i) => {
            const idx = i * 3;
            // Define Target
            let tx, ty, tz;
            if (isTree) {
                tx = item.treePos.x;
                ty = item.treePos.y;
                tz = item.treePos.z;
            } else {
                tx = item.scatterPos.x + Math.sin(time * 0.2 + i) * 0.2; // Move less
                ty = item.scatterPos.y;
                tz = item.scatterPos.z;
            }

            const smooth = 2.0 * delta; // Slower damping for heavy objects
            giftPositions.current[idx] += (tx - giftPositions.current[idx]) * smooth;
            giftPositions.current[idx+1] += (ty - giftPositions.current[idx+1]) * smooth;
            giftPositions.current[idx+2] += (tz - giftPositions.current[idx+2]) * smooth;

            tempObj.position.set(
                giftPositions.current[idx],
                giftPositions.current[idx+1],
                giftPositions.current[idx+2]
            );
            tempObj.rotation.copy(item.rotation);
            // Gifts barely rotate
            tempObj.rotation.y += time * 0.02;

            tempObj.scale.setScalar(item.scale);
            tempObj.updateMatrix();
            giftMeshRef.current!.setMatrixAt(i, tempObj.matrix);
        });
        giftMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Baubles - High Gloss Metallic */}
      <instancedMesh ref={baubleMeshRef} args={[undefined, undefined, baubles.length]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
            color="#FF69B4" 
            roughness={0.1} 
            metalness={0.9} 
            envMapIntensity={1.5}
            emissive="#FF1493"
            emissiveIntensity={0.2}
        />
      </instancedMesh>

      {/* Gifts - Satin finish */}
      <instancedMesh ref={giftMeshRef} args={[undefined, undefined, gifts.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial 
            color="#E0E0E0" 
            roughness={0.2} 
            metalness={0.7}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            envMapIntensity={2}
        />
      </instancedMesh>
    </group>
  );
};
