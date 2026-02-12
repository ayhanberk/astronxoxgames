'use client';

import React from 'react';
import { Text } from '@react-three/drei';
import { Tile as TileType } from '@/store/useOkeyStore';

interface Tile3DProps {
    tile: TileType;
    position?: [number, number, number];
    rotation?: [number, number, number];
    isOpponent?: boolean;
    onClick?: () => void;
}

export function Tile3D({ tile, position = [0, 0, 0], rotation = [0, 0, 0], isOpponent = false, onClick }: Tile3DProps) {
    // Tile dimensions
    const width = 2.5;
    const height = 3.5;
    const depth = 0.4;

    // Colors mapping
    const colorMap: Record<string, string> = {
        'red': '#ef4444',
        'blue': '#3b82f6',
        'black': '#1f2937',
        'orange': '#f97316',
    };

    const displayColor = tile.color ? colorMap[tile.color] : '#10b981';

    return (
        <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
            {/* Main Tile Body */}
            <mesh castShadow receiveShadow>
                <boxGeometry args={[width, height, depth]} />
                <meshStandardMaterial color="#fdf6e3" roughness={0.3} metalness={0.1} />
            </mesh>

            {/* Front Face (Number & Color) */}
            {!isOpponent && (
                <group position={[0, 0, depth / 2 + 0.01]}>
                    {tile.type === 'regular' ? (
                        <>
                            {/* Text component from drei is fine */}
                            <Text
                                position={[0, 0.2, 0]}
                                fontSize={2}
                                color={displayColor}
                                anchorX="center"
                                anchorY="middle"
                            >
                                {tile.value.toString()}
                            </Text>
                        </>
                    ) : (
                        <Text
                            position={[0, 0, 0]}
                            fontSize={1.5}
                            color="#10b981"
                            anchorX="center"
                            anchorY="middle"
                        >
                            J
                        </Text>
                    )}
                </group>
            )}

            {/* Back Face (Logo/Pattern) */}
            <group position={[0, 0, -depth / 2 - 0.01]} rotation={[0, Math.PI, 0]}>
                <mesh>
                    <planeGeometry args={[width - 0.2, height - 0.2]} />
                    <meshStandardMaterial color="#e2e8f0" />
                </mesh>
            </group>
        </group>
    );
}
