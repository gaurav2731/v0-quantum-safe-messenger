const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['direct', 'group', 'channel'],
    default: 'direct'
  },
  participants: [{
    userId: String,
    username: String,
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'admin', 'owner'],
      default: 'member'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastMessage: {
    messageId: String,
    senderId: String,
    content: String,
    timestamp: Date,
    messageType: {
      type: String,
      default: 'text'
    }
  },
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowInvites: {
      type: Boolean,
      default: true
    },
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    maxParticipants: {
      type: Number,
      default: 1000
    },
    messageRetention: {
      type: Number, // days, 0 = unlimited
      default: 365
    }
  },
  metadata: {
    messageCount: {
      type: Number,
      default: 0
    },
    totalParticipants: {
      type: Number,
      default: 0
    },
    activeParticipants: {
      type: Number,
      default: 0
    }
  },
  encryption: {
    algorithm: {
      type: String,
      default: 'AES-256-GCM'
    },
    keyVersion: {
      type: String,
      default: 'v1'
    },
    lastKeyRotation: {
      type: Date,
      default: Date.now
    }
  }
});

// Indexes for performance
chatRoomSchema.index({ 'participants.userId': 1 });
chatRoomSchema.index({ type: 1, 'settings.isPublic': 1 });
chatRoomSchema.index({ createdAt: -1 });
chatRoomSchema.index({ updatedAt: -1 });

// Pre-save middleware to update metadata
chatRoomSchema.pre('save', function(next) {
  this.metadata.totalParticipants = this.participants.length;
  this.metadata.activeParticipants = this.participants.filter(p => p.isActive).length;
  this.updatedAt = new Date();
  next();
});

// Static methods
chatRoomSchema.statics.findByParticipant = function(userId) {
  return this.find({
    'participants.userId': userId,
    'participants.isActive': true
  }).sort({ updatedAt: -1 });
};

chatRoomSchema.statics.findDirectChat = function(userId1, userId2) {
  return this.findOne({
    type: 'direct',
    participants: {
      $all: [
        { $elemMatch: { userId: userId1, isActive: true } },
        { $elemMatch: { userId: userId2, isActive: true } }
      ]
    }
  });
};

chatRoomSchema.statics.createDirectChat = async function(userId1, userId2, user1Data, user2Data) {
  const existingChat = await this.findDirectChat(userId1, userId2);
  if (existingChat) return existingChat;

  const chatId = `direct_${[userId1, userId2].sort().join('_')}`;

  return this.create({
    chatId,
    type: 'direct',
    participants: [
      {
        userId: userId1,
        username: user1Data.username,
        role: 'member',
        isActive: true
      },
      {
        userId: userId2,
        username: user2Data.username,
        role: 'member',
        isActive: true
      }
    ],
    createdBy: userId1,
    settings: {
      isPublic: false,
      allowInvites: false,
      allowFileSharing: true
    }
  });
};

chatRoomSchema.statics.createGroupChat = function(name, createdBy, participants) {
  const chatId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const participantObjects = participants.map(userId => ({
    userId,
    role: userId === createdBy ? 'owner' : 'member',
    isActive: true
  }));

  return this.create({
    chatId,
    name,
    type: 'group',
    participants: participantObjects,
    createdBy,
    settings: {
      isPublic: false,
      allowInvites: true,
      allowFileSharing: true,
      maxParticipants: 1000
    }
  });
};

// Instance methods
chatRoomSchema.methods.addParticipant = function(userId, username, role = 'member') {
  if (this.participants.length >= this.settings.maxParticipants) {
    throw new Error('Maximum participants reached');
  }

  const existingParticipant = this.participants.find(p => p.userId === userId);
  if (existingParticipant) {
    existingParticipant.isActive = true;
    existingParticipant.joinedAt = new Date();
  } else {
    this.participants.push({
      userId,
      username,
      role,
      isActive: true,
      joinedAt: new Date()
    });
  }

  return this.save();
};

chatRoomSchema.methods.removeParticipant = function(userId) {
  const participant = this.participants.find(p => p.userId === userId);
  if (participant) {
    participant.isActive = false;
  }
  return this.save();
};

chatRoomSchema.methods.updateLastMessage = function(messageData) {
  this.lastMessage = {
    messageId: messageData.messageId,
    senderId: messageData.senderId,
    content: messageData.content,
    timestamp: messageData.timestamp,
    messageType: messageData.messageType
  };
  this.metadata.messageCount += 1;
  return this.save();
};

chatRoomSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.userId === userId && p.isActive);
};

chatRoomSchema.methods.getActiveParticipants = function() {
  return this.participants.filter(p => p.isActive);
};

chatRoomSchema.methods.getParticipantRole = function(userId) {
  const participant = this.participants.find(p => p.userId === userId && p.isActive);
  return participant ? participant.role : null;
};

chatRoomSchema.methods.canUserInvite = function(userId) {
  const role = this.getParticipantRole(userId);
  return role === 'admin' || role === 'owner';
};

chatRoomSchema.methods.canUserManage = function(userId) {
  const role = this.getParticipantRole(userId);
  return role === 'owner';
};

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
