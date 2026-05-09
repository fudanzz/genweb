import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { getSupportedModel, isSupportedModel } from './utils';

export const dynamic = 'force-dynamic';

const aiSdkProviders = {
  openai: { constructor: createOpenAI, models: ['gpt-3.5-turbo', 'gpt-4'] },
  gemini: { constructor: createGoogleGenerativeAI, models: ['models/gemini-2.5-flash'] },
};

export async function POST(req) {
  const { messages, provider = 'gemini', model = 'models/gemini-2.5-flash' } = await req.json();

  isSupportedModel(provider, model);

  const systemMessage = {
    role: 'system',
    content: "I'm happy to assist you in any way I can. How can I be of service today?",
  };

  // Azure: use openai package directly for streaming (incompatible with AI SDK v4)
  if (provider === 'azure') {
    const client = await getSupportedModel(provider, model);
    const stream = await client.chat.completions.create({
      model,
      max_completion_tokens: 512,
      stream: true,
      messages: [systemMessage, ...messages],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // OpenAI / Gemini: use Vercel AI SDK streamText
  const providerConfig = aiSdkProviders[provider];
  const apiKey = process.env[`${provider.toUpperCase()}_API_KEY`];
  const providerModel = providerConfig.constructor({ apiKey })(model);

  const result = await streamText({
    model: providerModel,
    maxTokens: 512,
    messages: [systemMessage, ...messages],
  });

  return new Response(result.toDataStream(), {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
