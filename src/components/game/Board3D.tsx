'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { useGameStore } from '@/store/useGameStore';
import { Piece3D } from './Piece3D';

export function Board3D() {
    const { board, makeMove, winner } = useGameStore();

    const getPosition = (index: number): [number, number, number] => {
        const x = (index % 3) - 1;
        const y = 0;
        const z = Math.floor(index / 3) - 1;
        return [x * 1.5, y, z * 1.5];
    };

    return (
        <div className="w-full h-full cursor-grab active:cursor-grabbing">
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
                <OrbitControls
                    enablePan={false}
                    minPolarAngle={Math.PI / 6}
                    maxPolarAngle={Math.PI / 2}
                    enableDamping
                />

                {/* Lights */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} castShadow />
                <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />

                {/* Environment */}
                <Environment preset="city" />

                {/* Board Grid */}
                <group>
                    {/* Base Plane */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
                        <planeGeometry args={[10, 10]} />
                        <meshStandardMaterial color="#f8fafc" transparent opacity={0.05} />
                    </mesh>

                    {/* Grid Lines */}
                    <gridHelper args={[6, 3, 0x000000, 0xcccccc]} position={[0, -0.1, 0]} />

                    {/* Interactive Cells */}
                    {Array(9).fill(null).map((_, i) => (
                        <mesh
                            key={i}
                            position={getPosition(i)}
                            rotation={[-Math.PI / 2, 0, 0]}
                            onClick={(e) => {
                                e.stopPropagation();
                                makeMove(i);
                            }}
                            onPointerOver={(e) => (document.body.style.cursor = 'pointer')}
                            onPointerOut={(e) => (document.body.style.cursor = 'auto')}
                        >
                            <planeGeometry args={[1.4, 1.4]} />
                            <meshStandardMaterial transparent opacity={0} />
                        </mesh>
                    ))}

                    {/* Pieces */}
                    {board.map((cell, i) => (
                        cell && <Piece3D key={i} type={cell} position={getPosition(i)} />
                    ))}
                </group>

                <ContactShadows position={[0, -0.1, 0]} opacity={0.4} scale={10} blur={24} far={10} />
            </Canvas>
        </div>
    );
}
