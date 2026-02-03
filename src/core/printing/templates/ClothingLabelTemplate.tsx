'use client';

/**
 * Template de Etiqueta de Roupa - 33x55mm
 *
 * Baseado no formato da imagem fornecida
 * Layout vertical com marca, composição e instruções de cuidado
 */

import { CareInstruction, ClothingLabelData } from '@/core/printing/types';
import React from 'react';

interface ClothingLabelTemplateProps {
  data: ClothingLabelData;
}

// Ícones SVG para instruções de cuidado
const CareIcon: React.FC<{ type: CareInstruction }> = ({ type }) => {
  const iconMap: Record<CareInstruction, React.ReactElement> = {
    '40': (
      <svg viewBox="0 0 50 50" width="100%" height="100%">
        <rect
          x="5"
          y="15"
          width="40"
          height="25"
          fill="none"
          stroke="black"
          strokeWidth="2"
          rx="3"
        />
        <text
          x="25"
          y="33"
          fontSize="16"
          fontWeight="bold"
          textAnchor="middle"
          fill="black"
        >
          40
        </text>
      </svg>
    ),
    'no-bleach': (
      <svg viewBox="0 0 50 50" width="100%" height="100%">
        <polygon
          points="25,10 45,40 5,40"
          fill="none"
          stroke="black"
          strokeWidth="2"
        />
        <line x1="10" y1="10" x2="40" y2="40" stroke="black" strokeWidth="2" />
        <line x1="40" y1="10" x2="10" y2="40" stroke="black" strokeWidth="2" />
      </svg>
    ),
    'no-dryer': (
      <svg viewBox="0 0 50 50" width="100%" height="100%">
        <circle
          cx="25"
          cy="25"
          r="18"
          fill="none"
          stroke="black"
          strokeWidth="2"
        />
        <circle
          cx="25"
          cy="25"
          r="10"
          fill="none"
          stroke="black"
          strokeWidth="2"
        />
        <line x1="10" y1="10" x2="40" y2="40" stroke="black" strokeWidth="2" />
      </svg>
    ),
    'iron-low': (
      <svg viewBox="0 0 50 50" width="100%" height="100%">
        <path
          d="M 10 30 L 10 20 Q 10 10 20 10 L 30 10 Q 40 10 40 20 L 40 30 L 35 35 L 15 35 Z"
          fill="none"
          stroke="black"
          strokeWidth="2"
        />
        <circle cx="25" cy="23" r="2" fill="black" />
        <text x="25" y="28" fontSize="8" textAnchor="middle" fill="black">
          ••
        </text>
      </svg>
    ),
    'no-dry-clean': (
      <svg viewBox="0 0 50 50" width="100%" height="100%">
        <circle
          cx="25"
          cy="25"
          r="18"
          fill="none"
          stroke="black"
          strokeWidth="2"
        />
        <text
          x="25"
          y="32"
          fontSize="20"
          fontWeight="bold"
          textAnchor="middle"
          fill="black"
        >
          P
        </text>
        <line x1="10" y1="10" x2="40" y2="40" stroke="black" strokeWidth="2" />
      </svg>
    ),
  };

  return <div style={{ width: '100%', height: '100%' }}>{iconMap[type]}</div>;
};

export const ClothingLabelTemplate = React.forwardRef<
  HTMLDivElement,
  ClothingLabelTemplateProps
>(({ data }, ref) => {
  return (
    <div
      ref={ref}
      className="clothing-label-template"
      style={{
        width: '33mm',
        height: '55mm',
        padding: '1.5mm',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        color: '#000000',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: '1px solid #000',
        position: 'relative',
      }}
    >
      {/* Linha pontilhada superior para destacamento */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '2mm',
          right: '2mm',
          height: '1px',
          borderTop: '1.5px dashed #333',
        }}
      />

      {/* Marca */}
      <div
        style={{
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '11pt',
          marginTop: '2mm',
          lineHeight: '1.1',
          letterSpacing: '0.5px',
        }}
      >
        {data.brand}
      </div>

      {/* Referência */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '7pt',
          marginTop: '1mm',
          fontWeight: '500',
        }}
      >
        {data.reference}
      </div>

      {/* Composição */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '8pt',
          marginTop: '2mm',
          lineHeight: '1.2',
          fontWeight: '500',
          whiteSpace: 'pre-line',
        }}
      >
        {data.composition}
      </div>

      {/* Ícones de Cuidado */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1mm',
          marginTop: '2mm',
          marginBottom: '1mm',
        }}
      >
        {data.careInstructions.map((instruction, idx) => (
          <div
            key={idx}
            style={{
              width: '5mm',
              height: '5mm',
              flexShrink: 0,
            }}
          >
            <CareIcon type={instruction} />
          </div>
        ))}
      </div>

      {/* Tamanho */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '18pt',
          fontWeight: 'bold',
          marginTop: '1mm',
          marginBottom: '1mm',
        }}
      >
        {data.size}
      </div>

      {/* Origem */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '7pt',
          fontWeight: 'bold',
          marginBottom: '1mm',
        }}
      >
        {data.madeIn}
      </div>
    </div>
  );
});

ClothingLabelTemplate.displayName = 'ClothingLabelTemplate';
