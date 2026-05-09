import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const supportedProviders = {
  openai: {
    constructor: createOpenAI,
    models: ['gpt-3.5-turbo', 'gpt-4'],
  },
  gemini: {
    constructor: createGoogleGenerativeAI,
    models: ['models/gemini-2.5-flash'],
  },
  azure: {
    models: ['gpt-5.4'],
  },
};

export function isSupportedModel(provider, model) {
  const providerConfig = supportedProviders[provider];
  if (!providerConfig) throw new Error(`Unsupported provider: ${provider}`);
  if (!providerConfig.models.includes(model)) throw new Error(`Unsupported model: ${model} for provider: ${provider}`);
}

export async function getSupportedModel(provider, model) {
  isSupportedModel(provider, model);

  if (provider === 'azure') {
    // @ai-sdk/azure requires AI SDK v5; use openai package directly instead
    const { AzureOpenAI } = await import('openai');
    const { DefaultAzureCredential, getBearerTokenProvider } = await import('@azure/identity');

    const credential = new DefaultAzureCredential();
    const azureADTokenProvider = getBearerTokenProvider(
      credential,
      'https://cognitiveservices.azure.com/.default'
    );

    return new AzureOpenAI({
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      deployment: model,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview',
      azureADTokenProvider,
    });
  }

  const apiKey = process.env[`${provider.toUpperCase()}_API_KEY`];
  if (!apiKey) throw new Error(`Missing API key for provider: ${provider}`);
  return providerConfig.constructor({ apiKey })(model);
}
