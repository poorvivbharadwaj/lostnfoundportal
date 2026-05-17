import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  getDashboardStats,
  getAdminLostItems,
  getAdminFoundItems,
  approveLostItem,
  approveFoundItem,
  deleteAdminLostItem,
  deleteAdminFoundItem,
  rejectLostItem,
  rejectFoundItem,
  updateAdminLostItem,
  updateAdminFoundItem,
  archiveAdminLostItem,
  archiveAdminFoundItem,
} from '../utils/api';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('lost');
  const [activeTab, setActiveTab] = useState('all');
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const [statsRes, lostRes, foundRes] = await Promise.all([
        getDashboardStats(),
        getAdminLostItems(params),
        getAdminFoundItems(params),
      ]);
      setStats(statsRes.data.stats);
      setLostItems(lostRes.data.items || []);
      setFoundItems(foundRes.data.items || []);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }
    loadData();
  }, [loadData, navigate]);

  const openEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      ...item,
      lostDate: item.lostDate ? new Date(item.lostDate).toISOString().slice(0, 10) : '',
      foundDate: item.foundDate ? new Date(item.foundDate).toISOString().slice(0, 10) : '',
    });
  };

  const closeEdit = () => {
    setEditingItem(null);
    setEditForm({});
  };

  const handleEditChange = (key, value) => {
    setEditForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      const payload = {};
      if (activeType === 'lost') {
        payload.itemName = editForm.itemName;
        payload.description = editForm.description;
        payload.email = editForm.email;
        payload.phone = editForm.phone;
        if (editForm.lostDate) payload.lostDate = editForm.lostDate;
      } else {
        payload.finderName = editForm.finderName;
        payload.description = editForm.description;
        payload.contactEmail = editForm.contactEmail;
        payload.contactPhone = editForm.contactPhone;
        if (editForm.foundDate) payload.foundDate = editForm.foundDate;
      }

      if (activeType === 'lost') {
        await updateAdminLostItem(editingItem._id, payload);
      } else {
        await updateAdminFoundItem(editingItem._id, payload);
      }
      toast.success('Item updated successfully');
      closeEdit();
      loadData();
    } catch (err) {
      toast.error('Failed to save changes');
    }
  };

  const handleArchive = async (id, type) => {
    try {
      if (type === 'lost') await archiveAdminLostItem(id);
      else await archiveAdminFoundItem(id);
      toast.success('Item archived from public view');
      loadData();
    } catch (err) {
      toast.error('Failed to archive item');
    }
  };

  const handleApprove = async (id, type) => {
    try {
      if (type === 'lost') await approveLostItem(id);
      else await approveFoundItem(id);
      toast.success('Approved!');
      loadData();
    } catch (err) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id, type) => {
    try {
      if (type === 'lost') await rejectLostItem(id);
      else await rejectFoundItem(id);
      toast.success('Rejected!');
      loadData();
    } catch (err) {
      toast.error('Failed to reject');
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      if (type === 'lost') await deleteAdminLostItem(id);
      else await deleteAdminFoundItem(id);
      toast.success('Deleted!');
      loadData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const items = activeType === 'lost' ? lostItems : foundItems;

  const styles = {
    page: {
      minHeight: '100vh',
      background: '#060610',
      paddingBottom: 60,
      fontFamily: "'Outfit', sans-serif",
    },
    navbar: {
      background: 'rgba(14,14,28,0.95)',
      borderBottom: '1px solid rgba(99,102,241,0.15)',
      padding: '14px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    },
    navTitle: {
      fontFamily: "'Syne', sans-serif",
      fontWeight: 800,
      fontSize: 18,
      color: '#eef0ff',
    },
    navRight: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    logoutBtn: {
      padding: '7px 16px',
      borderRadius: 8,
      background: 'rgba(239,68,68,0.1)',
      color: '#f87171',
      border: '1px solid rgba(239,68,68,0.25)',
      fontSize: 13,
      cursor: 'pointer',
    },
    backBtn: {
      padding: '7px 16px',
      borderRadius: 8,
      background: 'rgba(99,102,241,0.1)',
      color: '#a5b4fc',
      border: '1px solid rgba(99,102,241,0.25)',
      fontSize: 13,
      textDecoration: 'none',
      display: 'inline-block',
    },
    content: {
      maxWidth: 1000,
      margin: '0 auto',
      padding: '24px 20px',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: 14,
      marginBottom: 28,
    },
    statCard: {
      background: 'rgba(14,14,28,0.75)',
      border: '1px solid rgba(99,102,241,0.15)',
      borderRadius: 14,
      padding: '16px 20px',
      textAlign: 'center',
    },
    tabBar: {
      background: 'rgba(14,14,28,0.75)',
      border: '1px solid rgba(99,102,241,0.12)',
      borderRadius: 14,
      padding: '12px 16px',
      marginBottom: 16,
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    itemCard: {
      background: 'rgba(14,14,28,0.75)',
      border: '1px solid rgba(99,102,241,0.12)',
      borderRadius: 12,
      padding: '16px',
      marginBottom: 12,
      display: 'flex',
      gap: 14,
      alignItems: 'flex-start',
    },
    actionBtn: (color) => ({
      padding: '6px 14px',
      borderRadius: 8,
      border: 'none',
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 600,
      marginRight: 6,
      marginTop: 6,
      background: color === 'green'
        ? 'rgba(16,185,129,0.15)'
        : color === 'red'
        ? 'rgba(239,68,68,0.15)'
        : color === 'blue'
        ? 'rgba(59,130,246,0.15)'
        : 'rgba(245,158,11,0.15)',
      color: color === 'green'
        ? '#34d399'
        : color === 'red'
        ? '#f87171'
        : color === 'blue'
        ? '#60a5fa'
        : '#f59e0b',
    }),
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(14,14,28,0.95)',
    border: '1px solid rgba(99,102,241,0.15)',
    borderRadius: 12,
    color: '#eef0ff',
    padding: '12px 14px',
    fontSize: 14,
    outline: 'none',
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: 110,
    resize: 'vertical',
  };

  return (
    <div style={styles.page}>

      <div style={styles.navbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🎓</span>
          <span style={styles.navTitle}>Admin Dashboard</span>
        </div>
        <div style={styles.navRight}>
          <span style={{ fontSize: 13, color: '#7b7fa0' }}>
            👤 {admin ? admin.username : 'Admin'}
          </span>
          <button style={styles.archiveBtn} onClick={() => navigate('/admin/archive')}>
            Archive
          </button>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
          <a href="/" style={styles.backBtn}>
            Back to Portal
          </a>
        </div>
      </div>

      <div style={styles.content}>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{ fontSize: 28, color: '#f59e0b', fontWeight: 800 }}>
              {stats ? stats.totalLost : 0}
            </div>
            <div style={{ fontSize: 12, color: '#7b7fa0', marginTop: 4 }}>
              Total Lost
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{ fontSize: 28, color: '#10b981', fontWeight: 800 }}>
              {stats ? stats.totalFound : 0}
            </div>
            <div style={{ fontSize: 12, color: '#7b7fa0', marginTop: 4 }}>
              Total Found
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{ fontSize: 28, color: '#94a3b8', fontWeight: 800 }}>
              {stats ? stats.pendingLost : 0}
            </div>
            <div style={{ fontSize: 12, color: '#7b7fa0', marginTop: 4 }}>
              Pending Lost
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{ fontSize: 28, color: '#94a3b8', fontWeight: 800 }}>
              {stats ? stats.pendingFound : 0}
            </div>
            <div style={{ fontSize: 12, color: '#7b7fa0', marginTop: 4 }}>
              Pending Found
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{ fontSize: 28, color: '#8b5cf6', fontWeight: 800 }}>
              {stats ? stats.matchedItems : 0}
            </div>
            <div style={{ fontSize: 12, color: '#7b7fa0', marginTop: 4 }}>
              Matches
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{ fontSize: 28, color: '#f97316', fontWeight: 800 }}>
              {stats ? ((stats.archivedLost || 0) + (stats.archivedFound || 0)) : 0}
            </div>
            <div style={{ fontSize: 12, color: '#7b7fa0', marginTop: 4 }}>
              Archived
            </div>
          </div>
        </div>

        <div style={styles.tabBar}>
          <span style={{ fontSize: 12, color: '#4a4d6a', marginRight: 4 }}>
            FILTER:
          </span>
          {['all', 'pending', 'approved', 'rejected', 'resolved'].map(function(tab) {
            return (
              <button
                key={tab}
                onClick={function() {
                  setActiveTab(tab);
                  setTimeout(loadData, 100);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  background: activeTab === tab
                    ? 'rgba(99,102,241,0.15)'
                    : 'transparent',
                  color: activeTab === tab ? '#a5b4fc' : '#7b7fa0',
                }}
              >
                {tab === 'resolved' ? 'Archived' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            );
          })}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button
              onClick={function() { setActiveType('lost'); }}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                background: activeType === 'lost'
                  ? 'rgba(245,158,11,0.15)'
                  : 'transparent',
                color: activeType === 'lost' ? '#f59e0b' : '#7b7fa0',
              }}
            >
              Lost ({lostItems.length})
            </button>
            <button
              onClick={function() { setActiveType('found'); }}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                background: activeType === 'found'
                  ? 'rgba(16,185,129,0.15)'
                  : 'transparent',
                color: activeType === 'found' ? '#10b981' : '#7b7fa0',
              }}
            >
              Found ({foundItems.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <p style={{ color: '#7b7fa0', fontSize: 15 }}>Loading...</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p style={{ color: '#7b7fa0', fontSize: 15 }}>
              No items found
            </p>
          </div>
        ) : (
          items.map(function(item) {
            return (
              <div key={item._id} style={styles.itemCard}>

                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: 10,
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: '#13132a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}>
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    '📦'
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    gap: 8,
                    marginBottom: 6,
                    flexWrap: 'wrap',
                  }}>
                    <span style={{
                      padding: '2px 10px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      background: activeType === 'lost'
                        ? 'rgba(245,158,11,0.1)'
                        : 'rgba(16,185,129,0.1)',
                      color: activeType === 'lost' ? '#f59e0b' : '#10b981',
                    }}>
                      {activeType === 'lost' ? 'Lost' : 'Found'}
                    </span>
                    <span style={{
                      padding: '2px 10px',
                      borderRadius: 999,
                      fontSize: 11,
                      background: 'rgba(100,116,139,0.12)',
                      color: '#94a3b8',
                    }}>
                      {item.status || 'pending'}
                    </span>
                    {item.matched && (
                      <span style={{
                        padding: '2px 10px',
                        borderRadius: 999,
                        fontSize: 11,
                        background: 'rgba(139,92,246,0.12)',
                        color: '#a78bfa',
                      }}>
                        Matched
                      </span>
                    )}
                  </div>

                  <div style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#eef0ff',
                    marginBottom: 4,
                  }}>
                    {activeType === 'lost'
                      ? item.itemName
                      : 'Found by ' + (item.finderName || 'Unknown')}
                  </div>

                  <div style={{
                    fontSize: 12,
                    color: '#7b7fa0',
                    marginBottom: 6,
                    lineHeight: 1.5,
                  }}>
                    {item.description}
                  </div>

                  {activeType === 'lost' && (
                    <div style={{ fontSize: 11, color: '#4a4d6a' }}>
                      {item.email && '✉️ ' + item.email}
                      {item.phone && '  📞 ' + item.phone}
                    </div>
                  )}

                  <div style={{ marginTop: 8 }}>
                      <button
                      style={styles.actionBtn('blue')}
                      onClick={function() {
                        openEdit(item);
                      }}
                    >
                      Edit
                    </button>
                    {item.status !== 'approved' && item.status !== 'resolved' && (
                      <button
                        style={styles.actionBtn('green')}
                        onClick={function() {
                          handleApprove(item._id, activeType);
                        }}
                      >
                        Approve
                      </button>
                    )}
                    {item.status === 'pending' && (
                      <button
                        style={styles.actionBtn('yellow')}
                        onClick={function() {
                          handleReject(item._id, activeType);
                        }}
                      >
                        Reject
                      </button>
                    )}
                    {item.status !== 'resolved' && (
                      <button
                        style={styles.actionBtn('blue')}
                        onClick={function() {
                          handleArchive(item._id, activeType);
                        }}
                      >
                        Archive
                      </button>
                    )}
                    <button
                      style={styles.actionBtn('red')}
                      onClick={function() {
                        handleDelete(item._id, activeType);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            onClick={loadData}
            style={{
              padding: '10px 28px',
              borderRadius: 10,
              background: 'rgba(99,102,241,0.1)',
              color: '#a5b4fc',
              border: '1px solid rgba(99,102,241,0.25)',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </div>

        {editingItem && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ width: '100%', maxWidth: 660, background: '#090916', borderRadius: 20, padding: 26, boxShadow: '0 0 40px rgba(0,0,0,0.35)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ color: '#eef0ff', fontSize: 18, margin: 0 }}>Edit {activeType === 'lost' ? 'Lost' : 'Found'} Item</h3>
                <button style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 20, cursor: 'pointer' }} onClick={closeEdit}>×</button>
              </div>

              <div style={{ display: 'grid', gap: 14 }}>
                {activeType === 'lost' ? (
                  <>
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Item Name</label>
                    <input value={editForm.itemName || ''} onChange={e => handleEditChange('itemName', e.target.value)} style={inputStyle} />
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Description</label>
                    <textarea value={editForm.description || ''} onChange={e => handleEditChange('description', e.target.value)} rows={4} style={textareaStyle} />
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Reporter Email</label>
                    <input value={editForm.email || ''} onChange={e => handleEditChange('email', e.target.value)} style={inputStyle} />
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Reporter Phone</label>
                    <input value={editForm.phone || ''} onChange={e => handleEditChange('phone', e.target.value)} style={inputStyle} />
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Lost Date</label>
                    <input type="date" value={editForm.lostDate || ''} onChange={e => handleEditChange('lostDate', e.target.value)} style={inputStyle} />
                  </>
                ) : (
                  <>
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Finder Name</label>
                    <input value={editForm.finderName || ''} onChange={e => handleEditChange('finderName', e.target.value)} style={inputStyle} />
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Description</label>
                    <textarea value={editForm.description || ''} onChange={e => handleEditChange('description', e.target.value)} rows={4} style={textareaStyle} />
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Contact Email</label>
                    <input value={editForm.contactEmail || ''} onChange={e => handleEditChange('contactEmail', e.target.value)} style={inputStyle} />
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Contact Phone</label>
                    <input value={editForm.contactPhone || ''} onChange={e => handleEditChange('contactPhone', e.target.value)} style={inputStyle} />
                    <label style={{ color: '#94a3b8', fontSize: 13 }}>Found Date</label>
                    <input type="date" value={editForm.foundDate || ''} onChange={e => handleEditChange('foundDate', e.target.value)} style={inputStyle} />
                  </>
                )}
              </div>

              <div style={{ marginTop: 18, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={closeEdit} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(148,163,184,0.3)', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSaveEdit} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer' }}>Save Changes</button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          .admin-edit-input { width: 100%; background: rgba(14,14,28,0.95); border: 1px solid rgba(99,102,241,0.15); border-radius: 12px; color: #eef0ff; padding: 12px 14px; font-size: 14px; }
        `}</style>

      </div>
    </div>
  );
}