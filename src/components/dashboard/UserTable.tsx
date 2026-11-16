'use client';

import { useState } from 'react';
import styles from './UserTable.module.css';

interface Tier {
  _id: string;
  name: string;
}

interface User {
  _id: string;

  name: string;

  email: string;

  role: "admin" | "mentor" | "mentee";

  /** Sign-in blocked by an admin; reversible. */
  deactivated?: boolean;

  subscriptionStatus?: string;

  subscriptionTierId?: string;

  createdAt?: string;

  phone?: string;

  city?: string;

  country?: string;

  expertise?: string;
}

interface UserTableProps {
  users: User[];
  tiers: Tier[];
  /** The signed-in admin, who can't deactivate or delete themselves. */
  currentUserId?: string;
}

export default function UserTable({ users: initialUsers, tiers, currentUserId }: UserTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [actionType, setActionType] = useState<'success' | 'error'>('success');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<User | null>(null);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const flash = (type: 'success' | 'error', msg: string) => {
    setActionType(type);
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 4000);
  };

  const handleActive = async (u: User, active: boolean) => {
    if (
      !active &&
      !window.confirm(
        `Deactivate ${u.name || u.email}? They won't be able to sign in until you reactivate them. Nothing is deleted.`
      )
    ) {
      return;
    }
    setBusyId(u._id);
    const res = await fetch(`/api/admin/users/${u._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    });
    setBusyId(null);
    if (res.ok) {
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, deactivated: !active } : x)));
      flash('success', active ? 'User reactivated.' : 'User deactivated.');
    } else {
      const data = await res.json().catch(() => ({}));
      flash('error', data.error ?? 'Something went wrong.');
    }
  };

  const openDelete = (u: User) => {
    setToDelete(u);
    setConfirmEmail('');
    setDeleteError('');
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setBusyId(toDelete._id);
    setDeleteError('');
    const res = await fetch(`/api/admin/users/${toDelete._id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmEmail }),
    });
    setBusyId(null);
    if (res.ok) {
      setUsers((prev) => prev.filter((x) => x._id !== toDelete._id));
      setToDelete(null);
      flash('success', 'User and their data permanently deleted.');
    } else {
      const data = await res.json().catch(() => ({}));
      setDeleteError(data.error ?? 'Could not delete this user.');
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    const matchesStatus =
      !statusFilter || (u.subscriptionStatus ?? 'none') === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleRoleChange = async (userId: string, 
    newRole: "admin" | "mentor" | "mentee") => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      setActionType('success');
      setActionMsg('Role updated.');
    } else {
      const data = await res.json();
      setActionType('error');
      setActionMsg(data.error ?? 'Failed to update role');
    }
    setTimeout(() => setActionMsg(''), 3000);
  };

  const tierName = (tierId?: string) =>
    tierId ? (tiers.find((t) => t._id === tierId)?.name ?? tierId) : '-';

  return (
    <div>
      {actionMsg && (
        <div className={`${styles.alert} ${styles[`alert-${actionType}`]}`}>
          {actionMsg}
        </div>
      )}

      <div className={styles.filters}>
        <input
          type="search"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className={styles.select}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="mentor">Mentor</option>
          <option value="mentee">Mentee</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.select}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
          <option value="none">None</option>
        </select>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Subscription</th>
              <th>Plan</th>
              <th>Joined</th>
              <th>Account</th>
              <th>
                <span className={styles.srOnly}>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.emptyCell}>
                  No users match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u._id} className={u.deactivated ? styles.rowDeactivated : undefined}>
                  <td className={styles.nameCell}>
                    <div className={styles.avatar}>{u.name.charAt(0).toUpperCase()}</div>
                    {u.name}
                  </td>
                  <td className={styles.emailCell}>{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value as "admin" | "mentor" | "mentee")}
                      className={styles.roleSelect}
                    >
                      <option value="admin">admin</option>
                      <option value="mentor">mentor</option>
                      <option value="mentee">mentee</option>
                    </select>
                  </td>
                  <td>
                    <span
                      className={`${styles.badge} ${styles[`badge-${u.subscriptionStatus ?? 'none'}`]}`}
                    >
                      {u.subscriptionStatus ?? 'none'}
                    </span>
                  </td>
                  <td>{tierName(u.subscriptionTierId)}</td>
                  <td className={styles.dateCell}>
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString()
                      : '-'}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${u.deactivated ? styles['badge-cancelled'] : styles['badge-active']}`}>
                      {u.deactivated ? 'Deactivated' : 'Active'}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    {u._id === currentUserId ? (
                      <span className={styles.youLabel}>You</span>
                    ) : (
                      <>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          disabled={busyId === u._id}
                          onClick={() => handleActive(u, Boolean(u.deactivated))}
                        >
                          {u.deactivated ? 'Reactivate' : 'Deactivate'}
                        </button>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.dangerBtn}`}
                          disabled={busyId === u._id}
                          onClick={() => openDelete(u)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className={styles.count}>{filtered.length} user(s) shown</div>

      {toDelete && (
        <div className={styles.overlay} onClick={() => busyId || setToDelete(null)}>
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === 'Escape' && !busyId && setToDelete(null)}
          >
            <h2 id="delete-user-title" className={styles.dialogTitle}>
              Delete {toDelete.name || 'this user'} permanently?
            </h2>
            <p className={styles.dialogText}>
              This removes their sign-in, profile, subscription, sessions, messages, matches and
              uploaded files from Supabase. It can&apos;t be undone. To only block sign-in, use
              Deactivate instead.
            </p>
            <label className={styles.dialogLabel} htmlFor="delete-confirm">
              Type <strong>{toDelete.email}</strong> to confirm
            </label>
            <input
              id="delete-confirm"
              type="email"
              autoComplete="off"
              autoFocus
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              className={styles.searchInput}
            />
            {deleteError && (
              <p className={styles.dialogError} role="alert">
                {deleteError}
              </p>
            )}
            <div className={styles.dialogActions}>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => setToDelete(null)}
                disabled={Boolean(busyId)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.dangerSolid}`}
                onClick={handleDelete}
                disabled={
                  Boolean(busyId) ||
                  confirmEmail.trim().toLowerCase() !== toDelete.email.toLowerCase()
                }
              >
                {busyId ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
