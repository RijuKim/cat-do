'use client';

import {useSession, signIn} from 'next-auth/react';
import {FaGoogle, FaCalendarAlt, FaExclamationTriangle} from 'react-icons/fa';

interface ExtendedSession {
  accessToken?: string;
  user?: {
    id: string;
    name?: string | null;
  };
}

export default function GoogleCalendarStatus() {
  const {data: session} = useSession();

  const isGoogleConnected = !!(session as ExtendedSession)?.accessToken;

  if (isGoogleConnected) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-green-600" />
          <span className="text-green-800 text-sm font-medium">
            ✅ Google Tasks 연결됨 - 할일을 Google Tasks로 내보낼 수 있습니다!
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <FaExclamationTriangle className="text-amber-600 mt-1 flex-shrink-0" />
        <div className="flex-grow">
          <p className="text-amber-800 text-sm font-medium mb-2">
            📝 Google Tasks가 연결되지 않았습니다
          </p>
          <p className="text-amber-700 text-xs mb-3">
            할일을 Google Tasks로 내보내려면 Google 계정을 연결해주세요.
          </p>
          <button
            onClick={() => signIn('google')}
            className="inline-flex items-center gap-2 bg-white border border-amber-300 text-amber-800 px-3 py-2 rounded-md text-sm hover:bg-amber-50 transition-colors">
            <FaGoogle className="text-blue-500" />
            Google 계정 연결하기
          </button>
        </div>
      </div>
    </div>
  );
}
