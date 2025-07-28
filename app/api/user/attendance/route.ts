import {PrismaClient} from '@prisma/client';
import {NextRequest, NextResponse} from 'next/server';

const prisma = new PrismaClient();

// 출석 체크 가능 여부 확인
export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({error: 'User ID is required'}, {status: 400});
    }

    const user = await prisma.user.findUnique({
      where: {id: userId},
      select: {lastJellyDate: true},
    });

    if (!user) {
      return NextResponse.json({error: 'User not found'}, {status: 404});
    }

    const today = new Date().toISOString().split('T')[0];
    const canReceive = user.lastJellyDate !== today;

    return NextResponse.json({canReceive});
  } catch (error) {
    console.error('Error checking attendance:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}

// 출석 체크 (감정 체크 포함)
export async function POST(request: NextRequest) {
  try {
    const {userId, selectedCat, mood} = await request.json();

    if (!userId || !selectedCat || !mood) {
      return NextResponse.json(
        {error: 'User ID, selected cat, and mood are required'},
        {status: 400},
      );
    }

    const today = new Date().toISOString().split('T')[0];

    // 오늘 이미 출석 체크했는지 확인
    const user = await prisma.user.findUnique({
      where: {id: userId},
      select: {lastJellyDate: true, jellyCount: true, moodChecks: true},
    });

    if (!user) {
      return NextResponse.json({error: 'User not found'}, {status: 404});
    }

    if (user.lastJellyDate === today) {
      return NextResponse.json(
        {error: 'Already received attendance reward today'},
        {status: 400},
      );
    }

    // 젤리 카운트 증가 및 출석 기록 업데이트
    const updatedMoodChecks = (user.moodChecks as Record<string, string>) || {};
    updatedMoodChecks[today] = mood;

    const updatedUser = await prisma.user.update({
      where: {id: userId},
      data: {
        jellyCount: {increment: 1},
        lastJellyDate: today,
        moodChecks: updatedMoodChecks,
      },
      select: {jellyCount: true},
    });

    return NextResponse.json({
      success: true,
      jellyCount: updatedUser.jellyCount,
      message: 'Attendance recorded successfully',
    });
  } catch (error) {
    console.error('Error recording attendance:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
