import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';

export const metadata: Metadata = {
  title: 'Programs',
  description: 'Explore our mentor and mentee programs.',
};

export default function ProgramsPage() {
  return (
    <Section spacing="lg">
      <Container>
        <h1>Our Programs</h1>
        <p>
          This is the programs page. Content will be migrated from Wix during
          the content migration phase.
        </p>
      </Container>
    </Section>
  );
}
