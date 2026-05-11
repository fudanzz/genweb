export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
    </div>
  );
};

export const fetchWeatherData = async (city) => {
  const { DefaultAzureCredential, getBearerTokenProvider } = await import('@azure/identity');
  const { default: OpenAI } = await import('openai');

  const credential = new DefaultAzureCredential();
  const getToken = getBearerTokenProvider(credential, 'https://ai.azure.com/.default');
  const token = await getToken();

  const baseURL = `https://${process.env.AZURE_RESOURCE_NAME}.services.ai.azure.com/openai`;
  const client = new OpenAI({
    baseURL,
    apiKey: 'placeholder',
    defaultHeaders: { Authorization: `Bearer ${token}` },
    defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview' },
  });

  const response = await client.responses.create({
    model: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-5.4',
    tools: [{ type: 'web_search_preview' }],
    input: `What is the current weather in ${city}? Include temperature in Celsius and sky condition.`,
  });

  const messageItem = response.output.find((item) => item.type === 'message');
  const text = messageItem?.content?.[0]?.text ?? '';
  const annotations = messageItem?.content?.[0]?.annotations ?? [];

  const tempMatch = text.match(/(-?\d+(?:\.\d+)?)\s*°?\s*C/i);
  const temperature = tempMatch ? Math.round(parseFloat(tempMatch[1])) : null;

  const conditionKeywords = ['Sunny', 'Cloudy', 'Rainy', 'Windy', 'Snowy', 'Foggy', 'Clear', 'Overcast', 'Partly cloudy'];
  const condition = conditionKeywords.find((k) => text.toLowerCase().includes(k.toLowerCase())) ?? 'Unknown';

  const source = annotations.find((a) => a.type === 'url_citation')?.url ?? null;

  return { temperature, condition, source };
};

export const WeatherCard = ({ city, temperature, condition, source }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-sm mx-auto">
      <h2 className="text-xl font-bold mb-4">{city}</h2>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-3xl font-bold">{temperature != null ? `${temperature}°C` : 'N/A'}</p>
          <p className="text-gray-500">{condition}</p>
        </div>
        <div className="text-4xl">
          {condition === 'Sunny' && '☀️'}
          {condition === 'Clear' && '☀️'}
          {condition === 'Cloudy' && '☁️'}
          {condition === 'Overcast' && '☁️'}
          {condition === 'Partly cloudy' && '⛅'}
          {condition === 'Rainy' && '🌧️'}
          {condition === 'Windy' && '💨'}
          {condition === 'Snowy' && '❄️'}
          {condition === 'Foggy' && '🌫️'}
        </div>
      </div>
      {source && (
        <p className="mt-3 text-xs text-gray-400">
          Source: <a href={source} target="_blank" rel="noopener noreferrer" className="underline">{new URL(source).hostname}</a>
        </p>
      )}
    </div>
  );
};
