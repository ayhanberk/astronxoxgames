'use client';

import React, { useMemo, useState } from 'react';
import { Tile3D } from './Tile3D';
import { AnimatedTile3D } from './AnimatedTile3D';
import { Tile, useOkeyStore } from '@/store/useOkeyStore';
import * as THREE from 'three';
import { useThree, createPortal } from '@react-three/fiber';
import { useDrag } from '@use-gesture/react';

interface Rack3DProps {
    tiles: (Tile | null)[];
    position?: [number, number, number];
    rotation?: [number, number, number];
    isOwnRack?: boolean;
}

export function Rack3D({ tiles, position = [0, 0, 0], rotation = [0, 0, 0], isOwnRack = false }: Rack3DProps) {

    // Verified Dimensions for Tile Compatibility
    const width = 55;
    const depth = 5.0;
    const height = 5.0;

    // Material
    const material = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#2e1c11',
        roughness: 0.6,
        metalness: 0.1,
    }), []);

    // "V4" Profile - Narrow Shelves to Highlight Backrest
    // Back Wall: X = 5.0
    // Front: X = 0

    // Top Shelf:
    // Backrest Top: X=5.0, Y=5.0.
    // Backrest Bottom: X=4.2, Y=2.8. (Sloped Back)
    // Shelf Floor End: X=3.4, Y=2.8. (Floor Width ~0.8 - Narrow!)

    // Bottom Shelf:
    // Backrest Top: X=3.4, Y=2.8.
    // Backrest Bottom: X=2.6, Y=0.8.
    // Shelf Floor End: X=1.8, Y=0.8. (Floor Width ~0.8)

    const rackShape = useMemo(() => {
        const shape = new THREE.Shape();

        // 1. Bottom Base
        shape.moveTo(0, 0);
        shape.lineTo(depth, 0);

        // 2. Back Wall
        shape.lineTo(depth, height);
        shape.lineTo(depth - 0.5, height); // Thickness

        // 3. Top Shelf Backrest (The "Leaning" Area)
        // From Top X=4.5, Y=5.0 down to Shelf Floor X=3.8
        shape.lineTo(3.8, 2.8);

        // 4. Top Shelf Floor (Narrow!)
        shape.lineTo(3.2, 2.8);

        // 5. Vertical Drop
        shape.lineTo(3.2, 1.5); // Thickness of step

        // 6. Bottom Shelf Backrest
        // From X=3.2, Y=1.5 down to X=2.2, 0.8
        shape.lineTo(2.2, 0.8);

        // 7. Bottom Shelf Floor
        shape.lineTo(1.4, 0.8);

        // 8. Front Lip
        shape.lineTo(1.4, 1.0);
        shape.lineTo(1.0, 1.0);
        shape.lineTo(0.5, 0);
        shape.lineTo(0, 0);

        return shape;
    }, []);

    const extrudeSettings = useMemo(() => ({
        steps: 1,
        depth: width,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 3
    }), [width]);

    const { handleTileClick, selectedId } = useRackInteraction(isOwnRack);

    return (
        <group position={position} rotation={rotation}>
            {/* Rack Body */}
            <mesh
                castShadow
                receiveShadow
                material={material}
                rotation={[0, Math.PI / 2, 0]}
                position={[-width / 2, 0, 0]}
            >
                <extrudeGeometry args={[rackShape, extrudeSettings]} />
            </mesh>

            {/* Tiles */}
            <group position={[-width / 2 + 1.8, 0, 0]} >
                {tiles.map((tile, index) => {
                    const tilesPerRow = 11;
                    const row = Math.floor(index / tilesPerRow);
                    const col = index % tilesPerRow;
                    const isTopRow = row === 0;

                    // Tile Positioning V4
                    // Tile H=3.6. Pivot Center -> Bottom = 1.8. 
                    // Tilt (-30 deg).
                    // Cos(30) ~ 0.866. Y shift = 1.8 * 0.866 = 1.56.
                    // Sin(30) ~ 0.5. Z shift = 1.8 * 0.5 = 0.9.

                    // Top Row:
                    // Shelf Floor Y=2.8.
                    // Tile Center Y = 2.8 + 1.56 = 4.36.
                    // Shelf Back corner X=3.8. Floor X=3.2. Mid X=3.5.
                    // Tile Base Z (in shape X) should be near 3.5.
                    // World Z = -3.5.

                    // Bottom Row:
                    // Shelf Floor Y=0.8.
                    // Tile Center Y = 0.8 + 1.56 = 2.36.
                    // Shelf Back corner X=2.2. Floor X=1.4. Mid X=1.8.
                    // World Z = -1.8.

                    const tileY = isTopRow ? 4.36 : 2.36;
                    const tileZ = isTopRow ? -3.5 : -1.8;

                    // Tile width is ~3.2. Spacing 3.5 is tight.
                    const xPos = col * 3.5 + 4.0;

                    // If slot is empty, don't render tile.
                    if (!tile) return null;

                    const isSelected = selectedId === tile.id;
                    const tilt = -Math.PI / 6; // 30 degrees

                    // Target Position
                    const targetPos: [number, number, number] = [xPos, tileY + (isSelected ? 0.8 : 0), tileZ];

                    // Start Position
                    const startPos: [number, number, number] | undefined = isOwnRack
                        ? [25, 15, 5]
                        : undefined;

                    if (isOwnRack) {
                        return (
                            <DraggableRackTile
                                key={tile.id}
                                tile={tile}
                                index={index}
                                targetPosition={targetPos}
                                startPosition={startPos}
                                tilesPerRow={tilesPerRow}
                                onMove={(newIndex) => useOkeyStore.getState().moveTile('player1', tile.id, newIndex)}
                                onClick={() => handleTileClick(tile.id)}
                            />
                        );
                    }

                    return (
                        <AnimatedTile3D
                            key={tile.id}
                            tile={tile}
                            targetPosition={targetPos}
                            startPosition={startPos}
                            scale={0.95}
                            isOpponent={true}
                        />
                    );
                })}
            </group>
        </group>
    );
}

function useRackInteraction(isOwn: boolean) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleTileClick = (id: string) => {
        if (!isOwn) return;
        setSelectedId(prev => prev === id ? null : id);
    };

    return { handleTileClick, selectedId };
}

interface DraggableRackTileProps {
    tile: Tile;
    index: number;
    targetPosition: [number, number, number];
    targetPosition: [number, number, number];
    tilesPerRow: number;
    onMove: (newIndex: number) => void;
    onClick: () => void;
}

function DraggableRackTile({ tile, index, targetPosition, startPosition, tilesPerRow, onMove, onClick }: DraggableRackTileProps) {
    const { size, viewport, camera, raycaster, controls, scene } = useThree();
    const [dragging, setDragging] = useState(false);
    const [dragPos, setDragPos] = useState<[number, number, number] | null>(null);

    // Drag plane at Y=5 (same as Draw Pile)
    const dragPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -5), []);
    const intersectPoint = useMemo(() => new THREE.Vector3(), []);

    // Convert logic: World X -> Index
    // Rack Width ~55. Center 0.
    // Col 0 X = 2.5. Col 1 X = 6.9... 
    // Formula: xPos = col * 4.0 + 2.5 + offset (shifted by width/2 in Rack)
    // Actually, dragging happens in WORLD space?
    // Rack group is at [0, 0, 36].
    // So Tile World X = RackX(0) + TileLocalX.
    // TileLocalX = col * 4.0 + 1.5 - (width/2 -> 27.5) + 1.8 (group offset)
    // This is getting complex.
    // Simplification: We only care about Local X within the Rack Group.
    // But useDrag gives us screen coords?

    // Let's rely on the Raycaster to give us the World Point.
    // Convert World Point to Rack Local Point.
    // Rack is at [0, 0, 36]. Rotation 0.
    // So Local P = World P - [0, 0, 36].

    const bind = useDrag(({ active, xy: [x, y], event }: any) => {
        if (controls) (controls as any).enabled = !active;

        if (active) {
            if (!dragging) setDragging(true);

            // Raycast for World Position
            const ndc = new THREE.Vector2(
                (x / size.width) * 2 - 1,
                -(y / size.height) * 2 + 1
            );

            raycaster.setFromCamera(ndc, camera);
            raycaster.ray.intersectPlane(dragPlane, intersectPoint);

            // Lift tile visually
            setDragPos([intersectPoint.x, intersectPoint.y, intersectPoint.z]);

        } else {
            setDragging(false);

            // DROP LOGIC
            // 1. Convert Drop World Pos to Rack Local Pos
            // Rack Center = [0, 0, 36].
            const localX = intersectPoint.x - 0;
            const localZ = intersectPoint.z - 36;

            // 2. Determine Row
            // Shape X maps to World -Z.
            // Top Row World Z ~ -3.5. Bottom Row ~ -1.8.
            // Let's just threshold.
            // If localZ < -2.6 -> Top Row (Row 0). Else -> Bottom Row (Row 1).
            const targetRow = localZ < -2.6 ? 0 : 1;

            // 3. Determine Col
            // xPos = col * 4.0 + 1.5 - width/2 + 1.8
            // Let's reverse:
            // Group offset X: -55/2 + 1.8 = -25.7
            // xPos = col * 4.0 + 1.5. 
            // LocalX = xPos - 25.7.
            // xPos = LocalX + 25.7.
            // col * 4.0 = xPos - 1.5 = LocalX + 24.2.
            // col = (LocalX + 24.2) / 4.0.

            const estCol = Math.round((localX + 24.2) / 4.0);
            const clampedCol = Math.max(0, Math.min(estCol, tilesPerRow - 1));

            const newIndex = targetRow * tilesPerRow + clampedCol;

            // Only move if changed
            if (newIndex !== index) {
                onMove(newIndex);
            }

            setDragPos(null);

            // Click if short drag? Handled by onClick usually, but drag suppresses click sometimes.
            // If movement was small... let's just ignore click during sort for now.
        }

        event?.stopPropagation(); // Prevent propagation to orbit controls?
    });

    if (dragging && dragPos) {
        // Render Floating Ghost
        return (
            <group position={dragPos} rotation={[-Math.PI / 2, 0, 0]}>
                <Tile3D
                    tile={tile}
                    isOpponent={false}
                    scale={1.0}
                />
            </group>
        );
    }

    // Render Normal (Animated) Tile
    // Attach bind to it
    return (
        <group {...(bind() as any)} onClick={(e) => {
            if (!dragging) onClick();
            e.stopPropagation();
        }}>
            <AnimatedTile3D
                tile={tile}
                targetPosition={targetPosition}
                startPosition={startPosition} // Only on mount
                isOpponent={false}
            />
        </group>
    );
}
