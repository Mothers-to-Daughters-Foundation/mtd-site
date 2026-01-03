import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';

export const metadata: Metadata = {
  title: 'Partner',
  description: 'Partner with us to make a difference.',
};

export default function PartnerPage() {
  return (
    <Section spacing="lg">
      <Container>
        <h1>Partner With Us</h1>
        <p>
          This is the partner page. Content will be migrated from Wix during
          the content migration phase.
        </p>
      </Container>
    </Section>
  );
}
