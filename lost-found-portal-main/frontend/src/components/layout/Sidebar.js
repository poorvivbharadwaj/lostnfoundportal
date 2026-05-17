import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../utils/helpers';

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const navItems = [
  { icon: '⊞', label: 'Dashboard', category: 'all' },
  { icon: '🪪', label: 'ID Cards', category: 'id_card' },
  { icon: '📱', label: 'Electronics', category: 'electronics' },
  { icon: '📚', label: 'Academic Items', category: 'books' },
  { icon: '📄', label: 'Personal Documents', category: 'documents' },
  { icon: '📦', label: 'Other Items', category: 'other' },
];

export default function Sidebar({ isOpen, onClose, activeCategory, onCategoryChange }) {
  const navigate = useNavigate();

  const handleCategory = (cat) => {
    if (onCategoryChange) onCategoryChange(cat);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 40 }}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔍</div>
            <div>
              <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.2 }}>Lost & Found</p>
              <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Campus Portal</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
            <CloseIcon />
          </button>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          <p className="section-label" style={{ padding: '4px 20px 8px' }}>Browse by Category</p>

          {navItems.map((item, i) => (
            <button
              key={item.category}
              onClick={() => handleCategory(item.category)}
              className={`sidebar-item ${activeCategory === item.category ? 'active' : ''}`}
              style={{
                width: 'calc(100% - 24px)',
                background: activeCategory === item.category ? 'rgba(99,102,241,0.12)' : 'transparent',
                border: activeCategory === item.category ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                color: activeCategory === item.category ? '#a5b4fc' : 'var(--text-muted)',
                animationDelay: `${i * 0.04}s`,
              }}
            >
              <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{item.icon}</span>
              <span>{item.label}</span>
              {activeCategory === item.category && (
                <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
              )}
            </button>
          ))}

          <div style={{ height: 1, background: 'var(--border)', margin: '12px 20px' }} />

          <p className="section-label" style={{ padding: '4px 20px 8px' }}>Report</p>

          <button
            onClick={() => { navigate('/report-lost'); onClose(); }}
            className="sidebar-item"
            style={{ width: 'calc(100% - 24px)' }}
          >
            <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>😢</span>
            <span>Report Lost Item</span>
          </button>

          <button
            onClick={() => { navigate('/report-found'); onClose(); }}
            className="sidebar-item"
            style={{ width: 'calc(100% - 24px)' }}
          >
            <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>🎉</span>
            <span>Report Found Item</span>
          </button>

          <div style={{ height: 1, background: 'var(--border)', margin: '12px 20px' }} />

          <p className="section-label" style={{ padding: '4px 20px 8px' }}>Admin</p>

          <button
            onClick={() => { navigate('/admin'); onClose(); }}
            className="sidebar-item"
            style={{ width: 'calc(100% - 24px)' }}
          >
            <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>🔐</span>
            <span>Admin Panel</span>
          </button>
        </div>

        {/* Footer */}
        <div style={{ padding: 16, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Lost & Found • Campus Portal</p>
          <p style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>Room 405 • lostfound@college.edu</p>
        </div>
      </div>
    </>
  );
}
