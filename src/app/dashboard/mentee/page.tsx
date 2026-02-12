'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LogoutButton from '@/components/LogoutButton';
import styles from './page.module.css';

interface DashboardStats {
  coursesEnrolled: number;
  sessionsAttended: number;
  progress: number;
  badgesEarned: number;
}

interface Course {
  _id: string;
  title: string;
  instructor: string;
  duration: string;
  progress: number;
  enrolled: number;
}

interface Event {
  _id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  attendees: number;
}

interface Session {
  _id: string;
  mentorName: string;
  date: string;
  time: string;
  topic: string;
}

interface Resource {
  _id: string;
  title: string;
  type: string;
  downloads: number;
  rating: number;
}

export default function MenteeDashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    coursesEnrolled: 6,
    sessionsAttended: 8,
    progress: 65,
    badgesEarned: 2,
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
    
    if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      if (userRole !== 'mentee' && userRole !== 'admin') {
        redirect('/dashboard');
      }
      fetchDashboardData();
    }
  }, [status, session]);

  const fetchDashboardData = async () => {
    try {
      // Fetch featured courses (training materials)
      const coursesRes = await fetch('/api/materials?featured=true');
      if (coursesRes.ok) {
        const materialsData = await coursesRes.json();
        const formattedCourses = materialsData.slice(0, 4).map((m: any) => ({
          _id: m._id,
          title: m.title,
          instructor: 'Instructor Name',
          duration: m.duration ? `${m.duration} mins` : '6 weeks',
          progress: 75,
          enrolled: Math.floor(Math.random() * 200) + 50,
        }));
        setCourses(formattedCourses);
      }

      // Fetch upcoming events
      const eventsRes = await fetch('/api/events?upcoming=true');
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.slice(0, 4));
      }

      // Fetch booked sessions
      const sessionsRes = await fetch('/api/sessions?filter=upcoming');
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        const formattedSessions = sessionsData.slice(0, 4).map((s: any) => ({
          _id: s._id,
          mentorName: s.mentorName || 'Mentor',
          date: new Date(s.scheduledDate).toLocaleDateString(),
          time: new Date(s.scheduledDate).toLocaleTimeString(),
          topic: s.title,
        }));
        setSessions(formattedSessions);
      }

      // Fetch featured resources
      const resourcesRes = await fetch('/api/resources?featured=true');
      if (resourcesRes.ok) {
        const resourcesData = await resourcesRes.json();
        setResources(resourcesData.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <Section spacing="lg">
        <Container>
          <p>Loading dashboard...</p>
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
              <h1>Dashboard</h1>
              <p className={styles.welcome}>
                Welcome back, {session?.user?.name}!
              </p>
              <p className={styles.subtitle}>
                Here&apos;s what&apos;s happening in your mentorship journey.
              </p>
            </div>
            <LogoutButton />
          </div>
        </Container>
      </Section>

      {/* Stats Overview */}
      <Section spacing="md">
        <Container>
          <div className={styles.statsGrid}>
            <Card className={styles.statCard}>
              <h3 className={styles.statLabel}>Courses Enrolled</h3>
              <p className={styles.statValue}>{stats.coursesEnrolled}</p>
            </Card>
            <Card className={styles.statCard}>
              <h3 className={styles.statLabel}>Sessions Attended</h3>
              <p className={styles.statValue}>{stats.sessionsAttended}</p>
            </Card>
            <Card className={styles.statCard}>
              <h3 className={styles.statLabel}>Progress</h3>
              <p className={styles.statValue}>{stats.progress}%</p>
            </Card>
            <Card className={styles.statCard}>
              <h3 className={styles.statLabel}>Badges Earned</h3>
              <p className={styles.statValue}>{stats.badgesEarned}</p>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Featured Courses */}
      <Section spacing="lg">
        <Container>
          <div className={styles.sectionHeader}>
            <h2>Featured Courses</h2>
          </div>
          <div className={styles.coursesGrid}>
            {courses.length > 0 ? (
              courses.map((course) => (
                <Card key={course._id} className={styles.courseCard}>
                  <h3 className={styles.courseTitle}>{course.title}</h3>
                  <p className={styles.courseMeta}>{course.duration} • {course.instructor}</p>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <p className={styles.progressText}>Progress {course.progress}%</p>
                  <p className={styles.enrolledText}>Enrolled: {course.enrolled}</p>
                  <Button href={`/dashboard/mentee/materials/${course._id}`} variant="primary" size="sm">
                    Continue
                  </Button>
                </Card>
              ))
            ) : (
              <p>No courses available yet. Check back soon!</p>
            )}
          </div>
          <Button href="/dashboard/mentee/materials" variant="secondary" size="md" className={styles.loadMore}>
            Load More
          </Button>
        </Container>
      </Section>

      {/* Upcoming Events */}
      <Section spacing="lg">
        <Container>
          <div className={styles.sectionHeader}>
            <h2>Upcoming Events</h2>
          </div>
          <div className={styles.eventsGrid}>
            {events.length > 0 ? (
              events.map((event) => (
                <Card key={event._id} className={styles.eventCard}>
                  <h3 className={styles.eventTitle}>{event.title}</h3>
                  <p className={styles.eventType}>{event.type}</p>
                  <div className={styles.eventDetails}>
                    <p><strong>Date:</strong> {event.date}</p>
                    <p><strong>Time:</strong> {event.time}</p>
                    <p><strong>Persons:</strong> {event.attendees}</p>
                  </div>
                  <Button href={`/dashboard/mentee/events/${event._id}`} variant="primary" size="sm">
                    Register
                  </Button>
                </Card>
              ))
            ) : (
              <p>No upcoming events at the moment.</p>
            )}
          </div>
          <Button href="/dashboard/mentee/events" variant="secondary" size="md" className={styles.loadMore}>
            Load More
          </Button>
        </Container>
      </Section>

      {/* Booked Sessions */}
      <Section spacing="lg">
        <Container>
          <div className={styles.sectionHeader}>
            <h2>Booked Sessions</h2>
          </div>
          <div className={styles.sessionsList}>
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <Card key={session._id} className={styles.sessionCard}>
                  <div className={styles.sessionContent}>
                    <h3 className={styles.sessionTitle}>Session with {session.mentorName}</h3>
                    <p className={styles.sessionMeta}>{session.date}, {session.time} - {session.topic}</p>
                  </div>
                  <div className={styles.sessionActions}>
                    <Button href={`/dashboard/mentee/sessions/${session._id}/join`} variant="primary" size="sm">
                      Join
                    </Button>
                    <Button href={`/dashboard/mentee/sessions/${session._id}/reschedule`} variant="secondary" size="sm">
                      Reschedule
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <p>No upcoming sessions scheduled.</p>
            )}
          </div>
          <Button href="/dashboard/mentee/sessions" variant="secondary" size="md" className={styles.loadMore}>
            Load More
          </Button>
        </Container>
      </Section>

      {/* Featured Resources */}
      <Section spacing="lg">
        <Container>
          <div className={styles.sectionHeader}>
            <h2>Featured Resources</h2>
          </div>
          <div className={styles.resourcesGrid}>
            {resources.length > 0 ? (
              resources.map((resource) => (
                <Card key={resource._id} className={styles.resourceCard}>
                  <h3 className={styles.resourceTitle}>{resource.title}</h3>
                  <div className={styles.resourceMeta}>
                    <p>{resource.downloads} downloads</p>
                    <p>⭐ {resource.rating.toFixed(1)} rating</p>
                  </div>
                  <p className={styles.resourceType}>{resource.type.toUpperCase()}</p>
                  <Button href={`/api/resources/${resource._id}/download`} variant="primary" size="sm">
                    Download
                  </Button>
                </Card>
              ))
            ) : (
              <p>No resources available yet.</p>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
