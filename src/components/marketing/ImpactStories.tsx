import Container from '@/components/layout/Container';
import Section from '@/components/layout/Section';
import styles from './ImpactStories.module.css';

interface Story {
  name: string;
  label?: string;
  paragraphs: string[];
}

/** Testimonials shown in the live site's "Impact Stories" slideshow, verbatim. */
export const impactStories: Story[] = [
  {
    name: 'Wan Chung',
    label: 'Daughter, Fall 2024 Cohort',
    paragraphs: [
      'Before M2D, my career felt stagnant. My mentor changed that. She didn’t just advise, she strategized with me. We ripped apart my resume and rebuilt it with punchy action verbs, practiced targeted interview techniques that landed me real interviews, and mapped out a concrete career path that honored my family life. She showed me how to command respect in the workplace, not just ‘be polite.’ We didn’t just talk about work-life balance; we created a plan I could implement immediately. M2D gave me the tools and the confidence to execute. If you’re ready to stop dreaming and start achieving, M2D will equip you to take action and own your success.',
    ],
  },
  {
    name: 'Lin Cao',
    label: 'Daughter, Fall 2024 Cohort',
    paragraphs: [
      'As a first-year Visual Effects student and newcomer to Canada, I struggled with self-doubt. The M2D Mentoring program changed that. My mentor helped me recognize my strengths—being friendly, collaborative, adaptable, and proactive. Her guidance on interviews, small talk, and Canadian culture was invaluable. Thanks to her, I started volunteering, feeling more connected to the community.',
      'This program boosted my confidence and prepared me for personal and professional growth. I’m grateful and highly recommend it to anyone seeking mentorship.',
    ],
  },
  {
    name: 'Bonnie Chen',
    paragraphs: [
      'I believe that having someone who has experienced or is currently experiencing what I am about to undergo can be incredibly beneficial. Cara opened up about the difficulties she encountered as a professional woman, and her words deeply connected with me. Being acknowledged and empathized with by another person felt truly comforting. After interacting with these remarkable women, listening to their journeys, and witnessing how they conquered obstacles, I am infused with a sense of inspiration. The positive energy was contagious.',
    ],
  },
  {
    name: 'Anqi Ma',
    paragraphs: [
      'Through participating in the program, I have gained some confidence in interacting with strangers, more knowledge about the industry, and some confidence in navigating my personal and work life in Canada. I do recommend this program. It would be a wonderful opportunity for immigrant women to gain some first-hand guidance about navigating both professional and personal life in Canada. Besides, it would also be an opportunity to be connected with other people and feel supported.',
    ],
  },
];

interface ImpactStoriesProps {
  /** Show only the first n stories (the live programs page shows one). */
  limit?: number;
  className?: string;
}

export default function ImpactStories({ limit, className }: ImpactStoriesProps) {
  const stories = limit ? impactStories.slice(0, limit) : impactStories;

  return (
    <Section spacing="lg" className={`${styles.section} ${className || ''}`}>
      <Container>
        <h2 className={styles.title}>Impact Stories</h2>
        <div className={`${styles.grid} ${stories.length === 1 ? styles.single : ''}`}>
          {stories.map((story) => (
            <blockquote key={story.name} className={styles.story}>
              <span className={styles.quoteMark} aria-hidden="true">
                &ldquo;
              </span>
              {story.label && <p className={styles.label}>{story.label}</p>}
              {story.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className={styles.text}>
                  {paragraph}
                </p>
              ))}
              <cite className={styles.author}>— {story.name}</cite>
            </blockquote>
          ))}
        </div>
      </Container>
    </Section>
  );
}
