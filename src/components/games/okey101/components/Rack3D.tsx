'use client';

import React, { useMemo, useState } from 'react';
import { Tile3D } from './Tile3D';
import { Tile, useOkeyStore } from '@/store/useOkeyStore';
import * as THREE from 'three';

interface Rack3DProps {
    tiles: Tile[];
    position?: [number, number, number];
    rotation?: [number, number, number];
    isOwnRack?: boolean;
}

export function Rack3D({ tiles, position = [0, 0, 0], rotation = [0, 0, 0], isOwnRack = false }: Rack3DProps) {
    // Rack Dimensions
    const width = 52; // Slightly wider for comfort
    const depth = 6;  // Reduced depth (Front to Back) from 9 to 6

    // Material
    const material = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#3E2723', // Dark Mahogany
        roughness: 0.4,
        metalness: 0.1,
    }), []);

    // "Staircase" Profile
    // We need 2 distinct shelves that don't overlap vertically in a way that hides tiles.
    // 
    // Back Wall: X=9
    // Top Shelf: X=4.5 to X=9. Height Y=3.0.
    // Bottom Shelf: X=0 to X=4.5. Height Y=0.5.

    const rackShape = useMemo(() => {
        const shape = new THREE.Shape();

        // Start Bottom-Front
        shape.moveTo(0, 0);
        shape.lineTo(depth, 0); // Bottom Base (Floor)

        // Back Wall
        shape.lineTo(depth, 6.0); // High Back Wall
        shape.lineTo(depth - 0.8, 6.0); // Wall Thickness

        // Top Shelf Area
        shape.lineTo(depth - 1.0, 3.5); // Back of Upper Shelf
        shape.lineTo(4.6, 2.5); // Front of Upper Shelf (Sloped slightly down-forward or up-forward? Sloped Back for gravity)
        // Let's slope BACK: Front Y=2.5, Back Y=2.0? No, tile rests on it.
        // Standard Okey Box: Sloped back.
        // Let's try: Front(4.6) Y=2.5 -> Back(8.0) Y=2.2.

        // Step Down (Vertical Face)
        shape.lineTo(4.6, 1.2);

        // Bottom Shelf Area
        shape.lineTo(4.6, 1.2); // Back of Lower Shelf
        shape.lineTo(0.5, 0.8); // Front of Lower Shelf (Sloped Back)

        // Front Face
        shape.lineTo(0.5, 0);
        shape.lineTo(0, 0); // Close

        return shape;
    }, []);

    const extrudeSettings = useMemo(() => ({
        steps: 1,
        depth: width,
        bevelEnabled: true,
        bevelThickness: 0.2,
        bevelSize: 0.2,
        bevelSegments: 3
    }), [width]);

    const { handleTileClick, selectedId } = useRackInteraction(isOwnRack);

    return (
        <group position={position} rotation={rotation}>
            {/* Rack Body */}
            {/* Center X (Width), Center Z? No, keep Z origin at front. */}
            <mesh
                castShadow
                receiveShadow
                material={material}
                rotation={[0, Math.PI / 2, 0]}
                position={[-width / 2, 0, 0]}
            >
                <extrudeGeometry args={[rackShape, extrudeSettings]} />
            </mesh>

            {/* Texture/Grain could be added here later */}

            {/* Tiles */}
            <group position={[-width / 2 + 2.0, 0, 0]} >
                {tiles.map((tile, index) => {
                    const tilesPerRow = 11;
                    const row = Math.floor(index / tilesPerRow);
                    const col = index % tilesPerRow;
                    const isTopRow = row === 0;

                    // Tile Logic:
                    // Tile Height: 3.5.
                    // Tilt: -15 deg (~ -0.26 rad)

                    // Upper Row positioning:
                    // Shelf Surface Y approx 2.3.
                    // Tile Center Y = 2.3 + 1.6 = 3.9. 
                    // Depth (Z in World, X in Shape): Approx 6.5.
                    // World Z = -6.5.

                    // Lower Row positioning:
                    // Shelf Surface Y approx 1.0.
                    // Tile Center Y = 1.0 + 1.6 = 2.6.
                    // Depth (Z in World, X in Shape): Approx 2.5.
                    // World Z = -2.5.

                    // NOTE: User said bottom tiles (Row 1) were entering the rack (clipping top shelf?).
                    // Our new step connects at X=4.6. Lower tiles are at X=2.5. Plenty of clearance.

                    const tileY = isTopRow ? 4.1 : 1.9;
                    const tileZ = isTopRow ? -4.3 : -1.5; // Negative Z forces them "into" the rack lines

                    const xPos = col * 4.2 + 2; // Wider spacing

                    const isSelected = selectedId === tile.id;
                    const tilt = -Math.PI / 8;

                    return (
                        <Tile3D
                            key={tile.id}
                            tile={tile}
                            position={[xPos, tileY + (isSelected ? 0.8 : 0), tileZ]}
                            rotation={[tilt, 0, 0]}
                            isOpponent={!isOwnRack}
                            onClick={() => handleTileClick(tile.id)}
                            scale={0.95}
                        />
                    );
                })}
            </group>
        </group>
    );
}

function useRackInteraction(isOwn: boolean) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Simple toggle for now
    const handleTileClick = (id: string) => {
        if (!isOwn) return;
        setSelectedId(prev => prev === id ? null : id);
    };

    return { handleTileClick, selectedId };
}
