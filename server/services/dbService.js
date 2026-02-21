const { query } = require('../config/postgres');
const bcrypt = require('bcryptjs');

const dbService = {
    // --- USER METHODS ---
    async findUserByEmail(email) {
        const res = await query('SELECT * FROM users WHERE email = $1', [email]);
        return res.rows[0];
    },

    async findUserByUsername(username) {
        const res = await query('SELECT * FROM users WHERE username = $1', [username]);
        return res.rows[0];
    },

    async findUserById(id) {
        const res = await query('SELECT * FROM users WHERE id = $1', [id]);
        return res.rows[0];
    },

    async getUserById(id) {
        return this.findUserById(id);
    },

    async createUser(userData) {
        const { username, email, password, publicKey, deviceId } = userData;
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        const res = await query(
            'INSERT INTO users (username, email, password_hash, public_key, device_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, public_key',
            [username, email, passwordHash, publicKey, deviceId]
        );
        return res.rows[0];
    },

    async updateUserStatus(userId, status) {
        await query('UPDATE users SET status = $1, last_seen = NOW() WHERE id = $2', [status, userId]);
    },

    async searchUsers(searchQuery, excludeUserId) {
        const res = await query(
            'SELECT id, username as name, email, public_key as "publicKey" FROM users WHERE (username ILIKE $1 OR email ILIKE $1) AND id != $2 LIMIT 10',
            [`%${searchQuery}%`, excludeUserId]
        );
        return res.rows;
    },

    async addContact(userId, contactId) {
        await query('UPDATE users SET contacts = array_append(contacts, $1) WHERE id = $2 AND NOT ($1 = ANY(contacts))', [contactId, userId]);
    },

    async getContacts(userId) {
        const res = await query(
            'SELECT u.id, u.username as name, u.email, u.public_key as "publicKey", u.status FROM users u WHERE u.id = ANY(SELECT unnest(contacts) FROM users WHERE id = $1)',
            [userId]
        );
        return res.rows;
    },

    // --- MESSAGE METHODS ---
    async saveMessage(message) {
        const { id, chatId, senderId, content, encrypted, status, timestamp } = message;
        await query(
            'INSERT INTO messages (id, chat_id, sender_id, content, encrypted, status, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [id, chatId, senderId, content, encrypted, status, new Date(timestamp)]
        );
    },

    async getMessageHistory(chatId) {
        const res = await query(
            'SELECT id, chat_id as "chatId", sender_id as "senderId", content, encrypted, status, timestamp FROM messages WHERE chat_id = $1 ORDER BY timestamp ASC',
            [chatId]
        );
        return res.rows;
    },

    async getMessages(chatId) {
        return this.getMessageHistory(chatId);
    }
};

module.exports = dbService;
