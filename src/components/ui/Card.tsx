import styles from './Card.module.css';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  href?: string;
  target?: string;
  rel?: string;
  variant?: 'interactive' | 'static';
}

export default function Card({ children, className, href, target, rel, variant = 'interactive' }: CardProps) {
  const isStatic = variant === 'static';
  const cardClass = `${isStatic ? styles.cardStatic : styles.card} ${className || ''}`;

  if (href && !isStatic) {
    return (
      <a href={href} className={cardClass} target={target} rel={rel}>
        {children}
      </a>
    );
  }

  return <article className={cardClass}>{children}</article>;
}
