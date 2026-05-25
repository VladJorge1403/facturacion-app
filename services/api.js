const API_URL =
  'https://m900d5on4h.execute-api.us-east-2.amazonaws.com/default';

const TIMEOUT = 15000;

export async function apiRequest(endpoint, options = {}) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, TIMEOUT);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: options.method || 'GET',

      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },

      signal: controller.signal,

      ...options,
    });

    clearTimeout(timeout);

    const text = await response.text();

    console.log('========== AWS API ==========');
    console.log('URL:', `${API_URL}${endpoint}`);
    console.log('STATUS:', response.status);
    console.log('RESPUESTA:', text);

    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data ||
          `Error HTTP ${response.status}`
      );
    }

    return data;
  } catch (error) {
    clearTimeout(timeout);

    console.log('ERROR API:', error.message);

    if (error.name === 'AbortError') {
      throw new Error(
        'Tiempo de espera agotado con AWS'
      );
    }

    throw error;
  }
}