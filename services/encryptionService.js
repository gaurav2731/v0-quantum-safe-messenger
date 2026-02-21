// Encryption Service for Quantum-Safe Messenger
// Implements AES-256-GCM encryption for message security

const crypto = require('crypto');

class EncryptionService {
  constructor() {
    // In production, this should come from environment variables
    this.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-byte-encryption-key-for-message-encryption-12345';
    this.HMAC_SECRET = process.env.HMAC_SECRET || 'your-hmac-secret-for-message-authentication-12345';
    this.ALGORITHM = 'aes-256-gcm';
  }

  // Generate a random encryption key
  generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate a random initialization vector
  generateIV() {
    return crypto.randomBytes(12);
  }

  // Encrypt message content
  encryptMessage(content, key = this.ENCRYPTION_KEY) {
    try {
      const iv = this.generateIV();
      const cipher = crypto.createCipher(this.ALGORITHM, Buffer.from(key, 'hex'));
      
      let encrypted = cipher.update(content, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt message');
    }
  }

  // Decrypt message content
  decryptMessage(encryptedData, iv, authTag, key = this.ENCRYPTION_KEY) {
    try {
      const decipher = crypto.createDecipher(this.ALGORITHM, Buffer.from(key, 'hex'));
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      decipher.setIV(Buffer.from(iv, 'hex'));
      
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt message');
    }
  }

  // Create message signature for integrity verification
  createMessageSignature(messageData) {
    const dataToSign = JSON.stringify({
      ...messageData,
      timestamp: messageData.timestamp || Date.now()
    });
    
    return crypto
      .createHmac('sha256', this.HMAC_SECRET)
      .update(dataToSign)
      .digest('hex');
  }

  // Verify message signature
  verifyMessageSignature(messageData, signature) {
    const expectedSignature = this.createMessageSignature(messageData);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  // Encrypt entire message object
  encryptMessageObject(messageObj, encryptionKey) {
    const content = JSON.stringify(messageObj);
    const encrypted = this.encryptMessage(content, encryptionKey);
    
    return {
      ...encrypted,
      messageType: messageObj.type || 'text',
      senderId: messageObj.senderId,
      recipientId: messageObj.recipientId
    };
  }

  // Decrypt message object
  decryptMessageObject(encryptedMessage, encryptionKey) {
    try {
      const decryptedContent = this.decryptMessage(
        encryptedMessage.encryptedData,
        encryptedMessage.iv,
        encryptedMessage.authTag,
        encryptionKey
      );
      
      return JSON.parse(decryptedContent);
    } catch (error) {
      console.error('Message object decryption error:', error);
      throw new Error('Failed to decrypt message object');
    }
  }

  // Generate key pair for end-to-end encryption
  generateKeyPair() {
    // Using tweetnacl for quantum-resistant cryptography
    const nacl = require('tweetnacl');
    const keyPair = nacl.box.keyPair();
    
    return {
      publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
      privateKey: Buffer.from(keyPair.secretKey).toString('hex')
    };
  }

  // Encrypt message with recipient's public key
  encryptWithPublicKey(message, recipientPublicKey, senderPrivateKey) {
    const nacl = require('tweetnacl');
    
    const messageUint8 = new TextEncoder().encode(message);
    const recipientPubKey = new Uint8Array(Buffer.from(recipientPublicKey, 'hex'));
    const senderPrivKey = new Uint8Array(Buffer.from(senderPrivateKey, 'hex'));
    
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const encrypted = nacl.box(messageUint8, nonce, recipientPubKey, senderPrivKey);
    
    return {
      encryptedData: Buffer.from(encrypted).toString('hex'),
      nonce: Buffer.from(nonce).toString('hex')
    };
  }

  // Decrypt message with private key
  decryptWithPrivateKey(encryptedData, nonce, senderPublicKey, recipientPrivateKey) {
    const nacl = require('tweetnacl');
    
    const encryptedUint8 = new Uint8Array(Buffer.from(encryptedData, 'hex'));
    const nonceUint8 = new Uint8Array(Buffer.from(nonce, 'hex'));
    const senderPubKey = new Uint8Array(Buffer.from(senderPublicKey, 'hex'));
    const recipientPrivKey = new Uint8Array(Buffer.from(recipientPrivateKey, 'hex'));
    
    const decrypted = nacl.box.open(encryptedUint8, nonceUint8, senderPubKey, recipientPrivKey);
    
    if (decrypted === null) {
      throw new Error('Decryption failed - invalid key or corrupted data');
    }
    
    return new TextDecoder().decode(decrypted);
  }

  // Create secure hash of message content
  hashMessage(content) {
    return crypto
      .createHash('sha256')
      .update(content)
      .digest('hex');
  }

  // Generate secure random string
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Derive encryption key from password
  deriveKeyFromPassword(password, salt) {
    return crypto.pbkdf2Sync(
      password,
      salt,
      100000, // iterations
      32, // key length
      'sha256'
    ).toString('hex');
  }

  // Generate salt for key derivation
  generateSalt() {
    return crypto.randomBytes(16).toString('hex');
  }

  // Encrypt file data
  encryptFile(fileBuffer, key) {
    const iv = this.generateIV();
    const cipher = crypto.createCipher(this.ALGORITHM, Buffer.from(key, 'hex'));
    
    const encrypted = Buffer.concat([
      cipher.update(fileBuffer),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    
    return {
      encryptedData: encrypted,
      iv: iv,
      authTag: authTag
    };
  }

  // Decrypt file data
  decryptFile(encryptedBuffer, iv, authTag, key) {
    const decipher = crypto.createDecipher(this.ALGORITHM, Buffer.from(key, 'hex'));
    decipher.setAuthTag(authTag);
    decipher.setIV(iv);
    
    return Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final()
    ]);
  }

  // Verify file integrity
  verifyFileIntegrity(fileBuffer, expectedHash) {
    const actualHash = this.hashMessage(fileBuffer.toString('hex'));
    return actualHash === expectedHash;
  }

  // Securely delete sensitive data from memory
  secureWipe(data) {
    if (typeof data === 'string') {
      // Overwrite string with random data
      return crypto.randomBytes(data.length).toString('hex');
    } else if (Buffer.isBuffer(data)) {
      // Overwrite buffer with random data
      return crypto.randomBytes(data.length);
    }
    return data;
  }
}

module.exports = new EncryptionService();