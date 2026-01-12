'use client';

import { useEffect, useCallback } from 'react';
import {
  configureWeChatShare,
  getDefaultShareConfig,
  getProductShareConfig,
  WeChatShareConfig,
} from '@/lib/wechat';

/**
 * 使用默认分享配置的 Hook
 */
export function useWeChatShare(customConfig?: Partial<WeChatShareConfig>) {
  useEffect(() => {
    const config = getDefaultShareConfig(customConfig);
    configureWeChatShare(config);
  }, [customConfig]);
}

/**
 * 产品详情页专用的分享 Hook
 */
export function useProductShare(product: {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
} | null) {
  useEffect(() => {
    if (!product) return;

    const config = getProductShareConfig(product);
    configureWeChatShare(config);
  }, [product]);
}

/**
 * 手动触发分享配置的 Hook
 */
export function useManualShare() {
  const configureShare = useCallback(async (config: WeChatShareConfig) => {
    return configureWeChatShare(config);
  }, []);

  return { configureShare };
}
