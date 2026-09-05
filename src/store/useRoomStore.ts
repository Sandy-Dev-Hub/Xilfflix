import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/services/supabase';
import type {
  WatchPartyRoom,
  Participant,
  DisplayMessage,
  ChatMessage,
  SystemMessage,
  SyncSignalType,
  SyncToast,
  RoomSession,
  CreateRoomResult,
  JoinRoomResult,
} from '@/types/watchparty';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ─── Session helpers (localStorage keyed by room id with memory fallback) ────
const memorySessions = new Map<string, RoomSession>();
const SESSION_KEY = (roomId: string) => `xf-room-${roomId}`;

function saveSession(session: RoomSession) {
  memorySessions.set(session.roomId, session);
  try {
    localStorage.setItem(SESSION_KEY(session.roomId), JSON.stringify(session));
  } catch {
    // Incognito or storage blocked
  }
}

function loadSession(roomId: string): RoomSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY(roomId));
    if (raw) return JSON.parse(raw) as RoomSession;
  } catch {
    // Incognito or storage blocked
  }
  return memorySessions.get(roomId) || null;
}

function clearSession(roomId: string) {
  memorySessions.delete(roomId);
  try {
    localStorage.removeItem(SESSION_KEY(roomId));
  } catch {
    // Incognito or storage blocked
  }
}

// ─── Avatar color palette ─────────────────────────────────────────────────────
const AVATAR_COLORS = [
  '#E50914', '#3B82F6', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#EF4444',
];
function randomAvatarColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

function generateSystemId() {
  return `sys-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ─── Store state ──────────────────────────────────────────────────────────────
interface RoomState {
  room: WatchPartyRoom | null;
  participants: Participant[];
  messages: DisplayMessage[];
  latestSignal: SyncSignalType | null;
  syncToast: SyncToast | null;
  session: RoomSession | null;
  isMuted: boolean;
  connecting: boolean;
  error: string | null;
  _channel: RealtimeChannel | null;

  createRoom: (
    movieId: string,
    movieType: 'movie' | 'tv',
    movieTitle: string,
    moviePoster: string,
    displayName: string,
    roomName?: string,
    participantLimit?: number
  ) => Promise<{ roomId: string } | { error: string }>;

  joinRoom: (
    roomId: string,
    displayName: string
  ) => Promise<{ ok: true } | { error: string }>;

  rejoinRoom: (roomId: string) => Promise<{ ok: true } | { error: string }>;

  leaveRoom: () => Promise<void>;

  sendMessage: (body: string) => Promise<{ error?: string }>;

  sendSyncSignal: (signal: SyncSignalType) => Promise<{ error?: string }>;

  updateRoomStatus: (status: 'watching' | 'ended') => Promise<{ error?: string }>;

  muteParticipant: (participantId: string, muted: boolean) => Promise<{ error?: string }>;

  clearChat: () => Promise<{ error?: string }>;

  dismissToast: () => void;

  clearError: () => void;

  _pushSystemMessage: (body: string) => void;
  _subscribe: (roomId: string) => Promise<void>;
  _unsubscribe: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useRoomStore = create<RoomState>((set, get) => ({
  room: null,
  participants: [],
  messages: [],
  latestSignal: null,
  syncToast: null,
  session: null,
  isMuted: false,
  connecting: false,
  error: null,
  _channel: null,

  // ── Create room ──────────────────────────────────────────────────────────────
  createRoom: async (movieId, movieType, movieTitle, moviePoster, displayName, roomName, participantLimit) => {
    if (!isSupabaseConfigured) return { error: 'Supabase not configured.' };
    set({ connecting: true, error: null });

    const avatarColor = randomAvatarColor();
    const { data, error } = await supabase.rpc('create_room', {
      p_movie_id: movieId,
      p_movie_type: movieType,
      p_movie_title: movieTitle,
      p_movie_poster: moviePoster,
      p_display_name: displayName || 'Host',
      p_avatar_color: avatarColor,
      p_room_name: roomName || null,
      p_participant_limit: participantLimit ?? 10,
    });

    if (error || !data) {
      const msg = error?.message ?? 'Failed to create room';
      set({ error: msg, connecting: false });
      return { error: msg };
    }

    const result = data as CreateRoomResult;
    const roomSession: RoomSession = {
      roomId: result.room_id,
      participantId: result.participant_id,
      participantToken: result.participant_token,
      hostToken: result.host_token,
      displayName: displayName || 'Host',
      avatarColor,
    };

    saveSession(roomSession);
    set({ session: roomSession });
    await get()._subscribe(result.room_id);
    set({ connecting: false });
    return { roomId: result.room_id };
  },

  // ── Join room ────────────────────────────────────────────────────────────────
  joinRoom: async (roomId, displayName) => {
    if (!isSupabaseConfigured) return { error: 'Supabase not configured.' };
    set({ connecting: true, error: null });

    const avatarColor = randomAvatarColor();
    const guestName = displayName?.trim() || `Guest ${Math.floor(Math.random() * 9000 + 1000)}`;

    const { data, error } = await supabase.rpc('join_room', {
      p_room_id: roomId,
      p_display_name: guestName,
      p_avatar_color: avatarColor,
    });

    if (error || !data) {
      const code = error?.message ?? 'UNKNOWN';
      let msg = `Could not join room: ${code}`;
      if (code === 'ROOM_NOT_FOUND') msg = 'Room not found or has ended.';
      else if (code.startsWith('ROOM_FULL')) {
        const parts = code.split(':');
        msg = `This room is full (${parts[1]}/${parts[2]}).`;
      }
      set({ error: msg, connecting: false });
      return { error: msg };
    }

    const result = data as JoinRoomResult;
    const roomSession: RoomSession = {
      roomId,
      participantId: result.participant_id,
      participantToken: result.participant_token,
      displayName: guestName,
      avatarColor,
    };

    saveSession(roomSession);
    set({ session: roomSession });
    await get()._subscribe(roomId);
    set({ connecting: false });
    return { ok: true };
  },

  // ── Rejoin from localStorage ──────────────────────────────────────────────────
  rejoinRoom: async (roomId) => {
    const stored = loadSession(roomId);
    if (!stored) return { error: 'No stored session for this room.' };

    // Validate the room still exists in Supabase
    const { data: roomData, error } = await supabase
      .from('rooms')
      .select('id, status')
      .eq('id', roomId)
      .single();

    if (error || !roomData) {
      clearSession(roomId);
      return { error: 'Room not found or has ended.' };
    }

    set({ session: stored });
    await get()._subscribe(roomId);
    set({ connecting: false });
    return { ok: true };
  },

  // ── Leave room ───────────────────────────────────────────────────────────────
  leaveRoom: async () => {
    const { session } = get();
    if (!session) return;

    get()._unsubscribe();

    if (isSupabaseConfigured) {
      await supabase.rpc('leave_room', {
        p_participant_id: session.participantId,
        p_participant_token: session.participantToken,
      });
    }

    clearSession(session.roomId);
    set({
      room: null,
      participants: [],
      messages: [],
      session: null,
      latestSignal: null,
      syncToast: null,
      isMuted: false,
    });
  },

  // ── Send chat message ─────────────────────────────────────────────────────────
  sendMessage: async (body) => {
    const { session } = get();
    if (!session || !isSupabaseConfigured) return { error: 'Not in a room.' };

    const { error } = await supabase.rpc('send_chat_message', {
      p_participant_id: session.participantId,
      p_participant_token: session.participantToken,
      p_body: body,
    });

    if (error) {
      const code = error.message;
      if (code === 'MUTED') return { error: 'You are muted by the host.' };
      if (code === 'RATE_LIMITED') return { error: 'Slow down — 3 messages per 5 seconds max.' };
      if (code === 'MESSAGE_TOO_LONG') return { error: 'Message too long (500 chars max).' };
      return { error: code };
    }

    return {};
  },

  // ── Send sync signal (host only) ──────────────────────────────────────────────
  sendSyncSignal: async (signal) => {
    const { session } = get();
    if (!session?.hostToken || !isSupabaseConfigured) return { error: 'Not authorized.' };

    const { error } = await supabase.rpc('send_sync_signal', {
      p_room_id: session.roomId,
      p_host_token: session.hostToken,
      p_signal: signal,
    });

    if (error) return { error: error.message };
    return {};
  },

  // ── Update room status (host only) ────────────────────────────────────────────
  updateRoomStatus: async (status) => {
    const { session } = get();
    if (!session?.hostToken || !isSupabaseConfigured) return { error: 'Not authorized.' };

    const { error } = await supabase.rpc('update_room_status', {
      p_room_id: session.roomId,
      p_host_token: session.hostToken,
      p_status: status,
    });

    if (error) return { error: error.message };
    return {};
  },

  // ── Mute participant (host only) ───────────────────────────────────────────────
  muteParticipant: async (participantId, muted) => {
    const { session } = get();
    if (!session?.hostToken || !isSupabaseConfigured) return { error: 'Not authorized.' };

    const { error } = await supabase.rpc('mute_participant', {
      p_room_id: session.roomId,
      p_host_token: session.hostToken,
      p_participant_id: participantId,
      p_muted: muted,
    });

    if (error) return { error: error.message };
    return {};
  },

  // ── Clear chat (host only) ─────────────────────────────────────────────────────
  clearChat: async () => {
    const { session } = get();
    if (!session?.hostToken || !isSupabaseConfigured) return { error: 'Not authorized.' };

    const { error } = await supabase.rpc('clear_chat', {
      p_room_id: session.roomId,
      p_host_token: session.hostToken,
    });

    if (error) return { error: error.message };
    set({ messages: [] });
    return {};
  },

  dismissToast: () => set({ syncToast: null }),

  clearError: () => set({ error: null }),

  _pushSystemMessage: (body) => {
    const { room } = get();
    const msg: SystemMessage = {
      id: generateSystemId(),
      roomId: room?.id ?? '',
      type: 'system',
      body,
      sentAt: new Date().toISOString(),
    };
    set((s) => ({ messages: [...s.messages, msg] }));
  },

  // ── Subscribe to Supabase Realtime ──────────────────────────────────────────
  _subscribe: async (roomId) => {
    get()._unsubscribe();
    if (!isSupabaseConfigured) return;

    try {
      // 1. Fetch initial data
      const [roomRes, participantRes, chatRes] = await Promise.all([
        supabase.from('rooms').select('*').eq('id', roomId).single(),
        supabase.from('participants').select('*').eq('room_id', roomId).order('joined_at'),
        supabase.from('chat_messages').select('*').eq('room_id', roomId).order('sent_at').limit(200),
      ]);

      const room: WatchPartyRoom | null = roomRes.data
        ? {
            id: roomRes.data.id,
            movieId: roomRes.data.movie_id,
            movieType: roomRes.data.movie_type,
            movieTitle: roomRes.data.movie_title,
            moviePoster: roomRes.data.movie_poster,
            status: roomRes.data.status,
            roomName: roomRes.data.room_name ?? null,
            participantLimit: roomRes.data.participant_limit ?? 10,
            createdAt: roomRes.data.created_at,
            expiresAt: roomRes.data.expires_at,
          }
        : null;

      const participants: Participant[] = (participantRes.data ?? []).map((p: any) => ({
        id: p.id,
        roomId: p.room_id,
        displayName: p.display_name,
        avatarColor: p.avatar_color,
        isHost: p.is_host,
        isMuted: p.is_muted,
        joinedAt: p.joined_at,
      }));

      const chatMessages: ChatMessage[] = (chatRes.data ?? []).map((m: any) => ({
        id: m.id,
        roomId: m.room_id,
        participantId: m.participant_id,
        senderName: m.sender_name,
        avatarColor: m.avatar_color,
        body: m.body,
        sentAt: m.sent_at,
        type: 'user' as const,
      }));

      const myId = get().session?.participantId;
      const me = participants.find((p) => p.id === myId);

      set({ room, participants, messages: chatMessages, isMuted: me?.isMuted ?? false });

      // 2. Subscribe to realtime updates
      const channel = supabase
        .channel(`room-${roomId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
          (payload) => {
            if (payload.eventType === 'UPDATE') {
              const d = payload.new as any;
              set((s) => ({ room: s.room ? { ...s.room, status: d.status } : null }));
              if (d.status === 'watching') get()._pushSystemMessage('Host started the party 🎬');
              if (d.status === 'ended') get()._pushSystemMessage('The watch party has ended.');
            }
            if (payload.eventType === 'DELETE') {
              set((s) => ({ room: s.room ? { ...s.room, status: 'ended' } : null }));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'participants', filter: `room_id=eq.${roomId}` },
          (payload) => {
            const myId = get().session?.participantId;

            if (payload.eventType === 'INSERT') {
              const d = payload.new as any;
              const newP: Participant = {
                id: d.id, roomId: d.room_id, displayName: d.display_name,
                avatarColor: d.avatar_color, isHost: d.is_host, isMuted: d.is_muted, joinedAt: d.joined_at,
              };
              set((s) => ({ participants: [...s.participants, newP] }));
              if (d.id !== myId) get()._pushSystemMessage(`${d.display_name} joined the party 👋`);
            }

            if (payload.eventType === 'UPDATE') {
              const d = payload.new as any;
              set((s) => {
                const updated = s.participants.map((p) =>
                  p.id === d.id ? { ...p, isMuted: d.is_muted, displayName: d.display_name } : p
                );
                const me = updated.find((p) => p.id === myId);
                return { participants: updated, isMuted: me?.isMuted ?? s.isMuted };
              });
              if (d.id === myId) {
                get()._pushSystemMessage(d.is_muted ? 'You have been muted by the host 🔇' : 'You have been unmuted 🔊');
              }
            }

            if (payload.eventType === 'DELETE') {
              const d = payload.old as any;
              const name = get().participants.find((p) => p.id === d.id)?.displayName ?? 'Someone';
              set((s) => ({ participants: s.participants.filter((p) => p.id !== d.id) }));
              if (d.id !== myId) get()._pushSystemMessage(`${name} left the party`);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'sync_events', filter: `room_id=eq.${roomId}` },
          (payload) => {
            const d = payload.new as any;
            const signal = d.signal as SyncSignalType;
            set({ latestSignal: signal, syncToast: { id: `toast-${Date.now()}`, signal, timestamp: Date.now() } });
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
          (payload) => {
            const d = payload.new as any;
            const msg: ChatMessage = {
              id: d.id, roomId: d.room_id, participantId: d.participant_id,
              senderName: d.sender_name, avatarColor: d.avatar_color,
              body: d.body, sentAt: d.sent_at, type: 'user',
            };
            set((s) => ({ messages: [...s.messages, msg] }));
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
          () => {
            set({ messages: [] });
            get()._pushSystemMessage('Host cleared the chat 🗑️');
          }
        )
        .subscribe();

      set({ _channel: channel });
    } catch (e) {
      console.error('[WatchParty] Failed to subscribe to room:', e);
    }
  },

  _unsubscribe: () => {
    const { _channel } = get();
    if (_channel) {
      supabase.removeChannel(_channel);
      set({ _channel: null });
    }
  },
}));
