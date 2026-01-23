import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, setAuthToken } from './apiClient';

const TOKEN_KEY = '@structa:auth_token';
const USER_KEY = '@structa:user';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

let authState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

const listeners: Set<(state: AuthState) => void> = new Set();

function notifyListeners() {
  listeners.forEach(listener => listener(authState));
}

export const authService = {
  /**
   * Initialize auth state from storage
   */
  async initialize(): Promise<AuthState> {
    try {
      const [token, userJson] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);
      
      if (token && userJson) {
        const user = JSON.parse(userJson);
        authState = { isAuthenticated: true, user, token };
        setAuthToken(token);
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    }
    
    return authState;
  },
  
  /**
   * Register a new user
   */
  async register(email: string, password: string, name?: string): Promise<{ success: boolean; error?: string }> {
    const response = await authApi.register(email, password, name);
    
    if (!response.success || !response.data) {
      return { success: false, error: response.error };
    }
    
    // Get user profile
    setAuthToken(response.data.token);
    const profileResponse = await authApi.getProfile();
    
    if (!profileResponse.success || !profileResponse.data) {
      return { success: false, error: 'Failed to get profile' };
    }
    
    // Save to storage
    await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(profileResponse.data));
    
    authState = {
      isAuthenticated: true,
      user: profileResponse.data,
      token: response.data.token,
    };
    
    notifyListeners();
    return { success: true };
  },
  
  /**
   * Login
   */
  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const response = await authApi.login(email, password);
    
    if (!response.success || !response.data) {
      return { success: false, error: response.error };
    }
    
    // Get user profile
    setAuthToken(response.data.token);
    const profileResponse = await authApi.getProfile();
    
    if (!profileResponse.success || !profileResponse.data) {
      return { success: false, error: 'Failed to get profile' };
    }
    
    // Save to storage
    await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(profileResponse.data));
    
    authState = {
      isAuthenticated: true,
      user: profileResponse.data,
      token: response.data.token,
    };
    
    notifyListeners();
    return { success: true };
  },
  
  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors
    }
    
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setAuthToken(null);
    
    authState = {
      isAuthenticated: false,
      user: null,
      token: null,
    };
    
    notifyListeners();
  },
  
  /**
   * Get current auth state
   */
  getState(): AuthState {
    return authState;
  },
  
  /**
   * Subscribe to auth state changes
   */
  subscribe(listener: (state: AuthState) => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return authState.isAuthenticated;
  },
  
  /**
   * Get current user
   */
  getUser(): User | null {
    return authState.user;
  },
};
