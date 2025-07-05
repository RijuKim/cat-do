"use client";

import Image from "next/image";
import cocoImg from "../../public/assets/coco.png";
import kakaoImg from "../../public/assets/kakao.png";

export default function SplashScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#B0E2F2]">
      <Image
        src={cocoImg}
        alt="캣두 로고"
        width={200}
        height={200}
        className="mb-8"
      />
      <h1 className="text-4xl font-bold mb-8">cat-do</h1>
      <button className="w-48" onClick={onLogin}>
        <Image
          src={kakaoImg}
          alt="로그인 아이콘"
          className="inline-block mr-2"
        />
      </button>
    </div>
  );
}
