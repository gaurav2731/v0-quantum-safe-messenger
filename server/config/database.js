const mongoose = require('mongoose');

// Database configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quantum-messenger';
const MONGODB_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  bufferMaxEntries: 0,
  maxIdleTimeMS: 30000,
  family: 4
};

// Connection state
let isConnected = false;
let connectionPromise = null;

const connectDB = async () => {
  if (isConnected) {
    console.log('📡 MongoDB already connected');
    return;
  }

  if (connectionPromise) {
    console.log('📡 MongoDB connection in progress...');
    return connectionPromise;
  }

  try {
    console.log('🔌 Connecting to MongoDB...');

    connectionPromise = mongoose.connect(MONGODB_URI, MONGODB_OPTIONS);

    const connection = await connectionPromise;

    isConnected = true;
    connectionPromise = null;

    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${connection.connection.db.databaseName}`);
    console.log(`🏠 Host: ${connection.connection.host}:${connection.connection.port}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📡 MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
      isConnected = true;
    });

    return connection;

  } catch (error) {
    connectionPromise = null;
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    isConnected = false;
    console.log('🔌 MongoDB disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error.message);
  }
};

const getConnectionStatus = () => {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    name: mongoose.connection.name,
    host: mongoose.connection.host,
    port: mongoose.connection.port
  };
};

// Health check
const healthCheck = async () => {
  try {
    if (!isConnected) {
      return { status: 'disconnected', message: 'Database not connected' };
    }

    // Ping the database
    await mongoose.connection.db.admin().ping();

    const stats = await mongoose.connection.db.stats();

    return {
      status: 'healthy',
      collections: stats.collections,
      objects: stats.objects,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      uptime: process.uptime()
    };

  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      uptime: process.uptime()
    };
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, closing MongoDB connection...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, closing MongoDB connection...');
  await disconnectDB();
  process.exit(0);
});

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionStatus,
  healthCheck,
  isConnected: () => isConnected
};
