import { AzureOpenAI } from 'openai';
import { DefaultAzureCredential, getBearerTokenProvider } from '@azure/identity';

export const dynamic = 'force-dynamic';

const credential = new DefaultAzureCredential();
const azureADTokenProvider = getBearerTokenProvider(
  credential,
  'https://cognitiveservices.azure.com/.default'
);

const client = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-01',
  azureADTokenProvider,
});

export async function POST(req) {
  const { text } = await req.json();

  const completion = await client.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: "I'm happy to assist you in any way I can. How can I be of service today?",
      },
      { role: 'user', content: text },
    ],
    model: process.env.AZURE_OPENAI_DEPLOYMENT,
    max_completion_tokens: 150,
  });

  const message = {
    id: completion.id,
    created: completion.created,
    role: 'assistant',
    content: completion.choices[0].message.content,
  };

  return Response.json({ message });
}
