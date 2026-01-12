"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMobileEnvironment } from '@/hooks/use-mobile';
import { WeChatLoginForm } from '@/components/auth/WeChatLoginForm';
import { sendSmsCode, verifySmsCode, startGoogleOAuth } from '@/lib/authApi';
import { ArrowLeft, LogIn, Mail, Smartphone } from 'lucide-react';

// WeChat icon SVG component
const WeChatIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.045c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.006-.27-.027-.405-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" />
  </svg>
);

// Google icon SVG component
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const modalStyles = `
  .auth-page-overlay {
    position: fixed;
    inset: 0;
    background: linear-gradient(135deg, #fff7ed 0%, #fef3e2 50%, #ffedd5 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 20px;
  }

  .auth-back-btn {
    position: absolute;
    top: 20px;
    left: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 10px;
    color: #4a5568;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
  }

  .auth-back-btn:hover {
    background: #fff;
    color: #2d3748;
    transform: translateX(-2px);
  }

  .auth-modal {
    background: #fff;
    border-radius: 16px;
    width: 100%;
    max-width: 420px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .auth-modal-header {
    padding: 24px 24px 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .auth-modal-title {
    font-size: 22px;
    font-weight: 700;
    color: #ea580c;
    margin-bottom: 4px;
  }

  .auth-modal-subtitle {
    font-size: 14px;
    color: #718096;
  }

  .auth-modal-body {
    padding: 24px;
  }

  .auth-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .auth-tab {
    flex: 1;
    min-width: 70px;
    padding: 12px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: #fff;
    color: #4a5568;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s;
  }

  .auth-tab:hover {
    border-color: #cbd5e0;
    background: #f7fafc;
  }

  .auth-tab.active {
    border-color: #f97316;
    background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
    color: #ea580c;
  }

  .auth-tab svg {
    width: 18px;
    height: 18px;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .auth-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .auth-field label {
    font-size: 14px;
    font-weight: 500;
    color: #2d3748;
  }

  .auth-field input {
    padding: 12px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .auth-field input:focus {
    border-color: #f97316;
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
  }

  .auth-submit {
    padding: 14px 20px;
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
    margin-top: 8px;
  }

  .auth-submit:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  }

  .auth-submit:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .auth-submit svg {
    width: 18px;
    height: 18px;
  }

  .auth-modal-footer {
    padding: 16px 24px 24px;
    text-align: center;
    font-size: 13px;
    color: #718096;
    border-top: 1px solid #f0f0f0;
  }

  .wechat-section {
    text-align: center;
  }

  .phone-input-group {
    display: flex;
    gap: 8px;
  }

  .phone-input-group input {
    flex: 1;
    padding: 12px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .phone-input-group input:focus {
    border-color: #f97316;
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
  }

  .send-code-btn {
    padding: 12px 16px;
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
    min-width: 100px;
  }

  .send-code-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  }

  .send-code-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .google-btn {
    padding: 14px 20px;
    background: #fff;
    color: #333;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    transition: all 0.2s;
    width: 100%;
  }

  .google-btn:hover {
    background: #f7fafc;
    border-color: #cbd5e0;
  }

  @media (max-width: 480px) {
    .auth-page-overlay {
      padding: 16px;
    }

    .auth-back-btn {
      top: 12px;
      left: 12px;
      padding: 8px 12px;
      font-size: 13px;
    }

    .auth-modal {
      border-radius: 12px;
      max-height: 95vh;
    }

    .auth-tabs {
      gap: 6px;
    }

    .auth-tab {
      padding: 10px 8px;
      font-size: 12px;
    }

    .phone-input-group {
      flex-direction: column;
      gap: 10px;
    }

    .send-code-btn {
      width: 100%;
      min-width: unset;
    }
  }
`;

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [activeTab, setActiveTab] = useState<'wechat' | 'email' | 'phone' | 'google'>('wechat');
  const [showAllMethods, setShowAllMethods] = useState(false);
  const { signIn, refreshUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { isMobile, isWeChat } = useMobileEnvironment();

  // 移动端微信环境默认只显示微信登录
  const isMobileWeChat = isMobile && isWeChat;
  const shouldShowOnlyWeChat = isMobileWeChat && !showAllMethods;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = useCallback(async () => {
    if (!phone || phone.length !== 11) {
      toast({
        title: "Invalid phone number",
        description: "Please enter an 11-digit phone number",
        variant: "destructive"
      });
      return;
    }

    setSendingCode(true);
    const result = await sendSmsCode(phone);
    setSendingCode(false);

    if (result.success) {
      setCountdown(60);
      toast({
        title: "Code sent",
        description: "Please check your SMS messages"
      });
    } else {
      toast({
        title: "Failed to send",
        description: result.error,
        variant: "destructive"
      });
    }
  }, [phone, toast]);

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !smsCode) return;

    setLoading(true);
    const result = await verifySmsCode(phone, smsCode);
    setLoading(false);

    if (result.success) {
      await refreshUser();
      toast({
        title: "Login successful",
        description: "Welcome!"
      });
      router.push('/');
    } else {
      toast({
        title: "Login failed",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Login successful",
        description: "Welcome!"
      });
      router.push('/');
    }

    setLoading(false);
  };

  const handleWeChatSuccess = () => {
    toast({
      title: "Login successful",
      description: "Welcome!"
    });
    router.push('/');
  };

  const handleGoogleLogin = () => {
    startGoogleOAuth();
  };

  return (
    <>
      <style>{modalStyles}</style>
      <div className="auth-page-overlay">
        <Link href="/" className="auth-back-btn">
          <ArrowLeft size={16} />
          返回首页
        </Link>

        <div className="auth-modal">
          <div className="auth-modal-header">
            <div>
              <h2 className="auth-modal-title">TierMate</h2>
              <p className="auth-modal-subtitle">登录后发现更多好物</p>
            </div>
          </div>

          <div className="auth-modal-body">
            {/* 移动端微信环境：只显示微信登录 */}
            {shouldShowOnlyWeChat ? (
              <>
                <div className="wechat-section">
                  <WeChatLoginForm onSuccess={handleWeChatSuccess} />
                </div>
                <button
                  type="button"
                  onClick={() => setShowAllMethods(true)}
                  className="w-full mt-6 text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  使用其他登录方式
                </button>
              </>
            ) : (
              <>
                {/* Tabs */}
                <div className="auth-tabs">
                  <button
                    className={`auth-tab ${activeTab === 'wechat' ? 'active' : ''}`}
                    onClick={() => setActiveTab('wechat')}
                  >
                    <WeChatIcon />
                    微信
                  </button>
                  <button
                    className={`auth-tab ${activeTab === 'phone' ? 'active' : ''}`}
                    onClick={() => setActiveTab('phone')}
                  >
                    <Smartphone size={18} />
                    手机
                  </button>
                  <button
                    className={`auth-tab ${activeTab === 'email' ? 'active' : ''}`}
                    onClick={() => setActiveTab('email')}
                  >
                    <Mail size={18} />
                    邮箱
                  </button>
                  <button
                    className={`auth-tab ${activeTab === 'google' ? 'active' : ''}`}
                    onClick={() => setActiveTab('google')}
                  >
                    <GoogleIcon className="w-4 h-4" />
                    Google
                  </button>
                </div>

                {/* WeChat Login */}
                {activeTab === 'wechat' && (
                  <div className="wechat-section">
                    <WeChatLoginForm onSuccess={handleWeChatSuccess} />
                  </div>
                )}

                {/* Phone Login */}
                {activeTab === 'phone' && (
                  <form className="auth-form" onSubmit={handlePhoneLogin}>
                    <div className="auth-field">
                      <label htmlFor="phone">手机号</label>
                      <div className="phone-input-group">
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                          placeholder="请输入手机号"
                          required
                          maxLength={11}
                        />
                        <button
                          type="button"
                          className="send-code-btn"
                          onClick={handleSendCode}
                          disabled={sendingCode || countdown > 0 || phone.length !== 11}
                        >
                          {sendingCode ? '发送中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
                        </button>
                      </div>
                    </div>
                    <div className="auth-field">
                      <label htmlFor="smsCode">验证码</label>
                      <input
                        id="smsCode"
                        type="text"
                        value={smsCode}
                        onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="请输入6位验证码"
                        required
                        maxLength={6}
                      />
                    </div>
                    <button type="submit" className="auth-submit" disabled={loading || !phone || !smsCode}>
                      <LogIn size={18} />
                      {loading ? '登录中...' : '登录 / 注册'}
                    </button>
                  </form>
                )}

                {/* Email Login */}
                {activeTab === 'email' && (
                  <form className="auth-form" onSubmit={handleSignIn}>
                    <div className="auth-field">
                      <label htmlFor="email">邮箱</label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="请输入邮箱"
                        required
                      />
                    </div>
                    <div className="auth-field">
                      <label htmlFor="password">密码</label>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="请输入密码"
                        required
                      />
                    </div>
                    <button type="submit" className="auth-submit" disabled={loading}>
                      <LogIn size={18} />
                      {loading ? '登录中...' : '登录'}
                    </button>
                  </form>
                )}

                {/* Google Login */}
                {activeTab === 'google' && (
                  <div className="auth-form">
                    <button type="button" className="google-btn" onClick={handleGoogleLogin}>
                      <GoogleIcon className="w-5 h-5" />
                      使用 Google 账号登录
                    </button>
                    <p className="text-center text-sm text-gray-500 mt-4">
                      点击使用 Google 账号登录
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="auth-modal-footer">
            登录即表示同意服务条款
          </div>
        </div>
      </div>
    </>
  );
}
