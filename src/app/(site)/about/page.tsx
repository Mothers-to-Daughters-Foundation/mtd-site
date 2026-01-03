import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn more about MTD and our mission.',
};

export default function AboutPage() {
  return (
    <Section spacing="lg">
      <Container>
        <h1>About Us</h1>
        <p>
          This is the about page. Content will be migrated from Wix during the
          content migration phase.
        </p>
      </Container>
    </Section>
  );
}
