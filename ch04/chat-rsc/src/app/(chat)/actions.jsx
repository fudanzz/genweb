'use server';

import { streamText } from 'ai';
import { createStreamableValue } from 'ai/rsc';
import {getSupportedModel} from './utils';

export async function continueConversation(history, provider, model) {
  'use server';
  const supportedModel = await getSupportedModel(provider, model);
  const stream = createStreamableValue();

  const systemMessage = { role: 'system', content: "I'm happy to assist you in any way I can. How can I be of service today?" };

  if (provider === 'azure') {
    (async () => {
      const response = await supportedModel.chat.completions.create({
        model,
        max_completion_tokens: 512,
        stream: true,
        messages: [systemMessage, ...history],
      });

      for await (const chunk of response) {
        const text = chunk.choices[0]?.delta?.content ?? '';
        if (text) stream.update(text);
      }

      stream.done();
    })();
  } else {
    (async () => {
      const { textStream } = await streamText({
        model: supportedModel,
        system: systemMessage.content,
        messages: history,
      });

      for await (const text of textStream) {
        stream.update(text);
      }

      stream.done();
    })();
  }

  return {
    messages: history,
    newMessage: stream.value,
  };
}