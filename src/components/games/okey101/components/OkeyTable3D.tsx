'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Text, Html } from '@react-three/drei';
import { useOkeyStore } from '@/store/useOkeyStore';
import { Rack3D } from './Rack3D';
import { Tile3D } from './Tile3D';
import { DraggableDrawPile } from './DraggableDrawPile';

export function OkeyTable3D() {
    const { playersHands, centerPile, tiles: drawPile } = useOkeyStore();
    const myPlayerId = 'player1';
    const [controlsEnabled, setControlsEnabled] = React.useState(true);

    return (
        <Canvas shadows className="w-full h-full" gl={{ preserveDrawingBuffer: true }}>
            <Suspense fallback={null}>
                {/* Camera: Slightly higher and back for better overview */}
                <PerspectiveCamera makeDefault position={[0, 70, 50]} fov={45} />
                <OrbitControls
                    enabled={controlsEnabled}
                    target={[0, 0, 0]}
                    minPolarAngle={Math.PI / 8}
                    maxPolarAngle={Math.PI / 2.5}
                    minDistance={30}
                    maxDistance={120}
                    enablePan={false}
                />

                <ambientLight intensity={0.6} />
                <pointLight position={[0, 60, 0]} intensity={1.5} castShadow />
                <directionalLight position={[30, 50, 20]} intensity={1} castShadow />
                <Environment preset="apartment" />

                {/* Table Surface */}
                <group position={[0, -0.5, 0]}>
                    {/* Table Border/Wood Frame - Bottom Layer */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
                        <boxGeometry args={[116, 116, 0.6]} />
                        <meshStandardMaterial color="#3e2723" roughness={0.5} />
                    </mesh>

                    {/* Felt Surface - Thickened to prevent Z-fighting */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]} receiveShadow>
                        <boxGeometry args={[110, 110, 0.2]} />
                        <meshStandardMaterial color="#1b5e20" roughness={0.9} /> {/* Premium Dark Green */}
                    </mesh>
                </group>

                {/* --- PLAYERS (RACKS) --- */}
                {/* 
                    Orientation Fix:
                    P1 (Bottom): Rot 0 (Faces +Z)
                    P2 (Right): Rot +PI/2 (Faces +X) -> Updated from -PI/2
                    P3 (Top): Rot PI (Faces -Z)
                    P4 (Left): Rot -PI/2 (Faces -X) -> Updated from +PI/2
                */}

                {/* Player 1 (Myself - Bottom) */}
                <group position={[0, 0, 36]}>
                    <Rack3D
                        tiles={playersHands['player1'] || []}
                        isOwnRack={true}
                    />
                </group>

                {/* Player 2 (Right) */}
                <group position={[42, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <Rack3D
                        tiles={playersHands['player2'] || []}
                        isOwnRack={false}
                    />
                </group>

                {/* Player 3 (Top) */}
                <group position={[0, 0, -42]} rotation={[0, Math.PI, 0]}>
                    <Rack3D
                        tiles={playersHands['player3'] || []}
                        isOwnRack={false}
                    />
                </group>

                {/* Player 4 (Left) */}
                <group position={[-42, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
                    <Rack3D
                        tiles={playersHands['player4'] || []}
                        isOwnRack={false}
                    />
                </group>


                {/* --- CENTER AREA --- */}
                <group position={[0, 0.2, 0]}>
                    {/* Draw Pile (Stack) */}
                    <DraggableDrawPile
                        drawPileLength={drawPile.length}
                        onClick={() => {
                            if (drawPile.length > 0) useOkeyStore.getState().drawTile(myPlayerId);
                        }}
                        onDragStart={() => setControlsEnabled(false)}
                        onDragEnd={() => setControlsEnabled(true)}
                    />

                    {/* Discard Pile (Center) */}
                    <group position={[6, 0, 0]}>
                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
                            <planeGeometry args={[4.5, 5.5]} />
                            <meshStandardMaterial color="#000000" opacity={0.3} transparent />
                        </mesh>
                        {centerPile.length > 0 && (
                            <Tile3D
                                tile={centerPile[centerPile.length - 1]}
                                position={[0, 0.2, 0]}
                                rotation={[-Math.PI / 2, 0, 0]}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    console.log("Picking discard...");
                                }}
                            />
                        )}
                    </group>
                </group>

                <Html position={[10, 5, 20]}>
                    <button
                        onClick={() => useOkeyStore.getState().initializeGame()}
                        className="px-4 py-2 bg-red-600 text-white rounded shadow-lg hover:bg-red-700 font-bold"
                    >
                        Sıfırla
                    </button>
                </Html>
            </Suspense>
        </Canvas>
    );
}
