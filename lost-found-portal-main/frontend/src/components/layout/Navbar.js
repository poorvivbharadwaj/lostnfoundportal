import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CATEGORIES } from '../../utils/helpers';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
  </svg>
);

const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

export default function Navbar({ onMenuToggle, onSearch, onFilterChange, filters = {} }) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const navigate = useNavigate();
  const location = useLocation();
  const filterRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query.trim());
  };

  const handleFilterChange = (key, value) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    if (onFilterChange) onFilterChange(updated);
  };

  const activeFilterCount = Object.values(localFilters).filter(v => v && v !== 'all').length;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: 'rgba(6,6,16,0.9)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 64 }}>

          {/* 3-dot menu button */}
          <button
            onClick={onMenuToggle}
            style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            title="Menu"
          >
            <MenuIcon />
          </button>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, boxShadow: '0 0 16px rgba(99,102,241,0.4)',
              }}>🔍</div>
              <span style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 700,
                fontSize: 15, color: 'var(--text-primary)',
                display: window.innerWidth < 480 ? 'none' : 'block',
              }}>
                Lost<span style={{ color: 'var(--accent)' }}>&</span>Found
              </span>
            </div>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 500, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
              <SearchIcon />
            </div>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search items…"
              style={{
                width: '100%', background: 'var(--bg-elevated)',
                border: '1px solid var(--border)', borderRadius: 10,
                padding: '8px 40px 8px 36px', color: 'var(--text-primary)',
                fontFamily: "'Outfit', sans-serif", fontSize: 14, outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); if(onSearch) onSearch(''); }}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>
                ×
              </button>
            )}
          </form>

          {/* Filter button */}
          <div ref={filterRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setShowFilters(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 10,
                background: showFilters ? 'rgba(99,102,241,0.12)' : 'var(--bg-elevated)',
                border: `1px solid ${showFilters ? 'var(--border-bright)' : 'var(--border)'}`,
                color: showFilters ? '#a5b4fc' : 'var(--text-muted)',
                cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.2s',
              }}
            >
              <FilterIcon />
              <span style={{ display: window.innerWidth < 560 ? 'none' : 'inline' }}>Filters</span>
              {activeFilterCount > 0 && (
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {showFilters && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                width: 280, background: 'var(--bg-card)', border: '1px solid var(--border-bright)',
                borderRadius: 14, padding: 16, zIndex: 50,
                boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                animation: 'slideUp 0.2s ease',
              }}>
                <p style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: "'JetBrains Mono'", letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Filters</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Category</label>
                    <select
                      value={localFilters.category || 'all'}
                      onChange={e => handleFilterChange('category', e.target.value)}
                      className="input-field"
                      style={{ padding: '8px 12px', fontSize: 13 }}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Type</label>
                    <select
                      value={localFilters.type || 'all'}
                      onChange={e => handleFilterChange('type', e.target.value)}
                      className="input-field"
                      style={{ padding: '8px 12px', fontSize: 13 }}
                    >
                      <option value="all">All Items</option>
                      <option value="lost">Lost Only</option>
                      <option value="found">Found Only</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>From Date</label>
                    <input
                      type="date"
                      value={localFilters.dateFrom || ''}
                      onChange={e => handleFilterChange('dateFrom', e.target.value)}
                      className="input-field"
                      style={{ padding: '8px 12px', fontSize: 13 }}
                    />
                  </div>

                  <button
                    onClick={() => { setLocalFilters({}); if(onFilterChange) onFilterChange({}); }}
                    className="btn-ghost"
                    style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => navigate('/report-lost')}
              style={{
                padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
                background: 'var(--lost-bg)', color: 'var(--lost)',
                border: '1px solid rgba(245,158,11,0.25)',
                fontSize: 13, fontWeight: 600, fontFamily: "'Syne',sans-serif",
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--lost-bg)'}
            >
              <span style={{ display: window.innerWidth < 640 ? 'none' : 'inline' }}>+ </span>Lost
            </button>
            <button
              onClick={() => navigate('/report-found')}
              style={{
                padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
                background: 'var(--found-bg)', color: 'var(--found)',
                border: '1px solid rgba(16,185,129,0.25)',
                fontSize: 13, fontWeight: 600, fontFamily: "'Syne',sans-serif",
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--found-bg)'}
            >
              <span style={{ display: window.innerWidth < 640 ? 'none' : 'inline' }}>+ </span>Found
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
