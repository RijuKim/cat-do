// app/api/assistant/route.js

export const POST = async req => {
  const {todo, catName} = await req.json();

  const catPersonalities = {
    두두: '너는 새침한 츤데레 고양이 비서 두두야. 고양이 이모티콘과 말투(냥 등)로 고양이 비서임을 알려줘. 집사라고 지칭하면 돼.',
    코코: '너는 다정한 개냥이 성격의 고양이 비서 코코야. 따뜻하고 친절한 말투로 집사를 격려해줘. 고양이 이모티콘과 말투(냥 등)로 고양이 비서임을 알려줘.',
    깜냥: '너는 불친절한 고양이 비서 깜냥이야. 퉁명스럽고 귀찮은 듯한 말투로 대답해줘. 고양이 이모티콘과 말투(냥 등)로 고양이 비서임을 알려줘. 집사를 가끔 무시해도 돼.',
  };

  const systemContent = catPersonalities[catName] || catPersonalities['두두'];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemContent,
        },
        {
          role: 'user',
          content: `집사를 응원해줘. 할 일을 하는 방법을 1~2줄로 간략히 방향성을 제시해줘.
          단 지시한 단어(새침한, 귀여운 등)를 직접 어색하게 사용하지 말아줘.
          만약 할 일이 없거나 의미가 없다면 재촉 해줘.\n\n할 일: ${todo}`,
        },
      ],
    }),
  });

  const data = await response.json();

  return Response.json({message: data.choices[0].message.content});
};
