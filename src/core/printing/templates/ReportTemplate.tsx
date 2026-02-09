'use client';

/**
 * Template Genérico de Relatório A4
 *
 * Template flexível e customizável para qualquer tipo de relatório
 */

import type {
  ReportData,
  ReportImageData,
  ReportTableData,
} from '@/core/printing/types';
import { type TableColumn } from '@/core/printing/types';
import React from 'react';

interface ReportTemplateProps {
  data: ReportData;
}

export const ReportTemplate = React.forwardRef<
  HTMLDivElement,
  ReportTemplateProps
>(({ data }, ref) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div
      ref={ref}
      className="report-template"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '20mm',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        color: '#000000',
        boxSizing: 'border-box',
        fontSize: '10pt',
      }}
    >
      {/* Cabeçalho */}
      <div
        style={{
          borderBottom: '2px solid #000',
          paddingBottom: '10px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ flex: 1 }}>
            {data.logo && (
              <img
                src={data.logo}
                alt="Logo"
                style={{ maxHeight: '40px', marginBottom: '10px' }}
              />
            )}
            <h1 style={{ fontSize: '18pt', fontWeight: 'bold', margin: 0 }}>
              {data.title}
            </h1>
            {data.subtitle && (
              <p
                style={{ fontSize: '12pt', color: '#666', margin: '5px 0 0 0' }}
              >
                {data.subtitle}
              </p>
            )}
          </div>
          <div style={{ textAlign: 'right', fontSize: '9pt', color: '#666' }}>
            {data.generatedAt && (
              <div>
                <strong>Gerado em:</strong> {formatDate(data.generatedAt)}
              </div>
            )}
            {data.generatedBy && (
              <div>
                <strong>Por:</strong> {data.generatedBy}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo - Seções */}
      <div style={{ marginBottom: '20px' }}>
        {data.sections.map((section, idx) => (
          <div key={idx} style={{ marginBottom: '20px' }}>
            {section.title && (
              <h2
                style={{
                  fontSize: '14pt',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  borderBottom: '1px solid #ccc',
                  paddingBottom: '5px',
                }}
              >
                {section.title}
              </h2>
            )}

            {/* Seção de Texto */}
            {section.type === 'text' && section.content && (
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                {section.content}
              </div>
            )}

            {/* Seção de Tabela */}
            {section.type === 'table' &&
              section.data &&
              (() => {
                const tableData = section.data as ReportTableData;
                return (
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '9pt',
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5' }}>
                        {tableData.columns.map(
                          (col: TableColumn, colIdx: number) => (
                            <th
                              key={colIdx}
                              style={{
                                border: '1px solid #ddd',
                                padding: '8px',
                                textAlign: col.align || 'left',
                                fontWeight: 'bold',
                                width: col.width,
                              }}
                            >
                              {col.header}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.rows.map(
                        (row: Record<string, unknown>, rowIdx: number) => (
                          <tr
                            key={rowIdx}
                            style={{
                              backgroundColor:
                                rowIdx % 2 === 0 ? '#ffffff' : '#fafafa',
                            }}
                          >
                            {tableData.columns.map(
                              (col: TableColumn, colIdx: number) => (
                                <td
                                  key={colIdx}
                                  style={{
                                    border: '1px solid #ddd',
                                    padding: '8px',
                                    textAlign: col.align || 'left',
                                  }}
                                >
                                  {col.format
                                    ? col.format(row[col.accessor])
                                    : String(row[col.accessor] ?? '')}
                                </td>
                              )
                            )}
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                );
              })()}

            {/* Seção de Imagem */}
            {section.type === 'image' &&
              section.data &&
              (() => {
                const imageData = section.data as ReportImageData;
                return (
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={imageData.src}
                      alt={imageData.alt || ''}
                      style={{
                        maxWidth: '100%',
                        maxHeight: imageData.maxHeight || '300px',
                      }}
                    />
                    {imageData.caption && (
                      <p
                        style={{
                          fontSize: '8pt',
                          color: '#666',
                          marginTop: '5px',
                          fontStyle: 'italic',
                        }}
                      >
                        {imageData.caption}
                      </p>
                    )}
                  </div>
                );
              })()}

            {/* Seção Customizada */}
            {section.type === 'custom' && section.content && (
              <div dangerouslySetInnerHTML={{ __html: section.content }} />
            )}
          </div>
        ))}
      </div>

      {/* Rodapé */}
      {data.footer && (
        <div
          style={{
            borderTop: '1px solid #ccc',
            paddingTop: '10px',
            marginTop: '30px',
            fontSize: '8pt',
            color: '#666',
            textAlign: 'center',
          }}
        >
          {data.footer}
        </div>
      )}
    </div>
  );
});

ReportTemplate.displayName = 'ReportTemplate';
