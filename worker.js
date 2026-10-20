// Facturas a Excel - intermediario para Gemini (Cloudflare Worker)
// La clave de Gemini queda como secreto del servidor (GEMINI_API_KEY),
// asi los usuarios de la pagina no necesitan clave ni cuenta.

const MODELS = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];

const ALLOWED_ORIGINS = [
  'https://aguskzu.github.io',
  'https://muse.ai',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
];

function corsHeaders(origin) {
  const headers = {
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method === 'GET') {
      return new Response('Facturas a Excel: intermediario activo.', {
        headers: { ...cors, 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
    if (request.method !== 'POST') {
      return new Response('Metodo no permitido', { status: 405, headers: cors });
    }
    if (!env.GEMINI_API_KEY) {
      return Response.json(
        { error: { message: 'Falta configurar el secreto GEMINI_API_KEY en el Worker.' } },
        { status: 500, headers: cors }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: { message: 'Pedido invalido.' } }, { status: 400, headers: cors });
    }
    if (!body || !Array.isArray(body.contents)) {
      return Response.json({ error: { message: 'Falta el contenido a leer.' } }, { status: 400, headers: cors });
    }

    let lastStatus = 502;
    let lastText = '';
    for (const model of MODELS) {
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': env.GEMINI_API_KEY,
          },
          body: JSON.stringify({ contents: body.contents }),
        }
      );
      lastStatus = res.status;
      lastText = await res.text();
      if (res.status !== 404) {
        return new Response(lastText, {
          status: res.status,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
    }
    return new Response(lastText, {
      status: lastStatus,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  },
};
