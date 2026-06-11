// /api/checkin
// GET  ?id=XXX            -> restituisce { nome, checkins:{t1:ts,...} }
// POST { id, nome }       -> registra/aggiorna il nome del partecipante
// POST { id, tappa }      -> segna la tappa come validata (timestamp)
//
// Richiede un binding KV chiamato CHECKINS configurato su Cloudflare Pages
// (Settings -> Functions -> KV namespace bindings -> CHECKINS)

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return jsonResponse({ error: "missing id" }, 400);
  }

  const data = await getRecord(env, id);
  return jsonResponse(data);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "invalid json" }, 400);
  }

  const { id, nome, tappa } = body;
  if (!id) return jsonResponse({ error: "missing id" }, 400);

  const data = await getRecord(env, id);

  if (nome) data.nome = nome;
  if (tappa) {
    data.checkins = data.checkins || {};
    data.checkins[tappa] = Date.now();
  }

  await env.CHECKINS.put(id, JSON.stringify(data));
  return jsonResponse(data);
}

async function getRecord(env, id) {
  const raw = await env.CHECKINS.get(id);
  if (!raw) return { nome: "", checkins: {} };
  try {
    const parsed = JSON.parse(raw);
    parsed.checkins = parsed.checkins || {};
    return parsed;
  } catch {
    return { nome: "", checkins: {} };
  }
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
