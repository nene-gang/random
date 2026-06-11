// /api/monitor
// GET -> { participants: [ { id, nome, checkins:{t1:ts,...}, glasses } ] }
//
// Richiede lo stesso binding KV "CHECKINS" usato da /api/checkin

export async function onRequestGet(context) {
  const { env } = context;

  let cursor;
  let done = false;
  const participants = [];

  while (!done) {
    const list = await env.CHECKINS.list({ cursor });
    done = list.list_complete;
    cursor = list.cursor;

    for (const key of list.keys) {
      const raw = await env.CHECKINS.get(key.name);
      if (!raw) continue;
      try {
        const data = JSON.parse(raw);
        participants.push({
          id: key.name,
          nome: data.nome || "(senza nome)",
          checkins: data.checkins || {},
          glasses: data.glasses || 0
        });
      } catch {
        // ignora record corrotti
      }
    }
  }

  // ordina per nome
  participants.sort((a, b) => a.nome.localeCompare(b.nome));

  return new Response(JSON.stringify({ participants }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
