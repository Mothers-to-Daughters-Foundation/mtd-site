'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  emailVerified?: boolean;
  subscriptionStatus?: string;
  createdAt: string;
}

interface UserStats {
  total: number;
  mentors: number;
  mentees: number;
  donors: number;
  admins: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/users?action=stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates: { role } }),
      });

      if (!response.ok) throw new Error('Failed to update role');
      
      await fetchUsers();
      await fetchStats();
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update user role');
    }
  };

  if (loading) {
    return (
      <Section spacing="lg">
        <Container>
          <p>Loading...</p>
        </Container>
      </Section>
    );
  }

  return (
    <>
      <Section spacing="lg" className={styles.header}>
        <Container>
          <div className={styles.headerContent}>
            <h1>User Management</h1>
            <Button href="/dashboard/admin" variant="secondary" size="md">
              Back to Dashboard
            </Button>
          </div>
        </Container>
      </Section>

      {stats && (
        <Section spacing="md">
          <Container>
            <div className={styles.statsGrid}>
              <Card className={styles.statCard}>
                <h3>Total Users</h3>
                <p className={styles.statNumber}>{stats.total}</p>
              </Card>
              <Card className={styles.statCard}>
                <h3>Mentors</h3>
                <p className={styles.statNumber}>{stats.mentors}</p>
              </Card>
              <Card className={styles.statCard}>
                <h3>Mentees</h3>
                <p className={styles.statNumber}>{stats.mentees}</p>
              </Card>
              <Card className={styles.statCard}>
                <h3>Donors</h3>
                <p className={styles.statNumber}>{stats.donors}</p>
              </Card>
            </div>
          </Container>
        </Section>
      )}

      <Section spacing="lg">
        <Container>
          <Card>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        {editingUser?._id === user._id ? (
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className={styles.roleSelect}
                          >
                            <option value="mentee">Mentee</option>
                            <option value="mentor">Mentor</option>
                            <option value="donor">Donor</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`${styles.badge} ${styles[user.role]}`}>
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td>
                        {user.subscriptionStatus ? (
                          <span className={`${styles.badge} ${styles[user.subscriptionStatus]}`}>
                            {user.subscriptionStatus}
                          </span>
                        ) : (
                          <span className={styles.badge}>-</span>
                        )}
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        {editingUser?._id === user._id ? (
                          <div className={styles.actionButtons}>
                            <button
                              onClick={() => handleRoleChange(user._id, newRole)}
                              className={styles.saveButton}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className={styles.cancelButton}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setNewRole(user.role);
                            }}
                            className={styles.editButton}
                          >
                            Edit Role
                            </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Container>
      </Section>
    </>
  );
}
