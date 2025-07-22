# 🐱 CAT DO

**고양이 비서와 함께하는 스마트 할일 관리 앱**

CAT DO는 귀여운 고양이 캐릭터들이 당신의 할일을 도와주는 AI 기반 할일 관리 애플리케이션입니다. 각기 다른 성격을 가진 고양이 비서들이 개인화된 조언과 격려를 통해 생산성 향상을 도와줍니다.

## ✨ 주요 기능

### 🎯 스마트 할일 관리

- **개인화된 할일 목록**: 날짜별로 할일을 체계적으로 관리
- **실시간 완료율 추적**: 달성도를 시각적으로 확인
- **직관적인 UI**: 체크박스, 편집, 삭제 기능

### 🐾 AI 고양이 비서

**3가지 개성 넘치는 고양이 캐릭터:**

- **두두** 🐱: 새침한 츤데레 고양이 - 도도하지만 따뜻한 조언
- **코코** 😸: 다정한 개냥이 - 친근하고 격려하는 조언
- **깜냥** 😾: 불친절한 고양이 - 직설적이고 솔직한 조언

### 🤖 AI 기반 조언 시스템

- **개별 할일 조언**: 특정 할일에 대한 맞춤형 실행 방법 제안
- **일일 요약**: 하루 성과에 대한 종합적인 피드백
- **지연 감지**: 미루는 습관을 파악하고 개선 방안 제시
- **완료 축하**: 성취감을 높이는 개인화된 축하 메시지

### 📅 캘린더 통합

- **월별 뷰**: 할일이 있는 날짜를 한눈에 파악
- **완료 표시**: 모든 할일을 완료한 날 특별 표시
- **접이식 UI**: 필요에 따라 캘린더 숨김/표시

### 🔐 보안 및 개인정보

- **카카오 소셜 로그인**: 간편하고 안전한 인증
- **사용자별 데이터 분리**: 완전한 개인정보 보호
- **세션 관리**: 자동 로그인 상태 유지

## 🛠️ 기술 스택

### Frontend

- **Next.js 14**: React 기반 풀스택 프레임워크
- **TypeScript**: 타입 안전성 보장
- **Tailwind CSS**: 모던하고 반응형 디자인
- **React Icons**: 일관된 아이콘 시스템

### Backend & Database

- **Next.js API Routes**: 서버리스 API 엔드포인트
- **Prisma ORM**: 타입 안전한 데이터베이스 액세스
- **PostgreSQL**: 안정적인 관계형 데이터베이스 (Neon 호스팅)

### Authentication & AI

- **NextAuth.js**: 카카오 OAuth 2.0 인증
- **OpenAI GPT-4**: 자연어 기반 AI 조언 생성

## 🚀 시작하기

### 1. 프로젝트 클론 및 설치

```bash
git clone <repository-url>
cd cat-do
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 값들을 설정하세요:

```env
# Database
DATABASE_URL="your-postgresql-connection-string"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Kakao OAuth
KAKAO_CLIENT_ID="your-kakao-client-id"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"
```

### 3. 데이터베이스 설정

```bash
# Prisma 마이그레이션 실행
npx prisma migrate dev

# Prisma 클라이언트 생성
npx prisma generate
```

### 4. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
```

[http://localhost:3000](http://localhost:3000)에서 애플리케이션을 확인할 수 있습니다.

## 📁 프로젝트 구조

```
cat-do/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   ├── advice/        # 조언 관리 API
│   │   ├── assistant/     # AI 어시스턴트 API
│   │   ├── auth/          # NextAuth 설정
│   │   └── todos/         # 할일 CRUD API
│   ├── component/         # 재사용 가능한 컴포넌트
│   ├── home/             # 메인 페이지
│   └── hooks/            # 커스텀 React 훅
├── prisma/               # 데이터베이스 스키마 및 마이그레이션
├── public/assets/        # 고양이 캐릭터 이미지
└── types/               # TypeScript 타입 정의
```

## 🎨 주요 컴포넌트

- **`useTodos`**: 할일 관리 로직을 담은 커스텀 훅
- **`CatSelectorModal`**: 고양이 캐릭터 선택 모달
- **`FoldableCalendar`**: 접이식 캘린더 컴포넌트
- **API Routes**: RESTful API 엔드포인트

## 🎯 사용법

1. **카카오 계정으로 로그인**
2. **원하는 고양이 비서 선택** (두두/코코/깜냥)
3. **오늘의 할일 추가**
4. **할일 완료시 체크** ✅
5. **AI 조언 받기** 💡 - 전구 아이콘 클릭
6. **일일 요약 확인** - 모든 할일 완료시 자동 생성

## 🔧 개발 가이드

### 데이터베이스 스키마 수정

```bash
# 스키마 변경 후
npx prisma migrate dev --name describe-your-changes
npx prisma generate
```

### API 엔드포인트

- `GET /api/todos` - 할일 목록 조회
- `POST /api/todos` - 새 할일 생성
- `PUT /api/todos/[id]` - 할일 수정
- `DELETE /api/todos/[id]` - 할일 삭제
- `GET /api/advice` - 저장된 조언 조회
- `POST /api/assistant` - AI 조언 생성

## 📝 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Made with ❤️ and Cats by Rijoo**
