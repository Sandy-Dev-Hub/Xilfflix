import type { MediaType } from './movie';

// ─── Sync signals sent by the host ───────────────────────────────────────────
export type SyncSignalType =
  | 'countdown-3'
  | 'countdown-2'
  | 'countdown-1'
  | 'start'
  | 'pause'
  | 'resume'
  | 'sync';

// ─── Room ─────────────────────────────────────────────────────────────────────
export type RoomStatus = 'lobby' | 'watching' | 'ended';

export interface WatchPartyRoom {
  id: string;
  movieId: string;
  movieType: MediaType;
  movieTitle: string | null;
  moviePoster: string | null;
  status: RoomStatus;
  roomName: string | null;
  participantLimit: number;
  createdAt: string;
  expiresAt: string;
}

// ─── Participant ──────────────────────────────────────────────────────────────
export interface Participant {
  id: string;
  roomId: string;
  displayName: string;
  avatarColor: string;
  isHost: boolean;
  isMuted: boolean;
  joinedAt: string;
}

// ─── Chat message ─────────────────────────────────────────────────────────────
export type ChatMessageType = 'user' | 'system';

export interface ChatMessage {
  id: number;
  roomId: string;
  participantId: string;
  senderName: string;
  avatarColor: string;
  body: string;
  sentAt: string;
  type: ChatMessageType; // derived client-side; 'system' never comes from DB
}

// System messages are generated client-side and share the same shape
export interface SystemMessage {
  id: string; // client-generated unique id
  roomId: string;
  type: 'system';
  body: string;
  sentAt: string;
}

export type DisplayMessage = ChatMessage | SystemMessage;

// ─── Sync event (DB row) ──────────────────────────────────────────────────────
export interface SyncEvent {
  id: number;
  roomId: string;
  signal: SyncSignalType;
  sentAt: string;
}

// ─── Session (stored in sessionStorage) ──────────────────────────────────────
export interface RoomSession {
  roomId: string;
  participantId: string;
  participantToken: string;
  hostToken?: string; // only present if this client is the host
  displayName: string;
  avatarColor: string;
}

// ─── RPC response shapes ──────────────────────────────────────────────────────
export interface CreateRoomResult {
  room_id: string;
  host_token: string;
  participant_id: string;
  participant_token: string;
}

export interface JoinRoomResult {
  participant_id: string;
  participant_token: string;
}

// ─── Toast notification (derived from sync signals) ──────────────────────────
export interface SyncToast {
  id: string;
  signal: SyncSignalType;
  timestamp: number;
}
