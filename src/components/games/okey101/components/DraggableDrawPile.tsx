'use client';

import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Vector3 } from 'three';
import { Tile3D } from './Tile3D';
import { useOkeyStore } from '@/store/useOkeyStore';
import { useDrag } from '@use-gesture/react';

interface DraggableDrawPileProps {
    drawPileLength: number;
    onClick: () => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
}

export function DraggableDrawPile({ drawPileLength, onClick, onDragStart, onDragEnd }: DraggableDrawPileProps) {
    const { size, viewport, gl, controls } = useThree(); // Access controls (if made default)
    const aspect = size.width / viewport.width;

    const [dragging, setDragging] = useState(false);
    const [dragPos, setDragPos] = useState<[number, number, number]>([-6, 0.5, 0]);

    const bind = useDrag(({ active, movement: [mx, my], event }) => {
        // Disable Orbit Controls while dragging
        if (controls) {
            (controls as any).enabled = !active;
        }

        const x = -6 + mx / aspect;
        const z = 0 + my / aspect;

        if (active) {
            if (!dragging) {
                setDragging(true);
                onDragStart?.();
            }
            setDragPos([x, 5.0, z]);
        } else {
            setDragging(false);
            onDragEnd?.();
            setDragPos([-6, 0.5, 0]);
            if (z > 20) {
                onClick();
            }
        }


        event?.stopPropagation();
    });

    if (drawPileLength === 0) return null;

    return (
        <group>
            {/* The Static Pile */}
            <group position={[-6, 0.5, 0]}
                {...(bind() as any)}
                onClick={(e) => { e.stopPropagation(); /* Only click if not drag? handled by gesture */ }}
                onPointerOver={() => document.body.style.cursor = 'grab'}
                onPointerOut={() => document.body.style.cursor = 'auto'}
            >
                {[...Array(Math.min(drawPileLength, 5))].map((_, i) => (
                    <Tile3D
                        key={`draw-${i}`}
                        tile={{ id: 'draw', value: 0, color: null, type: 'regular' }}
                        position={[0, i * 0.45, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        isOpponent={true}
                    />
                ))}
            </group>

            {/* The Dragged Ghost Tile */}
            {dragging && (
                <Tile3D
                    tile={{ id: 'ghost', value: 0, color: null, type: 'regular' }}
                    position={dragPos}
                    rotation={[-Math.PI / 2, 0, Math.PI]}
                    isOpponent={true}
                    scale={1.1}
                />
            )}
        </group>
    );
}
