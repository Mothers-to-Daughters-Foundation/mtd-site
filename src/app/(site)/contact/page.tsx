import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import ContactForm from '@/components/forms/ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with us.',
};

export default function ContactPage() {
  return (
    <Section spacing="lg">
      <Container>
        <h1>Contact Us</h1>
        <ContactForm />
      </Container>
    </Section>
  );
}
