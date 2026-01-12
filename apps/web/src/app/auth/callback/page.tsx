"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Home } from 'lucide-react';
import { exchangeCodeForTokens, getStoredToken, completeWeChatMPBind } from '@/lib/authApi';
import { useAuth } from '@/contexts/AuthContext';

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string>('');
  const [isBindMode, setIsBindMode] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      const bindMode = localStorage.getItem('wx_bind_mode') === 'true';
      setIsBindMode(bindMode);

      if (errorParam) {
        setStatus('error');
        setError(errorDescription || errorParam || 'Authorization failed');
        cleanupLocalStorage(bindMode);
        return;
      }

      if (!code) {
        const existingToken = getStoredToken();
        if (existingToken) {
          await refreshUser();
          setStatus('success');
          const returnPath = localStorage.getItem('wx_return_path') || '/';
          cleanupLocalStorage(bindMode);
          setTimeout(() => router.push(returnPath), 1500);
          return;
        }

        const returnPath = localStorage.getItem('wx_return_path');
        if (returnPath) {
          cleanupLocalStorage(bindMode);
          router.push(returnPath);
          return;
        }

        setStatus('success');
        cleanupLocalStorage(bindMode);
        setTimeout(() => router.push('/'), 1500);
        return;
      }

      const storedState = localStorage.getItem('oauth_state');
      if (state && storedState && state !== storedState) {
        setStatus('error');
        setError('State validation failed. Please try again.');
        cleanupLocalStorage(bindMode);
        return;
      }

      const codeVerifier = localStorage.getItem('pkce_verifier');
      if (!codeVerifier) {
        const existingToken = getStoredToken();
        if (existingToken) {
          await refreshUser();
          setStatus('success');
          const returnPath = localStorage.getItem('wx_return_path') || '/';
          cleanupLocalStorage(bindMode);
          setTimeout(() => router.push(returnPath), 1500);
          return;
        }
        setStatus('error');
        setError(bindMode ? 'Binding session expired. Please try again.' : 'Login session expired. Please try again.');
        cleanupLocalStorage(bindMode);
        return;
      }

      if (bindMode) {
        const result = await completeWeChatMPBind(code, codeVerifier);

        if (!result.success) {
          setStatus('error');
          setError(result.error || 'Binding failed');
          cleanupLocalStorage(bindMode);
          return;
        }

        await refreshUser();
        setStatus('success');
        const returnPath = localStorage.getItem('wx_return_path') || '/profile';
        cleanupLocalStorage(bindMode);
        setTimeout(() => router.push(returnPath), 1500);
      } else {
        const result = await exchangeCodeForTokens(code, codeVerifier);

        if (!result.success) {
          setStatus('error');
          setError(result.error || 'Login failed');
          cleanupLocalStorage(bindMode);
          return;
        }

        await refreshUser();
        setStatus('success');
        cleanupLocalStorage(bindMode);
        setTimeout(() => router.push('/'), 1500);
      }
    };

    const cleanupLocalStorage = (bindMode: boolean) => {
      localStorage.removeItem('pkce_verifier');
      localStorage.removeItem('oauth_state');
      localStorage.removeItem('oauth_nonce');
      localStorage.removeItem('wx_login_id');
      localStorage.removeItem('wx_return_path');
      if (bindMode) {
        localStorage.removeItem('wx_bind_mode');
      }
    };

    handleCallback();
  }, [searchParams, router, refreshUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {status === 'processing' && 'Processing...'}
            {status === 'success' && (isBindMode ? 'Binding Successful' : 'Login Successful')}
            {status === 'error' && (isBindMode ? 'Binding Failed' : 'Login Failed')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          {status === 'processing' && (
            <>
              <Loader2 className="h-16 w-16 text-primary-500 animate-spin" />
              <p className="text-gray-600">
                {isBindMode ? 'Binding your account...' : 'Processing your login...'}
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-gray-600">
                {isBindMode ? 'Returning to profile...' : 'Redirecting to home...'}
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-red-500" />
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="flex gap-4">
                <Button onClick={() => router.push(isBindMode ? '/profile' : '/auth')} variant="outline">
                  {isBindMode ? 'Back to Profile' : 'Try Again'}
                </Button>
                <Button onClick={() => router.push('/')}>
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Processing...</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <Loader2 className="h-16 w-16 text-primary-500 animate-spin" />
            <p className="text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
