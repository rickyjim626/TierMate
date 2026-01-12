'use client';

import { MobileBloggerProfile } from '@/components/mobile/blogger';

interface UserPageProps {
  params: {
    id: string;
  };
}

export default function UserPage({ params }: UserPageProps) {
  return <MobileBloggerProfile userId={params.id} />;
}
