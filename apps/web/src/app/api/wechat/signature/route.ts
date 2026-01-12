import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// 微信公众号配置（实际项目中应该从环境变量获取）
const WX_APP_ID = process.env.WECHAT_APP_ID || 'wx_app_id_placeholder';
const WX_APP_SECRET = process.env.WECHAT_APP_SECRET || 'wx_app_secret_placeholder';

// 缓存 access_token 和 jsapi_ticket
let accessTokenCache: { token: string; expiresAt: number } | null = null;
let jsapiTicketCache: { ticket: string; expiresAt: number } | null = null;

// 获取 access_token
async function getAccessToken(): Promise<string> {
  // 检查缓存
  if (accessTokenCache && Date.now() < accessTokenCache.expiresAt) {
    return accessTokenCache.token;
  }

  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WX_APP_ID}&secret=${WX_APP_SECRET}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.errcode) {
    throw new Error(`Failed to get access_token: ${data.errmsg}`);
  }

  accessTokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000, // 提前5分钟过期
  };

  return data.access_token;
}

// 获取 jsapi_ticket
async function getJsapiTicket(): Promise<string> {
  // 检查缓存
  if (jsapiTicketCache && Date.now() < jsapiTicketCache.expiresAt) {
    return jsapiTicketCache.ticket;
  }

  const accessToken = await getAccessToken();
  const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.errcode !== 0) {
    throw new Error(`Failed to get jsapi_ticket: ${data.errmsg}`);
  }

  jsapiTicketCache = {
    ticket: data.ticket,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000, // 提前5分钟过期
  };

  return data.ticket;
}

// 生成签名
function generateSignature(
  jsapiTicket: string,
  nonceStr: string,
  timestamp: number,
  url: string
): string {
  const str = `jsapi_ticket=${jsapiTicket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
  return crypto.createHash('sha1').update(str).digest('hex');
}

// 生成随机字符串
function generateNonceStr(): string {
  return Math.random().toString(36).substring(2, 15);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  try {
    const jsapiTicket = await getJsapiTicket();
    const nonceStr = generateNonceStr();
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature(jsapiTicket, nonceStr, timestamp, url);

    return NextResponse.json({
      appId: WX_APP_ID,
      timestamp,
      nonceStr,
      signature,
    });
  } catch (error) {
    console.error('Failed to generate WeChat signature:', error);
    return NextResponse.json(
      { error: 'Failed to generate signature' },
      { status: 500 }
    );
  }
}
