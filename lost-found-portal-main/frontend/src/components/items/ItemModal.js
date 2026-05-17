import React from 'react';
import { formatDateTime, getCategoryIcon, getCategoryLabel } from '../../utils/helpers';

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function ItemModal({ item, type, onClose }) {
  if (!item) return null;
  const isLost = type === 'lost';

  const shareUrl = window.location.origin;
  const shareTitle = isLost ? item.itemName : `Found item reported by ${item.finderName || 'someone'}`;
  const shareText = `${shareTitle}\n\n${item.description}\n\n${isLost ? `Contact: ${item.email || item.phone || 'N/A'}` : `Contact: ${item.contactEmail || item.contactPhone || 'N/A'}` }\n\nView this portal: ${shareUrl}`;

  const handleShareClick = (method) => {
    const encoded = encodeURIComponent(shareText);
    if (method === 'whatsapp') {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
      return;
    }
    if (method === 'email') {
      window.open(`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encoded}`, '_blank');
      return;
    }
    if (method === 'instagram') {
      window.open('https://www.instagram.com/', '_blank');
      navigator.clipboard?.writeText(shareText).catch(() => {});
      return;
    }
    if (method === 'copy') {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
        alert('Link and details copied to clipboard');
      }).catch(() => {
        alert('Copy failed, please try manually');
      });
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* Header Image */}
        {item.imageUrl && (
          <div style={{ width: '100%', height: 240, overflow: 'hidden', borderRadius: '18px 18px 0 0', position: 'relative' }}>
            <img src={item.imageUrl} alt={item.itemName || 'Item'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14,14,28,0.9) 0%, transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: 16, left: 20 }}>
              <span className={`badge badge-${type}`}>{isLost ? '😢 Lost' : '✅ Found'}</span>
              {item.matched && <span className="badge badge-match" style={{ marginLeft: 8 }}>🎯 Potential Match Found</span>}
            </div>
            <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 34, height: 34, borderRadius: 10, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
              <CloseIcon />
            </button>
          </div>
        )}

        {/* Content */}
        <div style={{ padding: 24 }}>
          {/* Close button (when no image) */}
          {!item.imageUrl && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span className={`badge badge-${type}`}>{isLost ? '😢 Lost' : '✅ Found'}</span>
              <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CloseIcon />
              </button>
            </div>
          )}

          {/* Title */}
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: 'var(--text-primary)', marginBottom: 4 }}>
            {isLost ? item.itemName : 'Found Item'}
          </h2>

          {/* Category */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <span style={{ fontSize: 14 }}>{getCategoryIcon(item.category)}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono'", textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {getCategoryLabel(item.category)}
            </span>
          </div>

          {/* Description */}
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: "'JetBrains Mono'", textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Description</p>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>{item.description}</p>
          </div>

          {/* Details grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <DetailBox icon="📅" label={isLost ? 'Lost On' : 'Found On'} value={formatDateTime(isLost ? item.lostDate : item.foundDate || item.createdAt)} />
            <DetailBox icon="📍" label="Location" value={isLost ? 'Campus' : (item.foundLocation || 'Room No 405')} />
            {isLost && <DetailBox icon="👤" label="Reported By" value={item.reporterName || 'Anonymous'} />}
            {!isLost && <DetailBox icon="👤" label="Found By" value={item.finderName || 'Anonymous'} />}
            <DetailBox icon="🏷️" label="Status" value={item.matched ? 'Match Found!' : (item.approved ? 'Approved' : 'Pending')} />
          </div>

          {/* Contact Info */}
          <div style={{ background: isLost ? 'var(--lost-bg)' : 'var(--found-bg)', borderRadius: 12, padding: 16, border: `1px solid ${isLost ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
            <p style={{ fontSize: 11, color: isLost ? 'var(--lost)' : 'var(--found)', fontFamily: "'JetBrains Mono'", textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Contact Information</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {isLost ? (
                <>
                  {item.email && <ContactRow icon="✉️" value={item.email} />}
                  {item.phone && <ContactRow icon="📞" value={item.phone} />}
                </>
              ) : (
                <>
                  <ContactRow icon="📍" value={item.foundLocation || 'Room No 405'} />
                  <ContactRow icon="✉️" value={item.contactEmail || 'lostfound@college.edu'} />
                  <ContactRow icon="📞" value={item.contactPhone || '+91-XXXXXXXXXX'} />
                </>
              )}
            </div>
          </div>

          <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            {['whatsapp', 'email', 'instagram', 'copy'].map(method => {
              const label = method === 'whatsapp' ? 'WhatsApp' : method === 'email' ? 'Email' : method === 'instagram' ? 'Instagram' : 'Copy';
              const bg = method === 'whatsapp' ? '#10b981' : method === 'email' ? '#6366f1' : method === 'instagram' ? '#ec4899' : '#94a3b8';
              return (
                <button
                  key={method}
                  onClick={() => handleShareClick(method)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: 'none',
                    cursor: 'pointer',
                    background: bg,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  Share via {label}
                </button>
              );
            })}
          </div>

          {/* Match Notice */}
          {item.matched && (
            <div style={{ marginTop: 14, background: 'rgba(139,92,246,0.1)', borderRadius: 12, padding: 14, border: '1px solid rgba(139,92,246,0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>🎯</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa', marginBottom: 2 }}>Potential Match Found!</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>A similar item has been reported. Please visit Room 405 to verify.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailBox({ icon, label, value }) {
  return (
    <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '10px 12px', border: '1px solid var(--border)' }}>
      <p style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: "'JetBrains Mono'", textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{icon} {label}</p>
      <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{value || '—'}</p>
    </div>
  );
}

function ContactRow({ icon, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono'" }}>{value}</span>
    </div>
  );
}
