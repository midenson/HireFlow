'use server'

export async function generateQuestions(prompt: string) {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 512,
      }),
    });
  
    if (!response.ok) {
      throw new Error('AI request failed');
    }
  
    const data = await response.json();
    return data.choices[0].message.content;
  }
  