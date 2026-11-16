import { Metadata } from 'next';
import Image from 'next/image';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import ContactForm from '@/components/forms/ContactForm';
import LogoMarquee from '@/components/partners/LogoMarquee';
import Explorer from '@/components/partners/Explorer';
import PartnerTiers, { type Tier } from '@/components/partners/PartnerTiers';
import InterestButton, { PARTNER_FORM_ID, TIER_SELECT_EVENT } from '@/components/partners/InterestButton';
import { getImagePath } from '@/lib/utils';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Become a Partner',
  description:
    'Whether you give your time, expertise, or financial support, you are shaping futures and changing lives. Partner with Mothers to Daughters.',
};

const engagementAreas = [
  {
    label: 'M2D Live Events',
    title: 'M2D Live Events: Moments That Inspire, Connections That Last',
    description:
      'Held bi-annually, these dynamic events spotlight the powerful journeys of mothers and daughters in our community. We invite mission-aligned partners to sponsor these impactful conversations, creating meaningful dialogue, fostering deep connections, and amplifying shared values.',
  },
  {
    label: 'Strategic Partnerships',
    title: 'Empowering Future Leaders Through Strategic Partnerships',
    description:
      'Mothers to Daughters is collaborating with businesses to invest in mentorship to equip young women with the leadership skills they need to thrive. We seek mission-driven corporate partners who are committed to help shape the next generation of female leaders.',
  },
  {
    label: 'Strength in Community',
    title: 'Collaborate for Impact: Strength in Community',
    description:
      "Mothers to Daughters partners with like-minded communities to host powerful events that champion women's causes. Together, we foster unity, amplify voices, and drive sustainable change that lasts beyond the moment.",
  },
  {
    label: 'Bridging Generations',
    title: 'Bridging Generations, Transforming Lives',
    description:
      'Mothers to Daughters partners with schools to help young girls discover the power of intergenerational wisdom. We also collaborate with retirement homes and hospitals, creating spaces where women can share their knowledge, stories, and experiences, building connections that transcend generations.',
  },
  {
    label: 'Elevating Local Voices',
    title: 'Elevating Local Voices, Strengthening Communities',
    description:
      'Mothers to Daughters celebrates the impact of local small businesses and welcomes the opportunity to showcase and support them through our social media and website. By uplifting women-led and community-driven businesses, we create a network of empowerment and shared success.',
  },
  {
    label: 'Strengthening Futures',
    title: 'Empowering Women, Strengthening Futures',
    description:
      'Mothers to Daughters creates intergenerational programs that equip women with the knowledge, skills, and opportunities they need to thrive. In an era of uncertainty, women deserve unwavering support to build economic stability and resilience. Through employment pathways for underrepresented women, skills transfer, and access to essential social services, we create lasting impact in high-risk communities.',
  },
];

const monetaryTiers: Tier[] = [
  {
    name: 'Legacy Partner',
    amount: '$100,000+',
    audience: 'For Government, Public Sector, and High-Impact Investors:',
    benefits: [
      'Lead funding partner for mentorship and leadership development initiatives',
      'Exclusive policy advocacy collaboration to influence gender equity programs',
      'Named research partner for gender equity in education and workforce initiatives',
      'Strategic advisory role in shaping M2D’s long-term vision',
    ],
  },
  {
    name: 'Pioneer Partner',
    amount: '$75,000 - $99,999',
    benefits: [
      'Signature sponsorship of M2D’s annual leadership summit',
      'Premier branding across all M2D platforms, publications, and events',
      'VIP speaking opportunities at national and global M2D events',
      'Strategic advisory input on mentorship program development',
    ],
  },
  {
    name: 'Visionary Partner',
    amount: '$50,000 - $74,999',
    audience: 'For Corporations, Institutions & High-Net-Worth Individuals:',
    benefits: [
      'Major sponsorship of regional mentorship initiatives',
      'Featured recognition in M2D’s annual reports and marketing campaigns',
      'Priority access to M2D leadership networking events',
      'Collaborative program development opportunities',
    ],
  },
  {
    name: 'Empowerment Partner',
    amount: '$25,000 - $49,999',
    benefits: [
      'Sponsorship of flagship mentorship programs and events',
      'Prominent branding and co-marketing opportunities',
      'Speaking opportunities at M2D panels and conferences',
      'Research collaboration on gender equity and mentorship impact',
    ],
  },
  {
    name: 'Impact Partner',
    amount: '$10,000 - $24,999',
    benefits: [
      'Sponsorship of key mentorship events and initiatives',
      'Recognition across M2D platforms, including digital and print',
      'Collaboration opportunities on mentorship programs and research',
    ],
  },
  {
    name: 'Catalyst Partner',
    amount: '$5,000 - $9,999',
    benefits: [
      'Event sponsorship and program support',
      'Recognition in select marketing materials and annual reports',
      'Workshop and research participation',
    ],
  },
  {
    name: 'Champion Partner',
    amount: '$1,000 - $4,999',
    benefits: [
      'Supporting sponsorship of initiatives',
      'Digital recognition on M2D’s platforms',
      'Access to leadership workshops and mentorship events',
    ],
  },
];

const inKindTiers: Tier[] = [
  {
    name: 'Strategic Ally (Non-Monetary)',
    audience: 'For Media, Nonprofits, and Community Organizations:',
    benefits: [
      'Venue hosting for mentorship events and leadership summits',
      'Professional services (marketing, legal, financial consulting)',
      'Technology and digital platform support for M2D initiatives',
      'Media production, content creation, and storytelling campaigns',
    ],
  },
  {
    name: 'Collaborative Partner (Non-Monetary)',
    audience: 'For Nonprofit & Community Organizations:',
    benefits: [
      'Joint programming and resource-sharing initiatives',
      'Mutual referrals and ecosystem-building opportunities',
      'Co-developed mentorship workshops and leadership events',
      'Joint funding proposals for mentorship programs',
    ],
  },
];

export default function PartnerPage() {
  return (
    <>
      <Section spacing="xl" className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>Support our Mission</h1>
          <p className={styles.heroDescription}>
            Intentional actions create impact. Big or small, it matters.
          </p>
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className={styles.intro}>
            <div className={styles.introText}>
              <p>
                Whether you give your time, expertise, or financial support, you
                are shaping futures and changing lives. Your generosity, alongside
                our community of supporters, fuels our mission and brings us
                closer to empowering the next generation.
              </p>
              <p className={styles.introCallout}>
                Join us in making a lasting difference.
              </p>
            </div>
            <div className={styles.introImage}>
              <Image
                src={getImagePath('/images/partner/support-our-mission.webp')}
                alt="Empowered women uniting in a safe, inclusive space to engage, educate & empower through M2D’s mentorship and sisterhood."
                width={1200}
                height={675}
                className={styles.introImageContent}
              />
            </div>
          </div>

          <div className={styles.partners}>
            <h2>Brands that have partnered with us</h2>
            <LogoMarquee />
          </div>
        </Container>
      </Section>

      <Section spacing="lg" className={styles.engagementSection}>
        <Container>
          <h2 className={styles.sectionTitle}>Visual Engagement</h2>
          <Explorer
            label="Ways to engage with Mothers to Daughters"
            items={engagementAreas.map((area) => ({
              id: area.label,
              label: area.label,
              content: (
                <div className={styles.engagementDetail}>
                  <h3>{area.title}</h3>
                  <p>{area.description}</p>
                  <InterestButton label="Partner with us on this" />
                </div>
              ),
            }))}
          />
        </Container>
      </Section>

      <Section spacing="lg">
        <Container>
          <div className={styles.partnershipTypes}>
            <h2>
              Financial contributions and in-kind support (services, expertise,
              resources)
            </h2>
            <PartnerTiers financial={monetaryTiers} inKind={inKindTiers} />
          </div>
        </Container>
      </Section>

      <Section spacing="lg" className={styles.formSection}>
        <Container>
          <div className={styles.ctaSection} id={PARTNER_FORM_ID}>
            <h2>Partnership/Sponsorship Tiers</h2>
            <div className={styles.formContainer}>
              <ContactForm
                nameLabel="First and Last name"
                includeCompany
                includeSubject={false}
                includeMessage={false}
                formSubject="Partnership interest"
                selectEvent={TIER_SELECT_EVENT}
                checkboxGroup={{
                  name: 'tiers',
                  legend: 'Select Your Preferred Partnership Tier (check all that apply):',
                  options: monetaryTiers.map((tier) => `${tier.name} (${tier.amount})`),
                }}
                submitLabel="Submit Your Partnership Interest"
                successMessage="Thanks for submitting!"
              />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
