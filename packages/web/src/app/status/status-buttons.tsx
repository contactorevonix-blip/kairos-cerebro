'use client';

const BTN_STYLE = {
  padding: '8px 16px', fontSize: 14, color: '#888', cursor: 'pointer',
  background: 'transparent', border: '1px solid #1f1f1f', borderRadius: 8,
  transition: 'all 150ms', fontFamily: 'var(--font-geist-sans)',
};

export function HeaderButtons() {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {['Report a problem', 'Subscribe to updates'].map(label => (
        <button key={label} style={BTN_STYLE}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1f1f1f'; e.currentTarget.style.color = '#888'; }}
        >{label}</button>
      ))}
    </div>
  );
}

export function NavButtons() {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {[{ id: 'left', label: '‹' }, { id: 'right', label: '›' }].map(({ id, label }) => (
        <button key={id} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: 4, fontSize: 16, lineHeight: 1 }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = '#444')}
        >{label}</button>
      ))}
    </div>
  );
}

export function ViewHistoryButton() {
  return (
    <button style={{
      display: 'flex', alignItems: 'center', gap: 8,
      border: '1px solid #1f1f1f', color: '#555', borderRadius: 8,
      padding: '10px 20px', fontSize: 14, background: 'transparent',
      cursor: 'pointer', transition: 'all 150ms', fontFamily: 'var(--font-geist-sans)',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#fff'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#1f1f1f'; e.currentTarget.style.color = '#555'; }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
      </svg>
      View history
    </button>
  );
}
