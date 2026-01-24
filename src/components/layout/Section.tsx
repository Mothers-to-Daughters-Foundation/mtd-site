import styles from './Section.module.css';
import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
}

export default function Section({
  children,
  className,
  spacing = 'md',
}: SectionProps) {
  const spacingClass = spacing !== 'none' ? styles[`spacing-${spacing}`] : styles['spacing-none'];
  return (
    <section className={`${styles.section} ${spacingClass} ${className || ''}`}>
      {children}
    </section>
  );
}
