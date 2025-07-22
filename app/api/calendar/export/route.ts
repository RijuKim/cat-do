import {NextResponse} from 'next/server';
import {getServerSession} from 'next-auth/next';
import {authOptions} from '@/pages/api/auth/[...nextauth]';
import {google} from 'googleapis';
import {prisma} from '@/lib/prisma';

export async function POST(request: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await getServerSession(authOptions as any);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(session as any)?.user?.id) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(session as any).accessToken) {
    return NextResponse.json(
      {
        error:
          'Google Calendar access token not found. Please connect your Google account.',
      },
      {status: 400},
    );
  }

  try {
    const {todoId, date} = await request.json();

    if (!todoId || !date) {
      return NextResponse.json(
        {error: 'todoId and date are required'},
        {status: 400},
      );
    }

    // 할일 정보 가져오기
    const todo = await prisma.todo.findUnique({
      where: {
        id: todoId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userId: (session as any).user.id, // 본인 것만
      },
    });

    if (!todo) {
      return NextResponse.json({error: 'Todo not found'}, {status: 404});
    }

    // Google Calendar API 클라이언트 설정
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );

    oauth2Client.setCredentials({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      access_token: (session as any).accessToken,
    });

    const tasks = google.tasks({version: 'v1', auth: oauth2Client});

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
      title: `📝 ${todo.text}`,
      notes,
      due: `${date}T00:00:00.000Z`, // 마감일 설정
    };

    const response = await tasks.tasks.insert({
      tasklist: '@default',
      requestBody: task,
    });

    return NextResponse.json({
      success: true,
      taskId: response.data.id,
      taskTitle: response.data.title,
      message: 'Google Tasks에 할일이 성공적으로 추가되었습니다!',
    });
  } catch (error) {
    console.error('Google Calendar export error:', error);

    if (error instanceof Error) {
      // 토큰 만료 등의 인증 오류
      if (
        error.message.includes('invalid_grant') ||
        error.message.includes('unauthorized')
      ) {
        return NextResponse.json(
          {
            error:
              'Google Calendar access expired. Please reconnect your account.',
          },
          {status: 401},
        );
      }
    }

    return NextResponse.json(
      {error: 'Failed to export to Google Tasks'},
      {status: 500},
    );
  }
}
