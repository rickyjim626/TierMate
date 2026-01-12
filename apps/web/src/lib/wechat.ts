/**
 * 微信 JS-SDK 工具库
 * 用于配置微信分享等功能
 */

declare global {
  interface Window {
    wx: WeChatJSSDK;
  }
}

interface WeChatJSSDK {
  config: (config: WxConfig) => void;
  ready: (callback: () => void) => void;
  error: (callback: (res: { errMsg: string }) => void) => void;
  updateAppMessageShareData: (config: ShareConfig) => void;
  updateTimelineShareData: (config: ShareConfig) => void;
  onMenuShareAppMessage: (config: ShareConfig) => void;
  onMenuShareTimeline: (config: ShareConfig) => void;
}

interface WxConfig {
  debug?: boolean;
  appId: string;
  timestamp: number;
  nonceStr: string;
  signature: string;
  jsApiList: string[];
}

interface ShareConfig {
  title: string;
  desc?: string;
  link: string;
  imgUrl: string;
  success?: () => void;
  cancel?: () => void;
}

interface SignatureResponse {
  appId: string;
  timestamp: number;
  nonceStr: string;
  signature: string;
}

// 微信分享配置参数
export interface WeChatShareConfig {
  title: string;
  desc: string;
  link: string;
  imgUrl: string;
}

// 获取微信 JS-SDK 签名
async function getWeChatSignature(url: string): Promise<SignatureResponse> {
  const response = await fetch(`/api/wechat/signature?url=${encodeURIComponent(url)}`);
  if (!response.ok) {
    throw new Error('Failed to get WeChat signature');
  }
  return response.json();
}

// 加载微信 JS-SDK 脚本
function loadWeChatScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.wx) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load WeChat JS-SDK'));
    document.head.appendChild(script);
  });
}

// 配置微信分享
export async function configureWeChatShare(config: WeChatShareConfig): Promise<boolean> {
  try {
    // 检测是否在微信环境中
    const isWeChat = /MicroMessenger/i.test(navigator.userAgent);
    if (!isWeChat) {
      console.log('Not in WeChat environment, skipping share configuration');
      return false;
    }

    // 加载 JS-SDK
    await loadWeChatScript();

    // 获取签名
    const currentUrl = window.location.href.split('#')[0];
    const signatureData = await getWeChatSignature(currentUrl);

    // 配置 wx
    window.wx.config({
      debug: process.env.NODE_ENV === 'development',
      appId: signatureData.appId,
      timestamp: signatureData.timestamp,
      nonceStr: signatureData.nonceStr,
      signature: signatureData.signature,
      jsApiList: [
        'updateAppMessageShareData',
        'updateTimelineShareData',
        'onMenuShareAppMessage',
        'onMenuShareTimeline',
      ],
    });

    // 等待 ready
    return new Promise((resolve) => {
      window.wx.ready(() => {
        // 分享给朋友
        window.wx.updateAppMessageShareData({
          title: config.title,
          desc: config.desc,
          link: config.link,
          imgUrl: config.imgUrl,
          success: () => {
            console.log('Share to friend configured');
          },
        });

        // 分享到朋友圈
        window.wx.updateTimelineShareData({
          title: config.title,
          link: config.link,
          imgUrl: config.imgUrl,
          success: () => {
            console.log('Share to timeline configured');
          },
        });

        resolve(true);
      });

      window.wx.error((res) => {
        console.error('WeChat config error:', res.errMsg);
        resolve(false);
      });
    });
  } catch (error) {
    console.error('Failed to configure WeChat share:', error);
    return false;
  }
}

// 默认分享配置
export function getDefaultShareConfig(overrides?: Partial<WeChatShareConfig>): WeChatShareConfig {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return {
    title: 'TierMate - 发现好物，分享美好',
    desc: '在这里发现优质产品，分享你的使用体验，与志同道合的人交流心得。',
    link: baseUrl,
    imgUrl: `${baseUrl}/og-image.png`,
    ...overrides,
  };
}

// 产品详情分享配置
export function getProductShareConfig(product: {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}): WeChatShareConfig {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return {
    title: product.title,
    desc: product.description,
    link: `${baseUrl}/product/${product.id}`,
    imgUrl: product.imageUrl,
  };
}
