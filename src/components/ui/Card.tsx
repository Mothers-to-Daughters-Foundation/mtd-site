import styles from './Card.module.css';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  href?: string;
}

export default function Card({ children, className, href }: CardProps) {
  const cardClass = `${styles.card} ${className || ''}`;

  if (href) {
    return (
      <a href={href} className={cardClass}>
        {children}
      </a>
    );
  }

  return <article className={cardClass}>{children}</article>;
}
