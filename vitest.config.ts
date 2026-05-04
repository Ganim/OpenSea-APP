import path from 'path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

const sharedAlias = {
  '@': path.resolve(dirname, './src'),
  '@lib': path.resolve(dirname, './src/lib'),
  '@components': path.resolve(dirname, './src/components'),
  '@hooks': path.resolve(dirname, './src/hooks'),
  '@types': path.resolve(dirname, './src/types'),
  '@services': path.resolve(dirname, './src/services'),
  '@contexts': path.resolve(dirname, './src/contexts'),
};

// Vitest 4 multi-project setup:
//  - "unit": existing happy-dom unit/integration tests (tests/**, src/**.spec.tsx)
//  - "storybook": Storybook stories rendered in real browser (Playwright/Chromium)
//    via @storybook/addon-vitest. Drives the a11y gate (parameters.a11y.test='error'
//    in .storybook/preview.tsx). Run with: npx vitest run --project=storybook
//
// Visual regression toggle:
//  Set `OPENSEA_VISUAL_REGRESSION=1` (see `npm run test:visual` / `test:visual:update`)
//  to filter the storybook project to stories tagged `'visual'` only. Those stories
//  expose a `play` function calling `expect.element(...).toMatchScreenshot('name')`.
//  Baseline images live next to the story file in `__screenshots__/` (created on
//  first run / `--update`). See `.storybook/visual-regression-pattern.md`.
const VISUAL_REGRESSION = process.env.OPENSEA_VISUAL_REGRESSION === '1';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', '**/*.test.ts', '**/*.test.tsx'],
    },
    projects: [
      {
        extends: false,
        resolve: { alias: sharedAlias },
        test: {
          name: 'unit',
          environment: 'happy-dom',
          setupFiles: ['./tests/setup.ts'],
          globals: true,
          include: [
            'tests/**/*.test.ts',
            'tests/**/*.test.tsx',
            'src/**/*.spec.ts',
            'src/**/*.spec.tsx',
            'src/**/*.test.ts',
            'src/**/*.test.tsx',
          ],
          exclude: [
            'node_modules',
            'dist',
            '.next',
            'build',
            '**/*.stories.tsx',
          ],
        },
      },
      {
        extends: false,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
            // OPENSEA_VISUAL_REGRESSION=1 → roda APENAS stories tagged 'visual'.
            // Default (CI/local sem flag) → exclui 'visual' (baselines hoje são
            // win32-only; CI Linux gera pixels diferentes e quebra). Reabilitar
            // no default quando os baselines forem regenerados em CI Linux ou
            // quando comparator tolerar drift cross-platform. Tracked em memory:
            // "Visual regression DESBLOQUEADO 2026-04-30, perguntas pendentes".
            ...(VISUAL_REGRESSION
              ? { tags: { include: ['visual'] } }
              : { tags: { exclude: ['visual'] } }),
          }),
        ],
        resolve: { alias: sharedAlias },
        test: {
          name: 'storybook',
          // `toMatchScreenshot` polls up to its `timeout` waiting for two
          // pixel-stable captures. The default browser-mode `testTimeout`
          // (15s) aborts the test wrapper before the matcher can resolve, so
          // the run fails with "Test timed out in 15000ms" even when the
          // screenshot would have settled. Set well above the matcher
          // timeout (60s below) so we always see the matcher's own error
          // rather than the wrapper's.
          testTimeout: 90000,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
            // Visual regression comparator. Pixelmatch with 1% mismatch
            // tolerance absorbs minor sub-pixel rendering noise across
            // platforms. Per-call overrides via `toMatchScreenshot(name, {})`.
            //
            // `timeout` is the stability poll budget: the matcher repeatedly
            // captures screenshots and compares N+1 vs N until two consecutive
            // captures are pixel-equal (within tolerance), then runs the final
            // baseline comparison. 60s is needed in practice because cold
            // Chromium mounts in this monorepo (heavy globals.css + tokens
            // resolution) take 10-20s before first paint, and the cross-frame
            // sequence (mount → hydrate → next-themes apply class → screenshot)
            // needs 2-3 stable poll iterations. The default (5s) is too short.
            expect: {
              toMatchScreenshot: {
                comparatorName: 'pixelmatch',
                comparatorOptions: {
                  allowedMismatchedPixelRatio: 0.01,
                },
                screenshotOptions: {
                  animations: 'disabled',
                  // Each `locator.screenshot()` call has its own actionability
                  // timeout (Playwright default 30s). The matcher polls until
                  // two captures match, but each capture call must succeed
                  // first. Without this, the underlying call dies at 30s with
                  // `locator.screenshot: Timeout 30000ms exceeded` even though
                  // the matcher budget is 60s. Aligning to 60s lets Playwright
                  // wait for the element to settle within the matcher window.
                  timeout: 60000,
                },
                timeout: 60000,
              },
            },
          },
        },
      },
    ],
  },
});
