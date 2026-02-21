// Seed Users Script for QuantumSafe Messenger
// This script populates the database with test users for development

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : {
    rejectUnauthorized: false
  }
});

// Test users data
const testUsers = [
  {
    username: 'alice_quantum',
    email: 'alice@quantumsafe.com',
    password: 'Alice@123',
    deviceId: 'device-alice-001',
    publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAalice123'
  },
  {
    username: 'bob_secure',
    email: 'bob@quantumsafe.com',
    password: 'Bob@123',
    deviceId: 'device-bob-001',
    publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAbob456'
  },
  {
    username: 'charlie_crypto',
    email: 'charlie@quantumsafe.com',
    password: 'Charlie@123',
    deviceId: 'device-charlie-001',
    publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAcharlie789'
  },
  {
    username: 'diana_dev',
    email: 'diana@quantumsafe.com',
    password: 'Diana@123',
    deviceId: 'device-diana-001',
    publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAdiana012'
  },
  {
    username: 'eve_tester',
    email: 'eve@quantumsafe.com',
    password: 'Eve@123',
    deviceId: 'device-eve-001',
    publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAeve345'
  }
];

async function seedUsers() {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if users already exist
    const existingUsers = await pool.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(existingUsers.rows[0].count);

    if (userCount > 0) {
      console.log(`⚠️  Database already has ${userCount} users.`);
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise(resolve => {
        readline.question('Do you want to clear and reseed? (yes/no): ', resolve);
      });
      readline.close();

      if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Seeding cancelled.');
        process.exit(0);
      }

      // Clear existing data
      console.log('🗑️  Clearing existing users...');
      await pool.query('DELETE FROM messages');
      await pool.query('DELETE FROM users');
    }

    // Insert test users
    console.log('👥 Creating test users...');

    for (const user of testUsers) {
      const passwordHash = await bcrypt.hash(user.password, 10);

      await pool.query(
        `INSERT INTO users (username, email, password_hash, device_id, public_key, status, is_verified)
         VALUES ($1, $2, $3, $4, $5, 'online', true)`,
        [user.username, user.email, passwordHash, user.deviceId, user.publicKey]
      );

      console.log(`✅ Created user: ${user.username} (${user.email})`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Test User Credentials:');
    console.log('━'.repeat(60));
    testUsers.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
      console.log(`Username: ${user.username}`);
      console.log('─'.repeat(60));
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure your PostgreSQL database is running and DATABASE_URL is set correctly in .env');
    }
    process.exit(1);
  }
}

// Run seeding
seedUsers();
