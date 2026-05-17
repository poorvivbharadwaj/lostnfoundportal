import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import ItemCard from '../components/items/ItemCard';
import ItemModal from '../components/items/ItemModal';
import SkeletonCard from '../components/common/SkeletonCard';
import { getLostItems, getFoundItems, searchItems } from '../utils/api';
import { CATEGORIES } from '../utils/helpers';

const EmptyState = ({ type }) => (
  <div style={{ textAlign: 'center', padding: '48px 20px' }}>
    <div style={{ fontSize: 48, marginBottom: 14 }}>{type === 'lost' ? '🔍' : '📭'}</div>
    <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--text-muted)', marginBottom: 6 }}>
      No {type} items yet
    </p>
    <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>
      {type === 'lost' ? 'Lost something? Report it above.' : 'Found something? Help someone out!'}
    </p>
  </div>
);

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory !== 'all') params.category = activeCategory;

      const [lostRes, foundRes] = await Promise.all([
        getLostItems(params),
        getFoundItems(params),
      ]);
      setLostItems(lostRes.data.items || []);
      setFoundItems(foundRes.data.items || []);
    } catch (err) {
      toast.error('Failed to load items. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  const handleSearch = useCallback(async (q) => {
    setSearchQuery(q);
    if (!q && !filters.category && !filters.dateFrom) {
      fetchItems();
      return;
    }
    setLoading(true);
    try {
      const params = { q, ...filters };
      if (activeCategory !== 'all') params.category = activeCategory;
      const res = await searchItems(params);
      setLostItems(res.data.lostItems || []);
      setFoundItems(res.data.foundItems || []);
    } catch {
      toast.error('Search failed.');
    } finally {
      setLoading(false);
    }
  }, [filters, activeCategory, fetchItems]);

  const handleFilterChange = useCallback((f) => {
    setFilters(f);
    if (f.category && f.category !== 'all') setActiveCategory(f.category);
  }, []);

  const handleCategoryChange = useCallback((cat) => {
    setActiveCategory(cat);
    setFilters(prev => ({ ...prev, category: cat }));
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openModal = (item, type) => { setSelectedItem(item); setSelectedType(type); };
  const closeModal = () => { setSelectedItem(null); setSelectedType(null); };

  const stats = {
    lost: lostItems.length,
    found: foundItems.length,
    matches: lostItems.filter(i => i.matched).length,
  };

  return (
    <div className="bg-mesh" style={{ minHeight: '100vh' }}>
      <Navbar
        onMenuToggle={() => setSidebarOpen(true)}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        filters={filters}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Hero Stats Bar */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'rgba(14,14,28,0.5)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1 }}>
            <StatPill icon="😢" label="Lost Items" count={stats.lost} color="var(--lost)" />
            <StatPill icon="✅" label="Found Items" count={stats.found} color="var(--found)" />
            {stats.matches > 0 && <StatPill icon="🎯" label="Matches" count={stats.matches} color="var(--match)" />}
          </div>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.slice(0, 5).map(cat => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                style={{
                  padding: '4px 12px', borderRadius: 999, fontSize: 12,
                  cursor: 'pointer', transition: 'all 0.18s',
                  background: activeCategory === cat.value ? 'rgba(99,102,241,0.15)' : 'transparent',
                  border: `1px solid ${activeCategory === cat.value ? 'var(--border-bright)' : 'var(--border)'}`,
                  color: activeCategory === cat.value ? '#a5b4fc' : 'var(--text-muted)',
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px' }}>
        {/* Active search/filter notice */}
        {searchQuery && (
          <div style={{ marginBottom: 16, padding: '10px 16px', background: 'rgba(99,102,241,0.08)', borderRadius: 10, border: '1px solid var(--border-bright)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>🔍</span>
            <span style={{ fontSize: 13, color: '#a5b4fc' }}>Results for: <strong>"{searchQuery}"</strong></span>
            <button onClick={() => handleSearch('')} style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}>Clear ×</button>
          </div>
        )}

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* LEFT: Lost Items */}
          <div>
            <div className="col-header lost-col" style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>😢</span>
              <span>Lost Items</span>
              <span style={{ marginLeft: 'auto', fontSize: 13, fontFamily: "'JetBrains Mono'", opacity: 0.7 }}>
                {lostItems.length} item{lostItems.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gap: 14 }}>
                {[1,2,3].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : lostItems.length === 0 ? (
              <EmptyState type="lost" />
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                {lostItems.map((item, i) => (
                  <div key={item._id} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <ItemCard item={item} type="lost" onClick={() => openModal(item, 'lost')} />
                  </div>
                ))}
              </div>
            )}

            {/* Report button */}
            {!loading && (
              <button
                onClick={() => navigate('/report-lost')}
                style={{ width: '100%', marginTop: 16, padding: '14px', borderRadius: 12, background: 'var(--lost-bg)', border: '2px dashed rgba(245,158,11,0.3)', color: 'var(--lost)', cursor: 'pointer', fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: 14, transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--lost-bg)'}
              >
                + Report a Lost Item
              </button>
            )}
          </div>

          {/* RIGHT: Found Items */}
          <div>
            <div className="col-header found-col" style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <span>Found Items</span>
              <span style={{ marginLeft: 'auto', fontSize: 13, fontFamily: "'JetBrains Mono'", opacity: 0.7 }}>
                {foundItems.length} item{foundItems.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gap: 14 }}>
                {[1,2,3].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : foundItems.length === 0 ? (
              <EmptyState type="found" />
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                {foundItems.map((item, i) => (
                  <div key={item._id} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <ItemCard item={item} type="found" onClick={() => openModal(item, 'found')} />
                  </div>
                ))}
              </div>
            )}

            {/* Report button */}
            {!loading && (
              <button
                onClick={() => navigate('/report-found')}
                style={{ width: '100%', marginTop: 16, padding: '14px', borderRadius: 12, background: 'var(--found-bg)', border: '2px dashed rgba(16,185,129,0.3)', color: 'var(--found)', cursor: 'pointer', fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: 14, transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--found-bg)'}
              >
                + Report a Found Item
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemModal item={selectedItem} type={selectedType} onClose={closeModal} />
      )}

      {/* Mobile: stack columns */}
      <style>{`
        @media (max-width: 768px) {
          .two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function StatPill({ icon, label, count, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontSize: 20, fontFamily: "'Syne',sans-serif", fontWeight: 800, color }}>{count}</span>
      <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{label}</span>
    </div>
  );
}
