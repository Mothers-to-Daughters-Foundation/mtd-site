const createMDX = require('@next/mdx');
const fs = require('fs');
const path = require('path');

/** Minimal RFC 4180 CSV parser: handles quoted fields, commas and "" escapes. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      if (row.some((v) => v.trim())) rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  row.push(field);
  if (row.some((v) => v.trim())) rows.push(row);
  return rows;
}

/**
 * Escape characters that path-to-regexp treats as syntax (Wix slugs contain
 * parentheses). A ":" at the start of a segment stays a named parameter.
 */
function toSourcePattern(url) {
  return url.replace(/[()*+?{}]|(?<!\/):/g, (c) => `\\${c}`);
}

const isPagesDeployment = process.env.GITHUB_PAGES === 'true';
const basePath = isPagesDeployment ? '/mtd-site' : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isPagesDeployment ? { output: 'export' } : {}),
  basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
  },
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  async redirects() {
    const redirectsPath = path.join(process.cwd(), 'docs', 'migration', 'urls.csv');

    try {
      if (!fs.existsSync(redirectsPath)) {
        return [];
      }

      const rows = parseCsv(fs.readFileSync(redirectsPath, 'utf-8'));
      if (rows.length === 0) {
        return [];
      }

      const headers = rows[0].map((h) => h.trim());
      const redirects = [];

      for (const values of rows.slice(1)) {
        const record = {};
        headers.forEach((header, index) => {
          record[header] = (values[index] || '').trim();
        });

        // Only include entries with both old_url and new_url
        if (record.old_url && record.new_url && record.old_url !== record.new_url) {
          redirects.push({
            source: toSourcePattern(record.old_url),
            destination: record.new_url,
            permanent: true,
          });
        }
      }

      return redirects;
    } catch (error) {
      console.warn('Error loading redirects:', error);
      return [];
    }
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

module.exports = withMDX(nextConfig);
