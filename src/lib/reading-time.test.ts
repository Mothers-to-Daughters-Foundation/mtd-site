import { describe, it, expect } from 'vitest';
import { readingTime } from './reading-time';

describe('readingTime', () => {
  it('returns at least 1 minute for empty content', () => {
    expect(readingTime('')).toBe(1);
    expect(readingTime('   ')).toBe(1);
  });
  it('200 words is 1 minute', () => {
    expect(readingTime(Array(200).fill('word').join(' '))).toBe(1);
  });
  it('rounds up: 201 words is 2 minutes', () => {
    expect(readingTime(Array(201).fill('word').join(' '))).toBe(2);
  });
  it('450 words is 3 minutes', () => {
    expect(readingTime(Array(450).fill('word').join(' '))).toBe(3);
  });
});
