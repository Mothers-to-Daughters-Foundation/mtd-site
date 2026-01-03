import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';

export const metadata: Metadata = {
  title: 'Mentors Mixer',
  description: 'Join our Mentors Mixer events to connect with other mentors and mentees.',
};

export default function MentorsMixerPage() {
  return (
    <Section spacing="lg">
      <Container>
        <h1>Mentors Mixer</h1>
        <p>
          This is the Mentors Mixer page. Content will be migrated from Wix
          during the content migration phase.
        </p>
      </Container>
    </Section>
  );
}
