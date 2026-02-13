'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { Tile3D } from './Tile3D';
import { Tile } from '@/store/useOkeyStore';

interface AnimatedTile3DProps {
    tile: Tile;
    targetPosition: [number, number, number];
    startPosition?: [number, number, number];
    isOpponent?: boolean;
    onClick?: () => void;
    scale?: number;
}

export function AnimatedTile3D({ tile, targetPosition, startPosition, isOpponent, onClick, scale = 0.95 }: AnimatedTile3DProps) {
    const group = useRef<any>();
    const currentPos = useRef(new Vector3(...(startPosition || targetPosition)));
    const target = new Vector3(...targetPosition);

    useFrame((state, delta) => {
        if (!group.current) return;
        // Simple lerp for smooth movement
        currentPos.current.lerp(target, 0.1);
        group.current.position.copy(currentPos.current);
    });

    return (
        <group ref={group} position={startPosition || targetPosition}>
            <Tile3D
                tile={tile}
                isOpponent={isOpponent}
                onClick={onClick}
                scale={scale}
                position={[0, 0, 0]} // Local 0
            />
        </group>
    );
}
