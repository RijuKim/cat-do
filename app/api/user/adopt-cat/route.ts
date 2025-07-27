import {PrismaClient} from '@prisma/client';
import {NextRequest, NextResponse} from 'next/server';

const prisma = new PrismaClient();

// 고양이 입양 (젤리 10개 소모)
export async function POST(request: NextRequest) {
  try {
    const {userId, catName} = await request.json();

    if (!userId || !catName) {
      return NextResponse.json(
        {error: 'User ID and cat name are required'},
        {status: 400},
      );
    }

    // 유효한 고양이 이름인지 확인
    const validCats = ['두두', '코코', '깜냥'];
    if (!validCats.includes(catName)) {
      return NextResponse.json({error: 'Invalid cat name'}, {status: 400});
    }

    const user = await prisma.user.findUnique({
      where: {id: userId},
      select: {
        jellyCount: true,
        unlockedCats: true,
      },
    });

    if (!user) {
      return NextResponse.json({error: 'User not found'}, {status: 404});
    }

    // 이미 입양된 고양이인지 확인
    if (user.unlockedCats.includes(catName)) {
      return NextResponse.json({
        success: false,
        message: '이미 입양된 고양이예요!',
        jellyCount: user.jellyCount,
      });
    }

    // 젤리가 충분한지 확인 (10개 필요)
    if (user.jellyCount < 10) {
      return NextResponse.json({
        success: false,
        message: '젤리가 부족해요! 10개가 필요해요.',
        jellyCount: user.jellyCount,
        required: 10,
      });
    }

    // 고양이 입양 및 젤리 차감
    const updatedUser = await prisma.user.update({
      where: {id: userId},
      data: {
        jellyCount: user.jellyCount - 10,
        unlockedCats: {
          push: catName,
        },
      },
      select: {
        jellyCount: true,
        unlockedCats: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${catName} 고양이를 입양했어요! 🐱`,
      jellyCount: updatedUser.jellyCount,
      unlockedCats: updatedUser.unlockedCats,
    });
  } catch (error) {
    console.error('Error adopting cat:', error);
    return NextResponse.json({error: 'Failed to adopt cat'}, {status: 500});
  }
}

// 사용자의 입양된 고양이 목록 조회
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
        unlockedCats: true,
      },
    });

    if (!user) {
      return NextResponse.json({error: 'User not found'}, {status: 404});
    }

    return NextResponse.json({
      unlockedCats: user.unlockedCats,
    });
  } catch (error) {
    console.error('Error fetching unlocked cats:', error);
    return NextResponse.json(
      {error: 'Failed to fetch unlocked cats'},
      {status: 500},
    );
  }
}
