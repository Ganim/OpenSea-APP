import { describe, expect, it } from 'vitest';
import {
  AisleConfig,
  expandPattern,
  generateAdvancedTextFromBasic,
  parseAdvancedTextToAisleConfigs,
  parseLocationStringAdvanced,
  readAisleConfigsFromDOM,
} from '../location-patterns';

describe('location-patterns helper', () => {
  it('expandPattern handles complex pattern with numbers and letters', () => {
    const res = expandPattern('PRT{2}-[3]') as string[];
    expect(res).toContain('PRT1-A');
    expect(res).toContain('PRT1-B');
    expect(res).toContain('PRT2-C');
    expect(res.length).toBe(6);
  });

  it('generateAdvancedTextFromBasic for different configs', () => {
    const configs = [
      { name: 'A', columns: 1, rows: 1 },
      { name: 'B', columns: 3, rows: 1 },
      { name: 'C', columns: 1, rows: 2 },
      { name: 'D', columns: 2, rows: 2 },
    ];
    const text = generateAdvancedTextFromBasic(configs as AisleConfig[]);
    expect(text).toContain('A');
    expect(text).toContain('B{3}');
    expect(text).toContain('C[2]');
    expect(text).toContain('D{2}-[2]');
  });

  it('parseAdvancedTextToAisleConfigs parses various patterns', () => {
    const parsed = parseAdvancedTextToAisleConfigs('PRT{2}-[3], X{5}, Y[2], Z');
    expect(parsed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'PRT', columns: 2, rows: 3 }),
        expect.objectContaining({ name: 'X', columns: 5, rows: 1 }),
        expect.objectContaining({ name: 'Y', columns: 1, rows: 2 }),
        expect.objectContaining({ name: 'Z', columns: 1, rows: 1 }),
      ])
    );
  });

  it('parseLocationStringAdvanced handles hierarchy pattern', () => {
    const nodes = parseLocationStringAdvanced('20{2}*(+-[2])');
    // should create parents and children
    expect(nodes.length).toBeGreaterThan(0);
    const parent = nodes[0];
    expect(parent.children.length).toBe(2);
  });

  it('readAisleConfigsFromDOM reads input elements from DOM', () => {
    // If no document is present (running in pure Node), skip this test
    if (typeof document === 'undefined' || !document.createElement) {
      return;
    }
    // Set up DOM inputs
    const nameInput = document.createElement('input');
    nameInput.id = 'aisle-name-0';
    nameInput.value = 'PRT';
    document.body.appendChild(nameInput);

    const colInput = document.createElement('input');
    colInput.id = 'aisle-columns-0';
    colInput.value = '10';
    document.body.appendChild(colInput);

    const rowInput = document.createElement('input');
    rowInput.id = 'aisle-rows-0';
    rowInput.value = '5';
    document.body.appendChild(rowInput);

    const parsed = readAisleConfigsFromDOM(10);
    expect(parsed).toEqual(
      expect.arrayContaining([{ name: 'PRT', columns: 10, rows: 5 }])
    );
  });
});
