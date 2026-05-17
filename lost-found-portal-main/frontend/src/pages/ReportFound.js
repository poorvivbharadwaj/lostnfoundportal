import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ImageUpload from '../components/forms/ImageUpload';
import { postFoundItem } from '../utils/api';
import { detectCategory, CATEGORIES } from '../utils/helpers';

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const SpinnerIcon = () => (
  <div className="spinner" style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
);

function FormField({ label, required, error, hint, children, readOnly }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: error ? 'var(--danger)' : 'var(--text-muted)', fontFamily: "'Syne',sans-serif" }}>
        {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        {readOnly && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--text-dim)', fontFamily: "'JetBrains Mono'", textTransform: 'uppercase' }}>fixed</span>}
      </label>
      {children}
      {hint && !error && <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>{hint}</p>}
      {error && <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>⚠ {error}</p>}
    </div>
  );
}

export default function ReportFound() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [form, setForm] = useState({
    finderName: '',
    description: '',
    category: 'auto',
  });
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
  const e = {};

  if (!form.finderName || !form.finderName.trim()) {
    e.finderName = 'Your name is required';
  }

  if (!form.description || !form.description.trim()) {
    e.description = 'Description is required';
  } else if (form.description.trim().length < 20) {
    e.description = 'Write at least 20 characters describing the item';
  }

  return e;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error('Please fill all required fields.');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('finderName', form.finderName);
      fd.append('description', form.description);

      const cat = form.category === 'auto' ? detectCategory(form.description) : form.category;
      fd.append('category', cat);

      if (imageFile) fd.append('image', imageFile);

      const res = await postFoundItem(fd);

      if (res.data.success) {
        if (res.data.potentialMatch) {
          toast.success(`🎯 Match found! "${res.data.potentialMatch.itemName}" may be this item. Owner notified!`, { duration: 7000 });
        } else {
          toast.success('✅ Found item reported! Admin will review shortly.', { duration: 5000 });
        }
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Submission failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-mesh" style={{ minHeight: '100vh', padding: '24px 20px 60px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Back */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14, marginBottom: 24, transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          <BackIcon /> Back to Portal
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--found-bg)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎉</div>
            <div>
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24, color: 'var(--text-primary)' }}>Report Found Item</h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Help reunite someone with their lost item</p>
            </div>
          </div>

          <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, fontSize: 12, color: 'var(--found)' }}>
            🤖 Our AI will automatically compare your report with lost items and notify the owner if a match is found!
          </div>
        </div>

        {/* Form */}
        <div className="glass" style={{ borderRadius: 18, padding: 28 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Finder Name */}
            <FormField label="Your Name" required error={errors.finderName}>
              <input className={`input-field ${errors.finderName ? 'error' : ''}`} placeholder="e.g. Priya Sharma" value={form.finderName} onChange={e => update('finderName', e.target.value)} />
            </FormField>

            {/* Category */}
            <FormField label="Item Category" hint="Auto-detect uses AI to classify based on your description">
              <select className="input-field" value={form.category} onChange={e => update('category', e.target.value)}>
                <option value="auto">🤖 Auto-detect from description</option>
                {CATEGORIES.filter(c => c.value !== 'all').map(c => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
            </FormField>

            {/* Description */}
            <FormField label="Item Description" required error={errors.description} hint="Be specific: colour, brand, condition, any markings (min 20 chars)">
              <textarea className={`input-field ${errors.description ? 'error' : ''}`} rows={5} placeholder="Describe the item you found. Include colour, brand, condition, any text or stickers visible on the item..." value={form.description} onChange={e => update('description', e.target.value)} style={{ resize: 'vertical' }} />
            </FormField>

            {/* Fixed: Location */}
            <FormField label="Found At (Location)" readOnly>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10 }}>
                <span style={{ fontSize: 16 }}>📍</span>
                <span style={{ fontSize: 14, color: 'var(--found)', fontWeight: 600 }}>Room No 405</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-dim)', fontFamily: "'JetBrains Mono'" }}>FIXED</span>
              </div>
            </FormField>

            {/* Fixed: Contact */}
            <FormField label="Contact Information" readOnly>
              <div style={{ background: 'rgba(14,14,28,0.8)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13 }}>✉️</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono'" }}>lostfound@college.edu</span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-dim)', fontFamily: "'JetBrains Mono'", textTransform: 'uppercase' }}>fixed</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13 }}>📞</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono'" }}>+91-XXXXXXXXXX</span>
                </div>
              </div>
            </FormField>

            {/* Image Upload */}
            <FormField label="Upload Photo of Found Item" hint="A clear photo helps the owner verify it's theirs">
              <ImageUpload onChange={setImageFile} />
            </FormField>

            {/* Submit */}
            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: '100%', padding: '13px', fontSize: 15, marginTop: 4, background: loading ? undefined : 'linear-gradient(135deg, #059669, #10b981)' }}>
              {loading ? <><SpinnerIcon /> Submitting Report…</> : '🎉 Submit Found Item Report'}
            </button>

            <p style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center' }}>
              Our AI will automatically check for matching lost items
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
