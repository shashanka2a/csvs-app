import { NextResponse } from 'next/server';

export interface GalleryItem {
  id: string;
  url: string;
  eventName: string;
  date: string;
  rawDate: string;
}

export interface GalleryGroup {
  groupKey: string;
  eventName: string;
  date: string;
  displayDate: string;
  photos: GalleryItem[];
  total: number;
}

const GOOGLE_SHEET_GALLERY_CSV_URL =
  process.env.GOOGLE_SHEET_GALLERY_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/1mO7L6B9JewS4CitYcK3wTD-HhMBww76oeCb-3iQJr1g/export?format=csv&gid=1532582308';

const DEFAULT_GALLERY_PHOTOS = [
  { id: 1, url: 'https://raw.githubusercontent.com/shashanka2a/csvs-app/refs/heads/main/public/images/1.jpg' },
  { id: 2, url: 'https://raw.githubusercontent.com/shashanka2a/csvs-app/refs/heads/main/public/images/2.jpg' },
  { id: 3, url: 'https://raw.githubusercontent.com/shashanka2a/csvs-app/refs/heads/main/public/images/3.jpg' },
  { id: 4, url: 'https://raw.githubusercontent.com/shashanka2a/csvs-app/refs/heads/main/public/images/4.jpg' },
  { id: 5, url: 'https://raw.githubusercontent.com/shashanka2a/csvs-app/refs/heads/main/public/images/5.jpg' },
  { id: 6, url: 'https://raw.githubusercontent.com/shashanka2a/csvs-app/refs/heads/main/public/images/6.jpg' },
  { id: 7, url: 'https://raw.githubusercontent.com/shashanka2a/csvs-app/refs/heads/main/public/images/7.jpg' },
];

const FALLBACK_GROUPS: GalleryGroup[] = [
  {
    groupKey: 'default_community_moments',
    eventName: 'Chattada Sri Vaishnava Sangham Moments',
    date: '2026-11-19',
    displayDate: 'November 2026',
    total: DEFAULT_GALLERY_PHOTOS.length,
    photos: DEFAULT_GALLERY_PHOTOS.map((p, idx) => ({
      id: `fallback_${p.id || idx + 1}`,
      url: p.url,
      eventName: 'Chattada Sri Vaishnava Sangham Moments',
      date: 'November 2026',
      rawDate: '2026-11-19',
    })),
  },
];

// Convert Google Drive sharing links or raw URLs into direct web image links
function formatPhotoUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  const fileIdMatch =
    trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  if (
    fileIdMatch &&
    fileIdMatch[1] &&
    (trimmed.includes('drive.google.com') ||
      trimmed.includes('docs.google.com') ||
      trimmed.includes('googleusercontent.com'))
  ) {
    return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
  }

  return trimmed;
}

// Split multiple comma-separated, semicolon-separated, or newline-separated photo URLs from a cell
function extractPhotoUrls(cellText: string): string[] {
  if (!cellText) return [];

  // Match all potential URLs or split on commas, semicolons, and newlines
  const parts = cellText.split(/[\n,;]+/);
  const urls: string[] = [];

  for (let part of parts) {
    part = part.replace(/^["'\s]+|["'\s]+$/g, '').trim();
    if (part.startsWith('http://') || part.startsWith('https://')) {
      const formatted = formatPhotoUrl(part);
      if (formatted) {
        urls.push(formatted);
      }
    }
  }

  return urls;
}

// Google Photos style date formatter: e.g. "Wed, Nov 25, 2026"
function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return 'Recent Moments';
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return dateStr;
}

// RFC-4180 CSV parser respecting newlines and quotes
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (insideQuotes && text[i + 1] === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && text[i + 1] === '\n') {
        i++;
      }
      currentRow.push(currentField.trim());
      currentField = '';
      if (currentRow.some((field) => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function parseGalleryCsv(text: string): GalleryGroup[] {
  const rows = parseCSV(text);
  if (rows.length <= 1) return [];

  const headers = rows[0].map((h) => h.trim().toLowerCase());

  const nameIdx = headers.findIndex(
    (h) =>
      h === 'event name' ||
      h.includes('event') ||
      h.includes('title') ||
      h === 'name' ||
      h.includes('occasion')
  );
  const dateIdx = headers.findIndex(
    (h) => h === 'date' || (h.includes('date') && !h.includes('timestamp'))
  );
  const photoIdx = headers.findIndex(
    (h) =>
      h.includes('photo') ||
      h.includes('image') ||
      h.includes('pic') ||
      h.includes('upload') ||
      h.includes('file')
  );

  const groupMap = new Map<string, GalleryGroup>();

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (r.length < 2) continue;

    const eventName =
      nameIdx >= 0 && nameIdx < r.length && r[nameIdx].trim()
        ? r[nameIdx].trim()
        : 'Community Gathering';
    const rawDate =
      dateIdx >= 0 && dateIdx < r.length && r[dateIdx].trim()
        ? r[dateIdx].trim()
        : '';
    const rawPhotos =
      photoIdx >= 0 && photoIdx < r.length ? r[photoIdx] : '';

    // Collect all comma-separated photos in the cell and any trailing URL fields
    let combinedPhotos = rawPhotos;
    for (let c = photoIdx + 1; c < r.length; c++) {
      if (
        r[c].includes('http://') ||
        r[c].includes('https://') ||
        r[c].includes('drive.google.com')
      ) {
        combinedPhotos += ', ' + r[c];
      }
    }

    const photoUrls = extractPhotoUrls(combinedPhotos);
    if (photoUrls.length === 0) continue;

    // Group key based on Date + Event Name so multiple batches on the same date merge together
    const normalizedDate = rawDate || 'Undated';
    const groupKey = `${normalizedDate}___${eventName}`;

    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, {
        groupKey,
        eventName,
        date: normalizedDate,
        displayDate: formatDisplayDate(normalizedDate),
        photos: [],
        total: 0,
      });
    }

    const group = groupMap.get(groupKey)!;
    photoUrls.forEach((url, pIdx) => {
      group.photos.push({
        id: `g_${i}_${pIdx}`,
        url,
        eventName,
        date: group.displayDate,
        rawDate: normalizedDate,
      });
    });
    group.total = group.photos.length;
  }

  const groups = Array.from(groupMap.values());

  // Sort groups newest first
  groups.sort((a, b) => {
    const timeA = new Date(a.date).getTime() || 0;
    const timeB = new Date(b.date).getTime() || 0;
    return timeB - timeA;
  });

  return groups;
}

export async function GET() {
  try {
    const res = await fetch(GOOGLE_SHEET_GALLERY_CSV_URL, {
      cache: 'no-store',
      redirect: 'follow',
      headers: {
        'User-Agent': 'CSVS-NextApp/1.0',
      },
    });

    if (!res.ok) {
      console.warn(`[Gallery API] Google Sheet status ${res.status}. Using fallback.`);
      return NextResponse.json({
        groups: FALLBACK_GROUPS,
        total: DEFAULT_GALLERY_PHOTOS.length,
        source: 'fallback',
        isUnauthorized: res.status === 401,
      });
    }

    const csvText = await res.text();
    if (!csvText || csvText.includes('<!DOCTYPE') || csvText.includes('<html')) {
      return NextResponse.json({
        groups: FALLBACK_GROUPS,
        total: DEFAULT_GALLERY_PHOTOS.length,
        source: 'fallback',
      });
    }

    const groups = parseGalleryCsv(csvText);

    if (groups.length === 0) {
      return NextResponse.json({
        groups: FALLBACK_GROUPS,
        total: DEFAULT_GALLERY_PHOTOS.length,
        source: 'fallback',
      });
    }

    const totalPhotos = groups.reduce((acc, g) => acc + g.total, 0);

    return NextResponse.json({
      groups,
      total: totalPhotos,
      source: 'google-sheet',
    });
  } catch (error) {
    console.warn('[Gallery API] Error:', error);
    return NextResponse.json({
      groups: FALLBACK_GROUPS,
      total: DEFAULT_GALLERY_PHOTOS.length,
      source: 'fallback',
    });
  }
}
