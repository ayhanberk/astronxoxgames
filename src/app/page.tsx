'use client';

import React, { useEffect } from 'react';
import { LoginScreen } from '@/components/game/LoginScreen';
import { useLobbyStore } from '@/store/useLobbyStore';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { currentUser } = useLobbyStore();
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      router.push('/lobbies');
    }
  }, [currentUser, router]);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background">
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>
      <LoginScreen />
    </main>
  );
}
