import { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Legal',
  description: 'Legal information and policies for Mothers to Daughters.',
};

const documents = [
  {
    href: '/legal/privacy-policy',
    title: 'Privacy Policy',
    description:
      'How we collect, use, and protect the personal information you share with us.',
  },
  {
    href: '/legal/disclaimer',
    title: 'Disclaimer',
    description:
      'The terms and limitations that apply to the information provided on this website.',
  },
];

export default function LegalPage() {
  return (
    <Section spacing="lg">
      <Container>
        <div className={styles.content}>
          <h1>Legal</h1>
          <p className={styles.intro}>
            Mothers to Daughters is a registered 501(c)(3) nonprofit. Our
            policies below explain how we operate and protect your information.
          </p>
          <div className={styles.cardGrid}>
            {documents.map((doc) => (
              <Link key={doc.href} href={doc.href} className={styles.card}>
                <h2>{doc.title}</h2>
                <p>{doc.description}</p>
                <span className={styles.cardLink}>Read more →</span>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
