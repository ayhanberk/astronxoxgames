'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshWobbleMaterial, RoundedBox, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Theme } from '@/store/useGameStore';

interface Piece3DProps {
  type: 'X' | 'O';
  position: [number, number, number];
  theme: Theme;
  isGhost?: boolean;
}

// --- Specialized Meshes ---

// ... (Keep existing Starfish, Lifebuoy, Snowflake, etc. unchanged if they are good) ...
function StarfishMesh({ material }: { material: any }) {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} scale={0.5}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI * 2) / 5]} position={[0, 0.5, 0]}>
          <coneGeometry args={[0.3, 1.5, 8]} />
          {material}
        </mesh>
      ))}
      <mesh>
        <cylinderGeometry args={[0.4, 0.5, 0.5, 5]} />
        {material}
      </mesh>
    </group>
  );
}

function LifebuoyMesh({ material }: { material: any }) {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} scale={1.5}>
      <mesh>
        <torusGeometry args={[0.4, 0.2, 16, 32]} />
        <meshStandardMaterial color="#ef4444" roughness={0.4} />
      </mesh>
      {[0, 1, 2, 3].map(i => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
          <boxGeometry args={[0.3, 0.9, 0.25]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function SnowflakeMesh({ material }: { material: any }) {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} scale={1.2}>
      {[0, 1, 2].map(i => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]}>
          <boxGeometry args={[0.1, 1.5, 0.1]} />
          {material}
        </mesh>
      ))}
      {[0, 1, 2].map(i => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]}>
          <boxGeometry args={[0.8, 0.1, 0.1]} />
          {material}
        </mesh>
      ))}
    </group>
  )
}

function IceSphereMesh({ material }: { material: any }) {
  return (
    <mesh scale={1.6}>
      <dodecahedronGeometry args={[0.5, 2]} />
      {material}
    </mesh>
  );
}

function NeonCrossMesh({ material }: { material: any }) {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} scale={2}>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.08, 0.08, 1, 8]} />
        {material}
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.08, 0.08, 1, 8]} />
        {material}
      </mesh>
      {/* Glow Center */}
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function NeonRingMesh({ material }: { material: any }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} scale={2}>
      <torusGeometry args={[0.4, 0.06, 6, 32]} />
      {material}
    </mesh>
  );
}

// --- New Specialized Meshes (Polished) ---

function SpaceAsteroidMesh({ material }: { material: any }) {
  return (
    <group scale={1.6} rotation={[Math.random(), Math.random(), 0]}>
      {/* Main Body */}
      <mesh castShadow receiveShadow>
        <dodecahedronGeometry args={[0.45, 0]} />
        {material}
      </mesh>
      {/* Irregular bumps for high-detail look */}
      {[0, 1, 2, 3].map(i => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 0.6
        ]} scale={0.4}>
          <dodecahedronGeometry args={[0.3, 0]} />
          {material}
        </mesh>
      ))}
    </group>
  );
}

function SpaceUFOMesh({ material }: { material: any }) {
  return (
    <group scale={1.8}>
      {/* Dome */}
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.25, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#60a5fa" roughness={0.2} metalness={0.9} opacity={0.5} transparent />
      </mesh>
      {/* Saucer */}
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.5, 0.15, 32]} />
        {material}
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <torusGeometry args={[0.45, 0.05, 16, 32]} />
        <meshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function CyberCrossMesh({ material }: { material: any }) {
  return (
    <group rotation={[0, 0, Math.PI / 4]} scale={1.8}>
      <RoundedBox args={[1, 0.15, 0.15]} radius={0.02} smoothness={4}>
        {material}
      </RoundedBox>
      <group rotation={[0, Math.PI / 2, 0]}>
        <RoundedBox args={[1, 0.15, 0.15]} radius={0.02} smoothness={4}>
          {material}
        </RoundedBox>
      </group>
    </group>
  );
}

function CyberHexMesh({ material }: { material: any }) {
  return (
    <group rotation={[Math.PI / 2, 0, 0]} scale={2}>
      <mesh>
        <torusGeometry args={[0.4, 0.05, 6, 6]} />
        {material}
      </mesh>
      {/* Inner Wireframe/Glow */}
      <mesh scale={0.8} rotation={[0, 0, Math.PI / 6]}>
        <torusGeometry args={[0.4, 0.02, 6, 6]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function GummyBearMesh({ material }: { material: any }) {
  return (
    <group scale={1.3} position={[0, 0.3, 0]}>
      {/* Body */}
      <RoundedBox args={[0.4, 0.5, 0.25]} radius={0.1} smoothness={4} position={[0, -0.1, 0]}>
        {material}
      </RoundedBox>
      {/* Head */}
      <RoundedBox args={[0.3, 0.25, 0.25]} radius={0.1} smoothness={4} position={[0, 0.35, 0]}>
        {material}
      </RoundedBox>
      {/* Ears */}
      <mesh position={[0.12, 0.5, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        {material}
      </mesh>
      <mesh position={[-0.12, 0.5, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        {material}
      </mesh>
      {/* Arms */}
      <RoundedBox args={[0.15, 0.25, 0.15]} radius={0.05} smoothness={4} position={[0.25, 0, 0]} rotation={[0, 0, -0.2]}>
        {material}
      </RoundedBox>
      <RoundedBox args={[0.15, 0.25, 0.15]} radius={0.05} smoothness={4} position={[-0.25, 0, 0]} rotation={[0, 0, 0.2]}>
        {material}
      </RoundedBox>
      {/* Legs */}
      <RoundedBox args={[0.18, 0.25, 0.18]} radius={0.05} smoothness={4} position={[0.12, -0.4, 0]}>
        {material}
      </RoundedBox>
      <RoundedBox args={[0.18, 0.25, 0.18]} radius={0.05} smoothness={4} position={[-0.12, -0.4, 0]}>
        {material}
      </RoundedBox>
    </group>
  );
}

function CandyDonutMesh({ material }: { material: any }) {
  return (
    <group scale={1.6}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.18, 16, 32]} />
        {material}
      </mesh>
      {/* Icing */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <torusGeometry args={[0.4, 0.16, 16, 32]} />
        {/* Lighter color for icing */}
        <meshStandardMaterial color="#fce7f3" roughness={0.2} />
      </mesh>
      {/* Sprinkles */}
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <mesh key={i} position={[Math.cos(i) * 0.4, 0.12, Math.sin(i) * 0.4]} rotation={[Math.random(), Math.random(), 0]}>
          <boxGeometry args={[0.04, 0.1, 0.04]} />
          <meshStandardMaterial color={['#f472b6', '#60a5fa', '#34d399', '#fbbf24'][i % 4]} />
        </mesh>
      ))}
    </group>
  );
}

// --- Main Component ---

export function Piece3D({ type, position, theme, isGhost }: Piece3DProps) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = 0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.08;
      meshRef.current.rotation.y += 0.01;
    }
  });

  const getMaterials = (playerType: 'X' | 'O') => {
    const isX = playerType === 'X';
    const color = isX
      ? (theme === 'neon' ? '#00ffff' : theme === 'winter' ? '#7dd3fc' : theme === 'beach' ? '#fb7185' : theme === 'space' ? '#fde047' : theme === 'cyberpunk' ? '#f0abfc' : theme === 'candy' ? '#f472b6' : '#3b82f6')
      : (theme === 'neon' ? '#ff00ff' : theme === 'winter' ? '#e0f2fe' : theme === 'beach' ? '#fbbf24' : theme === 'space' ? '#60a5fa' : theme === 'cyberpunk' ? '#2dd4bf' : theme === 'candy' ? '#60a5fa' : '#f59e0b');

    if (isGhost) {
      return (
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.4}
          roughness={1}
          metalness={0}
        />
      );
    }

    if (theme === 'glass') {
      return (
        <meshPhysicalMaterial
          color={color}
          roughness={0}
          metalness={0.1}
          transmission={0.8}
          thickness={1}
          transparent
          opacity={0.8}
        />
      );
    }

    if (theme === 'neon' || theme === 'cyberpunk') {
      return (
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={theme === 'cyberpunk' ? 2 : 4}
          toneMapped={false}
        />
      );
    }

    if (theme === 'winter' || theme === 'space') {
      return (
        <meshPhysicalMaterial
          color={color}
          roughness={theme === 'space' ? 0.3 : 0.2}
          metalness={theme === 'space' ? 0.7 : 0.1}
          transmission={theme === 'winter' ? 0.5 : 0}
          thickness={1.5}
          ior={1.4}
          emissive={color}
          emissiveIntensity={0.2}
        />
      );
    }

    if (theme === 'beach' || theme === 'candy') {
      return (
        <meshStandardMaterial
          color={color}
          roughness={theme === 'candy' ? 0.2 : 0.8}
          metalness={theme === 'candy' ? 0.1 : 0}
        />
      );
    }

    return (
      <MeshWobbleMaterial
        color={color}
        factor={0.1}
        speed={1}
        roughness={0.2}
        metalness={0.8}
      />
    );
  };

  const renderShape = () => {
    const material = getMaterials(type);

    switch (theme) {
      case 'beach':
        return type === 'X' ? <StarfishMesh material={material} /> : <LifebuoyMesh material={material} />;
      case 'winter':
        return type === 'X' ? <SnowflakeMesh material={material} /> : <IceSphereMesh material={material} />;
      case 'neon':
        return type === 'X' ? <NeonCrossMesh material={material} /> : <NeonRingMesh material={material} />;
      case 'space':
        return type === 'X' ? <SpaceAsteroidMesh material={material} /> : <SpaceUFOMesh material={material} />;
      case 'cyberpunk':
        return type === 'X' ? <CyberCrossMesh material={material} /> : <CyberHexMesh material={material} />;
      case 'candy':
        return type === 'X' ? <GummyBearMesh material={material} /> : <CandyDonutMesh material={material} />;
      default:
        return type === 'X' ? <XMesh material={material} theme={theme} /> : <OMesh material={material} />;
    }
  };

  return (
    <group position={[position[0], 0, position[2]]} ref={meshRef}>
      {renderShape()}
    </group>
  );
}

function XMesh({ material, theme }: { material: any; theme?: Theme }) {
  // If theme is glass, we avoid intersection overlap to prevent flickering/artifacts
  if (theme === 'glass') {
    return (
      <group rotation={[-Math.PI / 2, 0, 0]} scale={1.8}>
        <mesh>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          {material}
        </mesh>
        <mesh position={[0.4, 0.4, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.8, 0.2, 0.2]} />
          {material}
        </mesh>
        <mesh position={[-0.4, -0.4, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.8, 0.2, 0.2]} />
          {material}
        </mesh>
        <mesh position={[0.4, -0.4, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[0.8, 0.2, 0.2]} />
          {material}
        </mesh>
        <mesh position={[-0.4, 0.4, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[0.8, 0.2, 0.2]} />
          {material}
        </mesh>
      </group>
    )
  }

  // Standard X - Polished with RoundedBox and proper union look
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} scale={2}>
      <group rotation={[0, 0, Math.PI / 4]}>
        <RoundedBox args={[1.1, 0.22, 0.22]} radius={0.03} smoothness={4}>
          {material}
        </RoundedBox>
      </group>
      <group rotation={[0, 0, -Math.PI / 4]}>
        {/* Slightly offset to avoid severe Z-fighting if materials overlap perfectly */}
        <RoundedBox args={[1.1, 0.22, 0.22]} radius={0.03} smoothness={4} position={[0, -0.001, 0]}>
          {material}
        </RoundedBox>
      </group>
    </group>
  );
}

function OMesh({ material }: { material: any }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} scale={1.8}>
      <torusGeometry args={[0.4, 0.1, 32, 32]} />
      {material}
    </mesh>
  );
}

