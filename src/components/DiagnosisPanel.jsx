import React, { useState } from 'react';
import { diagnose, PRESET_PATIENTS, classifyCHD } from '../lib/fuzzyEngine';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';

const HEDGE_OPTIONS = [
  { value: 'none',        label: 'No Hedge' },
  { value: 'very',        label: 'Very (μ²)' },
  { value: 'indeed',      label: 'Indeed (μ²)' },
  { value: 'somewhat',    label: 'Somewhat (√μ)' },
  { value: 'more_or_less',label: 'More or Less (√μ)' },
  { value: 'extremely',   label: 'Extremely (μ³)' },
  { value: 'slightly',    label: 'Slightly (μ^1.25)' },
];

function Slider({ label, value, min, max, step, unit, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 13, color: '#a0c8e8' }}>{label}</span>
        <span style={{ fontFamily: 'Space Mono', fontSize: 13, color: '#00c8ff', fontWeight: 700 }}>
          {value} <span style={{ color: '#6a9bc3', fontWeight: 400 }}>{unit}</span>
        </span>
      </div>
      <div style={{ position: 'relative', height: 6, background: '#0e3a6e', borderRadius: 3 }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`,
          background: 'linear-gradient(90deg, #0050a0, #00c8ff)',
          borderRadius: 3, transition: 'width 0.1s',
        }} />
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: '100%', marginTop: -3, appearance: 'none',
          background: 'transparent', cursor: 'pointer', height: 20,
          position: 'relative', zIndex: 2,
          accentColor: '#00c8ff',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#3a6a9a' }}>{min}</span>
        <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#3a6a9a' }}>{max}</span>
      </div>
    </div>
  );
}

function GaugeChart({ value, label, color }) {
  const clampedVal = Math.max(0, Math.min(4, value));
  const angle = -135 + (clampedVal / 4) * 270;
  const r = 50;
  const cx = 60, cy = 65;

  // Arc background
  const toRad = deg => (deg * Math.PI) / 180;
  const arcPath = (startDeg, endDeg, radius) => {
    const x1 = cx + radius * Math.cos(toRad(startDeg));
    const y1 = cy + radius * Math.sin(toRad(startDeg));
    const x2 = cx + radius * Math.cos(toRad(endDeg));
    const y2 = cy + radius * Math.sin(toRad(endDeg));
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const needleAngle = toRad(angle);
  const nx = cx + (r - 10) * Math.cos(needleAngle);
  const ny = cy + (r - 10) * Math.sin(needleAngle);

  return (
    <svg viewBox="0 0 120 90" style={{ width: '100%', maxWidth: 180 }}>
      <path d={arcPath(-135, 135, r)} fill="none" stroke="#0e3a6e" strokeWidth="8" strokeLinecap="round" />
      <path d={arcPath(-135, -135 + (clampedVal / 4) * 270, r)} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${color}88)` }} />
      {/* Ticks */}
      {[0, 1, 2, 3, 4].map(v => {
        const a = toRad(-135 + (v / 4) * 270);
        return (
          <line key={v}
            x1={cx + (r + 4) * Math.cos(a)} y1={cy + (r + 4) * Math.sin(a)}
            x2={cx + (r + 9) * Math.cos(a)} y2={cy + (r + 9) * Math.sin(a)}
            stroke="#6a9bc3" strokeWidth="1.5" />
        );
      })}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth="2.5" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      <circle cx={cx} cy={cy} r={4} fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      <text x={cx} y={cy + 20} textAnchor="middle" fill={color} fontFamily="Space Mono" fontSize="11" fontWeight="700">{value.toFixed(3)}</text>
      <text x={cx} y={cy + 30} textAnchor="middle" fill="#6a9bc3" fontFamily="Syne" fontSize="7">{label}</text>
    </svg>
  );
}

export default function DiagnosisPanel() {
  const [bp, setBp] = useState(130);
  const [chol, setChol] = useState(180);
  const [hr, setHr] = useState(75);
  const [hedge, setHedge] = useState('none');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runDiagnosis = (bpVal = bp, cholVal = chol, hrVal = hr, hedgeVal = hedge) => {
    setLoading(true);
    setTimeout(() => {
      const r = diagnose(bpVal, cholVal, hrVal, hedgeVal);
      setResult(r);
      setLoading(false);
    }, 200);
  };

  const loadPreset = (p) => {
    setBp(p.bp); setChol(p.chol); setHr(p.hr);
    runDiagnosis(p.bp, p.chol, p.hr, hedge);
  };

  const ruleBarData = result ? result.ruleStrengths.map(r => ({
    name: `R${r.rule}`,
    strength: parseFloat(r.strength.toFixed(4)),
    output: r.output,
    fill: r.output === 'healthy' ? '#00ff9d' : r.output === 'middle' ? '#ffb703' : '#ff4d6d',
  })) : [];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Title */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, letterSpacing: '-0.03em', marginBottom: 6 }}>
          CHD Diagnosis Engine
        </h1>
        <p style={{ color: '#6a9bc3', fontFamily: 'Space Mono', fontSize: 12 }}>
          Input patient vitals → Fuzzy inference → CHD risk assessment
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, alignItems: 'start' }}>
        {/* INPUT PANEL */}
        <div>
          {/* Preset patients */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 11, color: '#6a9bc3', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
              Preset Patients
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PRESET_PATIENTS.map(p => (
                <button key={p.id} onClick={() => loadPreset(p)} style={{
                  padding: '6px 14px',
                  background: 'rgba(0,200,255,0.08)',
                  border: '1px solid #0e3a6e',
                  borderRadius: 6,
                  color: '#a0c8e8',
                  fontFamily: 'Space Mono', fontSize: 11,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}>
                  P{p.id}: {p.bp}/{p.chol}/{p.hr}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div style={{
            background: '#071a2e',
            border: '1px solid #0e3a6e',
            borderRadius: 12,
            padding: 24,
            marginBottom: 16,
          }}>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 11, color: '#6a9bc3', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>
              Patient Vitals
            </div>
            <Slider label="Blood Pressure" value={bp} min={80} max={220} step={1} unit="mmHg" onChange={setBp} />
            <Slider label="Cholesterol" value={chol} min={80} max={300} step={1} unit="mg/dL" onChange={setChol} />
            <Slider label="Heart Rate" value={hr} min={30} max={220} step={1} unit="bpm" onChange={setHr} />
          </div>

          {/* Hedge selector */}
          <div style={{
            background: '#071a2e',
            border: '1px solid #0e3a6e',
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
          }}>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 11, color: '#6a9bc3', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
              Linguistic Hedge
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {HEDGE_OPTIONS.map(h => (
                <label key={h.value} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="radio" name="hedge" value={h.value} checked={hedge === h.value}
                    onChange={() => setHedge(h.value)}
                    style={{ accentColor: '#00c8ff' }} />
                  <span style={{ fontFamily: 'Space Mono', fontSize: 11, color: hedge === h.value ? '#00c8ff' : '#6a9bc3' }}>
                    {h.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button onClick={() => runDiagnosis()} disabled={loading} style={{
            width: '100%', padding: '14px 0',
            background: loading ? '#0a2240' : 'linear-gradient(135deg, #004080, #0080c0)',
            border: '1px solid #00c8ff44',
            borderRadius: 10,
            color: '#e0f0ff',
            fontFamily: 'Syne', fontWeight: 700, fontSize: 15, letterSpacing: 0.5,
            cursor: loading ? 'wait' : 'pointer',
            transition: 'all 0.3s',
            boxShadow: loading ? 'none' : '0 0 20px rgba(0,200,255,0.2)',
          }}>
            {loading ? '⏳ Computing...' : '🔬 Run Diagnosis'}
          </button>
        </div>

        {/* RESULTS */}
        <div>
          {!result ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: 400, border: '1px dashed #0e3a6e', borderRadius: 12,
              color: '#2a4a6a', fontFamily: 'Space Mono', fontSize: 13, flexDirection: 'column', gap: 12,
            }}>
              <span style={{ fontSize: 40 }}>🫀</span>
              <span>Set vitals and run diagnosis</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* COG & SUGENO RESULTS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'COG (Centroid)', value: result.cog.value, cls: result.cog.classification, method: 'Mamdani + COG' },
                  { label: 'Sugeno Method', value: result.sugeno.value, cls: result.sugeno.classification, method: 'Weighted Average' },
                ].map(({ label, value, cls, method }) => (
                  <div key={label} style={{
                    background: '#071a2e', border: `1px solid ${cls.color}44`,
                    borderRadius: 12, padding: 20,
                    boxShadow: `0 0 20px ${cls.color}11`,
                  }}>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 11, color: '#6a9bc3', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
                      {label}
                    </div>
                    <GaugeChart value={value} label={method} color={cls.color} />
                    <div style={{
                      marginTop: 8, textAlign: 'center',
                      fontFamily: 'Syne', fontWeight: 800, fontSize: 18,
                      color: cls.color,
                      textShadow: `0 0 20px ${cls.color}66`,
                    }}>
                      {cls.emoji} {cls.label}
                    </div>
                    {result.hedge !== 'none' && (
                      <div style={{ marginTop: 6, textAlign: 'center', fontFamily: 'Space Mono', fontSize: 10, color: '#6a9bc3' }}>
                        Hedge: {result.hedge}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Membership degrees */}
              <div style={{ background: '#071a2e', border: '1px solid #0e3a6e', borderRadius: 12, padding: 20 }}>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 11, color: '#6a9bc3', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
                  Fuzzification — Membership Degrees
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[
                    { label: 'Blood Pressure', sets: result.memberships.bp, colors: { low: '#00c8ff', medium: '#ffb703', high: '#ff4d6d' } },
                    { label: 'Cholesterol', sets: result.memberships.chol, colors: { low: '#00c8ff', high: '#ff4d6d' } },
                    { label: 'Heart Rate', sets: result.memberships.hr, colors: { slow: '#00c8ff', moderate: '#ffb703', fast: '#ff4d6d' } },
                  ].map(({ label, sets, colors }) => (
                    <div key={label}>
                      <div style={{ fontFamily: 'Space Mono', fontSize: 10, color: '#a0c8e8', marginBottom: 8 }}>{label}</div>
                      {Object.entries(sets).map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                          <span style={{ fontFamily: 'Space Mono', fontSize: 10, color: colors[k], width: 65, textTransform: 'capitalize' }}>{k}</span>
                          <div style={{ flex: 1, background: '#0a2240', borderRadius: 2, height: 6 }}>
                            <div style={{ width: `${v * 100}%`, height: '100%', background: colors[k], borderRadius: 2, transition: 'width 0.4s', boxShadow: v > 0 ? `0 0 6px ${colors[k]}88` : 'none' }} />
                          </div>
                          <span style={{ fontFamily: 'Space Mono', fontSize: 10, color: '#6a9bc3', width: 36, textAlign: 'right' }}>{v.toFixed(3)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rule strengths */}
              <div style={{ background: '#071a2e', border: '1px solid #0e3a6e', borderRadius: 12, padding: 20 }}>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 11, color: '#6a9bc3', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
                  Rule Firing Strengths
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={ruleBarData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid stroke="#0e3a6e" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontFamily: 'Space Mono', fontSize: 11, fill: '#6a9bc3' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 1]} tick={{ fontFamily: 'Space Mono', fontSize: 10, fill: '#6a9bc3' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#071a2e', border: '1px solid #0e3a6e', fontFamily: 'Space Mono', fontSize: 11 }}
                      formatter={(v, n, p) => [`${v} → ${p.payload.output}`, 'Strength']}
                    />
                    <Bar dataKey="strength" radius={[4, 4, 0, 0]}>
                      {ruleBarData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ marginTop: 8, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {result.ruleStrengths.map(r => (
                    <div key={r.rule} style={{
                      fontFamily: 'Space Mono', fontSize: 10, color: '#6a9bc3',
                      background: '#0a2240', padding: '4px 10px', borderRadius: 4,
                      borderLeft: `3px solid ${r.output === 'healthy' ? '#00ff9d' : r.output === 'middle' ? '#ffb703' : '#ff4d6d'}`,
                    }}>
                      R{r.rule}: {r.strength.toFixed(4)} → {r.output}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
