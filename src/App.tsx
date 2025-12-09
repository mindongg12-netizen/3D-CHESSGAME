import { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Chess } from 'chess.js';
import { ref, set, onValue, off, remove, get } from 'firebase/database';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from './firebase';
import type { Room, ChessPiece, ChatMessage, User } from './types';
import './App.css';

// Generate 5-digit room code
const generateRoomCode = (): string => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

// 3D Chess Piece Component
function ChessPiece3D({
  piece,
  position,
  isSelected,
  isValidMove,
  onClick
}: {
  piece: ChessPiece | null;
  position: [number, number, number];
  isSelected: boolean;
  isValidMove: boolean;
  onClick: () => void;
}) {
  // Enhanced colors with better contrast
  const isWhite = piece?.color === 'w';
  const baseColor = isWhite ? '#faf0e6' : '#5c4a3d';      // Lighter brown for black
  const accentColor = isWhite ? '#d4c4b0' : '#6d5a4a';    // Slightly lighter brown
  const highlightColor = isWhite ? '#ffd700' : '#e8e8e8'; // Gold for white, Silver for black
  const edgeColor = '#ffffff';  // White edge lines for black pieces

  // Material properties - black pieces more metallic/shiny
  const metalness = isWhite ? 0.15 : 0.75;
  const roughness = isWhite ? 0.3 : 0.15;
  const emissive = isSelected ? '#22ff22' : isValidMove ? '#4488ff' : (isWhite ? '#000000' : '#4a3828');
  const emissiveIntensity = isSelected ? 0.4 : isValidMove ? 0.3 : (isWhite ? 0 : 0.2);

  // Edge line material for black pieces - glowing silver/white lines
  const edgeMaterial = {
    color: edgeColor,
    metalness: 1.0,
    roughness: 0.05,
    emissive: '#888888',
    emissiveIntensity: 0.5,
  };

  const getPieceGeometry = (type: string) => {
    switch (type) {
      case 'k': // King - tallest piece with prominent cross
        return (
          <group scale={1.3}>
            {/* Base - largest */}
            <mesh position={[0, 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.4, 0.44, 0.2, 32]} />
              <meshStandardMaterial color={baseColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Edge line - base top */}
            {!isWhite && (
              <mesh position={[0, 0.2, 0]}>
                <torusGeometry args={[0.4, 0.012, 8, 32]} />
                <meshStandardMaterial {...edgeMaterial} />
              </mesh>
            )}
            {/* Lower body */}
            <mesh position={[0, 0.3, 0]} castShadow>
              <cylinderGeometry args={[0.32, 0.4, 0.24, 32]} />
              <meshStandardMaterial color={baseColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Edge line - lower body top */}
            {!isWhite && (
              <mesh position={[0, 0.42, 0]}>
                <torusGeometry args={[0.32, 0.012, 8, 32]} />
                <meshStandardMaterial {...edgeMaterial} />
              </mesh>
            )}
            {/* Middle body */}
            <mesh position={[0, 0.55, 0]} castShadow>
              <cylinderGeometry args={[0.24, 0.32, 0.36, 32]} />
              <meshStandardMaterial color={accentColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Neck ring */}
            <mesh position={[0, 0.76, 0]} castShadow>
              <torusGeometry args={[0.22, 0.05, 16, 32]} />
              <meshStandardMaterial color={highlightColor} metalness={0.5} roughness={0.3} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Upper body */}
            <mesh position={[0, 0.92, 0]} castShadow>
              <cylinderGeometry args={[0.18, 0.24, 0.26, 32]} />
              <meshStandardMaterial color={baseColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Edge line - upper body top */}
            {!isWhite && (
              <mesh position={[0, 1.05, 0]}>
                <torusGeometry args={[0.18, 0.012, 8, 32]} />
                <meshStandardMaterial {...edgeMaterial} />
              </mesh>
            )}
            {/* Cross vertical */}
            <mesh position={[0, 1.18, 0]} castShadow>
              <boxGeometry args={[0.08, 0.32, 0.08]} />
              <meshStandardMaterial color={highlightColor} metalness={0.6} roughness={0.2} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Cross horizontal */}
            <mesh position={[0, 1.14, 0]} castShadow>
              <boxGeometry args={[0.24, 0.07, 0.08]} />
              <meshStandardMaterial color={highlightColor} metalness={0.6} roughness={0.2} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
          </group>
        );
      case 'q': // Queen - second tallest with crown
        return (
          <group scale={1.3}>
            {/* Base */}
            <mesh position={[0, 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.38, 0.42, 0.2, 32]} />
              <meshStandardMaterial color={baseColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Edge line - base top */}
            {!isWhite && (
              <mesh position={[0, 0.2, 0]}>
                <torusGeometry args={[0.38, 0.012, 8, 32]} />
                <meshStandardMaterial {...edgeMaterial} />
              </mesh>
            )}
            {/* Lower body */}
            <mesh position={[0, 0.3, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.38, 0.24, 32]} />
              <meshStandardMaterial color={baseColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Edge line - lower body top */}
            {!isWhite && (
              <mesh position={[0, 0.42, 0]}>
                <torusGeometry args={[0.3, 0.012, 8, 32]} />
                <meshStandardMaterial {...edgeMaterial} />
              </mesh>
            )}
            {/* Middle body */}
            <mesh position={[0, 0.54, 0]} castShadow>
              <cylinderGeometry args={[0.22, 0.3, 0.34, 32]} />
              <meshStandardMaterial color={accentColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Neck ring */}
            <mesh position={[0, 0.74, 0]} castShadow>
              <torusGeometry args={[0.2, 0.045, 16, 32]} />
              <meshStandardMaterial color={highlightColor} metalness={0.5} roughness={0.3} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Crown base */}
            <mesh position={[0, 0.9, 0]} castShadow>
              <cylinderGeometry args={[0.22, 0.18, 0.24, 32]} />
              <meshStandardMaterial color={baseColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Edge line - crown base */}
            {!isWhite && (
              <mesh position={[0, 1.02, 0]}>
                <torusGeometry args={[0.22, 0.012, 8, 32]} />
                <meshStandardMaterial {...edgeMaterial} />
              </mesh>
            )}
            {/* Crown spikes */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <mesh key={i} position={[Math.cos(i * Math.PI / 3) * 0.14, 1.08, Math.sin(i * Math.PI / 3) * 0.14]} castShadow>
                <coneGeometry args={[0.05, 0.12, 8]} />
                <meshStandardMaterial color={highlightColor} metalness={0.6} roughness={0.2} emissive={emissive} emissiveIntensity={emissiveIntensity} />
              </mesh>
            ))}
            {/* Crown ball */}
            <mesh position={[0, 1.12, 0]} castShadow>
              <sphereGeometry args={[0.12, 24, 24]} />
              <meshStandardMaterial color={highlightColor} metalness={0.6} roughness={0.2} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
          </group>
        );
      case 'r': // Rook - castle tower
        return (
          <group>
            {/* Base */}
            <mesh position={[0, 0.08, 0]} castShadow>
              <cylinderGeometry args={[0.32, 0.35, 0.16, 32]} />
              <meshStandardMaterial color={baseColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Edge line - base top */}
            {!isWhite && (
              <mesh position={[0, 0.16, 0]}>
                <torusGeometry args={[0.32, 0.012, 8, 32]} />
                <meshStandardMaterial {...edgeMaterial} />
              </mesh>
            )}
            {/* Lower body */}
            <mesh position={[0, 0.25, 0]} castShadow>
              <cylinderGeometry args={[0.26, 0.32, 0.2, 32]} />
              <meshStandardMaterial color={baseColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Edge line - lower body top */}
            {!isWhite && (
              <mesh position={[0, 0.35, 0]}>
                <torusGeometry args={[0.26, 0.012, 8, 32]} />
                <meshStandardMaterial {...edgeMaterial} />
              </mesh>
            )}
            {/* Tower body */}
            <mesh position={[0, 0.48, 0]} castShadow>
              <cylinderGeometry args={[0.22, 0.26, 0.36, 32]} />
              <meshStandardMaterial color={accentColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Edge line - tower top */}
            {!isWhite && (
              <mesh position={[0, 0.66, 0]}>
                <torusGeometry args={[0.22, 0.012, 8, 32]} />
                <meshStandardMaterial {...edgeMaterial} />
              </mesh>
            )}
            {/* Top platform */}
            <mesh position={[0, 0.7, 0]} castShadow>
              <cylinderGeometry args={[0.28, 0.22, 0.1, 32]} />
              <meshStandardMaterial color={baseColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Battlements */}
            {[0, 1, 2, 3].map((i) => (
              <mesh key={i} position={[Math.cos(i * Math.PI / 2) * 0.2, 0.82, Math.sin(i * Math.PI / 2) * 0.2]} castShadow>
                <boxGeometry args={[0.12, 0.14, 0.12]} />
                <meshStandardMaterial color={highlightColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
              </mesh>
            ))}
          </group>
        );
      case 'b': // Bishop - taller with distinctive pointed mitre
        return (
          <group>
            {/* Base - wider than pawn */}
            <mesh position={[0, 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.34, 0.38, 0.2, 32]} />
              <meshStandardMaterial color={baseColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Edge line - base top */}
            {!isWhite && (
              <mesh position={[0, 0.2, 0]}>
                <torusGeometry args={[0.34, 0.012, 8, 32]} />
                <meshStandardMaterial {...edgeMaterial} />
              </mesh>
            )}
            {/* Lower body */}
            <mesh position={[0, 0.28, 0]} castShadow>
              <cylinderGeometry args={[0.26, 0.34, 0.2, 32]} />
              <meshStandardMaterial color={baseColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Edge line - lower body top */}
            {!isWhite && (
              <mesh position={[0, 0.38, 0]}>
                <torusGeometry args={[0.26, 0.012, 8, 32]} />
                <meshStandardMaterial {...edgeMaterial} />
              </mesh>
            )}
            {/* Middle body - taller */}
            <mesh position={[0, 0.52, 0]} castShadow>
              <cylinderGeometry args={[0.16, 0.26, 0.32, 32]} />
              <meshStandardMaterial color={accentColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Neck ring */}
            <mesh position={[0, 0.7, 0]} castShadow>
              <torusGeometry args={[0.14, 0.035, 16, 32]} />
              <meshStandardMaterial color={highlightColor} metalness={0.5} roughness={0.3} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Head - pointed mitre shape */}
            <mesh position={[0, 0.85, 0]} castShadow>
              <coneGeometry args={[0.18, 0.35, 24]} />
              <meshStandardMaterial color={baseColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Mitre slit - distinctive marking */}
            <mesh position={[0, 0.88, 0.08]} rotation={[0.3, 0, 0]} castShadow>
              <boxGeometry args={[0.04, 0.25, 0.12]} />
              <meshStandardMaterial color={isWhite ? '#1a1a1a' : '#ffffff'} metalness={0.1} roughness={0.8} emissive={!isWhite ? '#888888' : '#000000'} emissiveIntensity={!isWhite ? 0.5 : 0} />
            </mesh>
            {/* Top ball */}
            <mesh position={[0, 1.05, 0]} castShadow>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshStandardMaterial color={highlightColor} metalness={0.6} roughness={0.2} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
          </group>
        );
      case 'n': // Knight - horse head
        return (
          <group rotation={[0, isWhite ? 0 : Math.PI, 0]}>
            {/* Base */}
            <mesh position={[0, 0.08, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.33, 0.16, 32]} />
              <meshStandardMaterial color={baseColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Edge line - base top */}
            {!isWhite && (
              <mesh position={[0, 0.16, 0]}>
                <torusGeometry args={[0.3, 0.012, 8, 32]} />
                <meshStandardMaterial {...edgeMaterial} />
              </mesh>
            )}
            {/* Lower body */}
            <mesh position={[0, 0.22, 0]} castShadow>
              <cylinderGeometry args={[0.22, 0.3, 0.16, 32]} />
              <meshStandardMaterial color={baseColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Edge line - lower body top */}
            {!isWhite && (
              <mesh position={[0, 0.3, 0]}>
                <torusGeometry args={[0.22, 0.012, 8, 32]} />
                <meshStandardMaterial {...edgeMaterial} />
              </mesh>
            )}
            {/* Neck */}
            <mesh position={[0, 0.42, 0.05]} rotation={[-0.3, 0, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.18, 0.28, 32]} />
              <meshStandardMaterial color={accentColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Head back */}
            <mesh position={[0, 0.6, 0.1]} rotation={[-0.5, 0, 0]} castShadow>
              <boxGeometry args={[0.18, 0.28, 0.22]} />
              <meshStandardMaterial color={baseColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Snout */}
            <mesh position={[0, 0.58, 0.25]} rotation={[-0.2, 0, 0]} castShadow>
              <boxGeometry args={[0.12, 0.14, 0.2]} />
              <meshStandardMaterial color={accentColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Mane edge line for black pieces */}
            {!isWhite && (
              <mesh position={[0, 0.68, -0.02]} rotation={[-0.4, 0, 0]}>
                <boxGeometry args={[0.02, 0.25, 0.08]} />
                <meshStandardMaterial {...edgeMaterial} />
              </mesh>
            )}
            {/* Ears */}
            <mesh position={[-0.06, 0.75, 0.05]} rotation={[-0.3, -0.2, 0]} castShadow>
              <coneGeometry args={[0.04, 0.1, 8]} />
              <meshStandardMaterial color={baseColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            <mesh position={[0.06, 0.75, 0.05]} rotation={[-0.3, 0.2, 0]} castShadow>
              <coneGeometry args={[0.04, 0.1, 8]} />
              <meshStandardMaterial color={baseColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Eye */}
            <mesh position={[0.08, 0.62, 0.18]} castShadow>
              <sphereGeometry args={[0.025, 12, 12]} />
              <meshStandardMaterial color={isWhite ? '#1a1a1a' : '#ffffff'} metalness={0.8} roughness={0.1} />
            </mesh>
            <mesh position={[-0.08, 0.62, 0.18]} castShadow>
              <sphereGeometry args={[0.025, 12, 12]} />
              <meshStandardMaterial color={isWhite ? '#1a1a1a' : '#ffffff'} metalness={0.8} roughness={0.1} />
            </mesh>
          </group>
        );
      case 'p': // Pawn - simple small piece
        return (
          <group>
            {/* Base */}
            <mesh position={[0, 0.06, 0]} castShadow>
              <cylinderGeometry args={[0.25, 0.28, 0.12, 32]} />
              <meshStandardMaterial color={baseColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Edge line - base top */}
            {!isWhite && (
              <mesh position={[0, 0.12, 0]}>
                <torusGeometry args={[0.25, 0.01, 8, 32]} />
                <meshStandardMaterial {...edgeMaterial} />
              </mesh>
            )}
            {/* Lower body */}
            <mesh position={[0, 0.18, 0]} castShadow>
              <cylinderGeometry args={[0.18, 0.25, 0.14, 32]} />
              <meshStandardMaterial color={baseColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Edge line - lower body top */}
            {!isWhite && (
              <mesh position={[0, 0.25, 0]}>
                <torusGeometry args={[0.18, 0.01, 8, 32]} />
                <meshStandardMaterial {...edgeMaterial} />
              </mesh>
            )}
            {/* Middle body */}
            <mesh position={[0, 0.32, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.18, 0.16, 32]} />
              <meshStandardMaterial color={accentColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Neck ring */}
            <mesh position={[0, 0.42, 0]} castShadow>
              <torusGeometry args={[0.09, 0.025, 12, 24]} />
              <meshStandardMaterial color={highlightColor} metalness={0.4} roughness={0.3} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 0.52, 0]} castShadow>
              <sphereGeometry args={[0.12, 24, 24]} />
              <meshStandardMaterial color={baseColor} metalness={metalness} roughness={roughness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
          </group>
        );
      default:
        return null;
    }
  };

  return (
    <group position={position} onClick={onClick}>
      {/* Square highlight */}
      {(isSelected || isValidMove) && (
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[0.9, 0.02, 0.9]} />
          <meshBasicMaterial
            color={isSelected ? '#00ff00' : '#4444ff'}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
      {/* Chess piece */}
      {piece && getPieceGeometry(piece.type)}
    </group>
  );
}

// 3D Chess Board Component
function ChessBoard3D({
  pieces,
  selectedSquare,
  validMoves,
  onSquareClick,
  myColor
}: {
  pieces: ChessPiece[];
  selectedSquare: string | null;
  validMoves: string[];
  onSquareClick: (square: string) => void;
  myColor: 'white' | 'black';
}) {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

  // Flip board if playing as black
  const displayFiles = myColor === 'black' ? [...files].reverse() : files;
  const displayRanks = myColor === 'black' ? ranks : [...ranks].reverse();

  const getPieceAtSquare = (square: string): ChessPiece | null => {
    return pieces.find(p => p.square === square) || null;
  };

  return (
    <group>
      {/* Board base */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[9, 0.2, 9]} />
        <meshStandardMaterial color="#5c3d2e" />
      </mesh>

      {/* Squares and pieces */}
      {displayRanks.map((rank, ri) =>
        displayFiles.map((file, fi) => {
          const square = `${file}${rank}`;
          const isLight = (fi + ri) % 2 === 0;
          const x = fi - 3.5;
          const z = ri - 3.5;
          const piece = getPieceAtSquare(square);
          const isSelected = selectedSquare === square;
          const isValidMove = validMoves.includes(square);

          return (
            <group key={square}>
              {/* Square */}
              <mesh
                position={[x, 0.005, z]}
                onClick={() => onSquareClick(square)}
              >
                <boxGeometry args={[0.98, 0.01, 0.98]} />
                <meshStandardMaterial color={isLight ? '#f0d9b5' : '#b58863'} />
              </mesh>

              {/* Piece */}
              <ChessPiece3D
                piece={piece}
                position={[x, 0, z]}
                isSelected={isSelected}
                isValidMove={isValidMove}
                onClick={() => onSquareClick(square)}
              />
            </group>
          );
        })
      )}
    </group>
  );
}

// Leaderboard Component
function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const usersRef = ref(db, 'users');


    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.values(data) as User[];
        // 승률 기준 정렬 (게임 수가 0인 경우 제외)
        const sortedUsers = userList
          .map(user => ({
            ...user,
            wins: user.wins || 0,
            losses: user.losses || 0,
            draws: user.draws || 0,
          }))
          .filter(user => (user.wins + user.losses + user.draws) > 0)
          .sort((a, b) => {
            const totalA = a.wins + a.losses + a.draws;
            const totalB = b.wins + b.losses + b.draws;
            const winRateA = totalA > 0 ? a.wins / totalA : 0;
            const winRateB = totalB > 0 ? b.wins / totalB : 0;

            // 승률이 같으면 승리 수로 정렬
            if (winRateB === winRateA) {
              return b.wins - a.wins;
            }
            return winRateB - winRateA;
          })
          .slice(0, 10); // 상위 10명

        setUsers(sortedUsers);
      } else {
        setUsers([]);
      }
      setIsLoading(false);
    });

    return () => off(usersRef);
  }, []);

  const getWinRate = (user: User) => {
    const total = (user.wins || 0) + (user.losses || 0) + (user.draws || 0);
    if (total === 0) return 0;
    return Math.round(((user.wins || 0) / total) * 100);
  };

  const getRankClass = (index: number) => {
    if (index === 0) return 'rank-gold';
    if (index === 1) return 'rank-silver';
    if (index === 2) return 'rank-bronze';
    return '';
  };

  const getRankEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  if (isLoading) {
    return (
      <div className="leaderboard">
        <h3 className="leaderboard-title">🏆 전적 순위표</h3>
        <p className="leaderboard-loading">로딩 중...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="leaderboard">
        <h3 className="leaderboard-title">🏆 전적 순위표</h3>
        <p className="leaderboard-empty">아직 게임 기록이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <h3 className="leaderboard-title">🏆 전적 순위표</h3>
      <div className="leaderboard-table">
        <div className="leaderboard-header">
          <span className="col-rank">순위</span>
          <span className="col-name">닉네임</span>
          <span className="col-wins">승</span>
          <span className="col-losses">패</span>
          <span className="col-draws">무</span>
          <span className="col-rate">승률</span>
        </div>
        {users.map((user, index) => (
          <div key={user.id} className={`leaderboard-row ${getRankClass(index)}`}>
            <span className="col-rank">{getRankEmoji(index)}</span>
            <span className="col-name" title={user.nickname}>{user.nickname}</span>
            <span className="col-wins">{user.wins || 0}</span>
            <span className="col-losses">{user.losses || 0}</span>
            <span className="col-draws">{user.draws || 0}</span>
            <span className="col-rate">{getWinRate(user)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Timer Component

function Timer({ timeLeft, isMyTurn }: { timeLeft: number; isMyTurn: boolean }) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`timer ${isMyTurn ? 'active' : ''} ${timeLeft <= 10 ? 'warning' : ''}`}>
      <span className="timer-label">{isMyTurn ? '내 차례' : '상대 차례'}</span>
      <span className="timer-value">{formatTime(timeLeft)}</span>
    </div>
  );
}

// Chat Component
function Chat({
  messages,
  onSendMessage,
  myName
}: {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  myName: string;
}) {
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`chat-container ${isOpen ? 'open' : 'closed'}`}>
      <button className="chat-toggle" onClick={() => setIsOpen(!isOpen)}>
        💬 {isOpen ? '채팅 닫기' : '채팅 열기'}
        {!isOpen && messages.length > 0 && (
          <span className="chat-badge">{messages.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="chat-panel">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <p className="chat-empty">메시지가 없습니다</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-message ${msg.senderName === myName ? 'mine' : 'theirs'}`}
                >
                  <span className="chat-sender">{msg.senderName}</span>
                  <span className="chat-text">{msg.text}</span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-area">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지 입력..."
              maxLength={100}
            />
            <button onClick={handleSend} className="chat-send">
              전송
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Paused Overlay Component - 상대방 연결 끊김 시 표시
function PausedOverlay({ disconnectedAt }: { disconnectedAt: number }) {
  const [remainingTime, setRemainingTime] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - disconnectedAt) / 1000);
      const remaining = Math.max(0, 60 - elapsed);
      setRemainingTime(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [disconnectedAt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="paused-overlay">
      <div className="paused-content">
        <div className="paused-icon">⏳</div>
        <h2>상대방 연결 대기 중...</h2>
        <div className="paused-timer">{formatTime(remainingTime)}</div>
        <p>상대방이 1분 내로 돌아오지 않으면<br />자동으로 승리합니다</p>
      </div>
    </div>
  );
}

// Result Popup Component
function ResultPopup({
  winner,
  isHost,
  hostNickname,
  guestNickname,
  onPlayAgain
}: {
  winner: 'host' | 'guest' | 'draw';
  isHost: boolean;
  hostNickname: string;
  guestNickname: string;
  onPlayAgain: () => void;
}) {
  const getResultMessage = () => {
    if (winner === 'draw') return '무승부!';
    const winnerName = winner === 'host' ? hostNickname : guestNickname;
    const iWon = (winner === 'host' && isHost) || (winner === 'guest' && !isHost);
    return iWon ? '🎉 승리!' : `${winnerName} 승리`;
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h2>{getResultMessage()}</h2>
        <p>패자가 다음 게임에서 선공합니다</p>
        <button onClick={onPlayAgain} className="btn-primary">
          다시 하기
        </button>
      </div>
    </div>
  );
}

// Simple hash function for password (for demo purposes - use proper hashing in production!)
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

// Lobby Component
function Lobby({
  onCreateRoom,
  onJoinRoom
}: {
  onCreateRoom: (nickname: string, isPrivate: boolean) => void;
  onJoinRoom: (code: string, nickname: string) => void;
}) {
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'register' | 'login'>('menu');
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);

  // Auth states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('chessUser');
    if (savedUser) {
      const user = JSON.parse(savedUser) as User;
      setCurrentUser(user);
      setNickname(user.nickname);
      setIsLoggedIn(true);
    }
  }, []);

  // 공개 방 목록 실시간 구독
  useEffect(() => {
    const roomsRef = ref(db, 'rooms');

    onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const roomList = Object.values(data) as Room[];
        const now = Date.now();

        // 공개 방 필터링:
        // 1. 대기 중 + 게스트 없음 + 호스트 활성 (1분 이내)
        // 2. 일시정지 상태 + 누군가 활성 (2분 이내)
        const openRooms = roomList.filter(room => {
          if (room.isPrivate) return false;

          // 대기 중인 방: 호스트가 1분 이상 비활성이면 제외
          if (room.status === 'waiting' && !room.guestId) {
            const hostInactive = (now - room.hostLastActive) > 60000; // 1분
            return !hostInactive;
          }

          // 일시정지 방: 양쪽 모두 2분 이상 비활성이면 제외
          if (room.status === 'paused' && room.disconnectedPlayer) {
            const hostInactive = (now - room.hostLastActive) > 120000; // 2분
            const guestInactive = (now - room.guestLastActive) > 120000; // 2분
            return !(hostInactive && guestInactive);
          }

          return false;
        }).sort((a, b) => b.createdAt - a.createdAt); // 최신순
        setAvailableRooms(openRooms);
      } else {
        setAvailableRooms([]);
      }
    });

    return () => off(roomsRef);
  }, []);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('chessUser');
    if (savedUser) {
      const user = JSON.parse(savedUser) as User;
      setCurrentUser(user);
      setNickname(user.nickname);
      setIsLoggedIn(true);
    }
  }, []);

  const handleCreate = () => {
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요');
      return;
    }
    onCreateRoom(nickname.trim(), isPrivate);
  };

  const handleJoin = () => {
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요');
      return;
    }
    if (roomCode.length !== 5) {
      setError('5자리 코드를 입력해주세요');
      return;
    }
    onJoinRoom(roomCode, nickname.trim());
  };

  // Handle Registration
  const handleRegister = async () => {
    setError('');
    setSuccess('');

    if (!username.trim()) {
      setError('아이디를 입력해주세요');
      return;
    }
    if (username.length < 4) {
      setError('아이디는 4자 이상이어야 합니다');
      return;
    }
    if (!password) {
      setError('비밀번호를 입력해주세요');
      return;
    }
    if (password.length < 4) {
      setError('비밀번호는 4자 이상이어야 합니다');
      return;
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }
    if (adminCode.length !== 4) {
      setError('4자리 관리자 코드를 입력해주세요');
      return;
    }
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요');
      return;
    }

    setIsLoading(true);

    try {
      // Check admin code
      const configRef = ref(db, 'config/registrationCode');
      const configSnapshot = await get(configRef);
      const validCode = configSnapshot.val() || '1234'; // Default to "1234" if not set

      if (validCode !== adminCode) {
        setError('관리자 코드가 올바르지 않습니다');
        setIsLoading(false);
        return;
      }

      // Check if username already exists
      const usersRef = ref(db, 'users');
      const usersSnapshot = await get(usersRef);
      const users = usersSnapshot.val() || {};

      const usernameExists = Object.values(users).some(
        (user: unknown) => (user as User).username === username.toLowerCase()
      );

      if (usernameExists) {
        setError('이미 존재하는 아이디입니다');
        setIsLoading(false);
        return;
      }

      // Create new user
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newUser: User = {
        id: userId,
        username: username.toLowerCase(),
        passwordHash: simpleHash(password),
        nickname: nickname.trim(),
        createdAt: Date.now(),
        wins: 0,
        losses: 0,
        draws: 0
      };


      await set(ref(db, `users/${userId}`), newUser);

      setSuccess('회원가입이 완료되었습니다! 로그인해주세요.');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setAdminCode('');

      // Switch to login mode after 2 seconds
      setTimeout(() => {
        setMode('login');
        setSuccess('');
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      setError('회원가입 중 오류가 발생했습니다');
    }

    setIsLoading(false);
  };

  // Handle Login
  const handleLogin = async () => {
    setError('');

    if (!username.trim()) {
      setError('아이디를 입력해주세요');
      return;
    }
    if (!password) {
      setError('비밀번호를 입력해주세요');
      return;
    }

    setIsLoading(true);

    try {
      const usersRef = ref(db, 'users');
      const usersSnapshot = await get(usersRef);
      const users = usersSnapshot.val() || {};

      const foundUser = Object.values(users).find(
        (user: unknown) => (user as User).username === username.toLowerCase()
      ) as User | undefined;

      if (!foundUser) {
        setError('존재하지 않는 아이디입니다');
        setIsLoading(false);
        return;
      }

      if (foundUser.passwordHash !== simpleHash(password)) {
        setError('비밀번호가 올바르지 않습니다');
        setIsLoading(false);
        return;
      }

      // Login successful
      setCurrentUser(foundUser);
      setNickname(foundUser.nickname);
      setIsLoggedIn(true);
      localStorage.setItem('chessUser', JSON.stringify(foundUser));
      setMode('menu');
      setUsername('');
      setPassword('');

    } catch (err) {
      console.error('Login error:', err);
      setError('로그인 중 오류가 발생했습니다');
    }

    setIsLoading(false);
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setNickname('');
    localStorage.removeItem('chessUser');
  };

  return (
    <div className="lobby">
      <h1 className="title">♔ 3D 체스 온라인 ♚</h1>

      {/* User Status */}
      {isLoggedIn && currentUser && (
        <div className="user-status">
          <span className="user-welcome">👋 {currentUser.nickname}님 환영합니다!</span>
          <button onClick={handleLogout} className="btn-logout">로그아웃</button>
        </div>
      )}

      {mode === 'menu' && (
        <div className="lobby-content">
          <div className="menu-buttons">
            <button onClick={() => setMode('create')} className="btn-primary">
              방 만들기
            </button>
            <button onClick={() => setMode('join')} className="btn-secondary">
              방 참가하기
            </button>
            {!isLoggedIn && (
              <>
                <div className="menu-divider">
                  <span>계정</span>
                </div>
                <button onClick={() => setMode('login')} className="btn-auth">
                  🔑 로그인
                </button>
                <button onClick={() => setMode('register')} className="btn-auth-secondary">
                  📝 회원가입
                </button>
              </>
            )}
          </div>
          <Leaderboard />
        </div>
      )}


      {mode === 'create' && (
        <div className="form">
          <h2>방 만들기</h2>
          <input
            type="text"
            placeholder="닉네임 입력"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={10}
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            <span>🔒 비공개 방</span>
          </label>
          {error && <p className="error">{error}</p>}
          <div className="form-buttons">
            <button onClick={handleCreate} className="btn-primary">생성</button>
            <button onClick={() => { setMode('menu'); setError(''); setIsPrivate(false); }} className="btn-secondary">취소</button>
          </div>
        </div>
      )}

      {mode === 'join' && (
        <div className="form join-form">
          <h2>방 참가하기</h2>

          {/* 공개 방 목록 */}
          {availableRooms.length > 0 && (
            <div className="room-list">
              <h3>📋 참가 가능한 방</h3>
              <div className="room-list-items">
                {availableRooms.slice(0, 5).map((room) => (
                  <div
                    key={room.code}
                    className={`room-item ${room.status === 'paused' ? 'room-paused' : ''}`}
                    onClick={() => setRoomCode(room.code)}
                  >
                    <span className="room-host">
                      {room.status === 'paused' ? '⏳' : '🎲'} {room.hostNickname}
                      {room.status === 'paused' && (
                        <span className="room-status-badge">재접속</span>
                      )}
                    </span>
                    <span className="room-code-badge">{room.code}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {availableRooms.length === 0 && (
            <div className="room-list-empty">
              <p>현재 대기 중인 공개 방이 없습니다</p>
            </div>
          )}

          <div className="divider">
            <span>또는 코드로 참가</span>
          </div>

          <input
            type="text"
            placeholder="닉네임 입력"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={10}
          />
          <input
            type="number"
            placeholder="5자리 코드"
            value={roomCode}
            onChange={(e) => {
              const val = e.target.value.slice(0, 5);
              setRoomCode(val);
            }}
            maxLength={5}
            style={{ appearance: 'textfield' }}
          />
          {error && <p className="error">{error}</p>}
          <div className="form-buttons">
            <button onClick={handleJoin} className="btn-primary">참가</button>
            <button onClick={() => { setMode('menu'); setError(''); setRoomCode(''); }} className="btn-secondary">취소</button>
          </div>
        </div>
      )}

      {mode === 'register' && (
        <div className="form auth-form">
          <h2>📝 회원가입</h2>
          <input
            type="text"
            placeholder="아이디 (4자 이상)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={20}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="비밀번호 (4자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={30}
            autoComplete="new-password"
          />
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            maxLength={30}
            autoComplete="new-password"
          />
          <input
            type="text"
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={10}
          />
          <input
            type="text"
            placeholder="관리자 코드 (4자리)"
            value={adminCode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 4);
              setAdminCode(val);
            }}
            maxLength={4}
            className="code-input"
          />
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <div className="form-buttons">
            <button onClick={handleRegister} className="btn-primary" disabled={isLoading}>
              {isLoading ? '처리 중...' : '가입하기'}
            </button>
            <button onClick={() => { setMode('menu'); setError(''); setSuccess(''); }} className="btn-secondary">
              취소
            </button>
          </div>
          <p className="auth-switch">
            이미 계정이 있으신가요? <span onClick={() => { setMode('login'); setError(''); }}>로그인</span>
          </p>
        </div>
      )}

      {mode === 'login' && (
        <div className="form auth-form">
          <h2>🔑 로그인</h2>
          <input
            type="text"
            placeholder="아이디"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={20}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={30}
            autoComplete="current-password"
          />
          {error && <p className="error">{error}</p>}
          <div className="form-buttons">
            <button onClick={handleLogin} className="btn-primary" disabled={isLoading}>
              {isLoading ? '처리 중...' : '로그인'}
            </button>
            <button onClick={() => { setMode('menu'); setError(''); }} className="btn-secondary">
              취소
            </button>
          </div>
          <p className="auth-switch">
            계정이 없으신가요? <span onClick={() => { setMode('register'); setError(''); }}>회원가입</span>
          </p>
        </div>
      )}

      {/* Footer Credit */}
      <div className="credit-footer">
        <span>Crafted by</span>
        <span className="credit-name">T.MIN</span>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [_waiting, setWaiting] = useState(false);
  const [error, setError] = useState('');

  const [chess] = useState(new Chess());
  const [pieces, setPieces] = useState<ChessPiece[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showResult, setShowResult] = useState(false);
  const [recordUpdated, setRecordUpdated] = useState(false);
  const [myRecord, setMyRecord] = useState<{ wins: number; losses: number } | null>(null);

  const timerRef = useRef<number | null>(null);
  const roomRef = useRef<ReturnType<typeof ref> | null>(null);

  // 내 전적 가져오기
  useEffect(() => {
    const savedUser = localStorage.getItem('chessUser');
    if (savedUser) {
      const user = JSON.parse(savedUser) as User;
      setMyRecord({ wins: user.wins || 0, losses: user.losses || 0 });
    }
  }, [room?.winner]); // winner 변경 시 전적 업데이트 반영

  // 게임 종료 시 전적 업데이트
  const updatePlayerRecord = useCallback(async (winner: 'host' | 'guest' | 'draw') => {
    // localStorage에서 로그인된 유저 정보 확인
    const savedUser = localStorage.getItem('chessUser');
    if (!savedUser) return; // 비로그인 유저는 전적 기록 안함

    const currentUser = JSON.parse(savedUser) as User;

    try {
      // Firebase에서 해당 유저 정보 가져오기
      const userRef = ref(db, `users/${currentUser.id}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val() as User | null;

      if (!userData) return;

      // 내가 호스트인지 게스트인지 확인하고 전적 계산
      const iAmHost = isHost;
      let newWins = userData.wins || 0;
      let newLosses = userData.losses || 0;
      let newDraws = userData.draws || 0;

      if (winner === 'draw') {
        newDraws++;
      } else if ((winner === 'host' && iAmHost) || (winner === 'guest' && !iAmHost)) {
        // 내가 이김
        newWins++;
      } else {
        // 내가 짐
        newLosses++;
      }

      // Firebase 업데이트
      await set(userRef, {
        ...userData,
        wins: newWins,
        losses: newLosses,
        draws: newDraws
      });

      // localStorage도 업데이트
      localStorage.setItem('chessUser', JSON.stringify({
        ...currentUser,
        wins: newWins,
        losses: newLosses,
        draws: newDraws
      }));

      console.log('전적 업데이트 완료:', { wins: newWins, losses: newLosses, draws: newDraws });
    } catch (error) {
      console.error('전적 업데이트 실패:', error);
    }
  }, [isHost]);

  // 게임 결과 감지 및 전적 업데이트
  useEffect(() => {
    if (room?.winner && !recordUpdated) {
      updatePlayerRecord(room.winner);
      setRecordUpdated(true);
    }
    // 새 게임 시작 시 recordUpdated 리셋
    if (room?.status === 'playing' && recordUpdated) {
      setRecordUpdated(false);
    }
  }, [room?.winner, room?.status, recordUpdated, updatePlayerRecord]);

  // 하트비트 시스템 - 3초마다 lastActive 업데이트 (더 자주)
  useEffect(() => {
    if (!room || !roomRef.current || room.status === 'finished') return;
    if (room.status !== 'playing' && room.status !== 'paused') return;

    // 즉시 하트비트 한 번 보내기
    const sendHeartbeat = async () => {
      if (!roomRef.current || !room) return;
      const fieldToUpdate = isHost ? 'hostLastActive' : 'guestLastActive';
      await set(ref(db, `rooms/${room.code}/${fieldToUpdate}`), Date.now());
    };

    sendHeartbeat(); // 즉시 실행

    const heartbeat = setInterval(sendHeartbeat, 3000); // 3초마다

    return () => clearInterval(heartbeat);
  }, [room?.code, room?.status, isHost]);

  // 연결 끊김 감지 및 처리
  useEffect(() => {
    if (!room || !roomRef.current) return;
    if (room.status !== 'playing' && room.status !== 'paused') return;

    const checkConnection = setInterval(async () => {
      if (!roomRef.current || !room) return;

      const now = Date.now();
      const opponentLastActive = isHost ? room.guestLastActive : room.hostLastActive;
      const timeSinceActive = now - opponentLastActive;

      // 상대방이 20초 이상 응답 없음 - 게임 일시정지 (여유롭게)
      if (timeSinceActive > 20000 && room.status === 'playing' && !room.disconnectedPlayer) {
        await set(roomRef.current, {
          ...room,
          status: 'paused',
          disconnectedPlayer: isHost ? 'guest' : 'host',
          disconnectedAt: now
        });
      }

      // 일시정지 상태에서 60초 초과 - 자동 승리
      if (room.status === 'paused' && room.disconnectedAt) {
        const pausedDuration = now - room.disconnectedAt;
        if (pausedDuration > 60000) {
          // 나간 사람이 지고, 남은 사람이 이김
          const winner = room.disconnectedPlayer === 'host' ? 'guest' : 'host';
          await set(roomRef.current, {
            ...room,
            status: 'finished',
            winner: winner,
            previousLoser: room.disconnectedPlayer,
            disconnectedPlayer: null,
            disconnectedAt: null
          });
        }
      }

      // 상대방이 다시 연결됨 - 게임 재개 (15초 이내면 복귀)
      if (room.status === 'paused' && timeSinceActive < 15000 && room.disconnectedPlayer) {
        await set(roomRef.current, {
          ...room,
          status: 'playing',
          disconnectedPlayer: null,
          disconnectedAt: null
        });
      }
    }, 3000); // 3초마다 체크

    return () => clearInterval(checkConnection);
  }, [room, isHost]);

  // Initialize anonymous auth
  useEffect(() => {
    signInAnonymously(auth)
      .then((result) => {
        setPlayerId(result.user.uid);
      })
      .catch((error) => {
        console.error('Auth error:', error);
        setError('인증 오류가 발생했습니다');
      });
  }, []);

  // Convert chess.js board to pieces array
  const updatePieces = useCallback(() => {
    const board = chess.board();
    const newPieces: ChessPiece[] = [];

    board.forEach((row, ri) => {
      row.forEach((piece, fi) => {
        if (piece) {
          const file = String.fromCharCode(97 + fi);
          const rank = (8 - ri).toString();
          newPieces.push({
            type: piece.type as ChessPiece['type'],
            color: piece.color as ChessPiece['color'],
            square: `${file}${rank}`
          });
        }
      });
    });

    setPieces(newPieces);
  }, [chess]);

  // Get my color based on host status and game rules
  const getMyColor = useCallback((): 'white' | 'black' => {
    if (!room) return 'white';

    // First game: host is white
    // After game: loser starts as white
    if (room.previousLoser === 'host') {
      return isHost ? 'white' : 'black';
    } else if (room.previousLoser === 'guest') {
      return isHost ? 'black' : 'white';
    }
    return isHost ? 'white' : 'black';
  }, [room, isHost]);

  // Check if it's my turn
  const isMyTurn = useCallback((): boolean => {
    if (!room || room.status !== 'playing') return false;
    const myColor = getMyColor();
    return room.currentTurn === myColor;
  }, [room, getMyColor]);

  // Timer effect with auto-move
  const autoMovedRef = useRef(false);

  useEffect(() => {
    if (room?.status === 'playing' && room.turnStartTime) {
      autoMovedRef.current = false; // Reset when turn changes

      const updateTimer = () => {
        const elapsed = Math.floor((Date.now() - room.turnStartTime) / 1000);
        const remaining = Math.max(0, 30 - elapsed);
        setTimeLeft(remaining);

        // Auto-move if time runs out and it's my turn (only once)
        if (remaining === 0 && isMyTurn() && !autoMovedRef.current) {
          autoMovedRef.current = true;

          // 현재 FEN에서 턴을 올바르게 설정
          const currentFen = chess.fen();
          const fenParts = currentFen.split(' ');
          const myColor = getMyColor();
          fenParts[1] = myColor === 'white' ? 'w' : 'b';
          chess.load(fenParts.join(' '));

          // Get random move and execute
          const moves = chess.moves({ verbose: true });
          if (moves.length > 0) {
            const randomMove = moves[Math.floor(Math.random() * moves.length)];

            // 직접 기물 이동 (handleMove와 동일한 방식)
            const piece = chess.get(randomMove.from as any);
            if (piece) {
              // 목표 위치 기물 제거 (캡처)
              const targetPiece = chess.get(randomMove.to as any);
              if (targetPiece) {
                chess.remove(randomMove.to as any);
              }

              // 기존 위치 제거
              chess.remove(randomMove.from as any);

              // 새 위치에 배치 (프로모션 처리)
              const newPiece = {
                ...piece,
                type: piece.type === 'p' && randomMove.to[1] === (piece.color === 'w' ? '8' : '1') ? 'q' : piece.type
              };
              chess.put(newPiece as any, randomMove.to as any);

              // FEN 턴 변경
              const newTurn = room.currentTurn === 'white' ? 'black' : 'white';
              const updatedFen = chess.fen();
              const updatedFenParts = updatedFen.split(' ');
              updatedFenParts[1] = newTurn === 'white' ? 'w' : 'b';
              const finalFen = updatedFenParts.join(' ');
              chess.load(finalFen);

              updatePieces();
              setSelectedSquare(null);
              setValidMoves([]);

              set(ref(db, `rooms/${room.code}`), {
                ...room,
                fen: finalFen,
                currentTurn: newTurn,
                turnStartTime: Date.now(),
                lastMove: { from: randomMove.from, to: randomMove.to },
                status: 'playing',
                winner: null
              });
            }
          }
        }
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [room?.turnStartTime, room?.status, room?.currentTurn, isMyTurn, chess, updatePieces, room, getMyColor]);

  // Handle move
  const handleMove = async (from: string, to: string) => {
    if (!room || !playerId) return;

    try {
      // 강제 이동: 체스 규칙을 무시하고 직접 말 이동
      const piece = chess.get(from as any);
      if (!piece) return; // 이동할 말이 없으면 중단

      // 목표 위치에 있는 기물 제거 (캡처)
      const targetPiece = chess.get(to as any);
      if (targetPiece) {
        chess.remove(to as any);
      }

      // 기존 위치 제거
      chess.remove(from as any);
      // 새로운 위치에 말 배치 (프로모션은 퀸으로 고정)
      const newPiece = { ...piece, type: piece.type === 'p' && to[1] === (piece.color === 'w' ? '8' : '1') ? 'q' : piece.type };
      chess.put(newPiece as any, to as any);

      // FEN 문자열의 턴 부분을 수정하여 chess.js 내부 상태 동기화
      const newTurn = room.currentTurn === 'white' ? 'black' : 'white';
      const currentFen = chess.fen();
      const fenParts = currentFen.split(' ');
      fenParts[1] = newTurn === 'white' ? 'w' : 'b'; // 턴 변경
      const newFen = fenParts.join(' ');
      chess.load(newFen);

      // UI와 DB 업데이트
      updatePieces();
      setSelectedSquare(null);
      setValidMoves([]);

      await set(roomRef.current!, {
        ...room,
        fen: newFen,
        currentTurn: newTurn,
        turnStartTime: Date.now(),
        lastMove: { from, to },
        status: 'playing',
        winner: null,
      });
    } catch (e) {
      console.error('Move error:', e);
    }
  };

  // Handle square click
  const handleSquareClick = (square: string) => {
    if (!room || room.status !== 'playing' || !isMyTurn()) return;

    if (selectedSquare) {
      if (validMoves.includes(square)) {
        handleMove(selectedSquare, square);
      } else {
        // Select new piece
        const piece = chess.get(square as any);
        if (piece && ((piece.color === 'w' && getMyColor() === 'white') ||
          (piece.color === 'b' && getMyColor() === 'black'))) {
          setSelectedSquare(square);
          const moves = chess.moves({ square: square as any, verbose: true });
          setValidMoves(moves.map(m => m.to));
        } else {
          setSelectedSquare(null);
          setValidMoves([]);
        }
      }
    } else {
      const piece = chess.get(square as any);
      if (piece && ((piece.color === 'w' && getMyColor() === 'white') ||
        (piece.color === 'b' && getMyColor() === 'black'))) {
        setSelectedSquare(square);
        const moves = chess.moves({ square: square as any, verbose: true });
        setValidMoves(moves.map(m => m.to));
      }
    }
  };

  // Create room
  const createRoom = async (nickname: string, isPrivate: boolean = false) => {
    if (!playerId) return;

    // 내 전적 가져오기
    const savedUser = localStorage.getItem('chessUser');
    const myRecord = savedUser
      ? { wins: (JSON.parse(savedUser) as User).wins || 0, losses: (JSON.parse(savedUser) as User).losses || 0 }
      : undefined;

    const code = generateRoomCode();
    const newRoom: Room = {
      code,
      hostId: playerId,
      hostNickname: nickname,
      hostRecord: myRecord,
      guestId: null,
      guestNickname: null,
      guestRecord: null,
      guestReady: false,
      status: 'waiting',
      currentTurn: 'white',
      turnStartTime: Date.now(),
      fen: chess.fen(),
      lastMove: null,
      winner: null,
      loserStarts: false,
      previousLoser: null,
      hostLastActive: Date.now(),
      guestLastActive: 0,
      disconnectedPlayer: null,
      disconnectedAt: null,
      isPrivate: isPrivate,
      createdAt: Date.now()
    };

    roomRef.current = ref(db, `rooms/${code}`);
    await set(roomRef.current, newRoom);

    setRoom(newRoom);
    setIsHost(true);
    setWaiting(true);
    updatePieces();

    // Listen for updates
    onValue(roomRef.current, (snapshot) => {
      const data = snapshot.val() as Room;
      if (data) {
        setRoom(data);
        chess.load(data.fen);
        updatePieces();

        // Guest joined - exit waiting screen
        if (data.guestId) {
          setWaiting(false);
        }
        if (data.status === 'playing') {
          setWaiting(false);
        }
        if (data.winner) {
          setShowResult(true);
        }
      }
    });
  };

  // Join room
  const joinRoom = async (code: string, nickname: string) => {
    if (!playerId) return;

    // 내 전적 가져오기
    const savedUser = localStorage.getItem('chessUser');
    const myRecord = savedUser
      ? { wins: (JSON.parse(savedUser) as User).wins || 0, losses: (JSON.parse(savedUser) as User).losses || 0 }
      : undefined;

    roomRef.current = ref(db, `rooms/${code}`);

    // Check if room exists
    onValue(roomRef.current, async (snapshot) => {
      const data = snapshot.val() as Room;

      if (!data) {
        setError('방을 찾을 수 없습니다');
        off(roomRef.current!);
        return;
      }

      if (data.guestId && data.guestId !== playerId) {
        setError('방이 가득 찼습니다');
        off(roomRef.current!);
        return;
      }

      // Join room - keep as 'waiting', guest needs to click ready
      if (!data.guestId) {
        const updatedRoom = {
          ...data,
          guestId: playerId,
          guestNickname: nickname,
          guestRecord: myRecord || null,
          guestReady: false,
          status: 'waiting' as const,
          guestLastActive: Date.now()
        };
        await set(roomRef.current!, updatedRoom);
        // Don't setRoom here, will be updated by onValue listener on next trigger
        return;
      }

      // Update room state with latest data (including guestId)
      setRoom(data);
      setIsHost(false);
      chess.load(data.fen);
      updatePieces();
    });
  };

  // Play again
  const handlePlayAgain = async () => {
    if (!room || !roomRef.current) return;

    chess.reset();
    updatePieces();

    await set(roomRef.current, {
      ...room,
      fen: chess.fen(),
      currentTurn: 'white',
      turnStartTime: Date.now(),
      lastMove: null,
      status: 'playing',
      winner: null
    });

    setShowResult(false);
    setSelectedSquare(null);
    setValidMoves([]);
  };

  // Resign button handler
  const handleResign = async () => {
    if (!room || !roomRef.current) return;
    if (room.status !== 'playing') return;

    // 확인 대화 상자
    if (!window.confirm('정말 기권하시겠습니까? 상대방에게 승리를 넘기게 됩니다.')) {
      return;
    }

    // 기권한 사람이 지고, 상대방이 이김
    const winner = isHost ? 'guest' : 'host';
    const loser = isHost ? 'host' : 'guest';

    await set(roomRef.current, {
      ...room,
      status: 'finished',
      winner: winner,
      previousLoser: loser
    });
  };

  // Go Home button handler
  const handleGoHome = async () => {
    if (!room || !roomRef.current) return;

    // 게임 중이면 경고
    if (room.status === 'playing' || room.status === 'paused') {
      if (!window.confirm('게임을 나가면 패배 처리됩니다. 정말 나가시겠습니까?')) {
        return;
      }

      // 나간 사람이 패배
      const winner = isHost ? 'guest' : 'host';
      const loser = isHost ? 'host' : 'guest';

      await set(roomRef.current, {
        ...room,
        status: 'finished',
        winner: winner,
        previousLoser: loser
      });
    } else {
      // 대기 중이면 그냥 방 삭제 또는 나가기
      if (isHost) {
        await remove(roomRef.current);
      } else {
        await set(roomRef.current, {
          ...room,
          guestId: null,
          guestNickname: null,
          guestReady: false
        });
      }
    }

    // 로비로 돌아가기
    setRoom(null);
    setIsHost(false);
    setWaiting(false);
    setShowResult(false);
    setSelectedSquare(null);
    setValidMoves([]);
    chess.reset();
    updatePieces();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    roomRef.current = null;
  };

  // Guest ready button
  const handleGuestReady = async () => {
    if (!room || !roomRef.current || isHost) return;

    await set(roomRef.current, {
      ...room,
      guestReady: true,
      status: 'ready'  // Now host can start the game
    });
  };

  // Start game (host only)
  const handleStartGame = async () => {
    if (!room || !roomRef.current || !isHost) return;
    if (!room.guestReady) return; // Can only start if guest is ready

    await set(roomRef.current, {
      ...room,
      status: 'playing',
      turnStartTime: Date.now()
    });
  };

  // Send chat message
  const handleSendMessage = async (text: string) => {
    if (!room || !roomRef.current || !playerId) return;

    const myNickname = isHost ? room.hostNickname : room.guestNickname;
    const newMessage: ChatMessage = {
      id: `${Date.now()}-${playerId}`,
      senderId: playerId,
      senderName: myNickname || 'Unknown',
      text,
      timestamp: Date.now()
    };

    const updatedMessages = [...(room.messages || []), newMessage];

    await set(roomRef.current, {
      ...room,
      messages: updatedMessages
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current && isHost) {
        remove(roomRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isHost]);

  // Render
  if (!playerId) {
    return <div className="loading">로딩 중...</div>;
  }

  if (!room) {
    return <Lobby onCreateRoom={createRoom} onJoinRoom={joinRoom} />;
  }

  // 호스트이고 게스트가 아직 들어오지 않았을 때만 대기 화면 표시
  if (isHost && !room.guestId) {
    return (
      <div className="waiting">
        <button onClick={handleGoHome} className="btn-home-waiting" title="홈으로 돌아가기">
          🏠 홈으로
        </button>
        <h2>대기 중</h2>
        <p>방 코드: <span className="room-code">{room.code}</span></p>
        <p>상대방이 참가하기를 기다리는 중...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="player-info me">
          <span className="nickname">
            {isHost ? room.hostNickname : room.guestNickname}
            {myRecord && (
              <span className="player-record">
                <span className="record-win">{myRecord.wins}승</span>
                <span className="record-loss">{myRecord.losses}패</span>
              </span>
            )}
          </span>
          <span className="color">({getMyColor() === 'white' ? '백' : '흑'})</span>
        </div>
        {/* Timer only shows during playing state */}
        {room.status === 'playing' ? (
          <div className="timer-section">
            <Timer timeLeft={timeLeft} isMyTurn={isMyTurn()} />
            <button onClick={handleResign} className="btn-resign">
              🏳️ 기권
            </button>
            <button onClick={handleGoHome} className="btn-home-game">
              🏠 홈
            </button>
          </div>
        ) : (
          <div className="ready-buttons">
            {/* Guest: Ready Button */}
            {!isHost && room.guestReady !== true && (
              <button onClick={handleGuestReady} className="btn-ready-header">
                ✋ 게임 준비
              </button>
            )}
            {/* Guest: Waiting for host */}
            {!isHost && room.guestReady === true && (
              <div className="ready-status">
                <span>✅ 준비 완료! 호스트 대기중...</span>
              </div>
            )}
            {/* Host: Waiting for guest -> disabled button, Ready -> Start button */}
            {isHost && (
              room.guestReady === true ? (
                <button onClick={handleStartGame} className="btn-start-header">
                  🚀 게임 시작
                </button>
              ) : (
                <button className="btn-waiting-header" disabled>
                  ⏳ 게스트 준비 대기중...
                </button>
              )
            )}
          </div>
        )}
        <div className="player-info opponent">
          <span className="nickname">
            {isHost ? room.guestNickname : room.hostNickname}
            {(() => {
              const opponentRecord = isHost ? room.guestRecord : room.hostRecord;
              return opponentRecord && (
                <span className="player-record">
                  <span className="record-win">{opponentRecord.wins}승</span>
                  <span className="record-loss">{opponentRecord.losses}패</span>
                </span>
              );
            })()}
          </span>
          <span className="color">({getMyColor() === 'white' ? '흑' : '백'})</span>
        </div>
      </div>

      <div className="game-canvas">
        <Canvas shadows camera={{ position: [0, 10, 10], fov: 45 }}>
          {/* Starry space background */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

          {/* Ambient light for base illumination - warmer tone */}
          <ambientLight intensity={0.3} color="#ffe4c4" />

          {/* Main key light - warm sunlight from top-right */}
          <directionalLight
            position={[8, 15, 8]}
            intensity={1.5}
            color="#fff8e7"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-12}
            shadow-camera-right={12}
            shadow-camera-top={12}
            shadow-camera-bottom={-12}
            shadow-bias={-0.0001}
          />

          {/* Fill light - cooler tone from left */}
          <directionalLight
            position={[-8, 10, -8]}
            intensity={0.5}
            color="#b8d4ff"
          />

          {/* Rim/Back light - dramatic edge lighting */}
          <directionalLight
            position={[0, 8, -12]}
            intensity={0.6}
            color="#ffd700"
          />

          {/* Top spotlight for dramatic center focus */}
          <spotLight
            position={[0, 20, 0]}
            angle={0.5}
            penumbra={0.8}
            intensity={0.8}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />

          {/* Accent point lights for piece highlighting */}
          <pointLight position={[5, 6, 5]} intensity={0.3} color="#ff6b6b" distance={15} />
          <pointLight position={[-5, 6, -5]} intensity={0.3} color="#4dabf7" distance={15} />

          {/* Central hemisphere light for soft fill */}
          <hemisphereLight
            args={['#87ceeb', '#2d1b0e', 0.4]}
          />
          <ChessBoard3D
            pieces={pieces}
            selectedSquare={selectedSquare}
            validMoves={validMoves}
            onSquareClick={handleSquareClick}
            myColor={getMyColor()}
          />
          <OrbitControls
            enablePan={true}
            minDistance={8}
            maxDistance={30}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.5}
          />
        </Canvas>
      </div>

      <div className="game-footer">
        <p className="room-code">방 코드: {room.code}</p>
        {room.status === 'playing' && (
          <button onClick={handleResign} className="btn-resign">
            🏳️ 기권
          </button>
        )}
        <p className="pan-hint">💡 마우스 오른쪽 버튼 드래그로 보드 이동</p>
      </div>

      {/* Paused Overlay - 상대방 연결 끊김 시 */}
      {room.status === 'paused' && room.disconnectedAt && (
        <PausedOverlay disconnectedAt={room.disconnectedAt} />
      )}

      {showResult && room.winner && (
        <ResultPopup
          winner={room.winner}
          isHost={isHost}
          hostNickname={room.hostNickname}
          guestNickname={room.guestNickname || ''}
          onPlayAgain={handlePlayAgain}
        />
      )}

      {/* Chat Component */}
      <Chat
        messages={room.messages || []}
        onSendMessage={handleSendMessage}
        myName={isHost ? room.hostNickname : (room.guestNickname || '')}
      />

      {error && <div className="error-toast">{error}</div>}
    </div>
  );
}

export default App;
