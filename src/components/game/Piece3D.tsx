'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface Piece3DProps {
    type: 'X' | 'O';
    position: [number, number, number];
}

export function Piece3D({ type, position }: Piece3DProps) {
    const meshRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <group position={position} ref={meshRef}>
                {type === 'X' ? (
                    <XMesh />
                ) : (
                    <OMesh />
                )}
            </group>
        </Float>
    );
}

function XMesh() {
    return (
        <group scale={0.6}>
            <mesh rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[1, 0.2, 0.2]} />
                <MeshWobbleMaterial color="#2563eb" factor={0.1} speed={1} />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI / 4]}>
                <boxGeometry args={[1, 0.2, 0.2]} />
                <MeshWobbleMaterial color="#2563eb" factor={0.1} speed={1} />
            </mesh>
        </group>
    );
}

function OMesh() {
    return (
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={0.6}>
            <torusGeometry args={[0.4, 0.1, 16, 100]} />
            <MeshWobbleMaterial color="#f59e0b" factor={0.1} speed={1} />
        </mesh>
    );
}
