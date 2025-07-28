import {PrismaClient} from '@prisma/client';
import {NextRequest, NextResponse} from 'next/server';

const prisma = new PrismaClient();

// 로그인 추적 및 연속 로그인 업데이트
export async function POST(request: NextRequest) {
  try {
    const {userId} = await request.json();

    if (!userId) {
      return NextResponse.json({error: 'User ID is required'}, {status: 400});
    }

    const today = new Date().toISOString().split('T')[0];

    const user = await prisma.user.findUnique({
      where: {id: userId},
      select: {lastActivityDate: true, loginStreak: true},
    });

    if (!user) {
      return NextResponse.json({error: 'User not found'}, {status: 404});
    }

    let newLoginStreak = user.loginStreak;

    if (user.lastActivityDate) {
      const lastLogin = new Date(user.lastActivityDate);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - lastLogin.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // 연속 로그인
        newLoginStreak += 1;
      } else if (diffDays > 1) {
        // 연속이 끊어짐
        newLoginStreak = 1;
      }
      // diffDays === 0이면 이미 오늘 로그인했으므로 streak 유지
    } else {
      // 첫 로그인
      newLoginStreak = 1;
    }

    await prisma.user.update({
      where: {id: userId},
      data: {
        lastActivityDate: today,
        loginStreak: newLoginStreak,
      },
    });

    return NextResponse.json({
      success: true,
      loginStreak: newLoginStreak,
      message: 'Login tracked successfully',
    });
  } catch (error) {
    console.error('Error tracking login:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
