import { AzureOpenAI } from 'openai';
import { DefaultAzureCredential, getBearerTokenProvider } from '@azure/identity';
import express from 'express';
import cors from 'cors';
import winston from 'winston';
import 'dotenv/config';

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

if (!endpoint) throw new Error('Missing AZURE_OPENAI_ENDPOINT environment variable');
if (!deployment) throw new Error('Missing AZURE_OPENAI_DEPLOYMENT environment variable');
if (!apiVersion) throw new Error('Missing AZURE_OPENAI_API_VERSION environment variable');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console({ format: winston.format.simple() })],
});

class AzureOpenAIHandler {
  constructor(client) {
    this.client = client;
  }

  async handleRequest(req, res) {
    try {
      logger.info('Received request:', { body: req.body });
      const { text } = req.body;
      const { data: completion } = await this.client.chat.completions
        .create({
          messages: [
            {
              role: 'system',
              content: "I'm happy to assist you in any way I can. How can I be of service today?",
            },
            { role: 'user', content: text },
          ],
          model: deployment,
          max_completion_tokens: 150,
        })
        .withResponse();
      const message = {
        id: completion.id,
        created: completion.created,
        role: 'assistant',
        content: completion.choices[0].message.content,
      };
      res.json({ message });
    } catch (e) {
      logger.error('Internal server error:', { error: e.message });
      res.status(500).send('Internal server error');
    }
  }
}

export function createServer() {
  const credential = new DefaultAzureCredential();
  const azureADTokenProvider = getBearerTokenProvider(
    credential,
    'https://cognitiveservices.azure.com/.default'
  );
  const client = new AzureOpenAI({ azureADTokenProvider, endpoint, deployment, apiVersion });
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.options('*', cors());

  const handler = new AzureOpenAIHandler(client);
  app.post('/', (req, res) => handler.handleRequest(req, res));

  app.use((err, req, res, next) => {
    logger.error('Unhandled error:', { error: err.message, stack: err.stack });
    res.status(500).send('Internal server error');
  });

  return app;
}
