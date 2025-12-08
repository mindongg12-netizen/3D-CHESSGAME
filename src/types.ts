export interface Player {
    id: string;
    nickname: string;
    color: 'white' | 'black';
}

export interface Room {
    code: string;
    hostId: string;
    hostNickname: string;
    guestId: string | null;
    guestNickname: string | null;
    status: 'waiting' | 'ready' | 'playing' | 'finished';
    currentTurn: 'white' | 'black';
    turnStartTime: number;
    fen: string; // FEN notation for chess position
    lastMove: { from: string; to: string } | null;
    winner: 'host' | 'guest' | 'draw' | null;
    loserStarts: boolean; // If true, loser of previous game starts
    previousLoser: 'host' | 'guest' | null;
    messages?: ChatMessage[];
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
