const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface User {
  id: string;
  username: string;
}

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
  error?: string;
}

// Honeypot: Fake session keys for suspicious clients
const FAKE_SESSIONS = new Map<string, { token: string; expires: number }>();
const SUSPICIOUS_PATTERNS = [
  /bot/i, /crawler/i, /spider/i, /scanner/i, /exploit/i,
  /sqlmap/i, /nmap/i, /burp/i, /owasp/i, /acunetix/i
];

export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: User } | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
      });

      const data: AuthResponse = await response.json();

      if (!data.success || !data.token || !data.user) {
        throw new Error(data.error || 'Login failed');
      }

      return { token: data.token, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  async register(email: string, password: string): Promise<{ token: string; user: User } | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
      });

      const data: AuthResponse = await response.json();

      if (!data.success || !data.token || !data.user) {
        throw new Error(data.error || 'Registration failed');
      }

      return { token: data.token, user: data.user };
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    }
  },

  async logout(token: string): Promise<boolean> {
    try {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  },

  verifyToken(token: string): { id: string; username: string } | null {
    try {
      // For now, just check if token exists and is not expired
      // In production, you'd verify the JWT signature
      if (!token || token.split('.').length !== 3) {
        return null;
      }

      // Mock verification - in production, verify JWT properly
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;

      if (payload.exp && payload.exp < currentTime) {
        return null;
      }

      return { id: payload.id, username: payload.username };
    } catch {
      return null;
    }
  },

  getStoredToken(): string | null {
    return localStorage.getItem('authToken');
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
