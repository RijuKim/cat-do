import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';
import {getServerSession} from 'next-auth/next';
import {authOptions} from '@/pages/api/auth/[...nextauth]';

export async function PUT(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await getServerSession(authOptions as any);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(session as any)?.user?.id) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({error: 'Missing ID'}, {status: 400});
    }

    const data = await request.json();

    if (data.date) {
      data.date = String(data.date);
    }

    const updatedTodo = await prisma.todo.update({
      where: {
        id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userId: (session as any).user.id, // ✅ 본인 것만 수정!
      },
      data,
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error(`Failed to update todo:`, error);
    return NextResponse.json({error: 'Failed to update todo'}, {status: 500});
  }
}

/**
 * 특정 할 일을 삭제합니다.
 */
export async function DELETE(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await getServerSession(authOptions as any);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(session as any)?.user?.id) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({error: 'Missing ID'}, {status: 400});
    }

    await prisma.todo.delete({
      where: {
        id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userId: (session as any).user.id, // ✅ 본인 것만 삭제!
      },
    });

    return new NextResponse(null, {status: 204});
  } catch (error) {
    console.error(`Failed to delete todo:`, error);
    return NextResponse.json({error: 'Failed to delete todo'}, {status: 500});
  }
}
