import { NextResponse } from 'next/server';

export interface CommunityMember {
  id: string;
  name: string;
  surname: string;
  fullName: string;
  district: string;
  occupation: string;
  membershipId?: string;
  photo?: string;
}

// Convert Google Drive sharing links or raw URLs into direct web image links
export function formatPhotoUrl(rawUrl: string): string {
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

const GOOGLE_SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/14e3REBG8Jh4rVtAHGs5LTq3irPBVz2bSssxysEJA_GM/export?format=csv';

const FALLBACK_MEMBERS: CommunityMember[] = [
  {
    id: '1',
    membershipId: '27',
    surname: 'Jagannatham',
    name: 'Ravi Chandar',
    fullName: 'Jagannatham Ravi Chandar',
    district: 'Nizamabad',
    occupation: 'Photographer',
  },
  {
    id: '2',
    membershipId: '27',
    surname: 'Jagannatham',
    name: 'Bharathi',
    fullName: 'Jagannatham Bharathi',
    district: 'Nizamabad',
    occupation: 'Home Maker',
  },
  {
    id: '3',
    membershipId: '27',
    surname: 'Jagannatham',
    name: 'Shashank',
    fullName: 'Jagannatham Shashank',
    district: 'Nizamabad',
    occupation: 'Software',
  },
  {
    id: '4',
    membershipId: '27',
    surname: 'Jagannatham',
    name: 'Shivani',
    fullName: 'Jagannatham Shivani',
    district: 'Nizamabad',
    occupation: 'M.S In U.S',
  },
  {
    id: '5',
    membershipId: '27',
    surname: 'Jagannatham',
    name: 'Raghu Chandar',
    fullName: 'Jagannatham Raghu Chandar',
    district: 'Nizamabad',
    occupation: 'Photographer',
  },
  {
    id: '6',
    membershipId: '27',
    surname: 'Jagannatham',
    name: 'Soubagya Laxmi',
    fullName: 'Jagannatham Soubagya Laxmi',
    district: 'Nizamabad',
    occupation: '',
  },
];

function parseCsv(text: string): CommunityMember[] {
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

  // Use exact matching so 'name' does not falsely match 'surname'
  const nameIdx = headers.indexOf('name');
  const surnameIdx = headers.indexOf('surname');
  const districtIdx = headers.findIndex((h) => h === 'district/mandal' || h.startsWith('district'));
  const occupationIdx = headers.indexOf('occupation');
  const photoIdx = headers.findIndex(
    (h) => h === 'photo' || h.includes('photo') || h.includes('dp') || h.includes('image') || h.includes('picture')
  );
  const membershipIdx = headers.findIndex(
    (h) => h.includes('membership') || h === 'id' || h.includes('member id') || h === 's.no' || h === 'sl.no'
  );

  const members: CommunityMember[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].trim();
    if (!row) continue;
    const values = parseLine(row);
    if (values.length < 2) continue;

    const name = nameIdx >= 0 && nameIdx < values.length ? values[nameIdx].trim() : '';
    const surname = surnameIdx >= 0 && surnameIdx < values.length ? values[surnameIdx].trim() : '';
    if (!name && !surname) continue;

    // Both Surname and Name
    const fullName = surname && name ? `${surname} ${name}` : (name || surname);
    const district = districtIdx >= 0 && districtIdx < values.length && values[districtIdx].trim()
      ? values[districtIdx].trim()
      : 'Nizamabad';
    const occupation = occupationIdx >= 0 && occupationIdx < values.length ? values[occupationIdx].trim() : '';
    const membershipId = membershipIdx >= 0 && membershipIdx < values.length ? values[membershipIdx].trim() : String(i);
    const rawPhoto = photoIdx >= 0 && photoIdx < values.length ? values[photoIdx].trim() : '';
    const photo = formatPhotoUrl(rawPhoto);

    members.push({
      id: String(i),
      name,
      surname,
      fullName,
      district,
      occupation,
      membershipId,
      photo: photo || undefined,
    });
  }

  return members.length > 0 ? members : FALLBACK_MEMBERS;
}

export async function GET() {
  try {
    const res = await fetch(GOOGLE_SHEET_CSV_URL, {
      cache: 'no-store',
      redirect: 'follow',
      headers: {
        'User-Agent': 'CSVS-Portal/1.0',
      },
    });

    if (!res.ok) {
      return NextResponse.json({
        members: FALLBACK_MEMBERS,
        count: FALLBACK_MEMBERS.length,
        source: 'fallback',
      });
    }

    const csvText = await res.text();
    const members = parseCsv(csvText);

    return NextResponse.json({
      members,
      count: members.length,
      source: 'live_google_sheet',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      members: FALLBACK_MEMBERS,
      count: FALLBACK_MEMBERS.length,
      source: 'fallback',
      error: String(error),
    });
  }
}
