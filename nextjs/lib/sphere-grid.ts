// Pure helpers for sphere grids. Shared by server (validation) and
// client (painter + 3D preview); importable anywhere.

export const DESIGN_COLS = 14;
export const DESIGN_ROWS = 8;

export function emptyGrid(): string[][] {
  return Array.from({ length: DESIGN_ROWS }, () => Array<string>(DESIGN_COLS).fill(""));
}

export function validateGrid(grid: unknown): string[][] {
  if (!Array.isArray(grid)) throw new Error("grid must be an array");
  if (grid.length !== DESIGN_ROWS) throw new Error(`grid must have ${DESIGN_ROWS} rows`);
  const hex = /^(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6}|)$/;
  const out: string[][] = [];
  for (const row of grid) {
    if (!Array.isArray(row)) throw new Error("grid row must be an array");
    if (row.length !== DESIGN_COLS) throw new Error(`grid row must have ${DESIGN_COLS} cols`);
    const normalized: string[] = [];
    for (const cell of row) {
      if (typeof cell !== "string") throw new Error("cell must be a string");
      if (!hex.test(cell)) throw new Error(`cell is not a hex color: "${cell}"`);
      normalized.push(cell);
    }
    out.push(normalized);
  }
  return out;
}
