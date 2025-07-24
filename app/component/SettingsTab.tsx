'use client';

import React, {useState, useEffect} from 'react';
import {useSession, signOut} from 'next-auth/react';
import GoogleCalendarStatus from './GoogleCalendarStatus';
import Image from 'next/image';
import {
  FaDownload,
  FaSync,
  FaCheck,
  FaExclamationTriangle,
  FaUpload,
} from 'react-icons/fa';

interface SettingsTabProps {
  selectedCat: string;
  onCatChange: (cat: string) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  selectedCat,
  onCatChange,
}) => {
  const {data: session} = useSession() as {data: {accessToken?: string} | null};
  const [fetchStatus, setFetchStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [fetchMessage, setFetchMessage] = useState('');
  const [exportStatus, setExportStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [exportMessage, setExportMessage] = useState('');
  const [includeCompleted, setIncludeCompleted] = useState(false);
  const [tempSelectedCat, setTempSelectedCat] = useState(selectedCat);

  // selectedCat이 변경될 때마다 tempSelectedCat도 업데이트
  useEffect(() => {
    setTempSelectedCat(selectedCat);
  }, [selectedCat]);

  const handleGoogleTasksFetch = async () => {
    if (!session?.accessToken) {
      setFetchStatus('error');
      setFetchMessage('Google 계정이 연결되지 않았습니다.');
      return;
    }

    setFetchStatus('loading');
    setFetchMessage('Google Tasks에서 할일을 가져오는 중...');

    try {
      const response = await fetch('/api/tasks/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setFetchStatus('success');
        setFetchMessage(
          `✅ ${data.importedCount || 0}개의 할일을 성공적으로 가져왔습니다!`,
        );
        setTimeout(() => {
          setFetchStatus('idle');
          setFetchMessage('');
        }, 3000);
      } else {
        setFetchStatus('error');
        setFetchMessage(`❌ ${data.error || '가져오기에 실패했습니다.'}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      setFetchStatus('error');
      setFetchMessage('❌ Google Tasks 가져오기에 실패했습니다.');
    }
  };

  const handleGoogleTasksExportAll = async () => {
    if (!session?.accessToken) {
      setExportStatus('error');
      setExportMessage('Google 계정이 연결되지 않았습니다.');
      return;
    }

    setExportStatus('loading');
    setExportMessage('모든 할일을 Google Tasks로 내보내는 중...');

    try {
      const response = await fetch('/api/tasks/export-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          includeCompleted,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setExportStatus('success');
        setExportMessage(`✅ ${data.message}`);
        setTimeout(() => {
          setExportStatus('idle');
          setExportMessage('');
        }, 3000);
      } else {
        setExportStatus('error');
        setExportMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error('Export all error:', error);
      setExportStatus('error');
      setExportMessage('❌ 전체 내보내기에 실패했습니다.');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 pb-24">
      {/* 제목 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">⚙️ Settings</h2>
        <p className="text-gray-600 text-sm">앱 설정을 관리하세요</p>
      </div>

      {/* 고양이 선택 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          🐱 고양이 선택
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          당신의 할일을 도와줄 고양이를 선택하세요
        </p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            {
              name: '두두',
              personality: '츤데레 치즈냥',
              img: '/assets/dodo.png',
            },
            {
              name: '코코',
              personality: '우아하고 느긋한 완벽주의냥',
              img: '/assets/coco.png',
            },
            {
              name: '깜냥',
              personality: '솔직하고 귀찮음이 많은냥',
              img: '/assets/kkamnyang.png',
            },
          ].map(cat => (
            <div
              key={cat.name}
              onClick={() => setTempSelectedCat(cat.name)}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 text-center ${
                tempSelectedCat === cat.name
                  ? 'bg-orange-100 ring-2 ring-orange-300 shadow-md'
                  : 'bg-gray-50 hover:bg-gray-100 hover:shadow-sm'
              }`}>
              <div className="relative w-16 h-16 mx-auto mb-2">
                <Image
                  src={cat.img}
                  alt={cat.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800">
                  {cat.name}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  {cat.personality}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 현재 선택된 고양이 표시 */}
        <div className="mb-3 p-2 bg-gray-50 rounded-lg text-sm text-gray-600 text-center">
          현재 선택:{' '}
          <span className="font-semibold text-orange-600">{selectedCat}</span>
        </div>

        {/* 선택 완료 버튼 */}
        <button
          onClick={() => onCatChange(tempSelectedCat)}
          disabled={tempSelectedCat === selectedCat}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            tempSelectedCat === selectedCat
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-orange-400 text-white hover:bg-orange-500'
          }`}>
          {tempSelectedCat === selectedCat
            ? '현재 선택됨'
            : `${tempSelectedCat} 선택하기`}
        </button>
      </div>

      {/* Google Tasks 연결 상태 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          🔗 Google Tasks 연결
        </h3>
        <GoogleCalendarStatus />
      </div>

      {/* Google Tasks 가져오기 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          📥 Google Tasks 가져오기
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Google Tasks에 있는 할일들을 캣두로 가져올 수 있습니다.
        </p>

        <button
          onClick={handleGoogleTasksFetch}
          disabled={fetchStatus === 'loading' || !session?.accessToken}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
            fetchStatus === 'loading'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : session?.accessToken
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}>
          {fetchStatus === 'loading' ? (
            <>
              <FaSync className="animate-spin" />
              가져오는 중...
            </>
          ) : (
            <>
              <FaDownload />
              Google Tasks 가져오기
            </>
          )}
        </button>

        {/* 상태 메시지 */}
        {fetchMessage && (
          <div
            className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${
              fetchStatus === 'success'
                ? 'bg-green-50 text-green-800'
                : fetchStatus === 'error'
                ? 'bg-red-50 text-red-800'
                : 'bg-blue-50 text-blue-800'
            }`}>
            {fetchStatus === 'success' && <FaCheck className="flex-shrink-0" />}
            {fetchStatus === 'error' && (
              <FaExclamationTriangle className="flex-shrink-0" />
            )}
            {fetchStatus === 'loading' && (
              <FaSync className="animate-spin flex-shrink-0" />
            )}
            <span className="text-sm">{fetchMessage}</span>
          </div>
        )}

        {/* 도움말 */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            💡 <strong>팁:</strong> 중복된 할일은 자동으로 건너뜁니다. 기존 CAT
            DO 할일은 그대로 유지됩니다.
          </p>
        </div>
      </div>

      {/* Google Tasks 전체 내보내기 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          📤 Google Tasks 전체 내보내기
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          캣두의 할일들을 Google Tasks로 한번에 내보낼 수 있습니다.
        </p>

        {/* 완료된 할일 포함 옵션 */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeCompleted}
              onChange={e => setIncludeCompleted(e.target.checked)}
              className="settings-checkbox"
            />
            <div>
              <span className="text-sm font-medium text-gray-800">
                완료된 할일도 포함하기
              </span>
              <p className="text-xs text-gray-600 mt-1">
                체크하면 완료된 할일도 Google Tasks로 내보내며, Google
                Tasks에서도 완료 상태로 표시됩니다.
              </p>
            </div>
          </label>
        </div>

        <button
          onClick={handleGoogleTasksExportAll}
          disabled={exportStatus === 'loading' || !session?.accessToken}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
            exportStatus === 'loading'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : session?.accessToken
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}>
          {exportStatus === 'loading' ? (
            <>
              <FaSync className="animate-spin" />
              내보내는 중...
            </>
          ) : (
            <>
              <FaUpload />
              모든 할일 내보내기
            </>
          )}
        </button>

        {/* 상태 메시지 */}
        {exportMessage && (
          <div
            className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${
              exportStatus === 'success'
                ? 'bg-green-50 text-green-800'
                : exportStatus === 'error'
                ? 'bg-red-50 text-red-800'
                : 'bg-blue-50 text-blue-800'
            }`}>
            {exportStatus === 'success' && (
              <FaCheck className="flex-shrink-0" />
            )}
            {exportStatus === 'error' && (
              <FaExclamationTriangle className="flex-shrink-0" />
            )}
            {exportStatus === 'loading' && (
              <FaSync className="animate-spin flex-shrink-0" />
            )}
            <span className="text-sm">{exportMessage}</span>
          </div>
        )}

        {/* 도움말 */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            💡 <strong>팁:</strong> 기본적으로는 미완료 할일만 내보냅니다.
            &quot;완료된 할일도 포함하기&quot;를 체크하면 완료된 할일도 Google
            Tasks에서 완료 상태로 내보내집니다. 조언이 있는 할일은 고양이 조언도
            함께 내보내집니다.
          </p>
        </div>
      </div>

      {/* 로그아웃 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          👋 계정 관리
        </h3>
        <button
          onClick={() => signOut({callbackUrl: '/'})}
          className="w-full bg-gray-200 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-500 transition-colors">
          로그아웃
        </button>
      </div>

      {/* 버전 정보 */}
      <div className="text-center text-gray-500 text-xs mt-8">
        <p>CAT DO v1.0.0</p>
        <p>🐱 고양이와 함께하는 할일 관리</p>
      </div>
    </div>
  );
};

export default SettingsTab;
