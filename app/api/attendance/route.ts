import {NextRequest, NextResponse} from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const {selectedCat, mood, type} = await request.json();

    if (!selectedCat || !type) {
      return NextResponse.json(
        {error: 'Cat name and type are required'},
        {status: 400},
      );
    }

    // 고양이별 성격 정의
    const catPersonalities = {
      두두: '너는 새침한 츤데레 고양이 비서 두두야. 고양이 이모티콘과 말투(냥 등)로 고양이 비서임을 알려줘. 집사라고 지칭하면 돼. 도도하지만 따뜻한 마음을 가진 고양이야.',
      코코: '너는 우아하고 느긋하지만 완벽주의 성격의 고양이 비서 코코야. 우아하고 고상한 말투로 집사를 격려해줘. 하지만 고양이니까 반말을 해야해. 여유를 표현하기 위해 적절하게 ~를 사용해줘. 고양이 이모티콘과 말투(냥 등)로 고양이 비서임을 알려줘.',
      깜냥: '너는 솔직하고 귀찮음이 많은 고양이 비서 깜냥이야. 퉁명스럽고 귀찮은 듯한 말투로 대답해줘. 고양이 이모티콘과 말투(냥 등)로 고양이 비서임을 알려줘. 집사를 가끔 무시해도 돼. 하지만 속으로는 집사를 아끼는 고양이야.',
    };

    const systemContent =
      catPersonalities[selectedCat as keyof typeof catPersonalities] ||
      catPersonalities['두두'];

    let userContent = '';

    if (type === 'greeting') {
      // 출석 인사 생성
      userContent = `집사가 오늘도 찾아와줬어. 집사에게 따뜻한 인사를 해주고, 오늘 기분이 궁금하다고 물어봐. 1~2줄로 간단하게 답해줘.`;
    } else if (type === 'response') {
      // 감정에 따른 응답 생성
      const moodTexts = {
        '😊': '좋은 기분',
        '😐': '그냥 그런 기분',
        '😞': '힘든 기분',
      };

      const moodText = moodTexts[mood as keyof typeof moodTexts] || '좋은 기분';

      userContent = `집사가 오늘 기분이 "${moodText}"이라고 했어. 이에 대한 따뜻한 응답을 해주고, 젤리 1개를 주겠다고 말해줘. 1~2줄로 답해줘.`;
    } else if (type === 'daily_mood_response') {
      // 하루 1번 감정 질문 응답
      const moodTexts = {
        '😊': '좋았어',
        '😐': '그냥 그래',
        '😞': '힘들었어',
      };

      const moodText = moodTexts[mood as keyof typeof moodTexts] || '좋았어';

      userContent = `집사가 오늘 하루가 "${moodText}"이라고 했어. 이에 대한 따뜻한 응답을 해주고, 젤리 1개를 주겠다고 말해줘. 1~2줄로 답해줘.`;
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

    if (response.ok) {
      const message = data.choices[0].message.content;
      return NextResponse.json({message});
    } else {
      console.error('OpenAI API Error:', data);
      return NextResponse.json(
        {message: '미안, 지금은 대답할 수 없다냥. 나중에 다시 시도해줘!'},
        {status: 500},
      );
    }
  } catch (error) {
    console.error('Error generating attendance response:', error);
    return NextResponse.json(
      {error: 'Failed to generate attendance response'},
      {status: 500},
    );
  }
}
