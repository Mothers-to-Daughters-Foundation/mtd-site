import styles from './Button.module.css';
import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  as?: 'button' | 'a';
  href?: string;
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

  if (as === 'a' && href) {
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
