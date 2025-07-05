// app/api/advice/route.ts
import {PrismaClient} from '@prisma/client';
import {NextResponse} from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const {searchParams} = new URL(req.url);
  const date = searchParams.get('date');
  const catName = searchParams.get('catName');

  if (!date || !catName) {
    return NextResponse.json(
      {error: 'date and catName are required'},
      {status: 400},
    );
  }

  try {
    const advice = await prisma.procrastinationAdvice.findUnique({
      where: {
        date_catName: {
          date,
          catName,
        },
      },
    });

    if (advice) {
      return NextResponse.json(advice);
    } else {
      // 조언이 없는 경우, 404 대신 null을 포함한 200 OK를 반환해야
      // 클라이언트에서 새로운 조언을 생성하는 로직으로 넘어갈 수 있습니다.
      return NextResponse.json(null, {status: 200});
    }
  } catch (error) {
    console.error('Failed to fetch advice:', error);
    return NextResponse.json({error: 'Failed to fetch advice'}, {status: 500});
  }
}
