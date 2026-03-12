import React from 'react';

export default function Header({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'diagnosis', label: 'Diagnosis' },
    { id: 'membership', label: 'Membership Functions' },
    { id: 'manual', label: 'Manual Calculations' },
    { id: 'surface3d', label: '3D Surface' },
    { id: 'comparison', label: 'Comparison' },
  ];

  return (
    <header style={{
      borderBottom: '1px solid #0e3a6e',
      background: 'rgba(7,26,46,0.95)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0 12px' }}>
          <div style={{
            width: 44, height: 44,
            background: 'linear-gradient(135deg, #00c8ff22, #00ff9d22)',
            border: '1.5px solid #00c8ff55',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>❤️</div>
          <div>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', color: '#e0f0ff' }}>
              HealthWise
              <span style={{ color: '#00c8ff', marginLeft: 8, fontSize: 12, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', verticalAlign: 'middle' }}>
                CHD Expert System
              </span>
            </div>
            <div style={{ fontFamily: 'Space Mono', fontSize: 10, color: '#6a9bc3', letterSpacing: 1 }}>
              Fuzzy Logic · Dr. Mohammed A. Altahrawi · UCAS 2026
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <nav style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 0 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                background: activeTab === tab.id ? 'rgba(0,200,255,0.12)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #00c8ff' : '2px solid transparent',
                color: activeTab === tab.id ? '#00c8ff' : '#6a9bc3',
                fontFamily: 'Syne',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                letterSpacing: 0.3,
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
