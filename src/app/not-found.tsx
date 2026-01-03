import Link from 'next/link';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <Section spacing="lg">
      <Container>
        <div style={{ textAlign: 'center' }}>
          <h1>404 - Page Not Found</h1>
          <p>The page you&apos;re looking for doesn&apos;t exist.</p>
          <Button href="/" variant="primary">
            Go Home
          </Button>
        </div>
      </Container>
    </Section>
  );
}
