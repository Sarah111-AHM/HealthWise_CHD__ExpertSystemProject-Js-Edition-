import React, { useEffect, useRef, useState } from 'react';
import { generate3DSurface } from '../lib/fuzzyEngine';

export default function Surface3DPanel() {
  const plotRef = useRef(null);
  const [hr, setHr] = useState(75);
  const [loading, setLoading] = useState(false);

  const renderPlot = (hrVal) => {
    if (!plotRef.current || !window.Plotly) return;
    setLoading(true);
    setTimeout(() => {
      const { x, y, z } = generate3DSurface(hrVal);
      const data = [{
        type: 'surface',
        x, y, z,
        colorscale: [
          [0.0,  '#00ff9d'],
          [0.37, '#00ffcc'],
          [0.5,  '#ffb703'],
          [0.7,  '#ff8c42'],
          [1.0,  '#ff4d6d'],
        ],
        contours: {
          z: { show: true, usecolormap: true, highlightcolor: '#00c8ff', project: { z: true } },
        },
        lighting: { ambient: 0.8, diffuse: 0.8, specular: 0.1, roughness: 0.5, fresnel: 0.2 },
        opacity: 0.92,
        colorbar: {
          title: { text: 'CHD Level', font: { color: '#a0c8e8', family: 'Space Mono' } },
          tickfont: { color: '#a0c8e8', family: 'Space Mono', size: 10 },
          bordercolor: '#0e3a6e', borderwidth: 1,
          bgcolor: '#071a2e',
          len: 0.7,
          tickvals: [0.75, 2.0, 3.25],
          ticktext: ['Healthy', 'Middle', 'Sick'],
        },
      }];

      const layout = {
        paper_bgcolor: '#071a2e',
        plot_bgcolor: '#071a2e',
        scene: {
          xaxis: {
            title: { text: 'Cholesterol (mg/dL)', font: { color: '#a0c8e8', family: 'Space Mono', size: 11 } },
            tickfont: { color: '#6a9bc3', family: 'Space Mono', size: 9 },
            gridcolor: '#0e3a6e', zerolinecolor: '#0e3a6e', backgroundcolor: '#020b14',
          },
          yaxis: {
            title: { text: 'Blood Pressure (mmHg)', font: { color: '#a0c8e8', family: 'Space Mono', size: 11 } },
            tickfont: { color: '#6a9bc3', family: 'Space Mono', size: 9 },
            gridcolor: '#0e3a6e', zerolinecolor: '#0e3a6e', backgroundcolor: '#020b14',
          },
          zaxis: {
            title: { text: 'CHD Level', font: { color: '#a0c8e8', family: 'Space Mono', size: 11 } },
            tickfont: { color: '#6a9bc3', family: 'Space Mono', size: 9 },
            gridcolor: '#0e3a6e', zerolinecolor: '#0e3a6e', backgroundcolor: '#020b14',
            range: [0, 4],
          },
          bgcolor: '#020b14',
          camera: { eye: { x: 1.6, y: -1.6, z: 1.2 } },
        },
        margin: { t: 40, b: 0, l: 0, r: 0 },
        font: { family: 'Space Mono', color: '#a0c8e8' },
        title: {
          text: `CHD Surface: Cholesterol × BP (HR=${hrVal} bpm)`,
          font: { family: 'Syne', size: 15, color: '#e0f0ff' },
          x: 0.5, xanchor: 'center',
        },
        annotations: [
          { text: 'Healthy zone', x: 95, y: 100, z: 0.75, showarrow: false, font: { color: '#00ff9d', size: 10, family: 'Space Mono' }, xref: 'x', yref: 'y', zref: 'z' },
        ],
      };

      const config = { responsive: true, displaylogo: false, modeBarButtonsToRemove: ['sendDataToCloud'] };
      window.Plotly.react(plotRef.current, data, layout, config);
      setLoading(false);
    }, 100);
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.plot.ly/plotly-2.27.0.min.js';
    script.onload = () => renderPlot(hr);
    document.head.appendChild(script);
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, []);

  useEffect(() => {
    if (window.Plotly) renderPlot(hr);
  }, [hr]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, letterSpacing: '-0.03em', marginBottom: 6 }}>
          3D Surface Plot
        </h1>
        <p style={{ color: '#6a9bc3', fontFamily: 'Space Mono', fontSize: 12 }}>
          CHD output as a function of Blood Pressure × Cholesterol at fixed Heart Rate
        </p>
      </div>

      {/* HR slider */}
      <div style={{ background: '#071a2e', border: '1px solid #0e3a6e', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 11, color: '#6a9bc3', letterSpacing: 2, textTransform: 'uppercase' }}>
            Fixed Heart Rate
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <input type="range" min={40} max={180} step={5} value={hr}
              onChange={e => setHr(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#00c8ff', cursor: 'pointer' }}
            />
          </div>
          <span style={{ fontFamily: 'Space Mono', fontSize: 14, color: '#00c8ff', fontWeight: 700, minWidth: 80 }}>
            {hr} bpm
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {[55, 75, 95, 120].map(v => (
              <button key={v} onClick={() => setHr(v)} style={{
                padding: '5px 12px', background: hr === v ? 'rgba(0,200,255,0.15)' : '#0a2240',
                border: `1px solid ${hr === v ? '#00c8ff' : '#0e3a6e'}`,
                borderRadius: 6, color: hr === v ? '#00c8ff' : '#6a9bc3',
                fontFamily: 'Space Mono', fontSize: 11, cursor: 'pointer',
              }}>{v}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Plot container */}
      <div style={{
        background: '#071a2e', border: '1px solid #0e3a6e', borderRadius: 12,
        overflow: 'hidden', position: 'relative',
      }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(7,26,46,0.8)', zIndex: 10, fontFamily: 'Space Mono', color: '#00c8ff', fontSize: 13,
          }}>
            ⏳ Generating surface...
          </div>
        )}
        <div ref={plotRef} style={{ height: 520 }} />
      </div>

      {/* Interpretation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 20 }}>
        {[
          { color: '#00ff9d', label: 'Healthy Zone', desc: 'Low BP + Low Chol → minimal CHD risk', range: '0.0 – 1.5' },
          { color: '#ffb703', label: 'Middle Zone', desc: 'Medium BP or elevated Chol → moderate risk', range: '1.5 – 2.7' },
          { color: '#ff4d6d', label: 'Sick Zone', desc: 'High BP + High Chol → high CHD risk', range: '2.7 – 4.0' },
        ].map(z => (
          <div key={z.label} style={{
            background: '#071a2e', border: `1px solid ${z.color}33`,
            borderLeft: `4px solid ${z.color}`, borderRadius: 8, padding: 16,
          }}>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, color: z.color, marginBottom: 6 }}>{z.label}</div>
            <div style={{ fontFamily: 'Space Mono', fontSize: 10, color: '#6a9bc3', marginBottom: 6 }}>{z.desc}</div>
            <div style={{ fontFamily: 'Space Mono', fontSize: 11, color: '#a0c8e8' }}>CHD: {z.range}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
