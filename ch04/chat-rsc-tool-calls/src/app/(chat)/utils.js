import { createOpenAI } from '@ai-sdk/openai';
import { createAzure } from '@ai-sdk/azure';
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

export function getSupportedModel(provider, model) {
  const providerConfig = supportedProviders[provider];

  if (!providerConfig) {
    throw new Error(`Unsupported provider: ${provider}. Please check your configuration.`);
  }

  if (!providerConfig.models.includes(model)) {
    throw new Error(`Unsupported model: ${model} for provider: ${provider}. Please choose a supported model.`);
  }

  if (provider === 'azure') {
    const { DefaultAzureCredential, getBearerTokenProvider } = require('@azure/identity');
    const credential = new DefaultAzureCredential();
    const azureADTokenProvider = getBearerTokenProvider(credential, 'https://cognitiveservices.azure.com/.default');
    const azure = createAzure({
      resourceName: process.env.AZURE_RESOURCE_NAME,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview',
      azureADTokenProvider,
    });
    return azure(model);
  }

  const apiKey = process.env[`${provider.toUpperCase()}_API_KEY`];

  if (!apiKey) {
    const keyName = `${provider.toUpperCase()}_API_KEY`;
    throw new Error(
      `Missing API key for provider: ${provider}. ` +
      `Please ensure the '${keyName}' environment variable is set in your '.env' file. ` +
      `If running from a monorepo, confirm the '.env' file is in the project root ` +
      `or the specific workspace folder (e.g., 'ch04/chat-rsc-tool-calls'). ` +
      `Refer to Appendix A for detailed API key setup instructions.`
    );
  }

  const providerInstance = providerConfig.constructor({ apiKey });

  return providerInstance(model);
}
