-- QuantumSafe Messenger PostgreSQL Schema
-- Use this to initialize your database (Supabase/Neon)

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar TEXT DEFAULT '',
    status VARCHAR(20) DEFAULT 'offline',
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    public_key TEXT NOT NULL,
    device_id TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    contacts UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id TEXT NOT NULL,
    sender_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    encrypted BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'sent',
    read_by UUID[] DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster chat lookup
CREATE INDEX IF NOT EXISTS idx_chat_id ON messages(chat_id);
