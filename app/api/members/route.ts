import { NextResponse } from 'next/server';

export interface CommunityMember {
  id: string;
  name: string;
  surname: string;
  fullName: string;
  district: string;
  occupation: string;
  membershipId?: string;
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

    members.push({
      id: String(i),
      name,
      surname,
      fullName,
      district,
      occupation,
      membershipId,
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
