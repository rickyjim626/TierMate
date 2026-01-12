/**
 * Auth API Client for TierMate
 *
 * Handles authentication with the xiaojinpro auth backend using JWT tokens:
 * - Email/password login
 * - WeChat QR login
 * - SMS phone login
 * - Google OAuth login
 * - JWT token management (stored in localStorage)
 * - User profile
 *
 * Note: TierMate uses tenant_id=3 (tiermate tenant) with client_id='tiermate'
 */

const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_BASE || 'https://auth.xiaojinpro.com';

// TierMate client ID - this maps to tenant_id=3 in the backend
export const CLIENT_ID = 'tiermate';

// ============================================================================
// Token Storage
// ============================================================================

const TOKEN_KEY = 'tiermate_jwt_token';
const REFRESH_TOKEN_KEY = 'tiermate_refresh_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearStoredTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Make an authenticated fetch request with JWT token
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

// ============================================================================
// Types
// ============================================================================

export interface User {
  id: number;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  username: string | null;
  bio: string | null;
  is_admin: boolean;
  is_disabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  user?: User;
}

export interface StartQrLoginParams {
  client_id: string;
  return_to?: string;
  scope: string;
  code_challenge: string;
  code_challenge_method: string;
  nonce: string;
}

export interface StartQrLoginResponse {
  login_id: string;
  wechat_qr_url: string;
  state: string;
  expires_in: number;
  wechat_params?: {
    appid: string;
    scope: string;
    redirect_uri: string;
    state: string;
  };
}

export interface LoginStatusEvent {
  status: 'pending' | 'scanned' | 'authorized' | 'approved' | 'completed' | 'success' | 'failed' | 'expired';
  code?: string;
  error?: string;
  user_id?: number;
  access_token?: string;
  refresh_token?: string;
}

export interface ApiError {
  error: string;
  message?: string;
}

// ============================================================================
// Email Authentication
// ============================================================================

export async function emailLogin(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; access_token?: string; error?: string }> {
  try {
    const response = await fetch(`${AUTH_BASE}/auth/email/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        client_id: CLIENT_ID,
        scope: 'openid profile email offline_access',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || data.error || 'Login failed' };
    }

    // Store JWT tokens
    if (data.access_token) {
      setStoredToken(data.access_token);
    }
    if (data.refresh_token) {
      setStoredRefreshToken(data.refresh_token);
    }

    // Map token response user to User type
    const user: User = {
      id: parseInt(data.user.id, 10),
      email: data.user.email,
      display_name: data.user.name,
      avatar_url: data.user.picture,
      username: null,
      bio: null,
      is_admin: data.user.is_admin,
    };

    return { success: true, user, access_token: data.access_token };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export async function emailRegister(
  email: string,
  password: string,
  displayName?: string
): Promise<{ success: boolean; user_id?: number; error?: string }> {
  try {
    const response = await fetch(`${AUTH_BASE}/auth/email/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        display_name: displayName,
        client_id: CLIENT_ID,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || data.error || 'Registration failed' };
    }

    return { success: true, user_id: data.user_id };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export async function logout(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await authFetch(`${AUTH_BASE}/auth/logout`, {
      method: 'POST',
    });

    // Clear tokens regardless of response
    clearStoredTokens();

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.message || data.error || 'Logout failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    // Clear tokens even if API call fails
    clearStoredTokens();
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// ============================================================================
// WeChat QR Login
// ============================================================================

import { generatePKCE, generateState, generateNonce } from './pkce';

export async function startQrLogin(params: StartQrLoginParams): Promise<StartQrLoginResponse> {
  const response = await fetch(`${AUTH_BASE}/v1/qr-login/start?client_id=${encodeURIComponent(params.client_id)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: params.client_id,
      return_to: params.return_to,
      scope: params.scope,
      code_challenge: params.code_challenge,
      code_challenge_method: params.code_challenge_method,
      nonce: params.nonce,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to start QR login');
  }

  return response.json();
}

export function subscribeLoginEvents(
  loginId: string,
  onEvent: (event: LoginStatusEvent) => void,
  onError?: (error: Error) => void
): () => void {
  const eventSource = new EventSource(
    `${AUTH_BASE}/v1/qr-login/events?login_id=${encodeURIComponent(loginId)}&client_id=${CLIENT_ID}`
  );

  eventSource.onmessage = async (e) => {
    try {
      const event = JSON.parse(e.data) as LoginStatusEvent;
      console.log('[SSE] Received event:', event.status, event);

      // Handle success status
      if (event.status === 'success' || event.status === 'completed') {
        console.log('[SSE] Login successful');

        // If we have an authorization code, exchange it for tokens
        if (event.code) {
          console.log('[SSE] Received authorization code, exchanging for tokens...');
          const codeVerifier = localStorage.getItem('pkce_verifier');
          if (codeVerifier) {
            const result = await exchangeCodeForTokens(event.code, codeVerifier);
            if (result.success) {
              console.log('[SSE] Token exchange successful');
              event.access_token = result.access_token;
              event.refresh_token = result.refresh_token;
            } else {
              console.error('[SSE] Token exchange failed:', result.error);
              event.status = 'failed';
              event.error = result.error;
            }
          } else {
            console.error('[SSE] No PKCE verifier found in session storage');
            event.status = 'failed';
            event.error = 'PKCE verifier not found';
          }
        } else if (event.access_token) {
          console.log('[SSE] Storing access token directly');
          setStoredToken(event.access_token);
          if (event.refresh_token) {
            setStoredRefreshToken(event.refresh_token);
          }
        }
      }

      onEvent(event);

      // Close connection on terminal states
      if (['success', 'failed', 'expired', 'completed'].includes(event.status)) {
        eventSource.close();
      }
    } catch (err) {
      console.error('Failed to parse SSE event:', err);
    }
  };

  eventSource.onerror = (e) => {
    console.error('SSE error:', e);
    onError?.(new Error('Connection lost'));
    eventSource.close();
  };

  return () => eventSource.close();
}

export async function getLoginStatus(loginId: string): Promise<LoginStatusEvent> {
  const response = await fetch(
    `${AUTH_BASE}/auth/login-status/${encodeURIComponent(loginId)}`
  );

  if (!response.ok) {
    throw new Error('Failed to get login status');
  }

  return response.json();
}

// ============================================================================
// WeChat MP OAuth (for WeChat browser)
// ============================================================================

export async function startWeChatMPOAuth(options: {
  redirectUri?: string;
  scope?: string;
} = {}): Promise<void> {
  const pkce = await generatePKCE();
  const state = generateState();
  const nonce = generateNonce();

  localStorage.setItem('pkce_verifier', pkce.codeVerifier);
  localStorage.setItem('oauth_state', state);
  localStorage.setItem('oauth_nonce', nonce);
  localStorage.setItem('wx_return_path', window.location.pathname + window.location.search);

  const origin = window.location.origin.replace('http://', 'https://');
  const redirectUri = options.redirectUri || `${origin}/auth/callback`;

  const authUrl = new URL(`${AUTH_BASE}/auth/wechat/authorize`);
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', options.scope || 'openid profile offline_access');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', pkce.codeChallenge);
  authUrl.searchParams.set('code_challenge_method', pkce.codeChallengeMethod);
  authUrl.searchParams.set('nonce', nonce);

  window.location.href = authUrl.toString();
}

export function isInWeChatBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return navigator.userAgent.toLowerCase().includes('micromessenger');
}

// ============================================================================
// User Profile
// ============================================================================

export async function getCurrentUser(): Promise<User | null> {
  const token = getStoredToken();

  if (!token) {
    return null;
  }

  try {
    const response = await authFetch(`${AUTH_BASE}/v1/users/me`);

    if (!response.ok) {
      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const retryResponse = await authFetch(`${AUTH_BASE}/v1/users/me`);
          if (retryResponse.ok) {
            return await retryResponse.json();
          }
        }
        clearStoredTokens();
        return null;
      }
      throw new Error('Failed to get user');
    }

    return await response.json();
  } catch (error) {
    console.error('[Auth] getCurrentUser error:', error);
    return null;
  }
}

export async function updateProfile(updates: {
  display_name?: string;
  avatar_url?: string;
  username?: string;
  bio?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await authFetch(`${AUTH_BASE}/v1/users/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.message || data.error || 'Update failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// ============================================================================
// Token Exchange (Authorization Code -> Tokens)
// ============================================================================

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  redirectUri?: string
): Promise<{ success: boolean; access_token?: string; refresh_token?: string; error?: string }> {
  try {
    const finalRedirectUri = redirectUri ?? (window.location.origin + '/auth/callback');
    const response = await fetch(`${AUTH_BASE}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        code_verifier: codeVerifier,
        client_id: CLIENT_ID,
        redirect_uri: finalRedirectUri,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Auth] Token exchange failed:', data);
      return { success: false, error: data.message || data.error || 'Token exchange failed' };
    }

    if (data.access_token) {
      setStoredToken(data.access_token);
    }
    if (data.refresh_token) {
      setStoredRefreshToken(data.refresh_token);
    }

    return {
      success: true,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };
  } catch (error) {
    console.error('[Auth] Token exchange error:', error);
    return { success: false, error: 'Network error during token exchange' };
  }
}

// ============================================================================
// Token Refresh
// ============================================================================

export async function refreshToken(): Promise<boolean> {
  const refresh = getStoredRefreshToken();
  if (!refresh) {
    return false;
  }

  try {
    const response = await fetch(`${AUTH_BASE}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh,
        client_id: CLIENT_ID,
      }),
    });

    if (!response.ok) {
      clearStoredTokens();
      return false;
    }

    const data: TokenResponse = await response.json();
    setStoredToken(data.access_token);
    if (data.refresh_token) {
      setStoredRefreshToken(data.refresh_token);
    }

    return true;
  } catch (error) {
    console.error('Token refresh error:', error);
    clearStoredTokens();
    return false;
  }
}

// ============================================================================
// SMS/Phone Authentication
// ============================================================================

export async function sendSmsCode(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${AUTH_BASE}/auth/sms/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        client_id: CLIENT_ID,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || data.error || 'Failed to send code' };
    }

    return { success: true };
  } catch (error) {
    console.error('Send SMS code error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export async function verifySmsCode(
  phone: string,
  code: string
): Promise<{ success: boolean; user?: User; access_token?: string; error?: string }> {
  try {
    const response = await fetch(`${AUTH_BASE}/auth/sms/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        code,
        client_id: CLIENT_ID,
        scope: 'openid profile email offline_access',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || data.error || 'Verification failed' };
    }

    if (data.access_token) {
      setStoredToken(data.access_token);
    }
    if (data.refresh_token) {
      setStoredRefreshToken(data.refresh_token);
    }

    const user: User = {
      id: parseInt(data.user.id, 10),
      email: data.user.email,
      display_name: data.user.name || data.user.display_name,
      avatar_url: data.user.picture || data.user.avatar_url,
      username: data.user.username || null,
      bio: null,
      is_admin: data.user.is_admin || false,
    };

    return { success: true, user, access_token: data.access_token };
  } catch (error) {
    console.error('Verify SMS code error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// ============================================================================
// Google OAuth
// ============================================================================

export async function startGoogleOAuth(options: {
  redirectUri?: string;
  scope?: string;
} = {}): Promise<void> {
  const pkce = await generatePKCE();
  const state = generateState();
  const nonce = generateNonce();

  localStorage.setItem('pkce_verifier', pkce.codeVerifier);
  localStorage.setItem('oauth_state', state);
  localStorage.setItem('oauth_nonce', nonce);
  localStorage.setItem('wx_return_path', window.location.pathname + window.location.search);

  const origin = window.location.origin.replace('http://', 'https://');
  const redirectUri = options.redirectUri || `${origin}/auth/callback`;

  const authUrl = new URL(`${AUTH_BASE}/auth/google/authorize`);
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', options.scope || 'openid email profile offline_access');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', pkce.codeChallenge);
  authUrl.searchParams.set('code_challenge_method', pkce.codeChallengeMethod);
  authUrl.searchParams.set('nonce', nonce);

  window.location.href = authUrl.toString();
}

// ============================================================================
// WeChat Binding (for account linking)
// ============================================================================

export async function completeWeChatMPBind(
  code: string,
  codeVerifier: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await authFetch(`${AUTH_BASE}/v1/users/me/connections/wechat/mp-bind`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        code_verifier: codeVerifier,
        redirect_uri: window.location.origin.replace('http://', 'https://') + '/auth/callback',
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.message || data.error || 'Binding failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('Complete WeChat MP bind error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}
