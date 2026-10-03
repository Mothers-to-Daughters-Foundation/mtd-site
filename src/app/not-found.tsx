import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main>
        <Section spacing="xl">
          <Container>
            <div className={styles.wrapper}>
              <p className={styles.code}>404</p>
              <h1 className={styles.title}>This page wandered off</h1>
              <p className={styles.message}>
                The page you&apos;re looking for doesn&apos;t exist or may have
                moved. Let&apos;s get you back on track.
              </p>
              <div className={styles.actions}>
                <Button href="/" variant="primary" size="lg">
                  Back to Home
                </Button>
                <Button href="/programs" variant="secondary" size="lg">
                  Explore Programs
                </Button>
                <Button href="/contact" variant="ghost" size="lg">
                  Contact Us
                </Button>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
