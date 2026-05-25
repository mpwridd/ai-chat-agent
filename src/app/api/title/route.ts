import { NextRequest, NextResponse } from 'next/server';

const MIMO_API_KEY = process.env.MIMO_API_KEY || '';
const MIMO_BASE_URL = process.env.MIMO_BASE_URL || 'https://token-plan-sgp.xiaomimimo.com/v1';
const MIMO_MODEL = process.env.MIMO_MODEL || 'mimo-v2-omni';

export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json();
    
    const response = await fetch(`${MIMO_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MIMO_API_KEY}`,
      },
      body: JSON.stringify({
        model: MIMO_MODEL,
        messages: [
          { role: 'system', content: 'Generate a short, concise chat title (max 6 words) for the following conversation topic. No quotes, no punctuation at the end.' },
          { role: 'user', content: `Topic: ${title}` },
        ],
        max_tokens: 30,
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    const chatTitle = data.choices?.[0]?.message?.content?.trim() || title.slice(0, 50);
    
    return NextResponse.json({ title: chatTitle });
  } catch {
    return NextResponse.json({ title: 'New Chat' });
  }
}
