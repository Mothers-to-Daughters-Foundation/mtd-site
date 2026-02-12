'use client';

import { useState, useEffect } from 'react';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

interface UserStats {
  total: number;
  mentors: number;
  mentees: number;
  donors: number;
  admins: number;
}

interface SubscriptionStats {
  total: number;
  active: number;
  inactive: number;
  cancelled: number;
}

export default function AdminAnalyticsPage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersResponse, subsResponse] = await Promise.all([
        fetch('/api/admin/users?action=stats'),
        fetch('/api/admin/subscriptions?action=stats'),
      ]);

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUserStats(usersData);
      }

      if (subsResponse.ok) {
        const subsData = await subsResponse.json();
        setSubscriptionStats(subsData);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Section spacing="lg">
        <Container>
          <p>Loading analytics...</p>
        </Container>
      </Section>
    );
  }

  return (
    <>
      <Section spacing="lg" className={styles.header}>
        <Container>
          <div className={styles.headerContent}>
            <h1>Platform Analytics</h1>
            <Button href="/dashboard/admin" variant="secondary" size="md">
              Back to Dashboard
            </Button>
          </div>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <h2>User Statistics</h2>
          {userStats && (
            <div className={styles.statsGrid}>
              <Card className={styles.statCard}>
                <div className={styles.statIcon}>👥</div>
                <h3>Total Users</h3>
                <p className={styles.statNumber}>{userStats.total}</p>
              </Card>
              <Card className={styles.statCard}>
                <div className={styles.statIcon}>🎓</div>
                <h3>Mentees</h3>
                <p className={styles.statNumber}>{userStats.mentees}</p>
                <p className={styles.statPercentage}>
                  {((userStats.mentees / userStats.total) * 100).toFixed(1)}% of total
                </p>
              </Card>
              <Card className={styles.statCard}>
                <div className={styles.statIcon}>👨‍🏫</div>
                <h3>Mentors</h3>
                <p className={styles.statNumber}>{userStats.mentors}</p>
                <p className={styles.statPercentage}>
                  {((userStats.mentors / userStats.total) * 100).toFixed(1)}% of total
                </p>
              </Card>
              <Card className={styles.statCard}>
                <div className={styles.statIcon}>💝</div>
                <h3>Donors</h3>
                <p className={styles.statNumber}>{userStats.donors}</p>
                <p className={styles.statPercentage}>
                  {((userStats.donors / userStats.total) * 100).toFixed(1)}% of total
                </p>
              </Card>
            </div>
          )}
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <h2>Subscription Statistics</h2>
          {subscriptionStats && (
            <div className={styles.statsGrid}>
              <Card className={styles.statCard}>
                <div className={styles.statIcon}>📊</div>
                <h3>Total Subscriptions</h3>
                <p className={styles.statNumber}>{subscriptionStats.total}</p>
              </Card>
              <Card className={styles.statCard}>
                <div className={styles.statIcon}>✅</div>
                <h3>Active</h3>
                <p className={styles.statNumber}>{subscriptionStats.active}</p>
                <p className={styles.statPercentage}>
                  {subscriptionStats.total > 0
                    ? ((subscriptionStats.active / subscriptionStats.total) * 100).toFixed(1)
                    : 0}% of total
                </p>
              </Card>
              <Card className={styles.statCard}>
                <div className={styles.statIcon}>⏸️</div>
                <h3>Inactive</h3>
                <p className={styles.statNumber}>{subscriptionStats.inactive}</p>
                <p className={styles.statPercentage}>
                  {subscriptionStats.total > 0
                    ? ((subscriptionStats.inactive / subscriptionStats.total) * 100).toFixed(1)
                    : 0}% of total
                </p>
              </Card>
              <Card className={styles.statCard}>
                <div className={styles.statIcon}>❌</div>
                <h3>Cancelled</h3>
                <p className={styles.statNumber}>{subscriptionStats.cancelled}</p>
                <p className={styles.statPercentage}>
                  {subscriptionStats.total > 0
                    ? ((subscriptionStats.cancelled / subscriptionStats.total) * 100).toFixed(1)
                    : 0}% of total
                </p>
              </Card>
            </div>
          )}
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <Card>
            <h2>Key Metrics</h2>
            <div className={styles.metricsGrid}>
              {userStats && subscriptionStats && (
                <>
                  <div className={styles.metric}>
                    <h4>Mentee-to-Mentor Ratio</h4>
                    <p className={styles.metricValue}>
                      {userStats.mentors > 0
                        ? (userStats.mentees / userStats.mentors).toFixed(2)
                        : 'N/A'}:1
                    </p>
                  </div>
                  <div className={styles.metric}>
                    <h4>Subscription Rate</h4>
                    <p className={styles.metricValue}>
                      {userStats.mentees > 0
                        ? ((subscriptionStats.active / userStats.mentees) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                  <div className={styles.metric}>
                    <h4>Active User Ratio</h4>
                    <p className={styles.metricValue}>
                      {((userStats.mentees + userStats.mentors) / userStats.total * 100).toFixed(1)}%
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>
        </Container>
      </Section>
    </>
  );
}
