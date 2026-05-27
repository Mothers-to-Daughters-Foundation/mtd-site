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
  role: string;
  subscriptionStatus?: string;
  subscriptionTierId?: string;
  createdAt?: string;
}

interface UserTableProps {
  users: User[];
  tiers: Tier[];
}

export default function UserTable({ users: initialUsers, tiers }: UserTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [actionType, setActionType] = useState<'success' | 'error'>('success');

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

  const handleRoleChange = async (userId: string, newRole: string) => {
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
    tierId ? (tiers.find((t) => t._id === tierId)?.name ?? tierId) : '—';

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
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyCell}>
                  No users match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u._id}>
                  <td className={styles.nameCell}>
                    <div className={styles.avatar}>{u.name.charAt(0).toUpperCase()}</div>
                    {u.name}
                  </td>
                  <td className={styles.emailCell}>{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
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
                      : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className={styles.count}>{filtered.length} user(s) shown</div>
    </div>
  );
}
