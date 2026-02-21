-- Quantum-Safe Messenger Database Schema
-- PostgreSQL Database Structure

-- Create database (run this first)
-- CREATE DATABASE quantum_safe_messenger;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    device_id VARCHAR(100) UNIQUE NOT NULL,
    public_key TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away', 'busy')),
    is_verified BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    lock_reason TEXT,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret TEXT,
    failed_login_attempts INTEGER DEFAULT 0,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_device_id ON users(device_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- User devices table
CREATE TABLE IF NOT EXISTS user_devices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(100) UNIQUE NOT NULL,
    device_info JSONB,
    is_active BOOLEAN DEFAULT true,
    last_seen TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, device_id)
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_device_id ON user_devices(device_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_active ON user_devices(is_active);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    contact_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked', 'rejected')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, contact_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_contact_id ON contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
    id VARCHAR(100) PRIMARY KEY,
    participants INTEGER[],
    chat_type VARCHAR(20) DEFAULT 'private' CHECK (chat_type IN ('private', 'group')),
    name VARCHAR(100),
    description TEXT,
    avatar_url TEXT,
    is_encrypted BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on participants array
CREATE INDEX IF NOT EXISTS idx_chats_participants ON chats USING GIN(participants);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(100) PRIMARY KEY,
    chat_id VARCHAR(100) REFERENCES chats(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'audio', 'video', 'location')),
    reply_to_message_id VARCHAR(100) REFERENCES messages(id) ON DELETE SET NULL,
    is_encrypted BOOLEAN DEFAULT true,
    encryption_key TEXT,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sending', 'sent', 'delivered', 'read', 'failed')),
    timestamp BIGINT NOT NULL,
    edited_at TIMESTAMP,
    deleted_at TIMESTAMP,
    reactions JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Message receipts table (for read/delivered status)
CREATE TABLE IF NOT EXISTS message_receipts (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(100) REFERENCES messages(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receipt_type VARCHAR(20) CHECK (receipt_type IN ('delivered', 'read')),
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(message_id, user_id, receipt_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_message_receipts_message_id ON message_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_message_receipts_user_id ON message_receipts(user_id);

-- Security logs table
CREATE TABLE IF NOT EXISTS security_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    event_type VARCHAR(50) NOT NULL,
    details TEXT,
    ip_address INET,
    user_agent TEXT,
    location JSONB,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON security_logs(severity);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    key_hash TEXT NOT NULL,
    permissions TEXT[],
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);

-- Blocked users table
CREATE TABLE IF NOT EXISTS blocked_users (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, blocked_user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blocked_users_user_id ON blocked_users(user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked_user_id ON blocked_users(blocked_user_id);

-- Message reactions table (normalized)
CREATE TABLE IF NOT EXISTS message_reactions (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(100) REFERENCES messages(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(message_id, user_id, reaction_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions(user_id);

-- Typing indicators table
CREATE TABLE IF NOT EXISTS typing_indicators (
    id SERIAL PRIMARY KEY,
    chat_id VARCHAR(100) REFERENCES chats(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_typing BOOLEAN DEFAULT false,
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(chat_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_typing_indicators_chat_id ON typing_indicators(chat_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_user_id ON typing_indicators(user_id);

-- File uploads table
CREATE TABLE IF NOT EXISTS file_uploads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_path TEXT NOT NULL,
    url TEXT NOT NULL,
    is_encrypted BOOLEAN DEFAULT true,
    encryption_key TEXT,
    upload_status VARCHAR(20) DEFAULT 'uploaded' CHECK (upload_status IN ('uploading', 'uploaded', 'failed', 'deleted')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_upload_status ON file_uploads(upload_status);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Push subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(100) NOT NULL,
    endpoint TEXT NOT NULL,
    keys JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, device_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_device_id ON push_subscriptions(device_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active);

-- Honeypot table (security monitoring)
CREATE TABLE IF NOT EXISTS honeypot_logs (
    id SERIAL PRIMARY KEY,
    ip_address INET NOT NULL,
    user_agent TEXT,
    request_path TEXT,
    request_method VARCHAR(10),
    request_data JSONB,
    threat_level VARCHAR(20) DEFAULT 'low' CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
    is_blocked BOOLEAN DEFAULT false,
    blocked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_honeypot_logs_ip_address ON honeypot_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_honeypot_logs_threat_level ON honeypot_logs(threat_level);
CREATE INDEX IF NOT EXISTS idx_honeypot_logs_created_at ON honeypot_logs(created_at);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default settings
INSERT INTO system_settings (key, value, description) VALUES
('max_file_size', '10485760', 'Maximum file upload size in bytes (10MB)'),
('allowed_file_types', '["image/jpeg","image/png","image/gif","application/pdf"]', 'Allowed file MIME types'),
('message_retention_days', '365', 'Number of days to retain messages'),
('max_contacts_per_user', '1000', 'Maximum number of contacts per user'),
('enable_2fa', 'false', 'Enable two-factor authentication system-wide')
ON CONFLICT (key) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_devices_updated_at 
    BEFORE UPDATE ON user_devices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at 
    BEFORE UPDATE ON chats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at 
    BEFORE UPDATE ON api_keys 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_uploads_updated_at 
    BEFORE UPDATE ON file_uploads 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_push_subscriptions_updated_at 
    BEFORE UPDATE ON push_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to get user's active chats
CREATE OR REPLACE FUNCTION get_user_chats(user_id_param INTEGER)
RETURNS TABLE(
    chat_id VARCHAR(100),
    chat_name VARCHAR(100),
    chat_type VARCHAR(20),
    participants INTEGER[],
    last_message TEXT,
    last_message_time BIGINT,
    unread_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as chat_id,
        c.name as chat_name,
        c.chat_type,
        c.participants,
        m.content as last_message,
        m.timestamp as last_message_time,
        COUNT(CASE WHEN mr.receipt_type != 'read' AND m.sender_id != user_id_param THEN 1 END) as unread_count
    FROM chats c
    LEFT JOIN messages m ON c.id = m.chat_id
    LEFT JOIN message_receipts mr ON m.id = mr.message_id AND mr.user_id = user_id_param
    WHERE user_id_param = ANY(c.participants)
    AND m.timestamp = (
        SELECT MAX(timestamp) 
        FROM messages 
        WHERE chat_id = c.id
    )
    GROUP BY c.id, c.name, c.chat_type, c.participants, m.content, m.timestamp
    ORDER BY last_message_time DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get chat participants
CREATE OR REPLACE FUNCTION get_chat_participants(chat_id_param VARCHAR(100))
RETURNS TABLE(
    user_id INTEGER,
    username VARCHAR(50),
    email VARCHAR(255),
    public_key TEXT,
    status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.username,
        u.email,
        u.public_key,
        u.status
    FROM users u
    JOIN chats c ON u.id = ANY(c.participants)
    WHERE c.id = chat_id_param;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;