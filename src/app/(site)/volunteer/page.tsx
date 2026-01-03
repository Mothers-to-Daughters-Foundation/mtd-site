import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import VolunteerForm from '@/components/forms/VolunteerForm';

export const metadata: Metadata = {
  title: 'Volunteer',
  description: 'Get involved as a volunteer.',
};

export default function VolunteerPage() {
  return (
    <Section spacing="lg">
      <Container>
        <h1>Volunteer With Us</h1>
        <p>
          We&apos;re always looking for dedicated volunteers to help us make a
          difference. Fill out the form below to get started.
        </p>
        <VolunteerForm />
      </Container>
    </Section>
  );
}
