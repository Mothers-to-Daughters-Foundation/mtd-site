import { getAllTiers } from '@/lib/models/SubscriptionTier';
import TierCard from '@/components/membership/TierCard';
import styles from './page.module.css';

export const metadata = {
  title: 'Membership | Mothers to Daughters Foundation',
  description:
    'Choose a membership plan and join the Mothers to Daughters mentorship community.',
};

// Revalidate every hour so new tiers appear without a full redeploy
export const revalidate = 3600;

export default async function MembershipPage() {
  let tiers: Awaited<ReturnType<typeof getAllTiers>> = [];
  try {
    tiers = await getAllTiers();
  } catch {
    // DB not available (e.g. static export build) — render empty state gracefully
  }
  const activeTiers = tiers.filter((t) => t.isActive);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Membership Plans</h1>
        <p className={styles.heroSubtitle}>
          Join our mentorship community. Every plan gives you access to
          dedicated mentors who are passionate about uplifting the next
          generation.
        </p>
      </section>

      {activeTiers.length === 0 ? (
        <section className={styles.empty}>
          <p>Membership plans are coming soon. Check back shortly or</p>
          <a href="/contact" className={styles.contactLink}>
            contact us
          </a>
          <p>to learn more.</p>
        </section>
      ) : (
        <section className={styles.tiersGrid}>
          {activeTiers.map((tier) => (
            <TierCard
              key={tier._id?.toString()}
              id={tier._id?.toString() ?? ''}
              name={tier.name}
              description={tier.description ?? ''}
              pricePerMonth={tier.pricePerMonth}
              features={tier.features}
              zeffyUrl={tier.zeffyUrl}
              isDefault={tier.isDefault}
            />
          ))}
        </section>
      )}

      <section className={styles.faq}>
        <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
        <div className={styles.faqGrid}>
          {faqs.map((faq) => (
            <div key={faq.q} className={styles.faqItem}>
              <h3 className={styles.faqQ}>{faq.q}</h3>
              <p className={styles.faqA}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

const faqs = [
  {
    q: 'How does the mentorship work?',
    a: "Once you sign up, our team will match you with a mentor based on your goals and background. You'll meet regularly at a cadence that works for both of you.",
  },
  {
    q: 'Can I cancel my membership?',
    a: 'Yes. You can cancel anytime from your dashboard. Your access continues until the end of the current billing period.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit/debit cards via Stripe, and some plans also support donations via Zeffy.',
  },
  {
    q: 'I have more questions.',
    a: "Reach out to us through our Contact page and we'll be happy to help.",
  },
];
