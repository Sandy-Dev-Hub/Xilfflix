-- ========================================================================================
-- XILFFLIX WATCH WITH FRIENDS - SUPABASE SCHEMA SETUP
-- Run this entire script in the Supabase SQL Editor to set up the database and APIs.
-- ========================================================================================

-- 1. Create Tables

CREATE TABLE IF NOT EXISTS rooms (
  id text PRIMARY KEY, -- 8 char alphanumeric code
  movie_id text NOT NULL,
  movie_type text NOT NULL,
  movie_title text NOT NULL,
  movie_poster text,
  status text NOT NULL DEFAULT 'lobby', -- 'lobby', 'watching', 'ended'
  host_token uuid NOT NULL, -- Secret token to authenticate the host
  room_name text, -- Optional cosmetic label
  participant_limit int NOT NULL DEFAULT 10, -- 0 = unlimited
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '24 hours'
);

CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id text NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  participant_token uuid NOT NULL, -- Secret token to authenticate the participant
  display_name text NOT NULL,
  avatar_color text NOT NULL,
  is_host boolean NOT NULL DEFAULT false,
  is_muted boolean NOT NULL DEFAULT false,
  joined_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id text NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  sender_name text NOT NULL,
  avatar_color text NOT NULL,
  body text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sync_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id text NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  signal text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Enable Realtime (Safe check if already added)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE participants;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE sync_events;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- 3. Grant schema & table permissions to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_events ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies (Explicit TO anon, authenticated)
DROP POLICY IF EXISTS "Public read access for rooms" ON rooms;
CREATE POLICY "Public read access for rooms" ON rooms FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read access for participants" ON participants;
CREATE POLICY "Public read access for participants" ON participants FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read access for chat_messages" ON chat_messages;
CREATE POLICY "Public read access for chat_messages" ON chat_messages FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read access for sync_events" ON sync_events;
CREATE POLICY "Public read access for sync_events" ON sync_events FOR SELECT TO anon, authenticated USING (true);


-- ========================================================================================
-- RPC FUNCTIONS (Server-side API)
-- ========================================================================================

-- Helper: Generate random 8-character string for room ID
CREATE OR REPLACE FUNCTION generate_room_id() RETURNS text AS $$
DECLARE
  chars text[] := '{A,B,C,D,E,F,G,H,J,K,L,M,N,P,Q,R,S,T,U,V,W,X,Y,Z,2,3,4,5,6,7,8,9}';
  result text := '';
  i integer := 0;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || chars[1+random()*(array_length(chars, 1)-1)];
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;


-- RPC: create_room
CREATE OR REPLACE FUNCTION create_room(
  p_movie_id text,
  p_movie_type text,
  p_movie_title text,
  p_movie_poster text,
  p_display_name text,
  p_avatar_color text,
  p_room_name text DEFAULT NULL,
  p_participant_limit int DEFAULT 10
) RETURNS json AS $$
DECLARE
  v_room_id text;
  v_host_token uuid := gen_random_uuid();
  v_participant_id uuid := gen_random_uuid();
  v_participant_token uuid := gen_random_uuid();
BEGIN
  -- Generate unique room ID
  LOOP
    v_room_id := generate_room_id();
    BEGIN
      INSERT INTO rooms (id, movie_id, movie_type, movie_title, movie_poster, status, host_token, room_name, participant_limit)
      VALUES (v_room_id, p_movie_id, p_movie_type, p_movie_title, p_movie_poster, 'lobby', v_host_token, p_room_name, p_participant_limit);
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      -- Try again
    END;
  END LOOP;

  -- Add host as participant
  INSERT INTO participants (id, room_id, participant_token, display_name, avatar_color, is_host)
  VALUES (v_participant_id, v_room_id, v_participant_token, p_display_name, p_avatar_color, true);

  RETURN json_build_object(
    'room_id', v_room_id,
    'host_token', v_host_token,
    'participant_id', v_participant_id,
    'participant_token', v_participant_token
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RPC: join_room
CREATE OR REPLACE FUNCTION join_room(
  p_room_id text,
  p_display_name text,
  p_avatar_color text
) RETURNS json AS $$
DECLARE
  v_room record;
  v_participant_id uuid := gen_random_uuid();
  v_participant_token uuid := gen_random_uuid();
  v_count int;
BEGIN
  SELECT * INTO v_room FROM rooms WHERE id = p_room_id;
  
  IF NOT FOUND OR v_room.status = 'ended' THEN
    RAISE EXCEPTION 'ROOM_NOT_FOUND';
  END IF;

  -- Check participant limit (0 = unlimited)
  SELECT count(*) INTO v_count FROM participants WHERE room_id = p_room_id;
  IF v_room.participant_limit > 0 AND v_count >= v_room.participant_limit THEN
    RAISE EXCEPTION 'ROOM_FULL:%:%', v_count, v_room.participant_limit;
  END IF;

  INSERT INTO participants (id, room_id, participant_token, display_name, avatar_color, is_host)
  VALUES (v_participant_id, p_room_id, v_participant_token, p_display_name, p_avatar_color, false);

  RETURN json_build_object(
    'participant_id', v_participant_id,
    'participant_token', v_participant_token
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RPC: leave_room
CREATE OR REPLACE FUNCTION leave_room(
  p_participant_id uuid,
  p_participant_token uuid
) RETURNS void AS $$
BEGIN
  DELETE FROM participants 
  WHERE id = p_participant_id AND participant_token = p_participant_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RPC: send_chat_message
CREATE OR REPLACE FUNCTION send_chat_message(
  p_participant_id uuid,
  p_participant_token uuid,
  p_body text
) RETURNS void AS $$
DECLARE
  v_participant record;
  v_recent_messages int;
BEGIN
  -- Verify identity and mute status
  SELECT * INTO v_participant FROM participants 
  WHERE id = p_participant_id AND participant_token = p_participant_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_AUTHORIZED';
  END IF;

  IF v_participant.is_muted THEN
    RAISE EXCEPTION 'MUTED';
  END IF;

  IF length(p_body) > 500 THEN
    RAISE EXCEPTION 'MESSAGE_TOO_LONG';
  END IF;

  -- Simple rate limit (max 3 messages in last 5 seconds)
  SELECT count(*) INTO v_recent_messages FROM chat_messages 
  WHERE participant_id = p_participant_id AND sent_at > (now() - interval '5 seconds');

  IF v_recent_messages >= 3 THEN
    RAISE EXCEPTION 'RATE_LIMITED';
  END IF;

  INSERT INTO chat_messages (room_id, participant_id, sender_name, avatar_color, body)
  VALUES (v_participant.room_id, p_participant_id, v_participant.display_name, v_participant.avatar_color, p_body);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RPC: send_sync_signal
CREATE OR REPLACE FUNCTION send_sync_signal(
  p_room_id text,
  p_host_token uuid,
  p_signal text
) RETURNS void AS $$
BEGIN
  -- Verify host
  IF NOT EXISTS (SELECT 1 FROM rooms WHERE id = p_room_id AND host_token = p_host_token) THEN
    RAISE EXCEPTION 'NOT_AUTHORIZED';
  END IF;

  INSERT INTO sync_events (room_id, signal) VALUES (p_room_id, p_signal);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RPC: update_room_status
CREATE OR REPLACE FUNCTION update_room_status(
  p_room_id text,
  p_host_token uuid,
  p_status text
) RETURNS void AS $$
BEGIN
  -- Verify host
  IF NOT EXISTS (SELECT 1 FROM rooms WHERE id = p_room_id AND host_token = p_host_token) THEN
    RAISE EXCEPTION 'NOT_AUTHORIZED';
  END IF;

  UPDATE rooms SET status = p_status WHERE id = p_room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RPC: mute_participant
CREATE OR REPLACE FUNCTION mute_participant(
  p_room_id text,
  p_host_token uuid,
  p_participant_id uuid,
  p_muted boolean
) RETURNS void AS $$
BEGIN
  -- Verify host
  IF NOT EXISTS (SELECT 1 FROM rooms WHERE id = p_room_id AND host_token = p_host_token) THEN
    RAISE EXCEPTION 'NOT_AUTHORIZED';
  END IF;

  UPDATE participants SET is_muted = p_muted 
  WHERE id = p_participant_id AND room_id = p_room_id AND is_host = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RPC: clear_chat
CREATE OR REPLACE FUNCTION clear_chat(
  p_room_id text,
  p_host_token uuid
) RETURNS void AS $$
BEGIN
  -- Verify host
  IF NOT EXISTS (SELECT 1 FROM rooms WHERE id = p_room_id AND host_token = p_host_token) THEN
    RAISE EXCEPTION 'NOT_AUTHORIZED';
  END IF;

  DELETE FROM chat_messages WHERE room_id = p_room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';
