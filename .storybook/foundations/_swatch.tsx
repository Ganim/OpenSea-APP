/**
 * Foundation helpers for MDX docs (Foundations/*).
 *
 * Não é uma story — não exporta `Meta`. Importado pelos arquivos MDX em
 * `.storybook/foundations/*.mdx` para renderizar swatches de cor, exemplos
 * de chip dual-theme e amostras tipográficas/de espaçamento.
 *
 * Mantemos JSX deliberadamente simples e auto-contido (sem dependência de
 * componentes do app) para evitar acoplamento entre catálogo e código real.
 */
import React from 'react';

/* ===================== ColorSwatch ===================== */

export type ColorSwatchProps = {
  /** Nome semântico do token (ex.: --primary, rose-500). */
  name: string;
  /** Valor CSS válido para `background` (ex.: rgb(244 63 94), #fff, var(--x)). */
  value: string;
  /** Cor do texto sobre o swatch (default: detecta claro/escuro). */
  textColor?: 'light' | 'dark' | 'auto';
  /** Texto descritivo opcional (ex.: "default", "hover"). */
  description?: string;
};

/**
 * Card pequeno com bloco de cor + nome + valor.
 * `aria-label` descreve o token e o valor para leitores de tela.
 */
export function ColorSwatch({
  name,
  value,
  textColor = 'auto',
  description,
}: ColorSwatchProps) {
  const fg =
    textColor === 'light'
      ? '#fff'
      : textColor === 'dark'
        ? '#0f172a'
        : 'inherit';

  return (
    <div
      aria-label={`Token ${name} com valor ${value}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: 12,
        borderRadius: 12,
        border: '1px solid rgba(148, 163, 184, 0.25)',
        background: 'transparent',
        minWidth: 180,
      }}
    >
      <div
        style={{
          height: 64,
          borderRadius: 8,
          background: value,
          border: '1px solid rgba(148, 163, 184, 0.2)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-start',
          padding: 8,
          color: fg,
          fontSize: 11,
          fontFamily: 'ui-monospace, SFMono-Regular, monospace',
        }}
      >
        {description ?? ''}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{name}</span>
        <code style={{ fontSize: 11, opacity: 0.7 }}>{value}</code>
      </div>
    </div>
  );
}

/* ===================== ThemePair ===================== */

export type ThemePairProps = {
  /** Nome do token semântico (ex.: --primary). */
  name: string;
  /** Valor no tema light. */
  light: string;
  /** Valor no tema dark. */
  dark: string;
  /** Descrição curta do uso do token. */
  description?: string;
};

/**
 * Renderiza um token semântico em light + dark lado a lado.
 */
export function ThemePair({ name, light, dark, description }: ThemePairProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 12,
        borderRadius: 12,
        border: '1px solid rgba(148, 163, 184, 0.25)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{name}</span>
        {description ? (
          <span style={{ fontSize: 12, opacity: 0.7 }}>{description}</span>
        ) : null}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <SwatchBlock label="light" value={light} />
        <SwatchBlock label="dark" value={dark} dark />
      </div>
    </div>
  );
}

function SwatchBlock({
  label,
  value,
  dark = false,
}: {
  label: string;
  value: string;
  dark?: boolean;
}) {
  return (
    <div
      aria-label={`${label}: ${value}`}
      style={{
        flex: 1,
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        background: dark ? '#0f172a' : '#f9fafb',
      }}
    >
      <div
        style={{
          height: 56,
          background: value,
        }}
      />
      <div
        style={{
          padding: '4px 8px',
          fontSize: 10,
          fontFamily: 'ui-monospace, SFMono-Regular, monospace',
          color: dark ? '#cbd5e1' : '#475569',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 4,
        }}
      >
        <span>{label}</span>
        <code style={{ opacity: 0.85 }}>{value}</code>
      </div>
    </div>
  );
}

/* ===================== Chip dual-theme ===================== */

export type DualThemeChipProps = {
  label: string;
  /** Classes light: ex.: 'bg-emerald-50 text-emerald-700' (apenas display). */
  lightClasses: string;
  /** Classes dark: ex.: 'bg-emerald-500/8 text-emerald-300'. */
  darkClasses: string;
  /** Cor real (CSS) usada no preview light. */
  lightBg: string;
  lightFg: string;
  /** Cor real (CSS) usada no preview dark. */
  darkBg: string;
  darkFg: string;
};

export function DualThemeChip({
  label,
  lightClasses,
  darkClasses,
  lightBg,
  lightFg,
  darkBg,
  darkFg,
}: DualThemeChipProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 12,
        borderRadius: 12,
        border: '1px solid rgba(148, 163, 184, 0.25)',
      }}
    >
      <div style={{ display: 'flex', gap: 8 }}>
        <ChipPreview bg={lightBg} fg={lightFg} label={label} dark={false} />
        <ChipPreview bg={darkBg} fg={darkFg} label={label} dark />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <code style={{ fontSize: 11, opacity: 0.85 }}>
          light: {lightClasses}
        </code>
        <code style={{ fontSize: 11, opacity: 0.85 }}>dark: {darkClasses}</code>
      </div>
    </div>
  );
}

function ChipPreview({
  bg,
  fg,
  label,
  dark,
}: {
  bg: string;
  fg: string;
  label: string;
  dark: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        padding: 12,
        borderRadius: 8,
        border: '1px solid rgba(148, 163, 184, 0.2)',
        background: dark ? '#0f172a' : '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          background: bg,
          color: fg,
          padding: '4px 10px',
          borderRadius: 9999,
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ===================== SpacingBox ===================== */

export type SpacingBoxProps = {
  step: number;
  rem: number;
  px: number;
};

export function SpacingBox({ step, rem, px }: SpacingBoxProps) {
  return (
    <div
      aria-label={`Spacing step ${step}: ${rem}rem (${px}px)`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 8,
        borderRadius: 8,
        border: '1px solid rgba(148, 163, 184, 0.2)',
      }}
    >
      <code
        style={{
          fontSize: 12,
          fontFamily: 'ui-monospace, SFMono-Regular, monospace',
          minWidth: 56,
        }}
      >
        {step}
      </code>
      <div
        style={{
          width: Math.max(px, 1),
          height: 16,
          background: 'rgb(59 130 246 / 0.6)',
          borderRadius: 4,
        }}
      />
      <span style={{ fontSize: 12, opacity: 0.75 }}>
        {rem}rem · {px}px
      </span>
    </div>
  );
}

/* ===================== TypeSample ===================== */

export type TypeSampleProps = {
  className: string;
  fontSizePx: number;
  lineHeightPx: number;
  usage: string;
  /** Render style applied to the sample text (font-size + line-height in px). */
  fontSize: string;
  lineHeight: string;
};

export function TypeSample({
  className,
  fontSizePx,
  lineHeightPx,
  usage,
  fontSize,
  lineHeight,
}: TypeSampleProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: 12,
        borderRadius: 8,
        border: '1px solid rgba(148, 163, 184, 0.2)',
      }}
    >
      <div style={{ fontSize, lineHeight }}>
        Bom dia. Sistema OpenSea pronto.
      </div>
      <div
        style={{
          fontSize: 11,
          fontFamily: 'ui-monospace, SFMono-Regular, monospace',
          opacity: 0.75,
        }}
      >
        <code>{className}</code> · {fontSizePx}px / {lineHeightPx}px · {usage}
      </div>
    </div>
  );
}

/* ===================== RadiusBox ===================== */

export type RadiusBoxProps = {
  className: string;
  rem: string;
  usage: string;
  borderRadius: string;
};

export function RadiusBox({
  className,
  rem,
  usage,
  borderRadius,
}: RadiusBoxProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: 12,
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: 8,
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          background: 'rgb(59 130 246 / 0.15)',
          border: '2px solid rgb(59 130 246 / 0.6)',
          borderRadius,
        }}
      />
      <code style={{ fontSize: 11 }}>{className}</code>
      <span style={{ fontSize: 11, opacity: 0.7 }}>{rem}</span>
      <span style={{ fontSize: 10, opacity: 0.6, textAlign: 'center' }}>
        {usage}
      </span>
    </div>
  );
}

/* ===================== ShadowBox ===================== */

export type ShadowBoxProps = {
  className: string;
  boxShadow: string;
  usage: string;
};

export function ShadowBox({ className, boxShadow, usage }: ShadowBoxProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 8,
        background: 'transparent',
      }}
    >
      <div
        style={{
          width: 96,
          height: 64,
          background: '#fff',
          borderRadius: 8,
          boxShadow,
          border: '1px solid rgba(148, 163, 184, 0.15)',
        }}
      />
      <code style={{ fontSize: 11 }}>{className}</code>
      <span
        style={{
          fontSize: 10,
          opacity: 0.65,
          textAlign: 'center',
          maxWidth: 120,
        }}
      >
        {usage}
      </span>
    </div>
  );
}

/* ===================== Grid wrapper ===================== */

export function Grid({
  children,
  min = 180,
}: {
  children: React.ReactNode;
  min?: number;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`,
        gap: 12,
        marginTop: 12,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}
