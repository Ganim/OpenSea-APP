'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import type { CareOption, CareOptionsResponse } from '@/types/stock';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function CareIconDebug() {
  const [apiResponse, setApiResponse] = useState<CareOptionsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    const checkIconLoading = async () => {
      try {
        // 1. Check base URL
        const url = process.env.NEXT_PUBLIC_ASSETS_URL || '/assets/care';
        setBaseUrl(url);

        // 2. Fetch API response
        const apiClient = (await import('@/lib/api-client')).apiClient;
        const response =
          await apiClient.get<CareOptionsResponse>('/v1/care/options');
        setApiResponse(response);

        // 3. Test first icon path from first category
        const firstCategory = Object.values(response.options)[0];
        if (firstCategory && firstCategory.length > 0) {
          const firstOption = firstCategory[0];
          const fullPath = `${url}/${firstOption.assetPath}`;

          // Try to fetch the image to verify it exists
          const imageTest = await fetch(fullPath);
          if (!imageTest.ok) {
            setError(
              `SVG file not found: ${fullPath} (Status: ${imageTest.status})`
            );
          }
        }

        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro desconhecido ao carregar'
        );
        setLoading(false);
      }
    };

    checkIconLoading();
  }, []);

  if (loading) {
    return (
      <Card className="p-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Verificando carregamento de ícones...
          </span>
        </div>
      </Card>
    );
  }

  // Get first option from first category for testing
  const firstCategory = apiResponse
    ? Object.values(apiResponse.options)[0]
    : undefined;
  const firstOption = firstCategory?.[0];
  const allOptions = apiResponse
    ? Object.values(apiResponse.options).flat()
    : [];

  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
      <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
        🔍 Debug: Care Icons
      </h3>

      {/* Base URL Check */}
      <Card className="p-3 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-gray-900 dark:text-white">
              Base URL
            </p>
            <p className="text-gray-600 dark:text-gray-400 font-mono text-xs">
              {baseUrl}
            </p>
          </div>
        </div>
      </Card>

      {/* API Response Check */}
      {error ? (
        <Alert className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
          <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
          <AlertDescription className="text-red-700 dark:text-red-300 text-sm">
            {error}
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="p-3 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
            <div className="text-sm w-full">
              <p className="font-medium text-gray-900 dark:text-white mb-2">
                API Response ({allOptions.length} options)
              </p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {allOptions.slice(0, 3).map((opt: CareOption) => (
                  <div
                    key={opt.id}
                    className="text-xs font-mono text-gray-600 dark:text-gray-400"
                  >
                    <p>
                      <span className="font-semibold">{opt.code}:</span>
                      {opt.assetPath ? '✓' : '✗'}
                      {opt.assetPath || 'SEM ASSET PATH'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Test Icon Rendering */}
      {firstOption && (
        <Card className="p-3 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <p className="font-medium text-gray-900 dark:text-white text-sm mb-2">
            Test:
            {firstOption.code}
          </p>
          <div className="flex items-center justify-center h-24 bg-gray-100 dark:bg-slate-700 rounded border border-gray-300 dark:border-slate-600">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${baseUrl}/${firstOption.assetPath}`}
              alt={firstOption.label}
              width={48}
              height={48}
              className="object-contain"
              onError={e => {
                const img = e.target as HTMLImageElement;
                img.style.border = '2px solid red';
                img.title = '❌ Erro ao carregar SVG';
              }}
              onLoad={e => {
                const img = e.target as HTMLImageElement;
                img.style.border = '2px solid green';
                img.title = '✓ SVG carregado com sucesso';
              }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-mono truncate">
            {`${baseUrl}/${firstOption.assetPath}`}
          </p>
        </Card>
      )}
    </div>
  );
}
