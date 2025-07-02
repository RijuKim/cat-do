import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

/**
 * 모든 할 일을 가져옵니다.
 */
export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Failed to fetch todos:', error);
    return NextResponse.json({error: 'Failed to fetch todos'}, {status: 500});
  }
}

/**
 * 새로운 할 일을 생성합니다.
 */
export async function POST(request: Request) {
  try {
    const {text, date} = await request.json();

    if (!text || !date) {
      return NextResponse.json(
        {error: 'Text and date are required'},
        {status: 400},
      );
    }

    const newTodo = await prisma.todo.create({
      data: {
        text,
        // ✅ 이제 date는 String으로 바로 넣음!
        date,
        completed: false,
        advice: '',
        celebration: '',
        adviceCat: '', // 새로운 할 일 생성 시 adviceCat을 null로 초기화
      },
    });

    return NextResponse.json(newTodo, {status: 201});
  } catch (error) {
    console.error('Failed to create todo:', error);
    return NextResponse.json({error: 'Failed to create todo'}, {status: 500});
  }
}
