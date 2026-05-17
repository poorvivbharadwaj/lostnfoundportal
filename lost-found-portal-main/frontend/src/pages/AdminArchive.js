import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  getAdminLostItems,
  getAdminFoundItems,
  restoreAdminLostItem,
  restoreAdminFoundItem,
  deleteAdminLostItem,
  deleteAdminFoundItem,
} from '../utils/api';

export default function AdminArchive() {
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const [activeType, setActiveType] = useState('lost');
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadArchivedItems = useCallback(async () => {
    setLoading(true);
    try {
      const [lostRes, foundRes] = await Promise.all([
        getAdminLostItems({ status: 'resolved' }),
        getAdminFoundItems({ status: 'resolved' }),
      ]);
      setLostItems(lostRes.data.items || []);
      setFoundItems(foundRes.data.items || []);
    } catch (err) {
      toast.error('Unable to load archived items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }
    loadArchivedItems();
  }, [loadArchivedItems, navigate]);

  const handleRestore = async (id, type) => {
    try {
      if (type === 'lost') await restoreAdminLostItem(id);
      else await restoreAdminFoundItem(id);
      toast.success('Item restored to public list');
      loadArchivedItems();
    } catch (err) {
      toast.error('Restore failed');
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Permanently delete this item from archive?')) return;
    try {
      if (type === 'lost') await deleteAdminLostItem(id);
      else await deleteAdminFoundItem(id);
      toast.success('Item deleted permanently');
      loadArchivedItems();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const items = activeType === 'lost' ? lostItems : foundItems;

  const styles = {
    page: {
      minHeight: '100vh',
      background: '#060610',
      color: '#eef0ff',
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
    button: {
      padding: '7px 16px',
      borderRadius: 8,
      border: '1px solid rgba(99,102,241,0.25)',
      background: 'rgba(99,102,241,0.1)',
      color: '#a5b4fc',
      cursor: 'pointer',
      fontSize: 13,
    },
    backButton: {
      padding: '7px 16px',
      borderRadius: 8,
      background: 'rgba(14,14,28,0.95)',
      color: '#94a3b8',
      border: '1px solid rgba(99,102,241,0.15)',
      cursor: 'pointer',
      fontSize: 13,
    },
    content: {
      maxWidth: 1000,
      margin: '0 auto',
      padding: '24px 20px',
    },
    tabBar: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap',
      marginBottom: 20,
    },
    tabBtn: (active) => ({
      padding: '8px 16px',
      borderRadius: 10,
      border: 'none',
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 700,
      background: active ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.05)',
      color: active ? '#a5b4fc' : '#7b7fa0',
    }),
    card: {
      background: 'rgba(14,14,28,0.85)',
      border: '1px solid rgba(99,102,241,0.12)',
      borderRadius: 14,
      padding: 18,
      marginBottom: 14,
    },
    actionButton: {
      padding: '8px 14px',
      borderRadius: 8,
      border: 'none',
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 700,
      marginRight: 10,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.navbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🗂️</span>
          <span style={styles.navTitle}>Admin Archive</span>
        </div>
        <div style={styles.navRight}>
          <span style={{ fontSize: 13, color: '#7b7fa0' }}>
            👤 {admin ? admin.username : 'Admin'}
          </span>
          <button style={styles.button} onClick={() => navigate('/admin')}>
            Dashboard
          </button>
          <button style={styles.backButton} onClick={() => navigate('/')}>
            Back to Portal
          </button>
          <button style={styles.button} onClick={() => { logout(); navigate('/admin/login', { replace: true }); }}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.tabBar}>
          <button
            style={styles.tabBtn(activeType === 'lost')}
            onClick={() => setActiveType('lost')}
          >
            Lost Archive ({lostItems.length})
          </button>
          <button
            style={styles.tabBtn(activeType === 'found')}
            onClick={() => setActiveType('found')}
          >
            Found Archive ({foundItems.length})
          </button>
        </div>

        {loading ? (
          <p style={{ color: '#7b7fa0' }}>Loading archived items…</p>
        ) : items.length === 0 ? (
          <p style={{ color: '#7b7fa0' }}>No archived {activeType} items found.</p>
        ) : (
          items.map(item => (
            <div key={item._id} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#eef0ff' }}>
                    {activeType === 'lost' ? item.itemName : item.finderName || 'Found Item'}
                  </div>
                  <div style={{ fontSize: 12, color: '#7b7fa0', marginTop: 6 }}>
                    {item.description}
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {activeType === 'lost' ? <span>✉️ {item.email || 'N/A'}</span> : <span>✉️ {item.contactEmail || 'N/A'}</span>}
                    {activeType === 'lost' ? <span>📞 {item.phone || 'N/A'}</span> : <span>📞 {item.contactPhone || 'N/A'}</span>}
                    <span style={{ color: '#94a3b8' }}>Status: {item.status}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    style={{ ...styles.actionButton, background: '#10b981', color: '#fff' }}
                    onClick={() => handleRestore(item._id, activeType)}
                  >
                    Restore
                  </button>
                  <button
                    style={{ ...styles.actionButton, background: '#ef4444', color: '#fff' }}
                    onClick={() => handleDelete(item._id, activeType)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
