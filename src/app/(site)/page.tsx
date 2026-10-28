import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import NewsletterFormInline from '@/components/forms/NewsletterFormInline';
import ImpactStories from '@/components/marketing/ImpactStories';
import { getAllPosts } from '@/lib/mdx';
import { getAllEvents } from '@/lib/mdx';
import { getImagePath } from '@/lib/utils';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Bridging the Generational Gap. We envision a world where women of all generations thrive through intergenerational wisdom.',
};

const founderStatement =
  '“Intergenerational mentoring is more than guidance—it’s a catalyst for change. It has guided me through challenges, and I am committed to sharing its benefits. At Mothers to Daughters, we cultivate powerful relationships where Mothers (Mentors) equip Daughters (Mentees) with the tools to thrive socially and economically. In turn, Daughters honor this wisdom by applying it, ensuring its impact extends beyond today. Together, we don’t just share knowledge—we build a lasting legacy of growth, transformation, and empowered women shaping the future.”';

const areasOfFocus = [
  {
    title: 'Equip Mothers & Daughters:',
    description: 'Empower women entrepreneurs through cross-generational mentorship.',
  },
  {
    title: 'Invite and Engage Male Allies to seat at our table:',
    description: 'Mobilize men to champion women’s entrepreneurial ambitions.',
  },
  {
    title: 'Highlight Impact Stories:',
    description: 'Share real experiences that inspire and drive change.',
  },
  {
    title: 'Curate Transformative Experiences:',
    description: 'Host workshops and gatherings that spark growth and connection.',
  },
  {
    title: 'Create Engaging Resources:',
    description: 'Develop eBooks, toolkits, and a partner portal for ongoing learning.',
  },
  {
    title: 'Activate Strategic Partnerships:',
    description: 'Build alliances to amplify reach and impact.',
  },
];

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
              <h1 className={styles.heroTitle}>Bridging the Generational Gap</h1>
              <p className={styles.heroSubhead}>
                We envision a world where women of all generations thrive through
                intergenerational wisdom
              </p>
              <div className={styles.heroActions}>
                <Button href="/donate" variant="primary" size="lg">
                  Donate
                </Button>
                <Button href="/contact" variant="secondary" size="lg">
                  Contact Us
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

      <ImpactStories />

      {/* Vision & Mission */}
      <Section spacing="lg" className={styles.visionSection}>
        <Container>
          <div className={styles.visionGrid}>
            <div className={styles.visionCard}>
              <div className={styles.visionText}>
                <h2 className={styles.visionTitle}>Vision</h2>
                <p>
                  We envision a world where women of all generations thrive
                  through intergenerational wisdom, driving inclusivity and gender
                  equity for lasting global economic and social impact.
                </p>
              </div>
              <div className={styles.visionImage}>
                <Image
                  src={getImagePath('/images/home/vision.webp')}
                  alt="Woman exploring new possibilities with a virtual reality headset"
                  width={900}
                  height={600}
                  className={styles.visionImageContent}
                />
              </div>
            </div>
            <div className={`${styles.visionCard} ${styles.visionCardReversed}`}>
              <div className={styles.visionText}>
                <h2 className={styles.visionTitle}>Mission</h2>
                <p>
                  We empower young women by connecting them with the wisdom and
                  insights of successful women, fostering economic independence,
                  resilience, and transformative leadership through innovation and
                  mentorship.
                </p>
              </div>
              <div className={styles.visionImage}>
                <Image
                  src={getImagePath('/images/cheerful-young-female-camper-dressed-ora.avif')}
                  alt="Cheerful young woman with a backpack ready for an adventure"
                  width={594}
                  height={770}
                  className={styles.visionImageContent}
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Programs Overview */}
      <Section spacing="lg">
        <Container>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Programs</h2>
          </div>
          <div className={styles.programsGrid}>
            <div className={styles.programCard}>
              <div className={styles.programImage}>
                <Image
                  src={getImagePath('/images/home/program-mentoring.jpg')}
                  alt="Two women of different generations stand facing each other in a stylish, modern room with white shelves and a large mirror"
                  width={800}
                  height={1200}
                  className={styles.programImageContent}
                />
              </div>
              <div className={styles.programContent}>
                <h3>Intergenerational Mentoring Program</h3>
                <p>
                  Mothers to Daughters (M2D) offers a high-impact mentorship program designed to equip young women with the entrepreneurial mindset, strategies, and leadership skills needed to excel. Through immersive mentorship and hands-on workshops.
                </p>
                <Link href="/programs" className={styles.learnMoreLink}>
                  View Details →
                </Link>
              </div>
            </div>
            <div className={`${styles.programCard} ${styles.programCardReversed}`}>
              <div className={styles.programImage}>
                <Image
                  src={getImagePath('/images/home/program-partner.jpg')}
                  alt="A group of eight diverse women from M2D gather in a modern, minimalist room with white shelves adorned with decorative objects"
                  width={1200}
                  height={800}
                  className={styles.programImageContent}
                />
              </div>
              <div className={styles.programContent}>
                <h3>Partner With Us</h3>
                <p>
                  Whether you give your time, expertise, or financial support, you are shaping futures and changing lives. Your generosity, alongside our community of supporters, fuels our mission and brings us closer to empowering the next generation.
                </p>
                <Link href="/partner" className={styles.learnMoreLink}>
                  View Details →
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

      {/* Partners */}
      <Section spacing="lg" className={styles.partnersSection}>
        <Container>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Brands that have partnered with us</h2>
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

      {/* Founder Statement */}
      <Section spacing="lg" className={styles.founderSection}>
        <Container>
          <div className={styles.founderContent}>
            <div className={styles.founderImage}>
              <Image
                src={getImagePath("/images/francine.jpg")}
                alt="Francine Mbvoumbo, Chair & President of Mothers to Daughters"
                width={500}
                height={600}
                className={styles.founderImageContent}
              />
            </div>
            <div className={styles.founderText}>
              <blockquote className={styles.founderQuote}>
                <p className={styles.founderStatement}>{founderStatement}</p>
              </blockquote>
              <div className={styles.founderSignature}>
                <h2 className={styles.founderName}>Francine Mbvoumbo</h2>
                <p className={styles.founderRole}>Chair &amp; President</p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Join the Community (Primary Conversion) */}
      <Section spacing="xl" className={styles.joinSection}>
        <Container>
          <div className={styles.joinContent}>
            <h2 className={styles.joinTitle}>Join Our Community</h2>
            <p className={styles.joinDescription}>
              Sign up for our mailing list to get updates and information about
              Mothers to Daughters.
            </p>
            <p className={styles.joinPrompt}>
              Subscribe to our newsletter • Don&apos;t miss out!
            </p>
            <NewsletterFormInline />
          </div>
        </Container>
      </Section>

      {/* Content Feed (Blog / Media) */}
      <Section spacing="lg" className={styles.contentFeedSection}>
        <Container>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Watch Us Go</h2>
            <p className={styles.sectionSubheading}>Wisdom-Filled Voices &amp; Moments</p>
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

      {/* Areas of Focus */}
      <Section spacing="lg" className={styles.focusSection}>
        <Container>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Our Areas of Focus</h2>
          </div>
          <ul className={styles.focusGrid}>
            {areasOfFocus.map((area) => (
              <li key={area.title} className={styles.focusItem}>
                <h3>{area.title}</h3>
                <p>{area.description}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
