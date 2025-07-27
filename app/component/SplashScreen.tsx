'use client';

import Image from 'next/image';
import {FaPaw, FaHeart} from 'react-icons/fa';
import duduImg from '../../public/assets/dodo.png';
import kakaoImg from '../../public/assets/kakao.png';

interface SplashScreenProps {
  onKakaoLogin: () => void;
  onGoogleLogin: () => void;
}

export default function SplashScreen({
  onKakaoLogin,
  onGoogleLogin,
}: SplashScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* 배경 장식 요소들 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 떠다니는 고양이 발자국들 */}
        <div
          className="absolute top-20 left-10 text-orange-200 text-4xl animate-bounce"
          style={{animationDelay: '0s'}}>
          <FaPaw />
        </div>
        <div
          className="absolute top-40 right-20 text-pink-200 text-3xl animate-bounce"
          style={{animationDelay: '1s'}}>
          <FaPaw />
        </div>
        <div
          className="absolute bottom-40 left-20 text-purple-200 text-5xl animate-bounce"
          style={{animationDelay: '2s'}}>
          <FaPaw />
        </div>
        <div
          className="absolute bottom-20 right-10 text-orange-200 text-3xl animate-bounce"
          style={{animationDelay: '0.5s'}}>
          <FaPaw />
        </div>

        {/* 떠다니는 하트들 */}
        <div
          className="absolute top-60 left-1/4 text-pink-200 text-2xl animate-pulse"
          style={{animationDelay: '0.3s'}}>
          <FaHeart />
        </div>
        <div
          className="absolute bottom-60 right-1/4 text-purple-200 text-3xl animate-pulse"
          style={{animationDelay: '1.5s'}}>
          <FaHeart />
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* 로고 섹션 */}
        <div className="text-center mb-12">
          {/* 메인 로고 */}
          <div className="relative mb-8">
            <Image
              src={duduImg}
              alt="캣두 로고"
              width={120}
              height={120}
              className="mx-auto rounded-full shadow-lg border-4 border-orange-200"
            />
            {/* 로고 주변 장식 */}
            <div className="absolute -top-2 -right-2 text-pink-400 animate-pulse">
              <FaHeart size={24} />
            </div>
            <div
              className="absolute -bottom-2 -left-2 text-purple-400 animate-pulse"
              style={{animationDelay: '0.5s'}}>
              <FaHeart size={20} />
            </div>
          </div>

          {/* 타이틀 */}
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            CAT DO
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            🐱 고양이와 함께하는 할일 관리
          </p>
        </div>

        {/* 로그인 버튼들 */}
        <div className="space-y-4 w-full max-w-sm">
          {/* 카카오 로그인 */}
          <button
            onClick={onKakaoLogin}
            className="w-full group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 opacity-90 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-center gap-3 px-6 py-4">
              <Image
                src={kakaoImg}
                alt="카카오"
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="text-black font-bold text-lg">
                카카오로 시작하기
              </span>
            </div>
          </button>

          {/* 구글 로그인 */}
          <button
            onClick={onGoogleLogin}
            className="w-full group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white border-2 border-gray-200 hover:border-gray-300">
            <div className="flex items-center justify-center gap-3 px-6 py-4">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-gray-700 font-bold text-lg">
                Google로 시작하기
              </span>
            </div>
          </button>
        </div>

        {/* 하단 장식 */}
        <div className="mt-12 text-center">
          <div className="flex justify-center gap-2 mb-4">
            <FaPaw className="text-orange-300 text-xl" />
            <FaHeart className="text-pink-300 text-xl" />
            <FaPaw className="text-purple-300 text-xl" />
          </div>
          <p className="text-xs text-gray-400">
            귀여운 고양이들과 함께 더 즐거운 하루를 만들어보세요! 🐱✨
          </p>
        </div>
      </div>
    </div>
  );
}
