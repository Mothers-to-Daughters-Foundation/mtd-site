'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Connect to real-time metrics stream
    const connectToStream = () => {
      const eventSource = new EventSource('/api/admin/metrics/realtime');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setConnected(true);
        setLoading(false);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setUserStats(data.userStats);
          setSubscriptionStats(data.subscriptionStats);
          setLastUpdate(new Date(data.timestamp).toLocaleTimeString());
        } catch (error) {
          console.error('Error parsing metrics data:', error);
        }
      };

      eventSource.onerror = () => {
        setConnected(false);
        eventSource.close();
        // Reconnect after 5 seconds
        setTimeout(connectToStream, 5000);
      };
    };

    connectToStream();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  if (loading) {
    return (
      <Section spacing="lg">
        <Container>
          <p>Loading real-time analytics...</p>
        </Container>
      </Section>
    );
  }

  return (
    <>
      <Section spacing="lg" className={styles.header}>
        <Container>
          <div className={styles.headerContent}>
            <div>
              <h1>Platform Analytics</h1>
              <div className={styles.statusBar}>
                <span className={connected ? styles.statusConnected : styles.statusDisconnected}>
                  {connected ? '● Live' : '○ Disconnected'}
                </span>
                {lastUpdate && <span className={styles.lastUpdate}>Last updated: {lastUpdate}</span>}
              </div>
            </div>
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
                <div className={styles.pulseIndicator} />
              </Card>
              <Card className={styles.statCard}>
                <div className={styles.statIcon}>🎓</div>
                <h3>Mentees</h3>
                <p className={styles.statNumber}>{userStats.mentees}</p>
                <p className={styles.statPercentage}>
                  {userStats.total > 0 ? ((userStats.mentees / userStats.total) * 100).toFixed(1) : 0}% of total
                </p>
              </Card>
              <Card className={styles.statCard}>
                <div className={styles.statIcon}>👨‍🏫</div>
                <h3>Mentors</h3>
                <p className={styles.statNumber}>{userStats.mentors}</p>
                <p className={styles.statPercentage}>
                  {userStats.total > 0 ? ((userStats.mentors / userStats.total) * 100).toFixed(1) : 0}% of total
                </p>
              </Card>
              <Card className={styles.statCard}>
                <div className={styles.statIcon}>💝</div>
                <h3>Donors</h3>
                <p className={styles.statNumber}>{userStats.donors}</p>
                <p className={styles.statPercentage}>
                  {userStats.total > 0 ? ((userStats.donors / userStats.total) * 100).toFixed(1) : 0}% of total
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
                <div className={styles.pulseIndicator} />
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
                      {userStats.total > 0 ? ((userStats.mentees + userStats.mentors) / userStats.total * 100).toFixed(1) : 0}%
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
