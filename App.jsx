import React, { useState } from 'react';
import Header from './components/Header';
import DiagnosisPanel from './components/DiagnosisPanel';
import MembershipPanel from './components/MembershipPanel';
import ManualPanel from './components/ManualPanel';
import Surface3DPanel from './components/Surface3DPanel';
import ComparisonPanel from './components/ComparisonPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState('diagnosis');

  const renderTab = () => {
    switch (activeTab) {
      case 'diagnosis':   return <DiagnosisPanel />;
      case 'membership':  return <MembershipPanel />;
      case 'manual':      return <ManualPanel />;
      case 'surface3d':   return <Surface3DPanel />;
      case 'comparison':  return <ComparisonPanel />;
      default:            return <DiagnosisPanel />;
    }
  };

  return (
    <div className="grid-bg" style={{ minHeight: '100vh' }}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>
        {renderTab()}
      </main>
      <footer style={{
        borderTop: '1px solid #0e3a6e', padding: '16px 24px',
        textAlign: 'center', fontFamily: 'Space Mono', fontSize: 10, color: '#3a5a7a',
      }}>
        HealthWise CHD Expert System · Fuzzy Logic · UCAS 2026 · Dr. Mohammed A. Altahrawi
      </footer>
    </div>
  );
}
