'use client';

import SplashScreen from './component/SplashScreen';
import {signIn, useSession} from 'next-auth/react';
import {useRouter} from 'next/navigation';
import {useEffect} from 'react';

export default function HomePage() {
  const {data: session} = useSession();
  const router = useRouter();

  const handleKakaoLogin = () => {
    signIn('kakao');
  };

  const handleGoogleLogin = () => {
    signIn('google');
  };

  useEffect(() => {
    if (session) {
      router.push('/home');
    }
  }, [session, router]);

  return (
    <SplashScreen
      onKakaoLogin={handleKakaoLogin}
      onGoogleLogin={handleGoogleLogin}
    />
  );
}
