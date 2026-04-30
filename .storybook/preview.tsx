import type { Preview } from '@storybook/react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { withThemeByClassName } from '@storybook/addon-themes';
import { MINIMAL_VIEWPORTS } from 'storybook/viewport';
import React from 'react';
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
    a11y: {
      // 'error' faz violações fail no Vitest/CI (gate da Task 23).
      // Sem esse flag, addon-a11y é warn-only — drift detectado pela revisão Codex.
      test: 'error',
      config: {
        rules: [],
      },
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa'],
        },
      },
    },
    backgrounds: { disable: true },
    viewport: {
      // Built-in viewports do core do Storybook 10 (`storybook/viewport`).
      // Não exigimos addon separado: `parameters.viewport.options` já habilita
      // o toolbar de viewport no canvas. `initialGlobals.viewport` (abaixo)
      // não é definido => canvas inicia em "reset" (full responsive).
      options: MINIMAL_VIEWPORTS,
    },
  },
  decorators: [
    withThemeByClassName({
      themes: { light: '', dark: 'dark' },
      defaultTheme: 'light',
    }),
    Story => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false, refetchOnWindowFocus: false },
        },
      });
      return (
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
          >
            <Story />
          </ThemeProvider>
        </QueryClientProvider>
      );
    },
  ],
};

export default preview;
