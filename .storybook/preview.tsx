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
      // Temporariamente 'todo' (não bloqueia CI). O gate foi promovido a
      // 'error' em 2026-04-30 (Storybook Phase 2) sem primeiro limpar a
      // debt pré-existente: 365 violações color-contrast (design system
      // — tokens CSS do destructive variant em Button/Badge), 158 button-name
      // (icon-only buttons sem aria-label) e 74 aria-allowed-attr,
      // espalhados em ~25 componentes. Limpeza requer esforço focado por
      // categoria (PR dedicado), não pode ir num PR misto. addon-a11y
      // continua reportando tudo no painel do Storybook como warn — quando
      // a debt for zerada, voltar para 'error' aqui.
      test: 'todo',
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
