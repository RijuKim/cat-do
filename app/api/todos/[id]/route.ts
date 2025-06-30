import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

/**
 * 특정 할 일을 수정합니다.
 */
export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({error: 'Missing ID'}, {status: 400});
    }

    const data = await request.json();

    // ✅ date 수정 시 안전가드
    if (data.date) {
      data.date = String(data.date);
    }

    const updatedTodo = await prisma.todo.update({
      where: {id},
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
  try {
    // ✅ 안전하게 URL에서 ID 추출
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({error: 'Missing ID'}, {status: 400});
    }

    await prisma.todo.delete({
      where: {id},
    });

    return new NextResponse(null, {status: 204}); // No Content
  } catch (error) {
    console.error(`Failed to delete todo:`, error);
    return NextResponse.json({error: 'Failed to delete todo'}, {status: 500});
  }
}
