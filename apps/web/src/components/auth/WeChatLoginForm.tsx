"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { generatePKCE, generateState, generateNonce } from '@/lib/pkce';
import {
  startQrLogin,
  subscribeLoginEvents,
  getLoginStatus,
  exchangeCodeForTokens,
  startWeChatMPOAuth,
  isInWeChatBrowser,
  CLIENT_ID,
  type LoginStatusEvent,
} from '@/lib/authApi';
import { useAuth } from '@/contexts/AuthContext';
import { QrCode, CheckCircle, XCircle, Clock, RefreshCw, Smartphone, LogIn } from 'lucide-react';

// WeChat icon SVG component
const WeChatIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.045c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.006-.27-.027-.405-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" />
  </svg>
);

const successStyles = `
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.5);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

interface WeChatLoginFormProps {
  onSuccess?: () => void;
}

type LoginStatus = 'pending' | 'scanned' | 'authorized' | 'approved' | 'completed' | 'success' | 'failed' | 'expired';

export function WeChatLoginForm({ onSuccess }: WeChatLoginFormProps) {
  const { refreshUser } = useAuth();
  const [qrUrl, setQrUrl] = useState<string>('');
  const [loginId, setLoginId] = useState<string>('');
  const [status, setStatus] = useState<LoginStatus>('pending');
  const [error, setError] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [isLoading, setIsLoading] = useState(true);
  const [isWeChat, setIsWeChat] = useState(false);
  const [mpLoading, setMpLoading] = useState(false);

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const timerRef = useRef<number | null>(null);
  const pollingRef = useRef<number | null>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  // Check if in WeChat browser on mount
  useEffect(() => {
    const inWeChat = isInWeChatBrowser();
    setIsWeChat(inWeChat);

    // Only initialize QR login if not in WeChat browser
    if (!inWeChat) {
      initLogin();
    } else {
      setIsLoading(false);
    }

    return cleanup;
  }, []);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'WECHAT_LOGIN_SUCCESS' && event.data?.source === 'xiaojinpro-auth') {
        cleanup();
        setStatus('completed');

        if (event.data.code) {
          const codeVerifier = localStorage.getItem('pkce_verifier');
          if (codeVerifier) {
            const result = await exchangeCodeForTokens(
              event.data.code,
              codeVerifier,
              event.data.redirect_uri || undefined
            );
            if (result.success) {
              console.log('[WeChatLogin] Token exchange successful');
            } else {
              setError(result.error || 'Token exchange failed');
              setStatus('failed');
              return;
            }
          } else {
            setError('PKCE verifier missing');
            setStatus('failed');
            return;
          }
        }

        handleSuccess();
      }
    };

    const pollInterval = window.setInterval(() => {
      const successMarker = localStorage.getItem('wx_login_success');
      if (successMarker && loginId && successMarker === loginId) {
        localStorage.removeItem('wx_login_success');
        cleanup();
        handleSuccess();
      }
    }, 500);

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(pollInterval);
    };
  }, [loginId]);

  useEffect(() => {
    if (timeLeft <= 0 && status === 'pending') {
      setStatus('expired');
      setError('QR code expired, please refresh');
    }
  }, [timeLeft, status]);

  const cleanup = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
  };

  const initLogin = async () => {
    try {
      setIsLoading(true);
      setError('');

      const pkce = await generatePKCE();
      const state = generateState();
      const nonce = generateNonce();

      localStorage.setItem('pkce_verifier', pkce.codeVerifier);
      localStorage.setItem('oauth_state', state);
      localStorage.setItem('oauth_nonce', nonce);
      localStorage.setItem('wx_return_path', window.location.pathname + window.location.search);

      const response = await startQrLogin({
        client_id: CLIENT_ID,
        scope: 'openid profile offline_access',
        code_challenge: pkce.codeChallenge,
        code_challenge_method: pkce.codeChallengeMethod,
        nonce,
      });

      setQrUrl(response.wechat_qr_url);
      setLoginId(response.login_id);
      localStorage.setItem('wx_login_id', response.login_id);

      startStatusMonitoring(response.login_id);
      startTimer();

      setIsLoading(false);
    } catch (err) {
      console.error('Failed to init login:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize login');
      setIsLoading(false);
    }
  };

  const startStatusMonitoring = (id: string) => {
    unsubscribeRef.current = subscribeLoginEvents(
      id,
      handleStatusUpdate,
      (err) => {
        console.error('SSE error:', err);
        startPolling(id);
      }
    );
  };

  const startPolling = (id: string) => {
    pollingRef.current = window.setInterval(async () => {
      try {
        const event = await getLoginStatus(id);
        handleStatusUpdate(event);
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);
  };

  const handleStatusUpdate = async (event: LoginStatusEvent) => {
    const normalizedStatus = event.status.toLowerCase() as LoginStatus;
    setStatus(normalizedStatus);

    if (normalizedStatus === 'success' || normalizedStatus === 'completed') {
      await handleSuccess();
    } else if (normalizedStatus === 'failed') {
      setError(event.error || 'Login failed');
    } else if (normalizedStatus === 'expired') {
      setError('QR code expired');
    }
  };

  const handleSuccess = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      await refreshUser();
      localStorage.removeItem('pkce_verifier');
      localStorage.removeItem('oauth_state');
      localStorage.removeItem('oauth_nonce');
      localStorage.removeItem('wx_login_id');
      localStorage.removeItem('wx_return_path');
      setStatus('success');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('[WeChatLogin] Post-login error:', err);
      setError('Login succeeded but failed to load user info');
      setStatus('failed');
    }
  };

  const startTimer = () => {
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
  };

  const handleRetry = () => {
    cleanup();
    setStatus('pending');
    setError('');
    setTimeLeft(300);
    initLogin();
  };

  // Handle WeChat MP (Service Account) one-click login
  const handleWeChatMPLogin = async () => {
    try {
      setMpLoading(true);
      setError('');
      await startWeChatMPOAuth();
      // Note: This will redirect the page, so we won't reach here
    } catch (err) {
      console.error('WeChat MP OAuth error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start WeChat login');
      setMpLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <QrCode className="h-12 w-12 text-primary-500 animate-pulse" />;
      case 'scanned':
        return <Smartphone className="h-12 w-12 text-blue-500 animate-bounce" />;
      case 'authorized':
      case 'approved':
      case 'completed':
        return <Clock className="h-12 w-12 text-yellow-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'failed':
      case 'expired':
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return <QrCode className="h-12 w-12 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Scan with WeChat to login';
      case 'scanned':
        return 'Scanned, please confirm on your phone';
      case 'authorized':
      case 'approved':
        return 'Authorizing...';
      case 'completed':
        return 'Processing...';
      case 'success':
        return 'Login successful!';
      case 'failed':
        return 'Login failed';
      case 'expired':
        return 'QR code expired';
      default:
        return '';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((300 - timeLeft) / 300) * 100;

  // WeChat MP (Service Account) one-click login UI for WeChat browser
  if (isWeChat) {
    return (
      <>
        <style>{successStyles}</style>
        <div className="space-y-6">
          {status === 'success' ? (
            <div className="flex flex-col items-center py-8">
              <div
                className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4"
                style={{ animation: 'scaleIn 0.3s ease-out' }}
              >
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <p className="text-lg font-medium text-green-600 mb-2">Login Successful</p>
              <p className="text-sm text-gray-500">Redirecting...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center py-6">
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4">
                  <WeChatIcon className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">WeChat Quick Login</h3>
                <p className="text-sm text-gray-500 text-center mb-6">
                  Click the button below to authorize with your WeChat account
                </p>

                <Button
                  onClick={handleWeChatMPLogin}
                  disabled={mpLoading}
                  className="w-full max-w-xs bg-green-500 hover:bg-green-600 text-white py-6 text-lg"
                >
                  {mpLoading ? (
                    <>
                      <Clock className="h-5 w-5 mr-2 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 mr-2" />
                      Login with WeChat
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </>
    );
  }

  // QR code login UI for non-WeChat browsers
  return (
    <>
      <style>{successStyles}</style>
      <div className="space-y-6">
        {status === 'success' ? (
          <div className="flex flex-col items-center py-8">
            <div
              className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4"
              style={{ animation: 'scaleIn 0.3s ease-out' }}
            >
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <p className="text-lg font-medium text-green-600 mb-2">Login Successful</p>
            <p className="text-sm text-gray-500">Redirecting...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center">{getStatusIcon()}</div>
            <p className="text-center text-lg font-medium text-gray-900">{getStatusText()}</p>
          </>
        )}

        {!isLoading && qrUrl && status === 'pending' && (
          <div className="flex justify-center">
            <div
              ref={iframeContainerRef}
              className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden"
              style={{ width: '300px', height: '400px' }}
            >
              <iframe
                src={qrUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                sandbox="allow-scripts allow-same-origin"
                title="WeChat QR Code"
              />
            </div>
          </div>
        )}

        {status === 'pending' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Time remaining</span>
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {(status === 'expired' || status === 'failed') && (
          <Button onClick={handleRetry} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh QR Code
          </Button>
        )}
      </div>
    </>
  );
}
