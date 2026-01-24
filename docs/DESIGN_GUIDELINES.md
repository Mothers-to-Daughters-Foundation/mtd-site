# Design Guidelines

## Mobile Responsiveness

The website is designed to be fully responsive across all device sizes. All components and layouts must adapt gracefully from mobile to desktop.

### Breakpoint System

The site uses a consistent breakpoint system defined in `src/styles/tokens.css`:

- **Mobile**: Default (up to 639px)
- **Tablet**: `768px` (min-width: 768px)
- **Desktop**: `1024px` (min-width: 1024px)
- **Wide**: `1280px` (min-width: 1280px)

**Usage in CSS:**
```css
/* Mobile-first: base styles for mobile */
.component {
  /* Mobile styles */
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    /* Tablet/Desktop styles */
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    /* Desktop styles */
  }
}
```

### Responsive Design Principles

1. **Mobile-First Approach**
   - Start with mobile styles as the base
   - Use `min-width` media queries to progressively enhance for larger screens
   - Never use `max-width` media queries to hide mobile content

2. **Container and Spacing**
   - Use `Container` component for consistent max-width and padding
   - Container padding adjusts automatically:
     - Mobile: `var(--spacing-4)` (16px)
     - Tablet+: `var(--spacing-6)` (24px)
   - Use `Section` component with spacing props (`sm`, `md`, `lg`, `xl`) for responsive vertical spacing

3. **Grid Layouts**
   - Single column on mobile
   - Multi-column on tablet/desktop using CSS Grid
   - Use `grid-template-columns: 1fr` for mobile, then expand for larger screens
   - Example:
     ```css
     .grid {
       display: grid;
       grid-template-columns: 1fr;
       gap: var(--spacing-6);
     }
     
     @media (min-width: 768px) {
       .grid {
         grid-template-columns: repeat(2, 1fr);
       }
     }
     
     @media (min-width: 1024px) {
       .grid {
         grid-template-columns: repeat(3, 1fr);
       }
     }
     ```

4. **Typography Scaling**
   - Font sizes should scale appropriately for mobile
   - Use typography tokens (`--text-xs` through `--text-6xl`)
   - Headlines may be smaller on mobile, larger on desktop
   - Example:
     ```css
     .title {
       font-size: var(--text-3xl);
     }
     
     @media (min-width: 768px) {
       .title {
         font-size: var(--text-4xl);
       }
     }
     ```

5. **Navigation**
   - Mobile: Hamburger menu with dropdown navigation
   - Desktop: Horizontal navigation bar
   - Use `SiteHeader` component which handles this automatically

6. **Images**
   - Always use `next/image` component for optimized images
   - Set appropriate `width` and `height` attributes
   - Use `object-fit: cover` or `contain` as needed
   - Images should be responsive and not overflow containers

7. **Touch Targets**
   - Buttons and interactive elements should be at least 44x44px on mobile
   - Ensure adequate spacing between clickable elements
   - Use appropriate padding for touch interaction

8. **Horizontal Scrolling**
   - Avoid horizontal scrolling on mobile
   - Use carousels for partner logos or similar content
   - Implement with `overflow-x: auto` and `scroll-snap-type` for smooth scrolling

9. **Forms**
   - Full-width inputs on mobile
   - Appropriate input sizes for touch interaction
   - Labels and inputs stack vertically on mobile

10. **Footer**
    - Single column on mobile
    - 2 columns on tablet (768px+)
    - 4 columns on desktop (1024px+)
    - Use `SiteFooter` component which handles this automatically

### Testing Checklist

When implementing or updating components, ensure:

- [ ] Layout works on mobile (320px - 639px)
- [ ] Layout works on tablet (768px - 1023px)
- [ ] Layout works on desktop (1024px+)
- [ ] Text is readable at all sizes
- [ ] Images scale appropriately
- [ ] Interactive elements are easily tappable on mobile
- [ ] No horizontal scrolling (except intentional carousels)
- [ ] Navigation is accessible on all devices
- [ ] Forms are usable on mobile
- [ ] Spacing and padding are appropriate for each breakpoint

### Common Responsive Patterns

**Two-Column Layout:**
```css
.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-6);
}

@media (min-width: 768px) {
  .layout {
    grid-template-columns: 1fr 1fr;
  }
}
```

**Responsive Text:**
```css
.heading {
  font-size: var(--text-2xl);
}

@media (min-width: 768px) {
  .heading {
    font-size: var(--text-3xl);
  }
}
```

**Responsive Spacing:**
```css
.section {
  padding: var(--spacing-4);
}

@media (min-width: 768px) {
  .section {
    padding: var(--spacing-8);
  }
}
```

## Card Components

### Interactive Cards
Cards that link to other pages or trigger actions should:
- Have hover states (elevation change, color shift, or scale)
- Use pointer cursor
- Provide visual feedback on interaction
- Use the `Card` component with `href` prop

### Impact and Informational Cards
Impact and informational cards must:
- **Have no hover state**
- **Use default cursor**
- **Not change elevation, color, or scale on hover**
- **Be visually static**

These cards are used for:
- Impact metrics
- Informational content
- Statistics
- Non-interactive content displays

Use the `Card` component with `variant="static"` prop, or use custom divs with appropriate styling for impact metrics.
