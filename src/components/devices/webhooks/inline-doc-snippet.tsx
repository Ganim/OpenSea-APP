'use client';

/**
 * InlineDocSnippet — Phase 11 anti-replay D-06 documentation.
 *
 * Tabs alternando 3 linguagens (Node / Python / Go) com snippet de verificação
 * HMAC-SHA256 do header `X-OpenSea-Signature: t=<unix>,v1=<hex>`. Cliente DEVE
 * rejeitar entregas com `t` > 5min (300s) de skew em relação ao relógio atual.
 *
 * Snippets verbatim de RESEARCH §Code Examples Example 2 (anti-replay enforcement).
 */

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const SNIPPETS = {
  node: `// Node.js — verifica assinatura do webhook (constant-time + 5min skew check)
import crypto from 'node:crypto';

const SECRET = process.env.OPENSEA_WEBHOOK_SECRET; // whsec_...
const MAX_SKEW_SECONDS = 300; // 5 minutos (D-06)

export function verifyOpenSeaSignature(rawBody, header) {
  const parts = Object.fromEntries(
    header.split(',').map((p) => p.split('=')),
  );
  const t = Number(parts.t);
  const v1 = parts.v1;
  if (!t || !v1) return false;

  const skew = Math.abs(Math.floor(Date.now() / 1000) - t);
  if (skew > MAX_SKEW_SECONDS) return false; // anti-replay

  const expected = crypto
    .createHmac('sha256', SECRET)
    .update(\`\${t}.\${rawBody}\`)
    .digest('hex');

  // constant-time compare evita timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(v1),
  );
}`,
  python: `# Python — verifica assinatura do webhook (constant-time + 5min skew)
import hmac, hashlib, time

SECRET = b"whsec_..."  # bytes
MAX_SKEW_SECONDS = 300  # 5 minutos (D-06)

def verify_opensea_signature(raw_body: bytes, header: str) -> bool:
    parts = dict(p.split("=", 1) for p in header.split(","))
    try:
        t = int(parts["t"])
        v1 = parts["v1"]
    except (KeyError, ValueError):
        return False

    if abs(int(time.time()) - t) > MAX_SKEW_SECONDS:
        return False  # anti-replay

    signed_payload = f"{t}.".encode() + raw_body
    expected = hmac.new(SECRET, signed_payload, hashlib.sha256).hexdigest()

    # constant-time compare
    return hmac.compare_digest(expected, v1)`,
  go: `// Go — verifica assinatura do webhook (constant-time + 5min skew)
package webhooks

import (
    "crypto/hmac"
    "crypto/sha256"
    "encoding/hex"
    "fmt"
    "strconv"
    "strings"
    "time"
)

const MaxSkewSeconds = 300 // 5 minutos (D-06)

func VerifyOpenSeaSignature(rawBody []byte, header, secret string) bool {
    var t int64
    var v1 string
    for _, p := range strings.Split(header, ",") {
        kv := strings.SplitN(p, "=", 2)
        if len(kv) != 2 {
            continue
        }
        switch kv[0] {
        case "t":
            t, _ = strconv.ParseInt(kv[1], 10, 64)
        case "v1":
            v1 = kv[1]
        }
    }
    if t == 0 || v1 == "" {
        return false
    }
    if abs(time.Now().Unix()-t) > MaxSkewSeconds {
        return false // anti-replay
    }

    mac := hmac.New(sha256.New, []byte(secret))
    fmt.Fprintf(mac, "%d.%s", t, rawBody)
    expected := hex.EncodeToString(mac.Sum(nil))

    return hmac.Equal([]byte(expected), []byte(v1))
}

func abs(x int64) int64 { if x < 0 { return -x }; return x }`,
};

export type SnippetLanguage = 'node' | 'python' | 'go';

const LABELS: Record<SnippetLanguage, string> = {
  node: 'Node.js',
  python: 'Python',
  go: 'Go',
};

export function InlineDocSnippet({
  defaultLanguage = 'node',
  className,
}: {
  defaultLanguage?: SnippetLanguage;
  className?: string;
}) {
  const [lang, setLang] = useState<SnippetLanguage>(defaultLanguage);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(SNIPPETS[lang]);
      toast.success(`Snippet ${LABELS[lang]} copiado.`);
    } catch {
      toast.error('Não foi possível copiar. Selecione o texto manualmente.');
    }
  }

  return (
    <div
      className={className}
      data-testid="webhook-inline-doc-snippet"
      data-language={lang}
    >
      <Tabs value={lang} onValueChange={v => setLang(v as SnippetLanguage)}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <TabsList>
            <TabsTrigger value="node">Node.js</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="go">Go</TabsTrigger>
          </TabsList>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCopy}
          >
            <Copy className="mr-1 h-4 w-4" />
            Copiar código
          </Button>
        </div>
        {(['node', 'python', 'go'] as const).map(l => (
          <TabsContent key={l} value={l}>
            <pre className="rounded-lg border border-border bg-slate-50 dark:bg-slate-900/60 p-3 overflow-x-auto font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200">
              <code>{SNIPPETS[l]}</code>
            </pre>
          </TabsContent>
        ))}
      </Tabs>
      <p className="mt-2 text-xs text-muted-foreground">
        Rejeite entregas com <code className="font-mono">t</code> mais antigo
        que 5 minutos (300s) do seu relógio para mitigar replay (D-06).
      </p>
    </div>
  );
}
