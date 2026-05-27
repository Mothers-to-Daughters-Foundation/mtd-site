'use client';

import { useState } from 'react';
import styles from './TierEditor.module.css';

interface Tier {
  _id: string;
  name: string;
  slug: string;
  description: string;
  pricePerMonth: number;
  features: string[];
  isActive: boolean;
  isDefault?: boolean;
  stripePriceId?: string;
  zeffyUrl?: string;
}

interface TierEditorProps {
  tiers: Tier[];
}

const emptyForm = (): Omit<Tier, '_id'> => ({
  name: '',
  slug: '',
  description: '',
  pricePerMonth: 0,
  features: [],
  isActive: true,
  isDefault: false,
  stripePriceId: '',
  zeffyUrl: '',
});

export default function TierEditor({ tiers: initialTiers }: TierEditorProps) {
  const [tiers, setTiers] = useState(initialTiers);
  const [showModal, setShowModal] = useState(false);
  const [editTier, setEditTier] = useState<Tier | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [featuresRaw, setFeaturesRaw] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');

  const openNew = () => {
    setEditTier(null);
    setForm(emptyForm());
    setFeaturesRaw('');
    setShowModal(true);
  };

  const openEdit = (tier: Tier) => {
    setEditTier(tier);
    setForm({
      name: tier.name,
      slug: tier.slug,
      description: tier.description,
      pricePerMonth: tier.pricePerMonth,
      features: tier.features,
      isActive: tier.isActive,
      isDefault: tier.isDefault ?? false,
      stripePriceId: tier.stripePriceId ?? '',
      zeffyUrl: tier.zeffyUrl ?? '',
    });
    setFeaturesRaw(tier.features.join('\n'));
    setShowModal(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const features = featuresRaw
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = { ...form, features };

    let res: Response;
    if (editTier) {
      res = await fetch(`/api/admin/tiers/${editTier._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch('/api/admin/tiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setMsgType('error');
      setMsg(data.error ?? 'Failed to save tier');
      return;
    }

    setMsgType('success');
    setMsg(editTier ? 'Tier updated.' : 'Tier created.');

    if (editTier) {
      setTiers((prev) =>
        prev.map((t) => (t._id === editTier._id ? { ...t, ...payload } : t))
      );
    } else {
      setTiers((prev) => [...prev, data]);
    }

    setShowModal(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleToggle = async (tier: Tier) => {
    const res = await fetch(`/api/admin/tiers/${tier._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !tier.isActive }),
    });
    if (res.ok) {
      setTiers((prev) =>
        prev.map((t) =>
          t._id === tier._id ? { ...t, isActive: !tier.isActive } : t
        )
      );
    }
  };

  return (
    <div>
      {msg && (
        <div className={`${styles.alert} ${styles[`alert-${msgType}`]}`}>{msg}</div>
      )}

      <div className={styles.toolbar}>
        <button onClick={openNew} className={styles.newBtn}>
          + New Tier
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Price/mo</th>
              <th>Features</th>
              <th>Status</th>
              <th>Default</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tiers.length === 0 && (
              <tr>
                <td colSpan={7} className={styles.emptyCell}>
                  No tiers yet. Create one above.
                </td>
              </tr>
            )}
            {tiers.map((tier) => (
              <tr key={tier._id}>
                <td className={styles.nameCell}>{tier.name}</td>
                <td className={styles.slugCell}>{tier.slug}</td>
                <td>${tier.pricePerMonth}/mo</td>
                <td>{tier.features.length} feature(s)</td>
                <td>
                  <span
                    className={`${styles.badge} ${tier.isActive ? styles.badgeActive : styles.badgeInactive}`}
                  >
                    {tier.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{tier.isDefault ? <span className={styles.defaultMark}>✓</span> : '—'}</td>
                <td className={styles.actions}>
                  <button
                    onClick={() => openEdit(tier)}
                    className={styles.editBtn}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggle(tier)}
                    className={`${styles.toggleBtn} ${tier.isActive ? styles.toggleBtnDeactivate : styles.toggleBtnActivate}`}
                  >
                    {tier.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editTier ? 'Edit Tier' : 'New Tier'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className={styles.closeBtn}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} />
                </div>
                <div className={styles.field}>
                  <label>Slug *</label>
                  <input name="slug" value={form.slug} onChange={handleChange} placeholder="e.g. basic-mentee" />
                </div>
              </div>
              <div className={styles.field}>
                <label>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
              <div className={styles.field}>
                <label>Price per Month ($)</label>
                <input
                  type="number"
                  name="pricePerMonth"
                  value={form.pricePerMonth}
                  onChange={handleChange}
                  min={0}
                  step={0.01}
                />
              </div>
              <div className={styles.field}>
                <label>Features (one per line)</label>
                <textarea
                  value={featuresRaw}
                  onChange={(e) => setFeaturesRaw(e.target.value)}
                  rows={4}
                  placeholder="Weekly check-ins&#10;Access to resources&#10;Community access"
                />
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Stripe Price ID</label>
                  <input
                    name="stripePriceId"
                    value={form.stripePriceId}
                    onChange={handleChange}
                    placeholder="price_xxxxx"
                  />
                </div>
                <div className={styles.field}>
                  <label>Zeffy URL (optional)</label>
                  <input
                    name="zeffyUrl"
                    value={form.zeffyUrl}
                    onChange={handleChange}
                    placeholder="https://zeffy.com/…"
                  />
                </div>
              </div>
              <div className={styles.checkboxRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                  />
                  Active (visible to users)
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={form.isDefault}
                    onChange={handleChange}
                  />
                  Default for new sign-ups
                </label>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                onClick={() => setShowModal(false)}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={styles.saveBtn}
                disabled={saving || !form.name || !form.slug}
              >
                {saving ? 'Saving…' : editTier ? 'Save Changes' : 'Create Tier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
