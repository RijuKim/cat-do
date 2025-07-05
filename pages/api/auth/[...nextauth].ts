import NextAuth, {Profile, Account, User, Session} from 'next-auth';
import KakaoProvider from 'next-auth/providers/kakao';
import {JWT} from 'next-auth/jwt';
import {prisma} from '@/lib/prisma';

// ✅ Kakao 전용 Profile 확장 타입
interface KakaoProfile extends Profile {
  id: string | number;
}

export const authOptions = {
  debug: true,
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
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
      const {token, profile} = params;

      if (profile) {
        const kakaoProfile = profile as KakaoProfile;
        const kakaoId = String(kakaoProfile.id);

        let user = await prisma.user.findUnique({
          where: {kakaoId},
        });

        if (!user) {
          user = await prisma.user.create({
            data: {kakaoId},
          });
        }

        token.id = user.id;
      }

      if (!token.id && token.sub) {
        const user = await prisma.user.findUnique({
          where: {kakaoId: String(token.sub)},
        });

        if (user) {
          token.id = user.id;
        } else {
          throw new Error('User not found for token.sub');
        }
      }

      return token;
    },

    async session({session, token}: {session: Session; token: JWT}) {
      if (!token.id) {
        throw new Error('Token.id is undefined');
      }
      session.user!.id = token.id as string;
      return session;
    },
  },
};

export default NextAuth(authOptions);
