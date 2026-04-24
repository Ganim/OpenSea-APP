import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EmployeeDayHeatmap, type HeatmapCell } from './employee-day-heatmap';

describe('EmployeeDayHeatmap', () => {
  const baseRows = [{ id: 'E1', label: 'João' }];
  const baseColumns = [{ id: '2026-04-01', label: '01' }];

  it('renders rows and columns correctly', () => {
    const cells: HeatmapCell[] = [
      { rowId: 'E1', colId: '2026-04-01', statuses: ['NORMAL'] },
    ];
    render(
      <EmployeeDayHeatmap rows={baseRows} columns={baseColumns} cells={cells} />
    );
    expect(screen.getByText('João')).toBeInTheDocument();
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByTestId('heatmap-grid')).toBeInTheDocument();
  });

  it('applies status-specific className to each cell', () => {
    const cells: HeatmapCell[] = [
      { rowId: 'E1', colId: '2026-04-01', statuses: ['FALTA'] },
    ];
    render(
      <EmployeeDayHeatmap rows={baseRows} columns={baseColumns} cells={cells} />
    );
    const cell = screen.getByTestId('heatmap-cell-E1-2026-04-01');
    expect(cell.className).toContain('rose-');
  });

  it('renders secondary status dot when cell has 2 statuses', () => {
    const cells: HeatmapCell[] = [
      {
        rowId: 'E1',
        colId: '2026-04-01',
        statuses: ['JUSTIFICADO', 'HORA_EXTRA'],
      },
    ];
    render(
      <EmployeeDayHeatmap rows={baseRows} columns={baseColumns} cells={cells} />
    );
    expect(
      screen.getByTestId('heatmap-cell-secondary-E1-2026-04-01')
    ).toBeInTheDocument();
  });

  it('calls onCellClick when cell clicked', () => {
    const handler = vi.fn();
    const cells: HeatmapCell[] = [
      { rowId: 'E1', colId: '2026-04-01', statuses: ['NORMAL'] },
    ];
    render(
      <EmployeeDayHeatmap
        rows={baseRows}
        columns={baseColumns}
        cells={cells}
        onCellClick={handler}
      />
    );
    fireEvent.click(screen.getByTestId('heatmap-cell-E1-2026-04-01'));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ rowId: 'E1', colId: '2026-04-01' })
    );
  });

  it('renders empty state when rows + cells are empty', () => {
    render(
      <EmployeeDayHeatmap
        rows={[]}
        columns={[]}
        cells={[]}
        emptyMessage="Vazio"
      />
    );
    expect(screen.getByText('Vazio')).toBeInTheDocument();
    expect(screen.getByTestId('heatmap-empty')).toBeInTheDocument();
  });

  it('renders loading skeleton when isLoading=true', () => {
    render(<EmployeeDayHeatmap rows={[]} columns={[]} cells={[]} isLoading />);
    expect(screen.getByTestId('heatmap-loading')).toBeInTheDocument();
    expect(screen.getAllByTestId('heatmap-skeleton').length).toBeGreaterThan(0);
  });

  it('applies todayColId ring highlight to today column cells', () => {
    const cells: HeatmapCell[] = [
      { rowId: 'E1', colId: '2026-04-01', statuses: ['NORMAL'] },
    ];
    render(
      <EmployeeDayHeatmap
        rows={baseRows}
        columns={baseColumns}
        cells={cells}
        todayColId="2026-04-01"
      />
    );
    const cell = screen.getByTestId('heatmap-cell-E1-2026-04-01');
    expect(cell.className).toContain('ring-primary');
  });
});
