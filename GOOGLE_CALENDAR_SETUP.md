# 📝 Google Tasks API 설정 가이드

## 1. Google Cloud Console 설정

### Step 1: 프로젝트 생성 및 API 활성화

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **API 및 서비스 > 라이브러리**로 이동
4. "Google Calendar API"와 "Google Tasks API" 검색 후 둘 다 활성화

### Step 2: OAuth 2.0 자격 증명 생성

1. **API 및 서비스 > 사용자 인증 정보**로 이동
2. **+ 사용자 인증 정보 만들기 > OAuth 클라이언트 ID** 선택
3. 애플리케이션 유형: **웹 애플리케이션**
4. 승인된 자바스크립트 원본:
   ```
   http://localhost:3000
   https://your-domain.com
   ```
5. 승인된 리디렉션 URI:
   ```
   http://localhost:3000/api/auth/callback/google
   https://your-domain.com/api/auth/callback/google
   ```

### Step 3: OAuth 동의 화면 구성

1. **OAuth 동의 화면** 탭으로 이동
2. 사용자 유형: **외부** (테스트 사용자 추가 가능)
3. 필수 정보 입력:
   - 앱 이름: `CAT DO`
   - 사용자 지원 이메일
   - 개발자 연락처 정보
4. **범위** 섹션에서 다음 스코프 추가:
   ```
   https://www.googleapis.com/auth/calendar
   https://www.googleapis.com/auth/calendar.events
   https://www.googleapis.com/auth/tasks
   ```

## 2. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수 추가:

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## 3. 사용법

### 할일을 구글 캘린더로 내보내기

1. CAT DO에서 할일 생성
2. 할일 항목 옆의 📅 (캘린더) 아이콘 클릭
3. 처음 사용 시 Google 계정 연결 필요
4. 성공적으로 내보내면 구글 캘린더에 이벤트가 생성됩니다

### 내보내지는 이벤트 형식

- **제목**: 📝 [할일 내용]
- **설명**: 🐱 [AI 조언] (조언이 있는 경우)
- **날짜**: 종일 이벤트로 생성
- **소스**: CAT DO로 표시

## 4. 문제 해결

### "Google Calendar access token not found" 에러

- Google 계정이 연결되지 않음
- 해결: 로그아웃 후 Google로 다시 로그인

### "access expired" 에러

- Google 액세스 토큰 만료
- 해결: 세션을 새로고침하거나 다시 로그인

### "unauthorized" 에러

- OAuth 설정 문제
- 해결: 리디렉션 URI와 도메인 설정 확인

## 5. 테스트 방법

1. 개발 서버 실행: `npm run dev`
2. Google 계정으로 로그인
3. 할일 생성 후 Google Tasks 내보내기 테스트
4. Google Calendar 또는 Gmail의 Tasks 섹션에서 할일 확인

## 6. 향후 계획

- [ ] Google Tasks에서 할일 가져오기 (역방향 동기화)
- [ ] 양방향 실시간 동기화
- [ ] Tasks 완료/미완료 상태 동기화
- [ ] 다중 작업 목록 지원
