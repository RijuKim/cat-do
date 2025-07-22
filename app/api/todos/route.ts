import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';
import {getServerSession} from 'next-auth/next';
import {authOptions} from '@/pages/api/auth/[...nextauth]';

export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await getServerSession(authOptions as any);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(session as any)?.user?.id) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  try {
    const todos = await prisma.todo.findMany({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: {userId: (session as any).user.id}, // ✅ 본인 것만!
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

export async function POST(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await getServerSession(authOptions as any);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(session as any)?.user?.id) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

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
        date,
        completed: false,
        advice: '',
        celebration: '',
        adviceCat: '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userId: (session as any).user.id,
      },
    });

    return NextResponse.json(newTodo, {status: 201});
  } catch (error) {
    console.error('Failed to create todo:', error);
    return NextResponse.json({error: 'Failed to create todo'}, {status: 500});
  }
}
