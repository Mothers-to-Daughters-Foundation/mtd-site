/**
 * Illustration and colour theme for a membership tier, chosen by its rank in
 * price (cheapest first): a seedling, a blossom, then a butterfly echoing the
 * logo. More tiers than themes reuse the top one.
 */
export type TierTheme = 'seed' | 'bloom' | 'flight';

const THEMES: TierTheme[] = ['seed', 'bloom', 'flight'];

export function tierTheme(rank: number): TierTheme {
  return THEMES[Math.min(Math.max(rank, 0), THEMES.length - 1)];
}

/** Rank of a price among all prices (0 = cheapest). */
export function priceRank(price: number, prices: number[]): number {
  return [...new Set(prices)].sort((a, b) => a - b).indexOf(price);
}

export default function TierArt({ theme, className }: { theme: TierTheme; className?: string }) {
  return (
    <svg viewBox="0 0 120 90" className={className} aria-hidden="true" focusable="false">
      <circle cx="60" cy="48" r="38" fill="currentColor" opacity="0.14" />
      {theme === 'seed' && (
        <g>
          <path d="M30 76h60" stroke="#8a6a4f" strokeWidth="4" strokeLinecap="round" />
          <path d="M60 76V46" stroke="#4f8a5b" strokeWidth="4" strokeLinecap="round" />
          <path d="M60 52c-14 0-22-8-24-20 13-1 22 6 24 20z" fill="#6fae7c" />
          <path d="M60 46c3-14 13-21 26-20-1 13-11 20-26 20z" fill="#89c493" />
          <circle cx="44" cy="22" r="3" fill="#f2b7c9" />
          <circle cx="82" cy="16" r="2" fill="#f2b7c9" />
        </g>
      )}
      {theme === 'bloom' && (
        <g>
          <path d="M60 80V52" stroke="#4f8a5b" strokeWidth="4" strokeLinecap="round" />
          <path d="M60 68c-10 0-16-5-18-13 10 0 16 5 18 13z" fill="#6fae7c" />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse
              key={a}
              cx="60"
              cy="26"
              rx="9"
              ry="15"
              fill="#e889ad"
              transform={`rotate(${a} 60 40)`}
            />
          ))}
          <circle cx="60" cy="40" r="8" fill="#f7c948" />
        </g>
      )}
      {theme === 'flight' && (
        <g>
          <path
            d="M60 46c-6-16-22-30-38-26-10 3-8 18 4 24-12 6-10 20 3 22 13 2 25-8 31-20z"
            fill="#7b1e4a"
          />
          <path
            d="M60 46c6-16 22-30 38-26 10 3 8 18-4 24 12 6 10 20-3 22-13 2-25-8-31-20z"
            fill="#a8336a"
          />
          <path d="M60 30v34" stroke="#3d0f26" strokeWidth="3" strokeLinecap="round" />
          <path d="M60 30c-3-8-7-12-12-14M60 30c3-8 7-12 12-14" stroke="#3d0f26" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="36" cy="34" r="4" fill="#f8e7f6" />
          <circle cx="84" cy="34" r="4" fill="#f8e7f6" />
          <path d="M20 16l4 4M100 14l-4 5M96 74l4 3" stroke="#f7c948" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
