import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:4000';

// Dépôt du code de lecture de l'abonné. Le code est vérifié par l'API puis
// conservé dans un cookie httpOnly : il n'est jamais laissé à la portée d'un
// script de la page, et c'est le serveur qui le présente à l'API pour chaque
// article lu (cf. lib/api.js).
export async function POST(request) {
  const { code } = await request.json().catch(() => ({}));
  if (!code) return Response.json({ error: 'Code manquant.' }, { status: 422 });

  const reponse = await fetch(`${API_URL}/api/codes-lecture/verifier`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
    cache: 'no-store',
  }).catch(() => null);

  if (!reponse) return Response.json({ error: 'Service indisponible, réessayez.' }, { status: 503 });
  const data = await reponse.json().catch(() => ({}));
  if (!reponse.ok || !data.valide) {
    return Response.json({ error: data.error || "Ce code n'est pas reconnu." }, { status: reponse.status });
  }

  cookies().set('nv_code_lecture', data.code, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(data.expireLe),
    path: '/',
  });
  return Response.json({ valide: true, expireLe: data.expireLe });
}

export async function DELETE() {
  cookies().delete('nv_code_lecture');
  return Response.json({ ok: true });
}
