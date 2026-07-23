/**
 * Dev-only extraction inspector — reachable at `/import-debug` (see main.jsx,
 * gated on import.meta.env.DEV). Pick a PDF and see:
 *   - the reconstructed lines with x / y / fontSize / column / cells,
 *   - a scaled page overlay of every line box plus detected gutters.
 *
 * This is diagnostic tooling for Phase 1, not part of the app. It imports the
 * importer lazily so it never touches the main bundle.
 */

import { useState, useCallback } from 'react';

const SCALE = 0.6; // page overlay scale

export default function ImportDebug() {
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');

  const onFile = useCallback(async (file) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setResult(null);
    setFileName(file.name);
    try {
      const { analyzePdf } = await import('../index.js');
      const res = await analyzePdf(file);
      setResult(res);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Importer debug — PDF layout</h1>
      <p style={S.sub}>
        Dev-only. Pick a resume PDF to inspect extracted lines, columns, cells and detected gutters.
      </p>

      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      {busy && <p>Analyzing {fileName}…</p>}
      {error && <p style={S.error}>Error: {error}</p>}

      {result && (
        <>
          <div style={S.stats}>
            <Stat label="file" value={fileName} />
            <Stat label="pages" value={result.pageCount} />
            <Stat label="multiColumn" value={String(result.multiColumn)} />
            <Stat label="lines" value={result.lines.length} />
            <Stat label="gutters" value={result.gutters.length} />
          </div>

          <h2 style={S.h2}>Page overlays</h2>
          <div style={S.overlays}>
            {result.pages.map((p) => (
              <PageOverlay
                key={p.page}
                page={p}
                lines={result.lines.filter((l) => l.page === p.page)}
                gutters={result.gutters.filter((g) => g.page === p.page)}
              />
            ))}
          </div>

          <h2 style={S.h2}>Lines (reading order)</h2>
          <LinesTable lines={result.lines} />
        </>
      )}
    </div>
  );
}

function PageOverlay({ page, lines, gutters }) {
  return (
    <div
      style={{
        position: 'relative',
        width: page.width * SCALE,
        height: page.height * SCALE,
        border: '1px solid #999',
        background: '#fff',
        flex: '0 0 auto',
      }}
    >
      {gutters.map((g, i) => (
        <div
          key={`g${i}`}
          title="gutter"
          style={{
            position: 'absolute',
            left: g.xStart * SCALE,
            top: g.yStart * SCALE,
            width: (g.xEnd - g.xStart) * SCALE,
            height: (g.yEnd - g.yStart) * SCALE,
            background: 'rgba(255,80,80,0.18)',
            border: '1px dashed rgba(200,0,0,0.6)',
          }}
        />
      ))}
      {lines.map((l, i) => (
        <div
          key={i}
          title={l.text}
          style={{
            position: 'absolute',
            left: l.x * SCALE,
            top: (l.y - l.fontSize) * SCALE,
            width: Math.max((l.xEnd - l.x) * SCALE, 1),
            height: Math.max(l.fontSize * SCALE, 2),
            background: l.column === 1 ? 'rgba(60,120,255,0.16)' : 'rgba(60,180,90,0.14)',
            borderLeft: `2px solid ${l.column === 1 ? '#3c78ff' : '#3cb45a'}`,
            fontSize: 6,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        />
      ))}
    </div>
  );
}

function LinesTable({ lines }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={S.table}>
        <thead>
          <tr>
            {['#', 'pg', 'col', 'y', 'x', 'xEnd', 'fs', 'ratio', 'B', 'CAPS', 'cells', 'text'].map(
              (h) => (
                <th key={h} style={S.th}>
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={i} style={l.column === 1 ? { background: '#eef3ff' } : undefined}>
              <td style={S.td}>{i}</td>
              <td style={S.td}>{l.page}</td>
              <td style={S.td}>{l.column}</td>
              <td style={S.td}>{Math.round(l.y)}</td>
              <td style={S.td}>{Math.round(l.x)}</td>
              <td style={S.td}>{Math.round(l.xEnd)}</td>
              <td style={S.td}>{l.fontSize.toFixed(1)}</td>
              <td style={S.td}>{l.bodyRatio.toFixed(2)}</td>
              <td style={S.td}>{l.bold ? '●' : ''}</td>
              <td style={S.td}>{l.allCaps ? '●' : ''}</td>
              <td style={S.td}>{l.cells.length > 1 ? l.cells.length : ''}</td>
              <td style={{ ...S.td, ...S.textCell }}>
                {l.cells.length > 1 ? l.cells.join('  ¦  ') : l.text}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={S.stat}>
      <div style={S.statLabel}>{label}</div>
      <div style={S.statValue}>{value}</div>
    </div>
  );
}

const S = {
  page: { padding: 24, fontFamily: 'system-ui, sans-serif', color: '#111', maxWidth: 1200, margin: '0 auto' },
  h1: { fontSize: 22, margin: '0 0 4px' },
  h2: { fontSize: 16, margin: '24px 0 8px' },
  sub: { color: '#555', margin: '0 0 16px' },
  error: { color: '#c00' },
  stats: { display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' },
  stat: { border: '1px solid #ddd', borderRadius: 8, padding: '8px 12px', minWidth: 80 },
  statLabel: { fontSize: 11, color: '#777', textTransform: 'uppercase' },
  statValue: { fontSize: 16, fontWeight: 600 },
  overlays: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  table: { borderCollapse: 'collapse', fontSize: 12, width: '100%' },
  th: { textAlign: 'left', borderBottom: '2px solid #ccc', padding: '4px 6px', position: 'sticky', top: 0, background: '#fafafa' },
  td: { borderBottom: '1px solid #eee', padding: '3px 6px', verticalAlign: 'top', whiteSpace: 'nowrap' },
  textCell: { whiteSpace: 'normal', fontFamily: 'ui-monospace, monospace' },
};
