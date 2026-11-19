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

  // Google Drive standard share link: https://drive.google.com/file/d/FILE_ID/view...
  const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}`;
  }

  // Google Drive open?id= or uc?id=
  const driveIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if ((trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) && driveIdMatch && driveIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}`;
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

function parseCsv(text: string): SanghamEvent[] {
  const lines = text.trim().split('\n');
  if (lines.length <= 1) return [];

  // Parse CSV line taking quotes into account
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map((h) => h.trim().toLowerCase());

  const nameIdx = headers.findIndex(
    (h) => h === 'event name' || h.includes('event name') || h === 'title' || h.includes('name')
  );
  const descIdx = headers.findIndex((h) => h.includes('description') || h.includes('desc'));
  const typeIdx = headers.findIndex(
    (h) => h === 'event type' || h.includes('type') || h.includes('category') || h.includes('tag')
  );
  const dateIdx = headers.findIndex((h) => h === 'date' || h.includes('date'));
  const timeIdx = headers.findIndex((h) => h === 'time' || h.includes('time'));
  const locIdx = headers.findIndex(
    (h) => h === 'location' || h.includes('location') || h.includes('place') || h.includes('venue')
  );
  const photoIdx = headers.findIndex(
    (h) => h === 'photo' || h.includes('photo') || h.includes('image') || h.includes('picture') || h.includes('dp')
  );

  const events: SanghamEvent[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].trim();
    if (!row) continue;
    const values = parseLine(row);
    if (values.length < 2) continue;

    const title = nameIdx >= 0 && nameIdx < values.length ? values[nameIdx].trim() : '';
    if (!title) continue;

    const description = descIdx >= 0 && descIdx < values.length ? values[descIdx].trim() : '';
    const type = typeIdx >= 0 && typeIdx < values.length && values[typeIdx].trim()
      ? values[typeIdx].trim()
      : 'Community';
    const date = dateIdx >= 0 && dateIdx < values.length ? values[dateIdx].trim() : '';
    const time = timeIdx >= 0 && timeIdx < values.length ? values[timeIdx].trim() : '';
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
