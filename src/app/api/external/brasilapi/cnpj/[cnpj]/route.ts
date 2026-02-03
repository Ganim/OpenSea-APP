import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ cnpj: string }> }
) {
  try {
    const { cnpj: paramCnpj } = await params;
    const raw = paramCnpj || '';
    const cleaned = raw.replace(/\D/g, '');

    if (!/^\d{14}$/.test(cleaned)) {
      return NextResponse.json(
        { message: 'CNPJ inválido. Use 14 dígitos.' },
        { status: 400 }
      );
    }

    const url = `https://brasilapi.com.br/api/cnpj/v1/${cleaned}`;

    const commonHeaders: HeadersInit = {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'user-agent': 'OpenSea-APP/1.0 (+https://localhost)',
    };

    // Primeira tentativa
    let res = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: commonHeaders,
    });

    // Re-tentativa com cabeçalhos ligeiramente diferentes se 403/429
    if (res.status === 403 || res.status === 429) {
      res = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          ...commonHeaders,
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
          referer: 'https://brasilapi.com.br/',
        },
      });
    }

    if (!res.ok) {
      let err: unknown = null;
      try {
        err = await res.json();
      } catch {}
      const message =
        (err as { message?: string })?.message ||
        `Erro ${res.status} ao consultar BrasilAPI`;
      return NextResponse.json({ message }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (e: unknown) {
    return NextResponse.json(
      { message: (e as Error)?.message || 'Erro ao consultar BrasilAPI' },
      { status: 500 }
    );
  }
}
