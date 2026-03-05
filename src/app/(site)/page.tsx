import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import NewsletterFormInline from '@/components/forms/NewsletterFormInline';
import { getAllPosts } from '@/lib/mdx';
import { getAllEvents } from '@/lib/mdx';
import { getImagePath } from '@/lib/utils';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Bridging Generations. Empowering Women. Mothers to Daughters connects women across generations through mentorship and support.',
};

export default function HomePage() {
  const recentPosts = getAllPosts().slice(0, 2);
  const recentEvents = getAllEvents()
    .filter((event) => new Date(event.frontmatter.date) >= new Date())
    .slice(0, 1);
  
  // Combine and sort by date, take latest 3
  const allContent = [
    ...recentPosts.map((post) => ({
      type: 'blog' as const,
      title: post.frontmatter.title,
      slug: post.slug,
      date: post.frontmatter.date,
      excerpt: post.frontmatter.excerpt,
      image: post.frontmatter.image,
    })),
    ...recentEvents.map((event) => ({
      type: 'event' as const,
      title: event.frontmatter.title,
      slug: event.slug,
      date: event.frontmatter.date,
      excerpt: event.frontmatter.excerpt,
      image: event.frontmatter.image,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <>
      {/* Hero Section */}
      <Section spacing="none" className={styles.hero}>
        <Container>
          <div className={styles.heroGrid}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                Bridging Generations. Empowering Women.
              </h1>
              <p className={styles.heroSubhead}>
                We connect young women with experienced mentors to foster
                personal growth, professional development, and meaningful
                intergenerational relationships.
              </p>
              <div className={styles.heroActions}>
                <Button href="/donate" variant="primary" size="lg">
                  Support Our Mission
                </Button>
                <Button href="/register" variant="secondary" size="lg">
                  Join the Community
                </Button>
              </div>
            </div>
            <div className={styles.heroImage}>
              <Image
                src={getImagePath("/images/Heroimage.jpg")}
                alt="Diverse group of women representing intergenerational mentorship and empowerment"
                width={800}
                height={600}
                className={styles.heroImageContent}
                priority
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* Empowering Young Women */}
      <Section spacing="sm" className={styles.empowerSection}>
        <Container>
          <div className={styles.empowerContent}>
            <div className={styles.empowerImage}>
              <Image
                src={getImagePath("/images/empowering.jpg")}
                alt="Two women engaged in mentorship, looking at a book together"
                width={600}
                height={450}
                className={styles.empowerImageContent}
              />
            </div>
            <div className={styles.empowerText}>
              <h2 className={styles.empowerTitle}>Empowering Young Women to Become Leaders</h2>
              <p className={styles.empowerDescription}>
                We connect young women with experienced leaders to mentor them, imparting wisdom that fuels economic independence and inspires them to mentor the next generation.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Programs Overview */}
      <Section spacing="lg">
        <Container>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Embark on a New Chapter</h2>
            <p className={styles.sectionSubheading}>
              There are a couple of meaningful ways to participate in our community.
            </p>
          </div>
          <div className={styles.programsGrid}>
            <div className={styles.programCard}>
              <div className={styles.programImage}>
                <Image
                  src={getImagePath("/images/intergenerational.jpg")}
                  alt="Diverse group of women representing intergenerational mentorship"
                  width={600}
                  height={450}
                  className={styles.programImageContent}
                />
              </div>
              <div className={styles.programContent}>
                <h3>Intergenerational Mentoring Cohort Program</h3>
                <p>
                  Mothers to Daughters (M2D) offers a high-impact mentorship program designed to equip young women with the entrepreneurial mindset, strategies, and leadership skills needed to excel. Through immersive mentorship and hands-on workshops.
                </p>
                <Link href="/programs" className={styles.learnMoreLink}>
                  Learn more →
                </Link>
              </div>
            </div>
            <div className={`${styles.programCard} ${styles.programCardReversed}`}>
              <div className={styles.programImage}>
                <Image
                  src={getImagePath("/images/slackcommunity.avif")}
                  alt="Slack community workspace showing collaboration and connection"
                  width={600}
                  height={450}
                  className={styles.programImageContent}
                />
              </div>
              <div className={styles.programContent}>
                <h3>Join Our Free Slack Community</h3>
                <p>
                  Here you will have an opportunity to connect, find support and ask questions.
                </p>
                <Link href="/programs" className={styles.learnMoreLink}>
                  Learn more →
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Impact Metrics */}
      <Section spacing="lg" className={styles.metricsSection}>
        <Container>
          <h2 className={styles.metricsTitle}>Our Impact</h2>
          <p className={styles.metricsExplainer}>
            Measured impact from our global community
          </p>
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricNumber}>5</div>
              <div className={styles.metricLabel}>Years in the Business</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricNumber}>100+</div>
              <div className={styles.metricLabel}>Women Mentored</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricNumber}>300+</div>
              <div className={styles.metricLabel}>Events Held</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricNumber}>$200k+</div>
              <div className={styles.metricLabel}>Donations</div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Donate CTA */}
      <Section spacing="lg" className={styles.donateCTASection}>
        <Container>
          <div className={styles.donateCTAContent}>
            <h2 className={styles.donateCTATitle}>
              She Could Be Your Daughter. Your Sister. Your Future Leader.
            </h2>
            <Button href="/donate" variant="primary" size="lg">
              Donate Now
            </Button>
          </div>
        </Container>
      </Section>

      {/* Impact Stories (Condensed) */}
      <Section spacing="md" className={styles.donateCTASection}>
        <Container>
          <div className={styles.storiesContent}>
            <blockquote className={styles.featuredQuote}>
              <span className={styles.quoteMark}>&ldquo;</span>
              <p className={styles.quoteText}>
                This program changed my perspective on what I could achieve. My
                mentor helped me see possibilities I never imagined.
              </p>
              <cite className={styles.quoteAuthor}>
                — Program Participant, Mentee
              </cite>
            </blockquote>
            <div className={styles.storiesLink}>
              <a href="/blog" className={styles.readMoreLink}>
                Read more stories →
              </a>
            </div>
          </div>
        </Container>
      </Section>

      {/* Partners */}
      <Section spacing="lg" className={styles.partnersSection}>
        <Container>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Our Amazing Partners</h2>
            <p className={styles.sectionDescription}>
              We&apos;re so grateful for the support of these organizations and individuals
            </p>
          </div>
          <div className={styles.partnersGrid}>
            <div className={styles.partnerLogo}>
              <Image
                src={getImagePath("/images/partner_6ix.avif")}
                alt="6ix"
                width={200}
                height={100}
                className={styles.partnerImage}
              />
            </div>
            <div className={styles.partnerLogo}>
              <Image
                src={getImagePath("/images/partner_arianamarquis.avif")}
                alt="Ariana Marquis"
                width={200}
                height={100}
                className={styles.partnerImage}
              />
            </div>
            <div className={styles.partnerLogo}>
              <Image
                src={getImagePath("/images/partner_brandedcities.avif")}
                alt="Branded Cities"
                width={200}
                height={100}
                className={styles.partnerImage}
              />
            </div>
            <div className={styles.partnerLogo}>
              <Image
                src={getImagePath("/images/partner_elevateher.avif")}
                alt="Elevate Her"
                width={200}
                height={100}
                className={styles.partnerImage}
              />
            </div>
            <div className={styles.partnerLogo}>
              <Image
                src={getImagePath("/images/partner_flounleashed.avif")}
                alt="FLO Unleashed"
                width={200}
                height={100}
                className={styles.partnerImage}
              />
            </div>
            <div className={styles.partnerLogo}>
              <Image
                src={getImagePath("/images/partner_fredas.avif")}
                alt="Freda's"
                width={200}
                height={100}
                className={styles.partnerImage}
              />
            </div>
            <div className={styles.partnerLogo}>
              <Image
                src={getImagePath("/images/partner_immigrantwomen.avif")}
                alt="Immigrant Women"
                width={200}
                height={100}
                className={styles.partnerImage}
              />
            </div>
            <div className={styles.partnerLogo}>
              <Image
                src={getImagePath("/images/partner_indeed.avif")}
                alt="Indeed"
                width={200}
                height={100}
                className={styles.partnerImage}
              />
            </div>
            <div className={styles.partnerLogo}>
              <Image
                src={getImagePath("/images/partner_jute.avif")}
                alt="Jute"
                width={200}
                height={100}
                className={styles.partnerImage}
              />
            </div>
            <div className={styles.partnerLogo}>
              <Image
                src={getImagePath("/images/partner_lux.avif")}
                alt="Lux"
                width={200}
                height={100}
                className={styles.partnerImage}
              />
            </div>
            <div className={styles.partnerLogo}>
              <Image
                src={getImagePath("/images/partner_mave.avif")}
                alt="Mave"
                width={200}
                height={100}
                className={styles.partnerImage}
              />
            </div>
            <div className={styles.partnerLogo}>
              <Image
                src={getImagePath("/images/partner_microsoft.avif")}
                alt="Microsoft"
                width={200}
                height={100}
                className={styles.partnerImage}
              />
            </div>
            <div className={styles.partnerLogo}>
              <Image
                src={getImagePath("/images/partner_mintroom.avif")}
                alt="Mint Room"
                width={200}
                height={100}
                className={styles.partnerImage}
              />
            </div>
            <div className={styles.partnerLogo}>
              <Image
                src={getImagePath("/images/partner_pressthebest.avif")}
                alt="Press The Best"
                width={200}
                height={100}
                className={styles.partnerImage}
              />
            </div>
            <div className={styles.partnerLogo}>
              <Image
                src={getImagePath("/images/partner_rondyce.avif")}
                alt="Rondyce"
                width={200}
                height={100}
                className={styles.partnerImage}
              />
            </div>
            <div className={styles.partnerLogo}>
              <Image
                src={getImagePath("/images/partner_spartancafe.avif")}
                alt="Spartan Cafe"
                width={200}
                height={100}
                className={styles.partnerImage}
              />
            </div>
            <div className={styles.partnerLogo}>
              <Image
                src={getImagePath("/images/partner_timeschange.avif")}
                alt="Times Change"
                width={200}
                height={100}
                className={styles.partnerImage}
              />
            </div>
            <div className={styles.partnerLogo}>
              <Image
                src={getImagePath("/images/partner_uef.avif")}
                alt="UEF"
                width={200}
                height={100}
                className={styles.partnerImage}
              />
            </div>
            <div className={styles.partnerLogo}>
              <Image
                src={getImagePath("/images/partner_vision2reality.avif")}
                alt="Vision 2 Reality"
                width={200}
                height={100}
                className={styles.partnerImage}
              />
            </div>
            <div className={styles.partnerLogo}>
              <Image
                src={getImagePath("/images/partner_zestylifestyle.avif")}
                alt="Zesty Lifestyle"
                width={200}
                height={100}
                className={styles.partnerImage}
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* Founder Statement */}
      <Section spacing="lg" className={styles.founderSection}>
        <Container>
          <div className={styles.founderContent}>
            <div className={styles.founderImage}>
              <Image
                src={getImagePath("/images/francine.jpg")}
                alt="Founder of Mothers to Daughters"
                width={500}
                height={600}
                className={styles.founderImageContent}
              />
            </div>
            <div className={styles.founderText}>
              <h2 className={styles.founderTitle}>A Message from Our Founder</h2>
              <p className={styles.founderStatement}>
                At Mothers to Daughters, we cultivate powerful relationships where Mothers (Mentors) equip Daughters (Mentees) with the tools to thrive socially and economically. In turn, Daughters honor this wisdom by applying it in their lives and to future generations, ensuring its impact extends beyond today. Intergenerational mentoring is more than guidance; it&apos;s a mindset that sparks real change. Having a support system has guided me through challenges, and I am committed to sharing its benefits.
              </p>
              <div className={styles.founderSignature}>
                <div className={styles.founderName}>Francine Mbvoumbo</div>
                <div className={styles.founderRole}>Chair & President</div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Join the Community (Primary Conversion) */}
      <Section spacing="xl" className={styles.joinSection}>
        <Container>
          <div className={styles.joinContent}>
            <h2 className={styles.joinTitle}>Stay Connected</h2>
            <p className={styles.joinDescription}>
              Get updates on programs, events, and stories from our community.
            </p>
            <NewsletterFormInline />
          </div>
        </Container>
      </Section>

      {/* Content Feed (Blog / Media) */}
      <Section spacing="lg" className={styles.contentFeedSection}>
        <Container>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>We&apos;re Making Waves</h2>
          </div>
          {allContent.length > 0 ? (
            <div className={styles.contentGrid}>
              {allContent.map((item) => (
                <Card
                  key={`${item.type}-${item.slug}`}
                  href={item.type === 'blog' ? `/blog/${item.slug}` : `/events/${item.slug}`}
                  className={styles.contentCard}
                >
                  <div className={styles.contentImage}>
                    {item.image ? (
                      <Image
                        src={getImagePath(item.image)}
                        alt={item.title}
                        width={400}
                        height={250}
                        className={styles.cardImage}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <span>Image</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.contentCardBody}>
                    <h3>{item.title}</h3>
                    <time dateTime={item.date} className={styles.contentDate}>
                      {new Date(item.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className={styles.noContent}>No content yet. Check back soon!</p>
          )}
          <div className={styles.contentFeedCTA}>
            <Button href="/blog" variant="secondary" size="md">
              View all stories
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
