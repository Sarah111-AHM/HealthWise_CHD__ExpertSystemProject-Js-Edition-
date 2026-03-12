import React, { useState } from 'react';
import { getMembershipCurveData, applyHedge } from '../lib/fuzzyEngine';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const PLOTS = [
  {
    key: 'bp', title: 'Blood Pressure', unit: 'mmHg',
    lines: [
      { key: 'low', color: '#00c8ff', label: 'Low' },
      { key: 'medium', color: '#ffb703', label: 'Medium' },
      { key: 'high', color: '#ff4d6d', label: 'High' },
    ],
  },
  {
    key: 'chol', title: 'Cholesterol', unit: 'mg/dL',
    lines: [
      { key: 'low', color: '#00c8ff', label: 'Low' },
      { key: 'high', color: '#ff4d6d', label: 'High' },
    ],
  },
  {
    key: 'hr', title: 'Heart Rate', unit: 'bpm',
    lines: [
      { key: 'slow', color: '#00c8ff', label: 'Slow' },
      { key: 'moderate', color: '#ffb703', label: 'Moderate' },
      { key: 'fast', color: '#ff4d6d', label: 'Fast' },
    ],
  },
  {
    key: 'output', title: 'CHD Output Level', unit: 'CHD',
    lines: [
      { key: 'healthy', color: '#00ff9d', label: 'Healthy' },
      { key: 'middle', color: '#ffb703', label: 'Middle' },
      { key: 'sick', color: '#ff4d6d', label: 'Sick' },
    ],
  },
];

const HEDGE_DEMO = [
  { value: 'none', label: 'None', op: 'μ' },
  { value: 'very', label: 'Very', op: 'μ²' },
  { value: 'extremely', label: 'Extremely', op: 'μ³' },
  { value: 'somewhat', label: 'Somewhat', op: '√μ' },
  { value: 'slightly', label: 'Slightly', op: 'μ^1.25' },
];

export default function MembershipPanel() {
  const [hedge, setHedge] = useState('none');
  const [focusedPlot, setFocusedPlot] = useState(null);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, letterSpacing: '-0.03em', marginBottom: 6 }}>
          Membership Functions
        </h1>
        <p style={{ color: '#6a9bc3', fontFamily: 'Space Mono', fontSize: 12 }}>
          Triangular &amp; trapezoidal membership functions with linguistic hedge modifiers
        </p>
      </div>

      {/* Hedge selector */}
      <div style={{
        background: '#071a2e', border: '1px solid #0e3a6e', borderRadius: 12, padding: 20, marginBottom: 28,
      }}>
        <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 11, color: '#6a9bc3', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
          Apply Linguistic Hedge to Visualize Effect
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {HEDGE_DEMO.map(h => (
            <button key={h.value} onClick={() => setHedge(h.value)} style={{
              padding: '8px 18px',
              background: hedge === h.value ? 'rgba(0,200,255,0.15)' : 'rgba(0,200,255,0.04)',
              border: `1px solid ${hedge === h.value ? '#00c8ff' : '#0e3a6e'}`,
              borderRadius: 8,
              color: hedge === h.value ? '#00c8ff' : '#6a9bc3',
              fontFamily: 'Space Mono', fontSize: 12,
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {h.label} <span style={{ color: '#3a8aaa', fontSize: 10 }}>({h.op})</span>
            </button>
          ))}
        </div>
        {hedge !== 'none' && (
          <div style={{ marginTop: 12, fontFamily: 'Space Mono', fontSize: 11, color: '#a0c8e8', background: '#0a2240', padding: '8px 14px', borderRadius: 6, borderLeft: '3px solid #00c8ff' }}>
            📖 Hedge "{hedge}": membership values modified. Concentration (very/extremely) sharpens peaks; dilation (somewhat) widens them.
          </div>
        )}
      </div>

      {/* Plots grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {PLOTS.map(plot => {
          let rawData = getMembershipCurveData(plot.key);
          // Apply hedge to all membership values for visualization
          const data = rawData.map(point => {
            const newPoint = { x: point.x };
            plot.lines.forEach(line => {
              const raw = point[line.key] || 0;
              newPoint[line.key] = hedge !== 'none' ? parseFloat(applyHedge(raw, hedge).toFixed(4)) : raw;
              newPoint[`${line.key}_orig`] = raw;
            });
            return newPoint;
          });

          return (
            <div key={plot.key} style={{
              background: '#071a2e',
              border: `1px solid ${focusedPlot === plot.key ? '#00c8ff55' : '#0e3a6e'}`,
              borderRadius: 12, padding: 20,
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }} onClick={() => setFocusedPlot(focusedPlot === plot.key ? null : plot.key)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16 }}>{plot.title}</div>
                  <div style={{ fontFamily: 'Space Mono', fontSize: 10, color: '#6a9bc3' }}>Input variable · {plot.unit}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {plot.lines.map(l => (
                    <span key={l.key} style={{
                      fontFamily: 'Space Mono', fontSize: 10, color: l.color,
                      background: `${l.color}15`, padding: '3px 8px', borderRadius: 4,
                    }}>{l.label}</span>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data} margin={{ top: 0, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid stroke="#0e3a6e" strokeDasharray="3 3" />
                  <XAxis dataKey="x" tick={{ fontFamily: 'Space Mono', fontSize: 9, fill: '#6a9bc3' }} axisLine={false} tickLine={false} tickCount={6} />
                  <YAxis domain={[0, 1]} tick={{ fontFamily: 'Space Mono', fontSize: 9, fill: '#6a9bc3' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#071a2e', border: '1px solid #0e3a6e', fontFamily: 'Space Mono', fontSize: 10 }}
                    formatter={(v) => [v.toFixed(4), '']}
                    labelFormatter={v => `${plot.unit === 'CHD' ? 'CHD' : plot.unit}: ${v}`}
                  />
                  {plot.lines.map(l => (
                    <Line key={l.key} type="monotone" dataKey={l.key}
                      stroke={l.color} strokeWidth={hedge !== 'none' ? 2.5 : 2}
                      dot={false} name={l.label}
                      strokeDasharray={hedge !== 'none' ? undefined : undefined}
                      style={{ filter: `drop-shadow(0 0 3px ${l.color}66)` }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>

      {/* Hedge explanation */}
      <div style={{ marginTop: 28, background: '#071a2e', border: '1px solid #0e3a6e', borderRadius: 12, padding: 24 }}>
        <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, color: '#a0c8e8', marginBottom: 16 }}>
          Linguistic Hedge Reference
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { hedge: 'None', formula: 'μ(x)', effect: 'No modification' },
            { hedge: 'Very / Indeed', formula: 'μ(x)²', effect: 'Concentrates (sharpens)' },
            { hedge: 'Extremely', formula: 'μ(x)³', effect: 'Strong concentration' },
            { hedge: 'Somewhat / More or Less', formula: '√μ(x)', effect: 'Dilates (widens)' },
            { hedge: 'Slightly', formula: 'μ(x)^1.25', effect: 'Mild concentration' },
          ].map(h => (
            <div key={h.hedge} style={{ background: '#0a2240', border: '1px solid #0e3a6e', borderRadius: 8, padding: 14 }}>
              <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, color: '#00c8ff', marginBottom: 4 }}>{h.hedge}</div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 11, color: '#ffb703', marginBottom: 4 }}>{h.formula}</div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 10, color: '#6a9bc3' }}>{h.effect}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
