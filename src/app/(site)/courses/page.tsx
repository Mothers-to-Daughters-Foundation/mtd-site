import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import { getCourseCatalog } from '@/lib/courses';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Courses',
  description: 'Explore educational courses we recommend to help you grow with confidence.',
};

export default async function CoursesPage() {
  const courses = (await getCourseCatalog()).flatMap((p) => p.courses);

  return (
    <>
      <Section spacing="xl" className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>Courses</h1>
          <p className={styles.heroDescription}>
            We partner with trusted educators to bring you courses that build
            confidence, skills, and leadership.
          </p>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className={styles.coursesGrid}>
            {courses.map((course) => (
              <Card
                key={course.id}
                variant="static"
                className={styles.courseCard}
              >
                {course.featured && (
                  <Tag variant="accent" className={styles.featuredBadge}>
                    Featured
                  </Tag>
                )}
                <div className={styles.cardContent}>
                  <Tag variant="default">{course.providerName}</Tag>
                  <h2>{course.title}</h2>
                  <p>{course.description}</p>
                  <Button
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="primary"
                    size="md"
                    aria-label={`Enroll in ${course.title} on ${course.providerName} (opens in new tab)`}
                  >
                    Enroll Now ↗
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
