export interface Player {
    id: string;
    nickname: string;
    color: 'white' | 'black';
}

export interface Room {
    code: string;
    hostId: string;
    hostNickname: string;
    hostRecord?: { wins: number; losses: number };
    guestId: string | null;
    guestNickname: string | null;
    guestRecord?: { wins: number; losses: number } | null;
    guestReady: boolean;
    status: 'waiting' | 'ready' | 'playing' | 'paused' | 'finished';
    currentTurn: 'white' | 'black';
    turnStartTime: number;
    fen: string;
    lastMove: { from: string; to: string } | null;
    winner: 'host' | 'guest' | 'draw' | null;
    loserStarts: boolean;
    previousLoser: 'host' | 'guest' | null;
    messages?: ChatMessage[];
    // 연결 상태 추적
    hostLastActive: number;
    guestLastActive: number;
    disconnectedPlayer: 'host' | 'guest' | null;
    disconnectedAt: number | null;
    // 방 설정
    isPrivate: boolean;
    createdAt: number;
}



export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: number;
}

export interface GameState {
    room: Room | null;
    playerId: string | null;
    isHost: boolean;
    myColor: 'white' | 'black';
    selectedSquare: string | null;
    validMoves: string[];
    timeLeft: number;
}

export type PieceType = 'k' | 'q' | 'r' | 'b' | 'n' | 'p';
export type PieceColor = 'w' | 'b';

export interface ChessPiece {
    type: PieceType;
    color: PieceColor;
    square: string;
}

// User account for registration/login
export interface User {
    id: string;
    username: string;
    passwordHash: string; // Simple hash for demo purposes
    nickname: string;
    createdAt: number;
    wins: number;      // 승리 횟수
    losses: number;    // 패배 횟수
    draws: number;     // 무승부 횟수
}


// Admin config (stored in Firebase)
export interface AdminConfig {
    registrationCode: string; // 4-digit code required for registration
}
