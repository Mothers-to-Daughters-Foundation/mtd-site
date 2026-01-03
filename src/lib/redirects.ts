import fs from 'fs';
import path from 'path';

export interface RedirectEntry {
  old_url: string;
  new_url: string;
  type?: string;
  title?: string;
  notes?: string;
}

export async function loadRedirects(): Promise<RedirectEntry[]> {
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
    const records: RedirectEntry[] = [];

    // Parse CSV rows
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const record: any = {};
      
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });

      // Only include entries with both old_url and new_url
      if (record.old_url && record.new_url && record.new_url.trim() !== '') {
        records.push(record as RedirectEntry);
      }
    }

    return records;
  } catch (error) {
    console.warn('Error loading redirects:', error);
    return [];
  }
}
