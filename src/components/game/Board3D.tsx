'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Stars, Sparkles, Cloud, MeshRefractionMaterial, Float } from '@react-three/drei';
import { useGameStore } from '@/store/useGameStore';
import { useLobbyStore, Room } from '@/store/useLobbyStore';
import { Piece3D } from './Piece3D';
import * as THREE from 'three';

// --- Procedural Props ---

// --- New Theme Props ---

function SpaceProps() {
    return (
        <group>
            {/* Planets / Asteroids in distance */}
            {[0, 1, 2, 3, 4].map(i => (
                <Float key={i} speed={1 + i / 2} rotationIntensity={2} floatIntensity={1}>
                    <mesh
                        position={[Math.cos(i * 2) * 20, Math.sin(i) * 10, Math.sin(i * 2) * 20]}
                        onClick={(e) => {
                            e.stopPropagation();
                            // Simple visual feedback: scale up temporarily (in a real app, use spring)
                            (e.object as THREE.Mesh).scale.multiplyScalar(1.2);
                            setTimeout(() => (e.object as THREE.Mesh).scale.multiplyScalar(1 / 1.2), 200);
                        }}
                        onPointerOver={() => document.body.style.cursor = 'pointer'}
                        onPointerOut={() => document.body.style.cursor = 'auto'}
                    >
                        <dodecahedronGeometry args={[i + 1, 1]} />
                        <meshStandardMaterial color={['#4b5563', '#60a5fa', '#f87171'][i % 3]} roughness={0.8} metalness={0.2} />
                    </mesh>
                </Float>
            ))}
            <Stars radius={60} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        </group>
    );
}

function CyberpunkProps() {
    const gridRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (gridRef.current) {
            // Glitch effect on grid opacity
            const flicker = Math.random() > 0.95 ? 0.5 : 0.2;
            (gridRef.current.material as THREE.Material).opacity = THREE.MathUtils.lerp((gridRef.current.material as THREE.Material).opacity, flicker, 0.1);
        }
    });

    return (
        <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} ref={gridRef}>
                <planeGeometry args={[100, 100, 40, 40]} />
                <meshBasicMaterial wireframe color="#ff00ff" transparent opacity={0.2} />
            </mesh>
            <fog attach="fog" args={['#050505', 5, 40]} />

            {/* Floating Neon Signs */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh position={[-12, 5, -10]} rotation={[0, 0.5, 0]}>
                    <planeGeometry args={[4, 2]} />
                    <meshBasicMaterial color="#00ffff" side={THREE.DoubleSide} />
                    <pointLight distance={10} intensity={2} color="#00ffff" />
                </mesh>
                <mesh position={[12, 8, -8]} rotation={[0, -0.5, 0]}>
                    <planeGeometry args={[3, 5]} />
                    <meshBasicMaterial color="#ff00ff" side={THREE.DoubleSide} />
                    <pointLight distance={10} intensity={2} color="#ff00ff" />
                </mesh>
            </Float>
        </group>
    )
}

function CandyProps() {
    return (
        <group>
            <Sparkles count={150} scale={25} size={6} speed={0.4} color="#f472b6" opacity={0.7} />
            {/* Floating Donuts */}
            {[0, 1, 2].map(i => (
                <Float key={i} speed={2 + i} rotationIntensity={1} floatIntensity={2}>
                    <mesh
                        position={[Math.cos(i * 2) * 15, 6 + i * 2, Math.sin(i * 2) * 15]}
                        rotation={[Math.random(), Math.random(), 0]}
                        onClick={(e) => {
                            e.stopPropagation();
                            // Spin rapidly on click
                            const mesh = e.object as THREE.Mesh;
                            let speed = 0.5;
                            const animate = () => {
                                if (speed > 0) {
                                    mesh.rotation.y += speed;
                                    speed -= 0.02;
                                    requestAnimationFrame(animate);
                                }
                            };
                            animate();
                        }}
                        onPointerOver={() => document.body.style.cursor = 'pointer'}
                        onPointerOut={() => document.body.style.cursor = 'auto'}
                    >
                        <torusGeometry args={[3 - i * 0.5, 1, 16, 32]} />
                        <meshStandardMaterial color={['#fce7f3', '#fef08a', '#bbf7d0'][i % 3]} roughness={0.2} />
                    </mesh>
                </Float>
            ))}
        </group>
    )
}

function BeachProps() {
    return (
        <group>
            {/* Water */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color="#0ea5e9" roughness={0.1} metalness={0.5} />
            </mesh>
            {/* Sand Island */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
                <circleGeometry args={[25, 64]} />
                <meshStandardMaterial color="#fde68a" roughness={1} />
            </mesh>

            {/* Beach Ball - Interactive Bounce */}
            <Float speed={5} rotationIntensity={2} floatIntensity={1.5} floatingRange={[1, 2]}>
                <mesh
                    position={[7, 1, -6]}
                    castShadow
                    onClick={(e) => {
                        e.stopPropagation();
                        // Jump up
                        (e.object as THREE.Mesh).position.y += 2;
                    }}
                    onPointerOver={() => document.body.style.cursor = 'pointer'}
                    onPointerOut={() => document.body.style.cursor = 'auto'}
                >
                    <sphereGeometry args={[1.5, 32, 32]} />
                    <meshStandardMaterial color="#f43f5e" roughness={0.3} />
                </mesh>
            </Float>

            {/* Crabs / Shells */}
            {[[5, -4], [-8, 2], [10, 8]].map(([x, z], i) => (
                <group key={i} position={[x, -0.55, z]} scale={0.5} onClick={() => console.log('Crab clicked!')}>
                    <mesh castShadow>
                        <sphereGeometry args={[0.4, 16, 16]} />
                        <meshStandardMaterial color="#ef4444" />
                    </mesh>
                    <mesh position={[0.2, 0.3, 0.2]}>
                        <sphereGeometry args={[0.1, 8, 8]} />
                        <meshStandardMaterial color="white" />
                    </mesh>
                    <mesh position={[-0.2, 0.3, 0.2]}>
                        <sphereGeometry args={[0.1, 8, 8]} />
                        <meshStandardMaterial color="white" />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

function WinterProps() {
    return (
        <group>
            {/* Snow Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#f8fafc" roughness={1} />
            </mesh>

            {/* Snow Clumps / Drifts */}
            {[[-6, 4], [8, -3], [-3, -7], [5, 6]].map(([x, z], i) => (
                <mesh key={i} position={[x, -0.4, z]} scale={[2 + i, 1, 2 + i]} onClick={() => console.log('Snow clicked!')}>
                    <sphereGeometry args={[1, 16, 8]} />
                    <meshStandardMaterial color="#f1f5f9" roughness={1} />
                </mesh>
            ))}

            {/* Simple Pine Trees */}
            {[[-12, -5], [10, -10], [-8, 12]].map(([x, z], i) => (
                <group key={i} position={[x, 0, z]}>
                    <mesh position={[0, 1, 0]} castShadow>
                        <cylinderGeometry args={[0.4, 0.6, 2]} />
                        <meshStandardMaterial color="#422006" />
                    </mesh>
                    <mesh position={[0, 3, 0]} castShadow>
                        <coneGeometry args={[2.5, 4, 8]} />
                        <meshStandardMaterial color="#064e3b" />
                    </mesh>
                </group>
            ))}
        </group>
    );
}


export function Board3D() {
    const { board, theme, setPendingMove, pendingMove, turn } = useGameStore();
    const currentUser = useLobbyStore((s: any) => s.currentUser);
    const rooms = useLobbyStore((s: any) => s.rooms);
    const currentRoomId = useLobbyStore((s: any) => s.currentRoomId);

    const currentRoom = useMemo(() => {
        return rooms.find((r: any) => r.id === currentRoomId);
    }, [rooms, currentRoomId]);

    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

    const CELL_SIZE = 2.5;

    const getPosition = (index: number): [number, number, number] => {
        const col = (index % 3) - 1;
        const row = Math.floor(index / 3) - 1;
        return [col * CELL_SIZE, 0, row * CELL_SIZE];
    };

    const myMark = useMemo(() => {
        if (!currentRoom || !currentUser) return null;
        if (currentRoom.players[0].id === currentUser.id) return 'X';
        if (currentRoom.players[1]?.id === currentUser.id) return 'O';
        return null;
    }, [currentRoom, currentUser]);

    const ThemeEffects = () => {
        switch (theme) {
            case 'neon':
                return (
                    <>
                        <Environment preset="night" />
                        <Stars radius={50} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
                        <fog attach="fog" args={['#000000', 5, 40]} />
                    </>
                );
            case 'cyberpunk':
                return (
                    <>
                        <Environment preset="night" />
                        <CyberpunkProps />
                    </>
                );
            case 'space':
                return (
                    <>
                        <Environment preset="night" />
                        <SpaceProps />
                    </>
                );
            case 'candy':
                return (
                    <>
                        <Environment preset="apartment" />
                        <CandyProps />
                    </>
                );
            case 'glass':
                return <Environment preset="city" />;
            case 'winter':
                return (
                    <>
                        <Environment preset="park" />
                        <Sparkles count={200} scale={12} size={4} speed={0.4} opacity={0.5} color="#ffffff" />
                        <fog attach="fog" args={['#f8fafc', 5, 40]} />
                        <WinterProps />
                    </>
                );
            case 'beach':
                return (
                    <>
                        <Environment preset="sunset" />
                        <Cloud opacity={0.5} speed={0.4} segments={10} position={[0, 10, -10]} />
                        <ambientLight intensity={0.8} />
                        <BeachProps />
                    </>
                );
            default:
                return <Environment preset="sunset" />;
        }
    };

    const BaseBoard = useMemo(() => {
        const getBaseProps = () => {
            switch (theme) {
                case 'neon': return { color: '#050505', grid: '#0f0', opacity: 1 };
                case 'cyberpunk': return { color: '#09090b', grid: '#f0abfc', opacity: 1 };
                case 'space': return { color: '#111827', grid: '#60a5fa', opacity: 1 };
                case 'candy': return { color: '#fff1f2', grid: '#fb7185', opacity: 1 };
                case 'dark': return { color: '#1e293b', grid: '#334155', opacity: 1 };
                case 'glass': return { color: '#ffffff', grid: '#ddd', opacity: 0.1 };
                case 'winter': return { color: '#e2e8f0', grid: '#94a3b8', opacity: 0.8 };
                case 'beach': return { color: '#ffedd5', grid: '#f59e0b', opacity: 1 };
                default: return { color: '#f8fafc', grid: '#cbd5e1', opacity: 1 };
            }
        };

        const styles = getBaseProps();

        return (
            <group>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.21, 0]} receiveShadow>
                    <boxGeometry args={[9, 9, 0.4]} />
                    <meshStandardMaterial
                        color={styles.color}
                        roughness={theme === 'beach' ? 0.9 : 0.5}
                        metalness={theme === 'space' ? 0.5 : 0.1}
                        transparent={(theme as string) === 'glass'}
                        opacity={styles.opacity}
                    />
                </mesh>

                <gridHelper
                    args={[7.5, 3, styles.grid, styles.grid]}
                    position={[0, 0.01, 0]}
                />

                {/* Interactive Plane Layer */}
                {/* Interactive Hitbox Layer - Box geometry for better raycasting from angles */}
                {Array(9).fill(null).map((_, i) => (
                    <mesh
                        key={i}
                        position={[getPosition(i)[0], 0.25, getPosition(i)[2]]} // Lift slightly to cover piece area
                        onClick={(e) => {
                            e.stopPropagation();
                            if (board[i]) return;
                            if (turn === myMark) {
                                setPendingMove(i);
                            }
                        }}
                        onPointerOver={() => {
                            if (!board[i] && turn === myMark) {
                                setHoveredIndex(i);
                                document.body.style.cursor = 'pointer';
                            }
                        }}
                        onPointerOut={() => {
                            setHoveredIndex(null);
                            document.body.style.cursor = 'auto';
                        }}
                        visible={false} // Invisible raycast target
                    >
                        <boxGeometry args={[CELL_SIZE - 0.1, 0.8, CELL_SIZE - 0.1]} />
                        <meshBasicMaterial />
                    </mesh>
                ))}
            </group>
        );
    }, [theme, board, turn, myMark, setPendingMove]);

    // Adjust Camera Defaults - Keep consistency
    const cameraPosition: [number, number, number] = [0, 15, 12];

    return (
        <div className="w-full h-full cursor-grab active:cursor-grabbing">
            <Canvas
                shadows
                dpr={[1, 1.5]} // Cap DPR for performance
                performance={{ min: 0.5 }}
                gl={{ antialias: true, powerPreference: 'high-performance' }}
            >
                <PerspectiveCamera makeDefault position={cameraPosition} fov={40} />
                <OrbitControls
                    enablePan={false}
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI / 2.2}
                    minDistance={5}
                    maxDistance={40}
                    enableDamping
                />

                {/* Simplified Lighting */}
                <ambientLight intensity={theme === 'dark' ? 0.4 : 0.7} />
                <directionalLight
                    position={[10, 15, 10]}
                    intensity={theme === 'dark' ? 0.8 : 1}
                    castShadow
                    shadow-mapSize={[1024, 1024]} // Lower shadow map resolution
                />

                <ThemeEffects />

                {BaseBoard}

                {/* Ghost Preview */}
                {hoveredIndex !== null && myMark && (
                    <Piece3D type={myMark} position={getPosition(hoveredIndex)} theme={theme} isGhost />
                )}

                {/* Pending Move Preview */}
                {pendingMove !== null && (
                    <group position={getPosition(pendingMove)}>
                        <Piece3D
                            type={turn as 'X' | 'O'}
                            position={[0, 0, 0]}
                            theme={theme}
                            isGhost={true} // Re-use ghost transparency
                        />
                        {/* Pulse/Highlight Effect for Pending Move */}
                        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                            <ringGeometry args={[0.3, 0.4, 32]} />
                            <meshBasicMaterial color={turn === 'X' ? '#2563eb' : '#d97706'} transparent opacity={0.5} />
                        </mesh>
                    </group>
                )}

                {/* Pieces */}
                {board.map((cell, i) => (
                    cell && <Piece3D key={i} type={cell} position={getPosition(i)} theme={theme} />
                ))}

                <ContactShadows position={[0, -0.1, 0]} opacity={0.4} scale={20} blur={2.5} far={4} resolution={256} />
            </Canvas>
        </div>
    );
}
