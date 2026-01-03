import styles from './Tag.module.css';
import { ReactNode } from 'react';

interface TagProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'accent';
}

export default function Tag({
  children,
  className,
  variant = 'default',
}: TagProps) {
  const variantClass = styles[`variant-${variant}`];
  return (
    <span className={`${styles.tag} ${variantClass} ${className || ''}`}>
      {children}
    </span>
  );
}
