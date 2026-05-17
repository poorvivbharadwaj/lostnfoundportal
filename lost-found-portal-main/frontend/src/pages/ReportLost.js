import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ImageUpload from '../components/forms/ImageUpload';
import { postLostItem } from '../utils/api';
import { validateEmail, validatePhone, detectCategory, CATEGORIES } from '../utils/helpers';

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const SpinnerIcon = () => (
  <div className="spinner" style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
);

function FormField({ label, required, error, hint, children }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: error ? 'var(--danger)' : 'var(--text-muted)', fontFamily: "'Syne',sans-serif" }}>
        {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
      </label>
      {children}
      {hint && !error && <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>{hint}</p>}
      {error && <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>⚠ {error}</p>}
    </div>
  );
}

export default function ReportLost() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [form, setForm] = useState({
    reporterName: '', email: '', phone: '', itemName: '',
    description: '', lostDate: '', category: 'auto',
  });
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
  const e = {};

  if (!form.reporterName || !form.reporterName.trim()) {
    e.reporterName = 'Name is required';
  }

  if (!form.email || !form.email.trim()) {
    e.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    e.email = 'Enter a valid email like yourname@gmail.com';
  }

  if (form.phone && form.phone.trim()) {
    const cleaned = form.phone.replace(/[\s\-+]/g, '');
    if (!/^[0-9]{10}$/.test(cleaned)) {
      e.phone = 'Enter 10 digits only like 9876543210';
    }
  }

  if (!form.itemName || !form.itemName.trim()) {
    e.itemName = 'Item name is required';
  }

  if (!form.description || !form.description.trim()) {
    e.description = 'Description is required';
  } else if (form.description.trim().length < 20) {
    e.description = 'Write at least 20 characters';
  }

  if (!form.lostDate) {
    e.lostDate = 'Please select the date you lost the item';
  }

  return e;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error('Please fix the errors before submitting.');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (imageFile) fd.append('image', imageFile);

      // Auto-detect category if needed
      const detectedCat = form.category === 'auto'
        ? detectCategory(`${form.itemName} ${form.description}`)
        : form.category;
      fd.set('category', detectedCat);

      const res = await postLostItem(fd);

      if (res.data.success) {
        toast.success('✅ Lost item reported! Waiting for admin approval.', { duration: 5000 });
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit. Please try again.';
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--lost-bg)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>😢</div>
            <div>
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24, color: 'var(--text-primary)' }}>Report Lost Item</h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Fill details to help us find your item</p>
            </div>
          </div>

          <div style={{ padding: '10px 14px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, fontSize: 12, color: 'var(--lost)' }}>
            ℹ️ Your report will be visible after admin review. You'll receive an email confirmation once approved.
          </div>
        </div>

        {/* Form Card */}
        <div className="glass" style={{ borderRadius: 18, padding: 28 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Name */}
            <FormField label="Your Full Name" required error={errors.reporterName}>
              <input className={`input-field ${errors.reporterName ? 'error' : ''}`} placeholder="e.g. Arjun Kumar" value={form.reporterName} onChange={e => update('reporterName', e.target.value)} />
            </FormField>

            {/* Email + Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField label="Email Address" required error={errors.email}>
                <input type="email" className={`input-field ${errors.email ? 'error' : ''}`} placeholder="you@college.edu" value={form.email} onChange={e => update('email', e.target.value)} />
              </FormField>
              <FormField label="Phone Number" error={errors.phone} hint="10-digit Indian mobile">
                <input type="tel" className={`input-field ${errors.phone ? 'error' : ''}`} placeholder="9876543210" value={form.phone} onChange={e => update('phone', e.target.value)} />
              </FormField>
            </div>

            {/* Item Name */}
            <FormField label="Item Name" required error={errors.itemName}>
              <input className={`input-field ${errors.itemName ? 'error' : ''}`} placeholder="e.g. Student ID Card, Blue Laptop, Record Book" value={form.itemName} onChange={e => update('itemName', e.target.value)} />
            </FormField>

            {/* Category */}
            <FormField label="Category" hint="Leave as Auto-detect to use AI classification">
              <select className="input-field" value={form.category} onChange={e => update('category', e.target.value)}>
                <option value="auto">🤖 Auto-detect</option>
                {CATEGORIES.filter(c => c.value !== 'all').map(c => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
            </FormField>

            {/* Description */}
            <FormField label="Detailed Description" required error={errors.description} hint="Include colour, brand, distinguishing features (min 20 characters)">
              <textarea className={`input-field ${errors.description ? 'error' : ''}`} rows={4} placeholder="Describe the item in detail. Include colour, brand, size, any unique marks or stickers..." value={form.description} onChange={e => update('description', e.target.value)} style={{ resize: 'vertical' }} />
            </FormField>

            {/* Lost Date */}
            <FormField label="Date Lost" required error={errors.lostDate}>
              <input type="date" className={`input-field ${errors.lostDate ? 'error' : ''}`} max={new Date().toISOString().split('T')[0]} value={form.lostDate} onChange={e => update('lostDate', e.target.value)} />
            </FormField>

            {/* Image Upload */}
            <FormField label="Upload Item Image" hint="Optional but recommended — helps in matching">
              <ImageUpload onChange={setImageFile} />
            </FormField>

            {/* Submit */}
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '13px', fontSize: 15, marginTop: 4 }}>
              {loading ? <><SpinnerIcon /> Submitting Report…</> : '📢 Submit Lost Item Report'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
