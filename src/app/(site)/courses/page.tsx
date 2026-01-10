import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Courses',
  description: 'Explore our educational courses designed to empower and educate.',
};

export default function CoursesPage() {
  const courses: Array<{
    slug: string;
    title: string;
    description: string;
    featured?: boolean;
    new?: boolean;
  }> = [
    // Course data will be added during content migration
  ];

  return (
    <>
      <Section spacing="xl" className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>Courses</h1>
          <p className={styles.heroDescription}>
            Explore our educational offerings designed to empower and inspire.
          </p>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          {courses.length === 0 ? (
            <div className={styles.placeholder}>
              <p>Course information will be added during content migration.</p>
            </div>
          ) : (
            <div className={styles.coursesGrid}>
              {courses.map((course: any) => (
                <Card
                  key={course.slug}
                  href={`/courses/${course.slug}`}
                  className={styles.courseCard}
                >
                  {course.featured && (
                    <Tag variant="accent" className={styles.featuredBadge}>
                      Featured
                    </Tag>
                  )}
                  {course.new && (
                    <Tag variant="default" className={styles.newBadge}>
                      New
                    </Tag>
                  )}
                  <div className={styles.cardImage}>
                    <div className={styles.imagePlaceholder}>
                      <span>Course Image</span>
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <h2>{course.title}</h2>
                    <p>{course.description}</p>
                    <Button
                      href={`/courses/${course.slug}`}
                      variant="primary"
                      size="md"
                    >
                      Learn More
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
