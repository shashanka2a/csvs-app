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

const GOOGLE_SHEET_GALLERY_GVIZ_URL =
  'https://docs.google.com/spreadsheets/d/1mO7L6B9JewS4CitYcK3wTD-HhMBww76oeCb-3iQJr1g/gviz/tq?tqx=out:csv&gid=1532582308';

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

// Split multiple comma-separated, semicolon-separated, or newline-separated photo URLs from the Photos column
function extractPhotoUrls(cellText: string): string[] {
  if (!cellText) return [];

  // Match all URLs cleanly using regex
  const regex = /https?:\/\/[^\s,;"<>]+/g;
  const matches = cellText.match(regex);
  const urls: string[] = [];

  if (matches && matches.length > 0) {
    for (let m of matches) {
      const clean = m.replace(/^["'\s]+|["'\s,;]+$/g, '').trim();
      const formatted = formatPhotoUrl(clean);
      if (formatted && !urls.includes(formatted)) {
        urls.push(formatted);
      }
    }
  }

  return urls;
}

// Robust date parser supporting YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, DD-MM-YYYY, and textual dates
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // ISO format: YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}/.test(trimmed)) {
    const parts = trimmed.split(/[-T ]/);
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    return new Date(y, m - 1, d);
  }

  // Slashed or dashed: DD/MM/YYYY or MM/DD/YYYY or DD-MM-YYYY
  const slashParts = trimmed.split(/[/.-]/);
  if (slashParts.length === 3) {
    const p0 = parseInt(slashParts[0], 10);
    const p1 = parseInt(slashParts[1], 10);
    let y = parseInt(slashParts[2], 10);
    if (y < 100) y += 2000;

    // DD/MM/YYYY (e.g. 19/11/2026)
    if (p0 > 12 && p1 <= 12) {
      return new Date(y, p1 - 1, p0);
    }
    // MM/DD/YYYY (e.g. 11/19/2026)
    if (p1 > 12 && p0 <= 12) {
      return new Date(y, p0 - 1, p1);
    }
    // Ambiguous (e.g. 05/11/2026) -> default to DD/MM/YYYY for Indian locale
    if (p0 <= 31 && p1 <= 12) {
      return new Date(y, p1 - 1, p0);
    }
  }

  const direct = new Date(trimmed);
  if (!isNaN(direct.getTime())) return direct;
  return null;
}

// Google Photos style date formatter: e.g. "Wed, Nov 25, 2026"
function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return 'Recent Moments';
  const parsed = parseDate(dateStr);
  if (parsed) {
    return parsed.toLocaleDateString('en-US', {
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

// 1. Strict Event Name index finder (matches Column B 'Event Name')
function findEventNameIndex(headers: string[]): number {
  let idx = headers.findIndex((h) =>
    h === 'event name' ||
    h === 'name of the event' ||
    h === 'name of event' ||
    h === 'event title' ||
    h === 'title of event' ||
    (h.includes('event') && (h.includes('name') || h.includes('title')))
  );
  if (idx !== -1) return idx;

  idx = headers.findIndex((h) =>
    (h === 'event' || h === 'title' || h === 'occasion' || h.includes('occasion') || (h.includes('event') && !h.includes('date') && !h.includes('time') && !h.includes('photo') && !h.includes('image') && !h.includes('file') && !h.includes('upload'))) &&
    !h.includes('timestamp') &&
    !h.includes('date') &&
    !h.includes('time') &&
    !h.includes('photo') &&
    !h.includes('image') &&
    !h.includes('pic') &&
    !h.includes('file') &&
    !h.includes('upload')
  );
  if (idx !== -1) return idx;

  idx = headers.findIndex((h) =>
    (h.includes('name') || h.includes('title')) &&
    !h.includes('timestamp') &&
    !h.includes('date') &&
    !h.includes('member') &&
    !h.includes('user') &&
    !h.includes('photo') &&
    !h.includes('file')
  );
  return idx;
}

// 2. Strict Date index finder (matches Column C 'Date', NEVER 'Timestamp')
function findDateIndex(headers: string[]): number {
  let idx = headers.findIndex((h) =>
    (h === 'event date' ||
     h === 'date of event' ||
     h === 'date of the event' ||
     (h.includes('date') && h.includes('event'))) &&
    !h.includes('timestamp')
  );
  if (idx !== -1) return idx;

  idx = headers.findIndex((h) =>
    (h === 'date' || h === 'day' || (h.includes('date') && !h.includes('birth') && !h.includes('update'))) &&
    !h.includes('timestamp') &&
    !h.includes('time')
  );
  if (idx !== -1) return idx;

  idx = headers.findIndex((h) =>
    (h.includes('when') || h.includes('day')) &&
    !h.includes('timestamp') &&
    !h.includes('time')
  );
  return idx;
}

// 3. Strict Photo column index finder (matches Column D 'Photos')
function findPhotoIndex(headers: string[]): number {
  return headers.findIndex((h) =>
    h.includes('photo') ||
    h.includes('image') ||
    h.includes('pic') ||
    h.includes('upload') ||
    h.includes('file')
  );
}

function parseGalleryCsv(text: string): GalleryGroup[] {
  const rows = parseCSV(text);
  if (rows.length <= 1) return [];

  const headers = rows[0].map((h) => h.trim().toLowerCase());

  const nameIdx = findEventNameIndex(headers);
  const dateIdx = findDateIndex(headers);
  const photoIdx = findPhotoIndex(headers);

  const groupMap = new Map<string, GalleryGroup>();

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (r.length < 2) continue;

    // Pull Event Name from sheet
    const eventName =
      nameIdx >= 0 && nameIdx < r.length && r[nameIdx].trim()
        ? r[nameIdx].trim()
        : 'Community Gathering';

    // Strictly pull Date from the form column, NEVER from the timestamp column
    const rawDate =
      dateIdx >= 0 && dateIdx < r.length && r[dateIdx].trim()
        ? r[dateIdx].trim()
        : '';

    const parsedDate = parseDate(rawDate);
    const displayDate = parsedDate ? formatDisplayDate(rawDate) : (rawDate || 'Recent Moments');
    const normalizedDate = parsedDate ? parsedDate.toISOString().split('T')[0] : (rawDate || 'undated');

    // Collect all photos from the Photos column in CSV
    const rawPhotos = photoIdx >= 0 && photoIdx < r.length ? r[photoIdx] : '';
    let combinedPhotos = rawPhotos;

    for (let c = 0; c < r.length; c++) {
      if (c === nameIdx || c === dateIdx || c === photoIdx) continue;
      const cell = r[c] || '';
      if (
        cell.includes('http://') ||
        cell.includes('https://') ||
        cell.includes('drive.google.com')
      ) {
        combinedPhotos += ', ' + cell;
      }
    }

    const photoUrls = extractPhotoUrls(combinedPhotos);
    if (photoUrls.length === 0) continue;

    // Group key based on Date + Event Name so multiple batches merge under one event
    const groupKey = `${normalizedDate}___${eventName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, {
        groupKey,
        eventName,
        date: normalizedDate,
        displayDate,
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
        date: displayDate,
        rawDate: normalizedDate,
      });
    });
    group.total = group.photos.length;
  }

  const groups = Array.from(groupMap.values());

  // Sort groups newest first based on parsed date timestamp
  groups.sort((a, b) => {
    const timeA = parseDate(a.date)?.getTime() || 0;
    const timeB = parseDate(b.date)?.getTime() || 0;
    return timeB - timeA;
  });

  return groups;
}

export async function GET() {
  try {
    // 1. Try primary Google Sheet CSV export
    let csvText = '';
    const res = await fetch(GOOGLE_SHEET_GALLERY_CSV_URL, {
      cache: 'no-store',
      redirect: 'follow',
      headers: {
        'User-Agent': 'CSVS-NextApp/1.0',
      },
    });

    if (res.ok) {
      const text = await res.text();
      if (text && !text.includes('<!DOCTYPE') && !text.includes('<html')) {
        csvText = text;
      }
    }

    // 2. Fallback to Google Visualization API if primary export was HTML or failed
    if (!csvText) {
      try {
        const gvizRes = await fetch(GOOGLE_SHEET_GALLERY_GVIZ_URL, {
          cache: 'no-store',
          redirect: 'follow',
          headers: {
            'User-Agent': 'CSVS-NextApp/1.0',
          },
        });
        if (gvizRes.ok) {
          const text = await gvizRes.text();
          if (text && !text.includes('<!DOCTYPE') && !text.includes('<html')) {
            csvText = text;
          }
        }
      } catch (e) {
        console.warn('[Gallery API] GViz fetch fallback error:', e);
      }
    }

    // If no CSV text could be retrieved (e.g. if sheet sharing is not yet set to Anyone with the link)
    if (!csvText) {
      return NextResponse.json({
        groups: [],
        total: 0,
        source: 'google-sheet',
      });
    }

    const groups = parseGalleryCsv(csvText);
    const totalPhotos = groups.reduce((acc, g) => acc + g.total, 0);

    return NextResponse.json({
      groups,
      total: totalPhotos,
      source: 'google-sheet',
    });
  } catch (error) {
    console.warn('[Gallery API] Error:', error);
    return NextResponse.json({
      groups: [],
      total: 0,
      source: 'google-sheet',
    });
  }
}
