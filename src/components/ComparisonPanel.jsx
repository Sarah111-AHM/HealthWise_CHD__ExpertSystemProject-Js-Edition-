import React, { useState } from 'react';
import { diagnose, PRESET_PATIENTS } from '../lib/fuzzyEngine';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';

const COLORS = ['#00c8ff', '#ffb703', '#ff4d6d'];
const PATIENT_COLORS = { 1: '#00c8ff', 2: '#ffb703', 3: '#ff4d6d' };

const HEDGES = ['none', 'very', 'somewhat', 'extremely'];

function ResultCard({ patient, result, color }) {
  const cogC = result.cog.classification;
  const sugC = result.sugeno.classification;
  return (
    <div style={{
      background: '#071a2e', border: `1px solid ${color}33`,
      borderTop: `3px solid ${color}`, borderRadius: 12, padding: 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color }}>{patient.name}</div>
          <div style={{ fontFamily: 'Space Mono', fontSize: 10, color: '#6a9bc3', marginTop: 4 }}>
            BP:{patient.bp} · Chol:{patient.chol} · HR:{patient.hr}
          </div>
        </div>
        <span style={{ fontSize: 28 }}>{cogC.emoji}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        {[
          { label: 'COG', value: result.cog.value, cls: cogC },
          { label: 'Sugeno', value: result.sugeno.value, cls: sugC },
        ].map(({ label, value, cls }) => (
          <div key={label} style={{ background: '#0a2240', borderRadius: 8, padding: 12, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Space Mono', fontSize: 10, color: '#6a9bc3', marginBottom: 4 }}>{label}</div>
            <div style={{ fontFamily: 'Space Mono', fontWeight: 700, fontSize: 18, color: cls.color }}>
              {value.toFixed(3)}
            </div>
            <div style={{ fontFamily: 'Syne', fontSize: 11, color: cls.color, marginTop: 2 }}>{cls.label}</div>
          </div>
        ))}
      </div>

      {/* Membership mini bars */}
      <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#6a9bc3', marginBottom: 6 }}>MEMBERSHIPS</div>
      {[
        { label: 'BP', sets: result.memberships.bp, keys: ['low', 'medium', 'high'], cols: ['#00c8ff', '#ffb703', '#ff4d6d'] },
        { label: 'Chol', sets: result.memberships.chol, keys: ['low', 'high'], cols: ['#00c8ff', '#ff4d6d'] },
        { label: 'HR', sets: result.memberships.hr, keys: ['slow', 'moderate', 'fast'], cols: ['#00c8ff', '#ffb703', '#ff4d6d'] },
      ].map(({ label, sets, keys, cols }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
          <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#3a6a8a', width: 32 }}>{label}</span>
          {keys.map((k, i) => (
            <div key={k} style={{ flex: 1 }}>
              <div style={{ background: '#0a2240', borderRadius: 2, height: 5 }}>
                <div style={{ width: `${(sets[k] || 0) * 100}%`, height: '100%', background: cols[i], borderRadius: 2 }} />
              </div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: cols[i], textAlign: 'center', marginTop: 1 }}>
                {(sets[k] || 0).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function ComparisonPanel() {
  const [hedge, setHedge] = useState('none');
  const results = PRESET_PATIENTS.map(p => diagnose(p.bp, p.chol, p.hr, hedge));

  const barData = [
    { metric: 'COG', P1: +results[0].cog.value.toFixed(3), P2: +results[1].cog.value.toFixed(3), P3: +results[2].cog.value.toFixed(3) },
    { metric: 'Sugeno', P1: +results[0].sugeno.value.toFixed(3), P2: +results[1].sugeno.value.toFixed(3), P3: +results[2].sugeno.value.toFixed(3) },
  ];

  // Radar data: rule strengths
  const radarData = results[0].ruleStrengths.map((r, i) => ({
    rule: `R${r.rule}`,
    P1: +results[0].ruleStrengths[i].strength.toFixed(3),
    P2: +results[1].ruleStrengths[i].strength.toFixed(3),
    P3: +results[2].ruleStrengths[i].strength.toFixed(3),
  }));

  // Hedge comparison
  const hedgeComparison = PRESET_PATIENTS.map((p, pi) => {
    return HEDGES.map(h => {
      const r = diagnose(p.bp, p.chol, p.hr, h);
      return { hedge: h, cog: +r.cog.value.toFixed(3), sugeno: +r.sugeno.value.toFixed(3) };
    });
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, letterSpacing: '-0.03em', marginBottom: 6 }}>
          Patient Comparison
        </h1>
        <p style={{ color: '#6a9bc3', fontFamily: 'Space Mono', fontSize: 12 }}>
          Side-by-side analysis of all 3 patients · COG vs Sugeno · Hedge sensitivity
        </p>
      </div>

      {/* Hedge selector */}
      <div style={{ background: '#071a2e', border: '1px solid #0e3a6e', borderRadius: 10, padding: 16, marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 11, color: '#6a9bc3', letterSpacing: 2, textTransform: 'uppercase' }}>Hedge:</span>
        {HEDGES.map(h => (
          <button key={h} onClick={() => setHedge(h)} style={{
            padding: '6px 16px', background: hedge === h ? 'rgba(0,200,255,0.15)' : '#0a2240',
            border: `1px solid ${hedge === h ? '#00c8ff' : '#0e3a6e'}`,
            borderRadius: 6, color: hedge === h ? '#00c8ff' : '#6a9bc3',
            fontFamily: 'Space Mono', fontSize: 11, cursor: 'pointer',
          }}>{h === 'none' ? 'None' : h.charAt(0).toUpperCase() + h.slice(1)}</button>
        ))}
      </div>

      {/* Patient cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28 }}>
        {PRESET_PATIENTS.map((p, i) => (
          <ResultCard key={p.id} patient={p} result={results[i]} color={COLORS[i]} />
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* COG vs Sugeno bar */}
        <div style={{ background: '#071a2e', border: '1px solid #0e3a6e', borderRadius: 12, padding: 20 }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>COG vs Sugeno — All Patients</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <CartesianGrid stroke="#0e3a6e" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="metric" tick={{ fontFamily: 'Space Mono', fontSize: 11, fill: '#6a9bc3' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 4]} tick={{ fontFamily: 'Space Mono', fontSize: 10, fill: '#6a9bc3' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#071a2e', border: '1px solid #0e3a6e', fontFamily: 'Space Mono', fontSize: 11 }} />
              <Legend wrapperStyle={{ fontFamily: 'Space Mono', fontSize: 11 }} />
              {['P1', 'P2', 'P3'].map((p, i) => (
                <Bar key={p} dataKey={p} fill={COLORS[i]} radius={[4, 4, 0, 0]} name={`Patient ${i + 1}`} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rule strength radar */}
        <div style={{ background: '#071a2e', border: '1px solid #0e3a6e', borderRadius: 12, padding: 20 }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Rule Strengths Radar</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#0e3a6e" />
              <PolarAngleAxis dataKey="rule" tick={{ fontFamily: 'Space Mono', fontSize: 10, fill: '#6a9bc3' }} />
              <PolarRadiusAxis domain={[0, 1]} tick={false} axisLine={false} />
              {['P1', 'P2', 'P3'].map((p, i) => (
                <Radar key={p} name={`Patient ${i + 1}`} dataKey={p}
                  stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15}
                  strokeWidth={2} dot={{ fill: COLORS[i], r: 3 }}
                />
              ))}
              <Legend wrapperStyle={{ fontFamily: 'Space Mono', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#071a2e', border: '1px solid #0e3a6e', fontFamily: 'Space Mono', fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hedge sensitivity table */}
      <div style={{ background: '#071a2e', border: '1px solid #0e3a6e', borderRadius: 12, padding: 24 }}>
        <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Hedge Sensitivity Analysis — COG Output</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Space Mono', fontSize: 11 }}>
            <thead>
              <tr style={{ background: '#0a2240' }}>
                <th style={{ padding: '8px 14px', color: '#6a9bc3', textAlign: 'left', borderBottom: '1px solid #0e3a6e', fontWeight: 400 }}>Hedge</th>
                {PRESET_PATIENTS.map((p, i) => (
                  <th key={p.id} colSpan={2} style={{ padding: '8px 14px', color: COLORS[i], textAlign: 'center', borderBottom: '1px solid #0e3a6e', fontWeight: 400 }}>
                    Patient {p.id}
                  </th>
                ))}
              </tr>
              <tr style={{ background: '#0a2240' }}>
                <th style={{ padding: '4px 14px', borderBottom: '1px solid #0e3a6e' }}></th>
                {PRESET_PATIENTS.map((_, i) => (
                  <React.Fragment key={i}>
                    <th style={{ padding: '4px 10px', color: '#6a9bc3', fontWeight: 400, borderBottom: '1px solid #0e3a6e' }}>COG</th>
                    <th style={{ padding: '4px 10px', color: '#6a9bc3', fontWeight: 400, borderBottom: '1px solid #0e3a6e' }}>Sugeno</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {HEDGES.map((h, hi) => (
                <tr key={h} style={{ borderBottom: '1px solid #0a2240', background: hi % 2 === 0 ? '#050f1e' : '#020b14' }}>
                  <td style={{ padding: '8px 14px', color: h === hedge ? '#00c8ff' : '#a0c8e8', fontWeight: h === hedge ? 700 : 400 }}>
                    {h === 'none' ? 'None' : h}
                  </td>
                  {PRESET_PATIENTS.map((p, pi) => {
                    const row = hedgeComparison[pi][hi];
                    const baseRow = hedgeComparison[pi][0];
                    const diff = row.cog - baseRow.cog;
                    return (
                      <React.Fragment key={pi}>
                        <td style={{ padding: '8px 10px', textAlign: 'center', color: COLORS[pi], fontWeight: 700 }}>
                          {row.cog.toFixed(3)}
                          {hi > 0 && (
                            <span style={{ color: diff > 0 ? '#ff4d6d' : '#00ff9d', fontSize: 9, marginLeft: 4 }}>
                              {diff > 0 ? '▲' : '▼'}{Math.abs(diff).toFixed(3)}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', color: '#6a9bc3' }}>{row.sugeno.toFixed(3)}</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Interpretation */}
        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {PRESET_PATIENTS.map((p, i) => {
            const r = results[i];
            return (
              <div key={p.id} style={{ background: '#0a2240', borderRadius: 8, padding: 14, borderLeft: `3px solid ${COLORS[i]}` }}>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, color: COLORS[i], marginBottom: 6 }}>Patient {p.id} Summary</div>
                <div style={{ fontFamily: 'Space Mono', fontSize: 10, color: '#6a9bc3', lineHeight: 1.8 }}>
                  <div>COG: <strong style={{ color: r.cog.classification.color }}>{r.cog.value.toFixed(3)} ({r.cog.classification.label})</strong></div>
                  <div>Sugeno: <strong style={{ color: r.sugeno.classification.color }}>{r.sugeno.value.toFixed(3)} ({r.sugeno.classification.label})</strong></div>
                  <div style={{ marginTop: 6 }}>
                    {i === 0 && 'Predominantly Healthy: Low BP and Chol, Slow HR. Rule 1 dominant.'}
                    {i === 1 && 'Borderline/Middle: Normal BP but elevated Chol. Rule 4 active.'}
                    {i === 2 && 'Moderate-High risk: Elevated BP + Chol + HR. Rules 3,5,6 fire.'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
