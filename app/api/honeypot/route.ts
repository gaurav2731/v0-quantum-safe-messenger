import { NextRequest, NextResponse } from 'next/server';
import { logApiHoneypotAccess } from '@/lib/honeypot';

// Fake API responses to confuse bots and attackers
const FAKE_RESPONSES = {
  users: [
    { id: 1, username: 'admin', email: 'admin@fake.com', role: 'superuser' },
    { id: 2, username: 'test', email: 'test@fake.com', role: 'user' },
    { id: 3, username: 'bot_trap', email: 'trap@honeypot.com', role: 'hacker' }
  ],
  config: {
    api_version: '2.1.0',
    debug_mode: true,
    secret_key: 'FAKE_SECRET_KEY_12345',
    database_url: 'postgresql://fake:password@honeypot.db:5432/fake_db',
    encryption_key: 'FAKE_ENCRYPTION_KEY_67890'
  },
  system: {
    uptime: '999 days, 23 hours, 59 minutes',
    memory_usage: '99.9%',
    cpu_load: '999.99%',
    active_connections: 9999,
    version: 'Quantum Messenger v9.99.999'
  },
  secrets: {
    aws_access_key: 'FAKE_AWS_ACCESS_KEY_DECOY',
    aws_secret_key: 'FAKE_AWS_SECRET_KEY_DECOY',
    stripe_secret: 'FAKE_STRIPE_SECRET_DECOY',
    github_token: 'FAKE_GITHUB_TOKEN_DECOY'
  }
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || 'random';

  // Log honeypot access
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  logApiHoneypotAccess({
    endpoint: `/api/honeypot?endpoint=${endpoint}`,
    method: 'GET',
    ip,
    userAgent,
    timestamp: Date.now()
  });

  // Rate limiting simulation - slow down suspicious requests
  if (userAgent.includes('bot') || userAgent.includes('scanner')) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 1000));
  }

  // Return fake data based on endpoint
  let response;
  switch (endpoint) {
    case 'users':
      response = FAKE_RESPONSES.users;
      break;
    case 'config':
      response = FAKE_RESPONSES.config;
      break;
    case 'system':
      response = FAKE_RESPONSES.system;
      break;
    case 'secrets':
      response = FAKE_RESPONSES.secrets;
      break;
    default:
      // Random fake response
      const keys = Object.keys(FAKE_RESPONSES);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      response = FAKE_RESPONSES[randomKey as keyof typeof FAKE_RESPONSES];
  }

  return NextResponse.json({
    success: true,
    data: response,
    message: 'Honeypot data retrieved successfully',
    timestamp: new Date().toISOString(),
    server: 'Quantum Messenger Honeypot v1.0'
  });
}

export async function POST(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  logApiHoneypotAccess({
    endpoint: '/api/honeypot',
    method: 'POST',
    ip,
    userAgent,
    timestamp: Date.now()
  });

  // Fake successful operation
  return NextResponse.json({
    success: true,
    message: 'Data updated successfully in honeypot database',
    id: Math.floor(Math.random() * 10000),
    timestamp: new Date().toISOString()
  });
}
