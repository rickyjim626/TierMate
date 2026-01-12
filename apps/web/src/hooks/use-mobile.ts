'use client';

import { useState, useEffect, useMemo } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

export function useIsWeChat() {
  const [isWeChat, setIsWeChat] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    setIsWeChat(/micromessenger/i.test(ua));
  }, []);

  return isWeChat;
}

export function useMobileEnvironment() {
  const [env, setEnv] = useState({
    isMobile: false,
    isWeChat: false,
    isIOS: false,
    isAndroid: false,
  });

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    setEnv({
      isMobile: /iphone|ipad|ipod|android|mobile/i.test(ua),
      isWeChat: /micromessenger/i.test(ua),
      isIOS: /iphone|ipad|ipod/i.test(ua),
      isAndroid: /android/i.test(ua),
    });
  }, []);

  return env;
}

export function useWeChatCapabilities() {
  const isWeChat = useIsWeChat();

  return useMemo(
    () => ({
      isWeChat,
      canShare: isWeChat,
      canScanQR: isWeChat,
      hasAddressBar: !isWeChat,
      hasNativeShare: isWeChat,
    }),
    [isWeChat]
  );
}
