import styles from './Section.module.css';
import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Section({
  children,
  className,
  spacing = 'md',
}: SectionProps) {
  const spacingClass = styles[`spacing-${spacing}`];
  return (
    <section className={`${styles.section} ${spacingClass} ${className || ''}`}>
      {children}
    </section>
  );
}
