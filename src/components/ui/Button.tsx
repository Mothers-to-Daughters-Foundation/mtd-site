import styles from './Button.module.css';
import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  as?: 'button' | 'a';
  href?: string;
  target?: string;
  rel?: string;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  as = 'button',
  href,
  className,
  ...props
}: ButtonProps) {
  const baseClass = styles.button;
  const variantClass = styles[`variant-${variant}`];
  const sizeClass = styles[`size-${size}`];
  const combinedClass = `${baseClass} ${variantClass} ${sizeClass} ${className || ''}`;

  // Render an anchor whenever an href is provided (not just when as="a"),
  // otherwise a <button href> is emitted which does not navigate.
  if (href || as === 'a') {
    return (
      <a href={href} className={combinedClass} {...(props as any)}>
        {children}
      </a>
    );
  }

  return (
    <button className={combinedClass} {...props}>
      {children}
    </button>
  );
}
