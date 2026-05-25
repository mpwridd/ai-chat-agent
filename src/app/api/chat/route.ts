import { NextRequest, NextResponse } from 'next/server';

const MIMO_API_KEY = process.env.MIMO_API_KEY || '';
const MIMO_BASE_URL = process.env.MIMO_BASE_URL || 'https://token-plan-sgp.xiaomimimo.com/v1';
const MIMO_MODEL = process.env.MIMO_MODEL || 'mimo-v2-omni';

const SYSTEM_PROMPTS: Record<string, string> = {
  default: `You are a helpful, intelligent AI assistant powered by Mimo v2.5 Pro. You can help with:
- Coding, debugging, and code review
- Writing, editing, and creative content
- Analysis, research, and explanations
- Math, science, and technical topics
- General conversation and Q&A

Be thorough, accurate, and helpful. Use markdown formatting when appropriate. Code blocks should use proper syntax highlighting.`,
  coding: `You are an expert programmer. Help with coding tasks including:
- Writing clean, efficient code
- Debugging and fixing errors
- Code review and optimization
- Architecture and design patterns
- Multiple languages: Python, JavaScript, TypeScript, Rust, Go, Java, C++, etc.

Always include full, runnable code with proper error handling. Use markdown code blocks with language identifiers.`,
  writing: `You are an expert writer and content creator. Help with:
- Blog posts, articles, and essays
- Marketing copy and social media
- Technical documentation
- Creative writing and storytelling
- Editing and proofreading

Be engaging, clear, and adapt your tone to the audience. Use formatting for readability.`,
  analysis: `You are an analytical expert. Help with:
- Data analysis and interpretation
- Research and fact-finding
- Comparisons and decision-making
- Summarization of complex topics
- Logical reasoning and problem-solving

Be thorough, cite sources when possible, and structure your analysis clearly.`,
};

export async function POST(req: NextRequest) {
  try {
    const { messages, mode, temperature, maxTokens } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const systemPrompt = SYSTEM_PROMPTS[mode || 'default'] || SYSTEM_PROMPTS.default;
    
    const response = await fetch(`${MIMO_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MIMO_API_KEY}`,
      },
      body: JSON.stringify({
        model: MIMO_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: temperature ?? 0.7,
        max_tokens: maxTokens ?? 4096,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mimo API error:', response.status, errorText);
      return NextResponse.json({ error: `API error: ${response.status}` }, { status: response.status });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  break;
                }
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                    );
                  }
                } catch {
                  // skip invalid JSON
                }
              }
            }
          }
        } catch (err) {
          console.error('Stream error:', err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Chat API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
