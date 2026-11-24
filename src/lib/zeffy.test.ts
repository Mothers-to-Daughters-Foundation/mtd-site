import { describe, expect, it } from 'vitest';
import { isZeffyEmbed, normalizeZeffyInput } from './zeffy';

describe('normalizeZeffyInput', () => {
  it('keeps a plain Zeffy link', () => {
    expect(normalizeZeffyInput(' https://www.zeffy.com/en-US/donation-form/growth ')).toBe(
      'https://www.zeffy.com/en-US/donation-form/growth'
    );
  });

  it('pulls the form address out of pasted embed code', () => {
    const code =
      '<div style="position:relative"><iframe title="Donation form" style="width:100%" src="https://www.zeffy.com/embed/donation-form/growth?modal=false&amp;x=1" allowpaymentrequest allowTransparency="true"></iframe></div>';
    const url = normalizeZeffyInput(code);
    expect(url).toBe('https://www.zeffy.com/embed/donation-form/growth?modal=false&x=1');
    expect(isZeffyEmbed(url)).toBe(true);
  });

  it('rejects other sites and non-https', () => {
    expect(normalizeZeffyInput('https://evil.example.com/embed/x')).toBeNull();
    expect(normalizeZeffyInput('http://www.zeffy.com/embed/x')).toBeNull();
    expect(normalizeZeffyInput('https://zeffy.com.evil.io/x')).toBeNull();
    expect(normalizeZeffyInput('<iframe src="javascript:alert(1)"></iframe>')).toBeNull();
    expect(normalizeZeffyInput('not a url')).toBeNull();
  });

  it('treats empty input as clearing the link', () => {
    expect(normalizeZeffyInput('')).toBe('');
    expect(normalizeZeffyInput(undefined)).toBe('');
  });

  it('only calls embed addresses embeddable', () => {
    expect(isZeffyEmbed('https://www.zeffy.com/en-US/donation-form/growth')).toBe(false);
    expect(isZeffyEmbed('')).toBe(false);
  });
});
