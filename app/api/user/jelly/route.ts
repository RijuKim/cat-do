import {PrismaClient} from '@prisma/client';
import {NextRequest, NextResponse} from 'next/server';

const prisma = new PrismaClient();

// 젤리 조회
export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({error: 'User ID is required'}, {status: 400});
  }

  try {
    const user = await prisma.user.findUnique({
      where: {id: userId},
      select: {
        jellyCount: true,
        lastJellyDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({error: 'User not found'}, {status: 404});
    }

    return NextResponse.json({
      jellyCount: user.jellyCount,
      lastJellyDate: user.lastJellyDate,
    });
  } catch (error) {
    console.error('Error fetching jelly data:', error);
    return NextResponse.json(
      {error: 'Failed to fetch jelly data'},
      {status: 500},
    );
  }
}

// 젤리 획득 (하루에 한 번)
export async function POST(request: NextRequest) {
  try {
    const {userId} = await request.json();

    if (!userId) {
      return NextResponse.json({error: 'User ID is required'}, {status: 400});
    }

    const today = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD 형식

    const user = await prisma.user.findUnique({
      where: {id: userId},
      select: {
        jellyCount: true,
        lastJellyDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({error: 'User not found'}, {status: 404});
    }

    // 오늘 이미 젤리를 받았는지 확인
    if (user.lastJellyDate === today) {
      return NextResponse.json({
        success: false,
        message: '오늘은 이미 젤리를 받았어요!',
        jellyCount: user.jellyCount,
        canReceive: false,
      });
    }

    // 젤리 획득
    const updatedUser = await prisma.user.update({
      where: {id: userId},
      data: {
        jellyCount: user.jellyCount + 1,
        lastJellyDate: today,
      },
      select: {
        jellyCount: true,
        lastJellyDate: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: '젤리 1개를 획득했어요! 🍬',
      jellyCount: updatedUser.jellyCount,
      canReceive: true,
    });
  } catch (error) {
    console.error('Error claiming jelly:', error);
    return NextResponse.json({error: 'Failed to claim jelly'}, {status: 500});
  }
}
