import NextAuth from 'next-auth';
import type {Session} from 'next-auth';
import KakaoProvider from 'next-auth/providers/kakao';
import GoogleProvider from 'next-auth/providers/google';
import {JWT} from 'next-auth/jwt';
import {prisma} from '@/lib/prisma';

// ✅ 필요한 타입들 정의
interface Profile {
  sub?: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
}

interface Account {
  provider: string;
  access_token?: string;
  refresh_token?: string;
  [key: string]: unknown;
}

interface User {
  id: string;
  [key: string]: unknown;
}

// ✅ Kakao 전용 Profile 확장 타입
interface KakaoProfile extends Profile {
  id: string | number;
}

export const authOptions = {
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            'openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/tasks',
        },
      },
    }),
  ],
  callbacks: {
    async jwt(params: {
      token: JWT;
      user?: User;
      account?: Account | null;
      profile?: Profile | undefined;
      trigger?: 'signIn' | 'signUp' | 'update';
      isNewUser?: boolean;
    }) {
      const {token, profile, account} = params;

      // Google OAuth 액세스 토큰 저장
      if (account?.provider === 'google') {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }

      if (profile) {
        if (account?.provider === 'kakao') {
          const kakaoProfile = profile as KakaoProfile;
          const kakaoId = String(kakaoProfile.id);

          let user = await prisma.user.findUnique({
            where: {kakaoId},
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                kakaoId,
                email: profile.email || null,
                name: profile.name || null,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any,
            });
          }

          token.id = user.id;
        } else if (account?.provider === 'google') {
          const googleId = String(profile.sub);

          let user = await prisma.user.findUnique({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            where: {googleId} as any,
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                googleId,
                email: profile.email || null,
                name: profile.name || null,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any,
            });
          }

          token.id = user.id;
        }
      }

      if (!token.id && token.sub) {
        // 먼저 kakaoId로 검색
        let user = await prisma.user.findUnique({
          where: {kakaoId: String(token.sub)},
        });

        // kakaoId로 찾지 못하면 googleId로 검색
        if (!user) {
          user = await prisma.user.findUnique({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            where: {googleId: String(token.sub)} as any,
          });
        }

        if (user) {
          token.id = user.id;
        } else {
          console.warn('User not found for token.sub:', token.sub);
          // 에러를 던지지 않고 새 사용자를 생성하거나 무시
        }
      }

      return token;
    },

    async session({session, token}: {session: Session; token: JWT}) {
      if (token.id) {
        session.user!.id = token.id as string;
      }
      // Google Calendar API를 위한 액세스 토큰 추가
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default NextAuth(authOptions);
