"use client";

import SplashScreen from "./component/SplashScreen";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogin = () => {
    signIn("kakao");
  };

  useEffect(() => {
    if (session) {
      router.push("/home");
    }
  }, [session]);

  return <SplashScreen onLogin={handleLogin} />;
}
