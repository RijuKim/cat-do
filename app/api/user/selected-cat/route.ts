import {NextRequest, NextResponse} from 'next/server';
import {prisma} from '../../../../lib/prisma';

// eslint-disable-next-line @typescript-eslint/no-explicit-any

// GET: 사용자의 선택된 고양이 조회
export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {error: '사용자 ID가 필요합니다.'},
        {status: 400},
      );
    }

    const user = (await prisma.user.findUnique({
      where: {id: userId},
      select: {selectedCat: true},
    })) as {selectedCat: string | null} | null;

    if (!user) {
      return NextResponse.json(
        {error: '사용자를 찾을 수 없습니다.'},
        {status: 404},
      );
    }

    console.log('사용자 선택된 고양이:', user.selectedCat);
    return NextResponse.json({
      selectedCat: user.selectedCat || '두두',
    });
  } catch (error) {
    console.error('선택된 고양이 조회 오류:', error);
    return NextResponse.json(
      {error: '서버 오류가 발생했습니다.'},
      {status: 500},
    );
  }
}

// PUT: 사용자의 선택된 고양이 업데이트
export async function PUT(request: NextRequest) {
  try {
    const {userId, selectedCat} = await request.json();

    if (!userId) {
      return NextResponse.json(
        {error: '사용자 ID가 필요합니다.'},
        {status: 400},
      );
    }

    if (!selectedCat || !['두두', '코코', '깜냥'].includes(selectedCat)) {
      return NextResponse.json(
        {error: '유효하지 않은 고양이 선택입니다.'},
        {status: 400},
      );
    }

    console.log('고양이 선택 업데이트:', {userId, selectedCat});

    const updatedUser = (await prisma.user.update({
      where: {id: userId},
      data: {selectedCat},
      select: {selectedCat: true},
    })) as {selectedCat: string | null};

    console.log('업데이트된 사용자:', updatedUser);
    return NextResponse.json({selectedCat: updatedUser.selectedCat});
  } catch (error) {
    console.error('선택된 고양이 업데이트 오류:', error);
    return NextResponse.json(
      {error: '서버 오류가 발생했습니다.'},
      {status: 500},
    );
  }
}
