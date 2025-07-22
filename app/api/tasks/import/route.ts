import {NextResponse} from 'next/server';
import {getServerSession} from 'next-auth/next';
import {authOptions} from '@/pages/api/auth/[...nextauth]';
import {google} from 'googleapis';
import {prisma} from '@/lib/prisma';

export async function POST() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authOptions as any);

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

    // 모든 태스크 리스트 가져오기
    const taskListsResponse = await tasks.tasklists.list();
    const taskLists = taskListsResponse.data.items || [];

    let importedCount = 0;
    const errors: string[] = [];

    // 각 태스크 리스트에서 할일들 가져오기
    for (const taskList of taskLists) {
      try {
        const tasksResponse = await tasks.tasks.list({
          tasklist: taskList.id!,
          showCompleted: false, // 완료되지 않은 할일만 가져오기
          maxResults: 100,
        });

        const googleTasks = tasksResponse.data.items || [];

        for (const googleTask of googleTasks) {
          try {
            // 이미 존재하는지 확인 (title과 notes로 중복 체크)
            const existingTodo = await prisma.todo.findFirst({
              where: {
                userId: userId,
                text: googleTask.title || '',
              },
            });

            if (!existingTodo && googleTask.title) {
              // 새로운 할일 생성 (오늘 날짜로)
              const today = new Date().toISOString().split('T')[0];
              await prisma.todo.create({
                data: {
                  text: googleTask.title,
                  completed: false,
                  date: today,
                  user: {
                    connect: {id: userId},
                  },
                },
              });
              importedCount++;
            }
          } catch (taskError) {
            console.error('Error importing task:', taskError);
            errors.push(`할일 "${googleTask.title}" 가져오기 실패`);
          }
        }
      } catch (listError) {
        console.error('Error processing task list:', listError);
        errors.push(`태스크 리스트 "${taskList.title}" 처리 실패`);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({
        importedCount,
        message: `${importedCount}개 할일을 가져왔습니다. 일부 오류가 발생했습니다.`,
        errors,
      });
    }

    return NextResponse.json({
      success: true,
      importedCount,
      message: `Google Tasks에서 ${importedCount}개의 할일을 성공적으로 가져왔습니다!`,
    });
  } catch (error) {
    console.error('Google Tasks import error:', error);
    return NextResponse.json(
      {error: 'Failed to import from Google Tasks'},
      {status: 500},
    );
  }
}
