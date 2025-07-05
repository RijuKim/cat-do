import NextAuth from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  debug: true,
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, profile }: { token: JWT; profile?: any }) {
      if (profile) {
        const kakaoId = String(profile.id);

        let user = await prisma.user.findUnique({
          where: { kakaoId },
        });

        if (!user) {
          user = await prisma.user.create({
            data: { kakaoId },
          });
        }

        token.id = user.id;
      }
      if (!token.id && token.sub) {
        // `token.sub`는 카카오 고유 ID니까 다시 DB에서 찾기
        const user = await prisma.user.findUnique({
          where: { kakaoId: String(token.sub) },
        });

        if (user) {
          token.id = user.id;
        } else {
          throw new Error("User not found for token.sub");
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (!token.id) {
        throw new Error("Token.id is undefined");
      }
      session.user!.id = token.id as string;
      return session;
    },
  },
};

export default NextAuth(authOptions);
