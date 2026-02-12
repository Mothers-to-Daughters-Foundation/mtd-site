const createMDX = require('@next/mdx');
const fs = require('fs');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '',
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

      const fileContent = fs.readFileSync(redirectsPath, 'utf-8');
      const lines = fileContent.split('\n').filter((line) => line.trim());
      
      if (lines.length === 0) {
        return [];
      }

      // Parse CSV header
      const headers = lines[0].split(',').map((h) => h.trim());
      const redirects = [];

      // Parse CSV rows
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());
        const record = {};
        
        headers.forEach((header, index) => {
          record[header] = values[index] || '';
        });

        // Only include entries with both old_url and new_url
        if (record.old_url && record.new_url && record.new_url.trim() !== '') {
          redirects.push({
            source: record.old_url,
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
