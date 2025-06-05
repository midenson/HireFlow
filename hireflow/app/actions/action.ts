'use server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function generateQuestions(prompt: string) {
  if (!OPENROUTER_API_KEY) {
    console.error('Missing OpenRouter API key');
    throw new Error('Missing OpenRouter API key');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // try a model you’re sure works
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenRouter API Error:', response.status, errorText);
    throw new Error('AI request failed');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}


export async function generateFeedback(prompt:string) {
  if (!OPENROUTER_API_KEY) {
    console.log('missing api key...');
    throw new Error('missing api key detected...');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    throw new Error("AI request failed");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}


export const generateSummary = async (prompt: string) => {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'content-Type': 'application/json',
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 512,
        })
    });

    if (!response.ok) {
        throw new Error('AI request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

export const generateCoverLetter = async (prompt: string) => {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'content-Type': 'application/json',
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 512,
        })
    });

    if (!response.ok) {
        throw new Error('AI request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}