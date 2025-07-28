import {NextResponse} from 'next/server';
import {getServerSession} from 'next-auth/next';
import {authOptions} from '@/pages/api/auth/[...nextauth]';
import {google} from 'googleapis';
import {prisma} from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authOptions as any);
    const body = await request.json();
    const {includeCompleted = false} = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session as any)?.user?.id) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session as any).user.id;
    const accessToken = (session as {accessToken?: string}).accessToken;

    if (!accessToken) {
      return NextResponse.json(
        {error: 'Google access token not found'},
        {status: 401},
      );
    }

    // Google OAuth2 클라이언트 설정
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const tasks = google.tasks({version: 'v1', auth: oauth2Client});

    // 사용자의 할일 가져오기 (완료된 할일 포함 옵션에 따라)
    const todos = await prisma.todo.findMany({
      where: {
        userId: userId,
        ...(includeCompleted ? {} : {completed: false}),
      },
    });

    if (todos.length === 0) {
      return NextResponse.json({
        success: true,
        exportedCount: 0,
        message: '내보낼 할일이 없습니다.',
      });
    }

    let exportedCount = 0;
    const errors: string[] = [];

    // 각 할일을 Google Tasks로 내보내기
    for (const todo of todos) {
      try {
        // 할일 생성
        let notes = 'CAT DO에서 생성된 할일입니다.';

        if (todo.advice) {
          if (todo.adviceCat) {
            // 고양이 이름과 함께 조언 표시
            notes = `🐱 ${todo.adviceCat}의 한마디: ${todo.advice.replace(
              /^🐱\s*/,
              '',
            )}`;
          } else {
            // 고양이 이름이 없으면 기존 방식
            notes = `🐱 ${todo.advice}`;
          }
        }

        const task = {
          title: `${todo.text}`,
          notes,
          due: `${todo.date}T00:00:00.000Z`, // 마감일 설정
          status: todo.completed ? 'completed' : 'needsAction', // 완료 상태 설정
        };

        const response = await tasks.tasks.insert({
          tasklist: '@default',
          requestBody: task,
        });

        // 만약 할일이 완료된 상태라면, Google Tasks에서도 완료로 표시
        if (todo.completed && response.data.id) {
          await tasks.tasks.patch({
            tasklist: '@default',
            task: response.data.id,
            requestBody: {
              status: 'completed',
              completed: new Date().toISOString(),
            },
          });
        }

        exportedCount++;
      } catch (taskError) {
        console.error('Error exporting task:', taskError);
        errors.push(`할일 "${todo.text}" 내보내기 실패`);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({
        exportedCount,
        message: `${exportedCount}개 할일을 내보냈습니다. 일부 오류가 발생했습니다.`,
        errors,
      });
    }

    return NextResponse.json({
      success: true,
      exportedCount,
      message: `${exportedCount}개의 할일을 Google Tasks로 성공적으로 내보냈습니다!`,
    });
  } catch (error) {
    console.error('Google Tasks export all error:', error);
    return NextResponse.json(
      {error: 'Failed to export all to Google Tasks'},
      {status: 500},
    );
  }
}
