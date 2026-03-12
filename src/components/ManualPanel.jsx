import React, { useState } from 'react';
import { diagnose, PRESET_PATIENTS } from '../lib/fuzzyEngine';
import { MANUAL_CALCULATIONS } from '../lib/manualCalcs';

function Step({ number, title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: 16 }}>
      <button onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
        background: '#0a2240', border: '1px solid #0e3a6e',
        borderRadius: open ? '8px 8px 0 0' : 8,
        padding: '12px 16px', cursor: 'pointer',
        color: '#e0f0ff',
        transition: 'all 0.2s',
      }}>
        <span style={{
          width: 24, height: 24, borderRadius: '50%',
          background: '#00c8ff22', border: '1.5px solid #00c8ff55',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Space Mono', fontSize: 11, color: '#00c8ff', flexShrink: 0,
        }}>{number}</span>
        <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14 }}>{title}</span>
        <span style={{ marginLeft: 'auto', color: '#6a9bc3', fontSize: 14 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{
          background: '#071a2e', border: '1px solid #0e3a6e', borderTop: 'none',
          borderRadius: '0 0 8px 8px', padding: 20,
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

function MemberRow({ label, sets }) {
  const colors = { low: '#00c8ff', medium: '#ffb703', high: '#ff4d6d', slow: '#00c8ff', moderate: '#ffb703', fast: '#ff4d6d' };
  return (
    <div style={{ marginBottom: 8 }}>
      <span style={{ fontFamily: 'Space Mono', fontSize: 11, color: '#a0c8e8', display: 'inline-block', width: 130 }}>{label}</span>
      {Object.entries(sets).map(([k, v]) => (
        <span key={k} style={{
          fontFamily: 'Space Mono', fontSize: 11,
          color: v > 0 ? colors[k] : '#3a4a5a',
          marginRight: 16,
        }}>
          μ<sub>{k}</sub> = <strong>{typeof v === 'number' ? v.toFixed(3) : v}</strong>
        </span>
      ))}
    </div>
  );
}

function RuleTable({ rules }) {
  const outputColor = { Healthy: '#00ff9d', Middle: '#ffb703', Sick: '#ff4d6d' };
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Space Mono', fontSize: 11 }}>
        <thead>
          <tr style={{ background: '#0a2240' }}>
            {['Rule', 'BP', 'Chol', 'HR', 'Strength (min)', 'Output'].map(h => (
              <th key={h} style={{ padding: '8px 12px', color: '#6a9bc3', textAlign: 'left', borderBottom: '1px solid #0e3a6e', fontWeight: 400 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rules.map(r => (
            <tr key={r.rule} style={{ borderBottom: '1px solid #0a2240', background: r.strength > 0 ? '#050f1e' : '#020b14' }}>
              <td style={{ padding: '8px 12px', color: '#6a9bc3' }}>R{r.rule}</td>
              <td style={{ padding: '8px 12px', color: '#a0c8e8' }}>{r.bp}</td>
              <td style={{ padding: '8px 12px', color: '#a0c8e8' }}>{r.chol}</td>
              <td style={{ padding: '8px 12px', color: '#a0c8e8' }}>{r.hr}</td>
              <td style={{ padding: '8px 12px', fontWeight: 700,
                color: r.strength > 0 ? '#00c8ff' : '#2a3a4a' }}>
                {r.strength.toFixed(4)}
              </td>
              <td style={{ padding: '8px 12px' }}>
                <span style={{
                  color: outputColor[r.output] || '#6a9bc3',
                  background: `${outputColor[r.output]}15` || '#0a2240',
                  padding: '2px 8px', borderRadius: 4,
                }}>{r.output}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ManualPanel() {
  const [selectedPatient, setSelectedPatient] = useState(0);

  const mc = MANUAL_CALCULATIONS[selectedPatient];
  const result = diagnose(mc.inputs.bp, mc.inputs.chol, mc.inputs.hr, 'none');
  const resultHedge = diagnose(mc.inputs.bp, mc.inputs.chol, mc.inputs.hr, 'very');

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, letterSpacing: '-0.03em', marginBottom: 6 }}>
          Manual Calculations
        </h1>
        <p style={{ color: '#6a9bc3', fontFamily: 'Space Mono', fontSize: 12 }}>
          Step-by-step intermediate computation for each patient
        </p>
      </div>

      {/* Patient selector */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        {MANUAL_CALCULATIONS.map((p, i) => (
          <button key={i} onClick={() => setSelectedPatient(i)} style={{
            flex: 1, padding: '14px 20px',
            background: selectedPatient === i ? 'rgba(0,200,255,0.12)' : '#071a2e',
            border: `1px solid ${selectedPatient === i ? '#00c8ff' : '#0e3a6e'}`,
            borderRadius: 10,
            color: selectedPatient === i ? '#00c8ff' : '#6a9bc3',
            fontFamily: 'Syne', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', transition: 'all 0.2s',
            textAlign: 'left',
          }}>
            <div>{p.patient}</div>
            <div style={{ fontFamily: 'Space Mono', fontSize: 10, marginTop: 4, opacity: 0.8 }}>
              BP:{p.inputs.bp} · Chol:{p.inputs.chol} · HR:{p.inputs.hr}
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          {/* Step 1: Fuzzification */}
          <Step number="1" title="Fuzzification — Membership Degrees">
            <div style={{ fontFamily: 'Space Mono', fontSize: 11, color: '#6a9bc3', marginBottom: 14 }}>
              Computing μ(x) for each input using trapmf/trimf:
            </div>
            <MemberRow label="Blood Pressure:" sets={mc.fuzzification.bp} />
            <MemberRow label="Cholesterol:" sets={mc.fuzzification.chol} />
            <MemberRow label="Heart Rate:" sets={mc.fuzzification.hr} />
            <div style={{ marginTop: 14, fontFamily: 'Space Mono', fontSize: 10, color: '#3a6a8a', background: '#0a2240', padding: 10, borderRadius: 6 }}>
              Note: Values computed using actual engine. Trapmf(x, a, b, c, d) and trimf(x, a, b, c) functions applied.
            </div>
          </Step>

          {/* Step 2: Rule firing */}
          <Step number="2" title="Inference Engine — Rule Firing (AND = min)">
            <div style={{ fontFamily: 'Space Mono', fontSize: 11, color: '#6a9bc3', marginBottom: 14 }}>
              Firing strength = min(μ_BP, μ_Chol, μ_HR) for each rule:
            </div>
            <RuleTable rules={mc.ruleStrengths} />
            <div style={{ marginTop: 12, fontFamily: 'Space Mono', fontSize: 10, color: '#a0c8e8', background: '#0a2240', padding: 10, borderRadius: 6 }}>
              🔥 Active rules: {mc.ruleStrengths.filter(r => r.strength > 0).length} / {mc.ruleStrengths.length}
            </div>
          </Step>

          {/* Step 3: Aggregation */}
          <Step number="3" title="Aggregation — Output Fuzzy Sets">
            <div style={{ fontFamily: 'Space Mono', fontSize: 11, color: '#a0c8e8', lineHeight: 1.8 }}>
              <div style={{ marginBottom: 8 }}>Method: <span style={{ color: '#00c8ff' }}>MAX aggregation</span></div>
              <div style={{ color: '#6a9bc3' }}>{mc.aggregation}</div>
              <div style={{ marginTop: 10, color: '#ffb703' }}>
                Active consequents clipped at respective firing strengths:
              </div>
              {mc.ruleStrengths.filter(r => r.strength > 0).map(r => (
                <div key={r.rule} style={{ marginTop: 4, color: '#a0c8e8' }}>
                  → Rule {r.rule}: {r.output} clipped at {r.strength.toFixed(4)}
                </div>
              ))}
            </div>
          </Step>
        </div>

        <div>
          {/* Step 4: Defuzzification */}
          <Step number="4" title="Defuzzification — COG Method">
            <div style={{ fontFamily: 'Space Mono', fontSize: 11, color: '#a0c8e8', lineHeight: 2 }}>
              <div style={{ color: '#6a9bc3', marginBottom: 8 }}>
                COG = ∫ x·μ(x)dx / ∫ μ(x)dx
              </div>
              <div>Discrete approximation with 400 steps over [0, 4]:</div>
              <div style={{ color: '#6a9bc3', marginTop: 6 }}>• dx = 4/400 = 0.01</div>
              <div style={{ color: '#6a9bc3' }}>• For each x: μ_agg(x) = max of all clipped consequents</div>
              <div style={{ color: '#6a9bc3' }}>• Numerator: Σ x·μ_agg(x)·dx</div>
              <div style={{ color: '#6a9bc3' }}>• Denominator: Σ μ_agg(x)·dx</div>
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#0a2240', borderRadius: 8, borderLeft: '3px solid #00ff9d' }}>
                <strong style={{ color: '#00ff9d' }}>COG Result: {result.cog.value.toFixed(4)}</strong>
                <span style={{ color: '#6a9bc3', marginLeft: 12 }}>→ {result.cog.classification.label}</span>
              </div>
              <div style={{ marginTop: 6, fontFamily: 'Space Mono', fontSize: 10, color: '#6a9bc3' }}>{mc.cogNote}</div>
            </div>
          </Step>

          <Step number="5" title="Defuzzification — Sugeno Method">
            <div style={{ fontFamily: 'Space Mono', fontSize: 11, color: '#a0c8e8', lineHeight: 2 }}>
              <div style={{ color: '#6a9bc3', marginBottom: 8 }}>
                Sugeno = Σ(wᵢ·zᵢ) / Σwᵢ
              </div>
              <div>Crisp output centers:</div>
              <div style={{ color: '#6a9bc3' }}>• Healthy: z = 0.75</div>
              <div style={{ color: '#6a9bc3' }}>• Middle: z = 2.00</div>
              <div style={{ color: '#6a9bc3' }}>• Sick: z = 3.25</div>
              <div style={{ marginTop: 8 }}>Calculation:</div>
              {mc.ruleStrengths.filter(r => r.strength > 0).map(r => {
                const z = r.output === 'Healthy' ? 0.75 : r.output === 'Middle' ? 2.0 : 3.25;
                return (
                  <div key={r.rule} style={{ color: '#6a9bc3' }}>
                    w{r.rule}={r.strength.toFixed(3)} × z={z} = {(r.strength * z).toFixed(3)}
                  </div>
                );
              })}
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#0a2240', borderRadius: 8, borderLeft: '3px solid #ffb703' }}>
                <strong style={{ color: '#ffb703' }}>Sugeno Result: {result.sugeno.value.toFixed(4)}</strong>
                <span style={{ color: '#6a9bc3', marginLeft: 12 }}>→ {result.sugeno.classification.label}</span>
              </div>
              <div style={{ marginTop: 6, fontFamily: 'Space Mono', fontSize: 10, color: '#6a9bc3' }}>{mc.sugenoNote}</div>
            </div>
          </Step>

          <Step number="6" title="Linguistic Hedge — Effect on Output (hedge: 'very')">
            <div style={{ fontFamily: 'Space Mono', fontSize: 11, color: '#a0c8e8', lineHeight: 2 }}>
              <div style={{ color: '#6a9bc3', marginBottom: 8 }}>Hedge "very": μ_new = μ²  (concentration)</div>
              <div>Modified rule strengths:</div>
              {result.ruleStrengths.map(r => (
                <div key={r.rule} style={{ color: '#6a9bc3' }}>
                  R{r.rule}: {r.strength.toFixed(3)} → {Math.pow(r.strength, 2).toFixed(3)} ({r.output})
                </div>
              ))}
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#0a2240', borderRadius: 8, borderLeft: '3px solid #00c8ff' }}>
                <div><strong style={{ color: '#00c8ff' }}>Hedge COG: {resultHedge.cog.value.toFixed(4)}</strong> <span style={{ color: '#6a9bc3' }}>vs original: {result.cog.value.toFixed(4)}</span></div>
                <div><strong style={{ color: '#00c8ff' }}>Hedge Sugeno: {resultHedge.sugeno.value.toFixed(4)}</strong> <span style={{ color: '#6a9bc3' }}>vs original: {result.sugeno.value.toFixed(4)}</span></div>
              </div>
            </div>
          </Step>
        </div>
      </div>
    </div>
  );
}
