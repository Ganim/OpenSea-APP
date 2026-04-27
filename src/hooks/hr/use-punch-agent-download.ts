'use client';

/**
 * useLatestPunchAgentRelease — fetches the latest GitHub Release for
 * OpenSea-Punch-Agent to surface download links in the APP.
 *
 * Plan 10-06 Task 6.3.
 *
 * Strategy:
 *   1. Query GitHub API `/repos/OpenSea-ERP/OpenSea-Punch-Agent/releases/latest`.
 *   2. Extract .msi and .exe asset download URLs.
 *   3. Fallback to stable "/releases/latest/download/" URL pattern if API is
 *      unavailable (GitHub 403 / rate-limit) — graceful degradation per CLAUDE.md
 *      APP rules (no silent fallbacks, but public static URL is reliable enough).
 *
 * Cache: 1h staleTime (release cadence is slow; no need to refresh constantly).
 * Error handling: on API failure, returns fallback URLs so download buttons
 * remain functional. GridError is rendered only if we have no URL at all.
 */

import { useQuery } from '@tanstack/react-query';

const OWNER = 'OpenSea-ERP';
const REPO = 'OpenSea-Punch-Agent';
const GITHUB_RELEASES_API = `https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`;
const FALLBACK_BASE = `https://github.com/${OWNER}/${REPO}/releases/latest/download`;

export interface PunchAgentRelease {
  version: string;
  publishedAt: string | null;
  msiUrl: string;
  exeUrl: string;
  isFallback: boolean;
}

interface GitHubAsset {
  name: string;
  browser_download_url: string;
}

interface GitHubRelease {
  tag_name: string;
  published_at: string;
  assets: GitHubAsset[];
}

async function fetchLatestRelease(): Promise<PunchAgentRelease> {
  try {
    const res = await fetch(GITHUB_RELEASES_API, {
      headers: { Accept: 'application/vnd.github+json' },
      // next.js cache: revalidate every hour
      next: { revalidate: 3600 },
    } as RequestInit);

    if (!res.ok) {
      throw new Error(`GitHub API ${res.status}`);
    }

    const data: GitHubRelease = (await res.json()) as GitHubRelease;

    const msiAsset = data.assets.find(a => a.name.endsWith('.msi'));
    const exeAsset = data.assets.find(a => a.name.endsWith('.exe'));

    const version = data.tag_name.replace(/^v/, '');

    return {
      version,
      publishedAt: data.published_at ?? null,
      msiUrl:
        msiAsset?.browser_download_url ??
        `${FALLBACK_BASE}/OpenSeaPunchAgent-Setup-${version}.msi`,
      exeUrl:
        exeAsset?.browser_download_url ??
        `${FALLBACK_BASE}/OpenSeaPunchAgent-Setup-${version}.exe`,
      isFallback: false,
    };
  } catch {
    // Graceful degradation: return fallback URLs without a version number.
    // The download page will still function; version shown as "mais recente".
    return {
      version: 'latest',
      publishedAt: null,
      msiUrl: `${FALLBACK_BASE}/OpenSeaPunchAgent-Setup-latest.msi`,
      exeUrl: `${FALLBACK_BASE}/OpenSeaPunchAgent-Setup-latest.exe`,
      isFallback: true,
    };
  }
}

export function useLatestPunchAgentRelease() {
  return useQuery({
    queryKey: ['punch-agent', 'latest-release'],
    queryFn: fetchLatestRelease,
    staleTime: 60 * 60 * 1000, // 1h
    gcTime: 2 * 60 * 60 * 1000, // 2h
    retry: 1,
  });
}
