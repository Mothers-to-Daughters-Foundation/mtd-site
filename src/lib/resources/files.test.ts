import { describe, it, expect } from 'vitest';
import {
  isExternalResource,
  resourceTypeFromMime,
  sanitizeFileName,
  uploadPrefix,
} from './files';

describe('resourceTypeFromMime', () => {
  it('maps media types', () => {
    expect(resourceTypeFromMime('video/mp4')).toBe('video');
    expect(resourceTypeFromMime('audio/mpeg')).toBe('audio');
  });
  it('treats PDFs, office files and text as documents', () => {
    expect(resourceTypeFromMime('application/pdf')).toBe('document');
    expect(
      resourceTypeFromMime('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    ).toBe('document');
    expect(resourceTypeFromMime('application/vnd.ms-excel.sheet.macroEnabled.12')).toBe('document');
    expect(resourceTypeFromMime('text/plain')).toBe('document');
  });
  it('falls back to other', () => {
    expect(resourceTypeFromMime('image/png')).toBe('other');
    expect(resourceTypeFromMime('')).toBe('other');
  });
});

describe('sanitizeFileName', () => {
  it('replaces unsafe characters and keeps the extension', () => {
    expect(sanitizeFileName('My Plan (v2)/../x.pdf')).toBe('My_Plan__v2__.._x.pdf');
  });
  it('keeps the last 100 characters', () => {
    const long = `${'a'.repeat(150)}.pdf`;
    expect(sanitizeFileName(long)).toHaveLength(100);
    expect(sanitizeFileName(long).endsWith('.pdf')).toBe(true);
  });
});

describe('uploadPrefix', () => {
  it('scopes uploads per role and user', () => {
    expect(uploadPrefix('admin', 'u1')).toBe('admin-uploads/u1/');
    expect(uploadPrefix('mentor', 'u1')).toBe('mentor-uploads/u1/');
  });
});

describe('isExternalResource', () => {
  it('recognises http(s) links', () => {
    expect(isExternalResource({ file_url: 'https://youtu.be/x' })).toBe(true);
    expect(isExternalResource({ file_url: 'HTTP://example.com' })).toBe(true);
  });
  it('treats storage paths as files', () => {
    expect(isExternalResource({ file_url: 'admin-uploads/u1/1-plan.pdf' })).toBe(false);
  });
});
