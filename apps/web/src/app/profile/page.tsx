'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { MobileLayout, MobileProfilePage } from '@/components/mobile';

export default function ProfilePage() {
  const isMobile = useIsMobile();

  const handleLogout = () => {
    // 实际项目中这里应该清除登录状态并跳转
    console.log('Logout clicked');
  };

  if (isMobile) {
    return (
      <MobileLayout showTabBar={true} showHeader={false}>
        <MobileProfilePage onLogout={handleLogout} />
      </MobileLayout>
    );
  }

  // 桌面端个人中心（简化版本）
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">个人中心</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">请登录查看个人信息</p>
        </div>
      </div>
    </div>
  );
}
