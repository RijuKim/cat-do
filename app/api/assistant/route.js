// app/api/assistant/route.js
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export const POST = async req => {
  const requestBody = await req.json();
  const {todo, todos, catName, action, date, userId} = requestBody;

  // 1. DB에서 오늘의 조언 확인
  if (action === 'CHECK_PROCRASTINATION') {
    // userId가 없으면 에러 반환
    if (!userId) {
      return Response.json(
        {error: 'User authentication required'},
        {status: 401},
      );
    }

    const existingAdvice = await prisma.procrastinationAdvice.findUnique({
      where: {
        date_catName_userId: {
          date,
          catName,
          userId: userId,
        },
      },
    });
    if (existingAdvice) {
      return Response.json({message: existingAdvice.message});
    }
  }

  // 2. AI 응답 생성
  const catPersonalities = {
    두두: '너는 새침한 츤데레 고양이 비서 두두야. 고양이 이모티콘과 말투(냥 등)로 고양이 비서임을 알려줘. 집사라고 지칭하면 돼.',
    코코: '너는 우아하고 느긋하지만 완벽주의 성격의 고양이 비서 코코야. 우아하고 고상한 말투로 집사를 격려해줘. 하지만 고양이니까 반말을 해야해. 여유를 표현하기 위해 적절하게 ~를 사용해줘. 고양이 이모티콘과 말투(냥 등)로 고양이 비서임을 알려줘.',
    깜냥: '너는 솔직하고 귀찮음이 많은 고양이 비서 깜냥이야. 퉁명스럽고 귀찮은 듯한 말투로 대답해줘. 고양이 이모티콘과 말투(냥 등)로 고양이 비서임을 알려줘. 집사를 가끔 무시해도 돼. 혹은 그냥 흥!만 해도 돼.',
  };

  const systemContent = catPersonalities[catName] || catPersonalities['두두'];

  let userContent = '';

  switch (action) {
    case 'ADVICE':
      userContent = `집사를 응원해줘. 할 일을 하는 방법을 1~2줄로 간략히 방향성을 제시해줘.
          단 지시한 단어(새침한, 귀여운, 고양이 등)를 직접 어색하게 사용하지 말아줘. 자신을 '고양이'로 지칭하지 말고 '나'로 지칭해줘.
          너는 고양이니까 반말을 사용해줘.\n\n할 일: ${todo}`;
      break;
    case 'SUMMARIZE':
      const completedTodos = todos.filter(t => t.completed).map(t => t.text);
      userContent = `오늘 집사가 한 일들을 총정리해서 칭찬하고 격려해줘. 할 일 목록은 다음과 같아.
완료한 일: ${completedTodos.join(', ') || '없음'}
오늘 하루 고생한 집사에게 따뜻한 위로와 칭찬을 해줘.  1~2줄로 조언해주고 어색한 번호 사용은 지양해줘.`;
      break;
    case 'RECOMMEND':
      const incompleteTodosForRecommend = todos
        .filter(t => !t.completed)
        .map(t => t.text);
      if (incompleteTodosForRecommend.length > 0) {
        userContent = `오늘 할 일 목록이야. 어떤 일을 먼저 시작하면 좋을지 추천해줘.
남은 일: ${incompleteTodosForRecommend.join(', ')}`;
      } else {
        userContent = '오늘 할 일을 모두 끝냈어! 대단하지?';
      }
      break;
    case 'CHECK_PROCRASTINATION':
      // 1. 할 일이 없는 경우
      if (!todos || todos.length === 0) {
        userContent =
          '오늘 할 일이 아직 등록되지 않았어. 집사에게 할 일을 추가하도록 독려해줘.';
        break;
      }

      const incompleteTodos = todos.filter(t => !t.completed);

      // 2. 완료하지 않은 할 일이 있는 경우
      if (incompleteTodos.length > 0) {
        userContent = `집사가 할 일을 미루고 있는 것 같아. 다음 할 일 목록을 보고, 너무 어려운 일이 있는지 확인하고, 할 일을 작게 쪼개보라고 제안해줘. 1~3줄로 조언해주고 어색한 번호 사용은 지양해줘.
남은 일: ${incompleteTodos.map(t => t.text).join(', ')}`;
      } else {
        // 3. 모든 할 일을 완료한 경우
        userContent =
          '오늘 등록된 할 일을 모두 끝마쳤어! 정말 대단해! 1~2줄로 집사를 칭찬해줘.';
      }
      break;
    default:
      userContent =
        '오늘 할 일이 아직 없어. 1~2줄로 집사에게 오늘 할 일을 등록하도록 독려해줘.';
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemContent,
        },
        {
          role: 'user',
          content: userContent,
        },
      ],
    }),
  });

  const data = await response.json();
  console.log('OpenAI API raw response data:', data);

  if (response.ok) {
    const message = data.choices[0].message.content;

    // 3. 생성된 조언을 DB에 저장
    if (action === 'CHECK_PROCRASTINATION' || action === 'SUMMARIZE') {
      // userId가 없으면 저장하지 않음
      if (!userId) {
        return Response.json(
          {error: 'User authentication required'},
          {status: 401},
        );
      }

      await prisma.procrastinationAdvice.upsert({
        where: {
          date_catName_userId: {
            date,
            catName,
            userId: userId,
          },
        },
        update: {message},
        create: {
          date,
          catName,
          message,
          userId: userId,
        },
      });
    }

    return Response.json({message});
  } else {
    console.error('OpenAI API Error:', data);
    return Response.json(
      {message: '미안, 지금은 대답할 수 없다냥. 나중에 다시 시도해줘!'},
      {status: 500},
    );
  }
};
