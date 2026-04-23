// Bypasses CRA proxy by using absolute URLs to avoid "Failed to fetch" errors.
// Falls back to localStorage-only demo mode when backend is unreachable.

const API_BASE_URL = 'http://localhost:8080';

const DEMO_USERS_KEY = 'sn_demo_users';

function getDemoUsers() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveDemoUsers(users) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

class AuthService {
  async authenticate(username, password) {
    const credentials = btoa(`${username}:${password}`);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return { success: true, credentials, demoMode: false };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      // Backend unreachable — try local demo users
      if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
        const users = getDemoUsers();
        const user = users[username];
        if (user && user.password === btoa(password)) {
          return { success: true, credentials: btoa(`${username}:${password}`), demoMode: true };
        }
        return { success: false, error: 'Invalid username or password (offline mode)' };
      }
      return { success: false, error: error.message };
    }
  }

  async register(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return { success: true, message: result.message, demoMode: false };
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (error) {
      // Backend unreachable — register locally
      if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
        const users = getDemoUsers();
        if (users[username]) {
          return { success: false, error: 'Username already exists (offline mode)' };
        }
        users[username] = { password: btoa(password) };
        saveDemoUsers(users);
        return { success: true, message: 'Registered in offline mode!', demoMode: true };
      }
      return { success: false, error: error.message };
    }
  }
}

export default new AuthService();
