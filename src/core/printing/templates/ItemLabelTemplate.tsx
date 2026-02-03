'use client';

/**
 * Template de Etiqueta de Item - 100x100mm
 *
 * Baseado no formato da imagem fornecida
 */

import { ItemLabelData } from '@/core/printing/types';
import { generateBarcodeDataURL } from '@/core/printing/utils';
import React, { useEffect, useRef } from 'react';

interface ItemLabelTemplateProps {
  data: ItemLabelData;
}

export const ItemLabelTemplate = React.forwardRef<
  HTMLDivElement,
  ItemLabelTemplateProps
>(({ data }, ref) => {
  const barcodeRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Gera código de barras quando o componente monta
    if (barcodeRef.current && data.barcode) {
      const barcodeUrl = generateBarcodeDataURL(data.barcode, {
        width: 2,
        height: 40,
        displayValue: true,
        fontSize: 12,
      });
      barcodeRef.current.src = barcodeUrl;
    }
  }, [data.barcode]);

  return (
    <div
      ref={ref}
      className="item-label-template"
      style={{
        width: '100mm',
        height: '100mm',
        padding: '3mm',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '8pt',
        color: '#000000',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Título */}
      <div
        style={{
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '11pt',
          marginBottom: '2mm',
          borderBottom: '2px solid #000',
          paddingBottom: '1mm',
        }}
      >
        IDENTIFICAÇÃO DE PRODUTO
      </div>

      {/* Tabela de Informações */}
      <div style={{ flex: 1 }}>
        {/* Linha 1: Fabricante e Localização */}
        <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
          <div
            style={{
              width: '50%',
              borderRight: '1px solid #000',
              padding: '1mm',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontWeight: 'bold', fontSize: '7pt' }}>
              Fabricante:
            </span>
            <span style={{ fontSize: '8pt', marginTop: '0.5mm' }}>
              {data.manufacturer}
            </span>
          </div>
          <div
            style={{
              width: '50%',
              padding: '1mm',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontWeight: 'bold', fontSize: '7pt' }}>
              Localização Estoque:
            </span>
            <span style={{ fontSize: '8pt', marginTop: '0.5mm' }}>
              {data.stockLocation}
            </span>
          </div>
        </div>

        {/* Linha 2: Produto e Código */}
        <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
          <div
            style={{
              width: '50%',
              borderRight: '1px solid #000',
              padding: '1mm',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontWeight: 'bold', fontSize: '7pt' }}>
              Produto:
            </span>
            <span style={{ fontSize: '8pt', marginTop: '0.5mm' }}>
              {data.product}
            </span>
          </div>
          <div
            style={{
              width: '50%',
              padding: '1mm',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontWeight: 'bold', fontSize: '7pt' }}>Código:</span>
            <span style={{ fontSize: '8pt', marginTop: '0.5mm' }}>
              {data.code}
            </span>
          </div>
        </div>

        {/* Linha 3: Composição e Qualidade */}
        <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
          <div
            style={{
              width: '50%',
              borderRight: '1px solid #000',
              padding: '1mm',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontWeight: 'bold', fontSize: '7pt' }}>
              Composição:
            </span>
            <span style={{ fontSize: '8pt', marginTop: '0.5mm' }}>
              {data.composition}
            </span>
          </div>
          <div
            style={{
              width: '50%',
              padding: '1mm',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontWeight: 'bold', fontSize: '7pt' }}>
              Qualidade:
            </span>
            <span style={{ fontSize: '8pt', marginTop: '0.5mm' }}>
              {data.quality || '-'}
            </span>
          </div>
        </div>

        {/* Linha 4: Cor e Nuance */}
        <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
          <div
            style={{
              width: '50%',
              borderRight: '1px solid #000',
              padding: '1mm',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontWeight: 'bold', fontSize: '7pt' }}>Cor:</span>
            <span style={{ fontSize: '8pt', marginTop: '0.5mm' }}>
              {data.color}
            </span>
          </div>
          <div
            style={{
              width: '50%',
              padding: '1mm',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontWeight: 'bold', fontSize: '7pt' }}>Nuance:</span>
            <span style={{ fontSize: '8pt', marginTop: '0.5mm' }}>
              {data.nuance || '-'}
            </span>
          </div>
        </div>

        {/* Linha 5: Dimensões e Gramatura */}
        <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
          <div
            style={{
              width: '50%',
              borderRight: '1px solid #000',
              padding: '1mm',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontWeight: 'bold', fontSize: '7pt' }}>
              Dimensões:
            </span>
            <span style={{ fontSize: '8pt', marginTop: '0.5mm' }}>
              {data.dimensions}
            </span>
          </div>
          <div
            style={{
              width: '50%',
              padding: '1mm',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontWeight: 'bold', fontSize: '7pt' }}>
              Gramatura:
            </span>
            <span style={{ fontSize: '8pt', marginTop: '0.5mm' }}>
              {data.grammage}
            </span>
          </div>
        </div>

        {/* Linha 6: ID da Peça e Quantidade */}
        <div style={{ display: 'flex', borderBottom: '2px solid #000' }}>
          <div
            style={{
              width: '50%',
              borderRight: '1px solid #000',
              padding: '1mm',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontWeight: 'bold', fontSize: '7pt' }}>
              #ID DA PEÇA:
            </span>
            <span
              style={{
                fontSize: '9pt',
                fontWeight: 'bold',
                marginTop: '0.5mm',
              }}
            >
              {data.pieceId}
            </span>
          </div>
          <div
            style={{
              width: '50%',
              padding: '1mm',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontWeight: 'bold', fontSize: '7pt' }}>
              QUANTIDADE:
            </span>
            <span
              style={{
                fontSize: '9pt',
                fontWeight: 'bold',
                marginTop: '0.5mm',
              }}
            >
              {data.quantity}
            </span>
          </div>
        </div>
      </div>

      {/* Código de Barras */}
      <div
        style={{
          marginTop: '2mm',
          textAlign: 'center',
          backgroundColor: '#ffffff',
          padding: '1mm',
        }}
      >
        <img
          ref={barcodeRef}
          alt={`Código de barras: ${data.barcode}`}
          style={{
            maxWidth: '100%',
            height: 'auto',
          }}
        />
      </div>
    </div>
  );
});

ItemLabelTemplate.displayName = 'ItemLabelTemplate';
