import { NextResponse } from 'next/server';

export interface SanghamEvent {
  id: string | number;
  title: string;
  description: string;
  type: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  month?: string;
  day?: string;
  year?: string;
}

const GOOGLE_SHEET_EVENTS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1mUNv-OQf39D81ijUPEcSDON-VY8rmWqLlpasUQ-tSIk/export?format=csv&gid=327105065';

// Convert Google Drive sharing links or raw URLs into direct web image links
function formatPhotoUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // Extract Google Drive ID from /file/d/ID/ or open?id=ID or uc?id=ID
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

// Format time string to remove redundant seconds (e.g., "11:00:00 AM" -> "11:00 AM")
function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  const match = trimmed.match(/^(\d{1,2}:\d{2}):\d{2}(\s*[AaPp][Mm])?$/);
  if (match) {
    return `${match[1]}${match[2] ? ' ' + match[2].trim() : ''}`;
  }
  return trimmed;
}

// Extract month, day, year for display badge
function parseDateParts(dateStr: string) {
  if (!dateStr) return { month: 'EVENT', day: '••', year: '' };
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = String(d.getDate()).padStart(2, '0');
    const year = String(d.getFullYear());
    return { month, day, year };
  }
  const parts = dateStr.trim().split(/[\s,/-]+/);
  if (parts.length >= 2) {
    return { month: parts[0].slice(0, 3).toUpperCase(), day: parts[1], year: parts[2] || '' };
  }
  return { month: 'DATE', day: dateStr, year: '' };
}

// Full RFC-4180 compliant CSV parser that respects newlines inside quoted fields
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

function parseCsv(text: string): SanghamEvent[] {
  const rows = parseCSV(text);
  if (rows.length <= 1) return [];

  const headers = rows[0].map((h) => h.trim().toLowerCase());

  const nameIdx = headers.findIndex(
    (h) => h === 'event name' || h === 'title' || (h.includes('event') && h.includes('name'))
  );
  const descIdx = headers.findIndex((h) => h.includes('description') || h.includes('desc'));
  const typeIdx = headers.findIndex(
    (h) => h === 'event type' || h.includes('type') || h.includes('category')
  );

  // Explicitly match Date and Time columns (NOT timestamp)
  const dateIdx = headers.findIndex(
    (h) => h === 'date' || (h.includes('date') && !h.includes('timestamp'))
  );
  const timeIdx = headers.findIndex(
    (h) => h === 'time' || (h.includes('time') && !h.includes('timestamp') && !h.includes('date'))
  );
  const locIdx = headers.findIndex(
    (h) => h === 'location' || h.includes('location') || h.includes('venue') || h.includes('place')
  );
  const photoIdx = headers.findIndex(
    (h) => h === 'photo' || h.includes('photo') || h.includes('image') || h.includes('picture') || h.includes('dp')
  );

  const events: SanghamEvent[] = [];

  for (let i = 1; i < rows.length; i++) {
    const values = rows[i];
    if (values.length < 2) continue;

    const title = nameIdx >= 0 && nameIdx < values.length ? values[nameIdx].trim() : '';
    if (!title) continue;

    const description = descIdx >= 0 && descIdx < values.length ? values[descIdx].trim() : '';
    const type = typeIdx >= 0 && typeIdx < values.length && values[typeIdx].trim()
      ? values[typeIdx].trim()
      : 'Community';
    const rawDate = dateIdx >= 0 && dateIdx < values.length ? values[dateIdx].trim() : '';
    const rawTime = timeIdx >= 0 && timeIdx < values.length ? values[timeIdx].trim() : '';
    const date = rawDate;
    const time = formatTime(rawTime);
    const location = locIdx >= 0 && locIdx < values.length && values[locIdx].trim()
      ? values[locIdx].trim()
      : 'Nizamabad';
    const rawPhoto = photoIdx >= 0 && photoIdx < values.length ? values[photoIdx].trim() : '';
    const image = formatPhotoUrl(rawPhoto);
    const { month, day, year } = parseDateParts(date);

    events.push({
      id: String(i),
      title,
      description,
      type,
      date,
      time,
      location,
      image: image || undefined,
      month,
      day,
      year,
    });
  }

  return events;
}

export async function GET() {
  try {
    const res = await fetch(GOOGLE_SHEET_EVENTS_CSV_URL, {
      cache: 'no-store',
      redirect: 'follow',
      headers: {
        'User-Agent': 'CSVS-NextApp/1.0',
      },
    });

    if (!res.ok) {
      console.warn(`[Events API] Google Sheet response status: ${res.status}.`);
      return NextResponse.json({
        events: [],
        source: 'error',
        total: 0,
      });
    }

    const csvText = await res.text();
    if (!csvText || csvText.includes('<!DOCTYPE') || csvText.includes('<html')) {
      return NextResponse.json({
        events: [],
        source: 'empty',
        total: 0,
      });
    }

    const events = parseCsv(csvText);
    const eventTypes = Array.from(
      new Set(events.map((e) => e.type.trim()).filter((t) => Boolean(t) && t.toLowerCase() !== 'all'))
    );

    return NextResponse.json({
      events,
      eventTypes,
      source: 'google-sheet',
      total: events.length,
    });
  } catch (error) {
    console.warn('[Events API] Error fetching sheet:', error);
    return NextResponse.json({
      events: [],
      source: 'error',
      total: 0,
    });
  }
}
