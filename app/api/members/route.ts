import { NextResponse } from 'next/server';

export interface CommunityMember {
  id: string;
  name: string;
  surname: string;
  fullName: string;
  gothram: string;
  district: string;
  address: string;
  pincode: string;
  occupation: string;
  phone: string;
  bloodGroup: string;
  membershipId: string;
}

const GOOGLE_SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/14e3REBG8Jh4rVtAHGs5LTq3irPBVz2bSssxysEJA_GM/export?format=csv';

const FALLBACK_MEMBERS: CommunityMember[] = [
  {
    id: '1',
    membershipId: '27',
    gothram: 'Achyutha',
    surname: 'Jagannatham',
    name: 'Ravi Chandar',
    fullName: 'Ravi Chandar Jagannatham',
    address: '11-1-58, Kanteshwear, Telangana.',
    district: 'Nizamabad',
    pincode: '503002',
    occupation: 'Photographer',
    phone: '9848765051',
    bloodGroup: 'B+',
  },
  {
    id: '2',
    membershipId: '27',
    gothram: 'Achyutha',
    surname: 'Jagannatham',
    name: 'Bharathi',
    fullName: 'Bharathi Jagannatham',
    address: '11-1-58, Kanteshwear, Telangana.',
    district: 'Nizamabad',
    pincode: '503002',
    occupation: 'Home Maker',
    phone: '9848765051',
    bloodGroup: 'A+',
  },
  {
    id: '3',
    membershipId: '27',
    gothram: 'Achyutha',
    surname: 'Jagannatham',
    name: 'Shashank',
    fullName: 'Shashank Jagannatham',
    address: '11-1-58, Kanteshwear, Telangana.',
    district: 'Nizamabad',
    pincode: '503002',
    occupation: 'Software',
    phone: '9848765051',
    bloodGroup: 'A+',
  },
  {
    id: '4',
    membershipId: '27',
    gothram: 'Achyutha',
    surname: 'Jagannatham',
    name: 'Shivani',
    fullName: 'Shivani Jagannatham',
    address: '11-1-58, Kanteshwear, Telangana.',
    district: 'Nizamabad',
    pincode: '503002',
    occupation: 'M.S In U.S',
    phone: '9848765051',
    bloodGroup: 'AB+',
  },
  {
    id: '5',
    membershipId: '27',
    gothram: 'Achyutha',
    surname: 'Jagannatham',
    name: 'Raghu Chandar',
    fullName: 'Raghu Chandar Jagannatham',
    address: '11-1-58, Kanteshwear, Telangana.',
    district: 'Nizamabad',
    pincode: '503002',
    occupation: 'Photographer',
    phone: '9848765051',
    bloodGroup: '',
  },
  {
    id: '6',
    membershipId: '27',
    gothram: 'Achyutha',
    surname: 'Jagannatham',
    name: 'Soubagya Laxmi',
    fullName: 'Soubagya Laxmi Jagannatham',
    address: '11-1-58, Kanteshwear, Telangana.',
    district: 'Nizamabad',
    pincode: '503002',
    occupation: '',
    phone: '9848765051',
    bloodGroup: '',
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

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase());
  const members: CommunityMember[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].trim();
    if (!row) continue;
    const values = parseLine(row);
    if (values.length < 2) continue;

    const getCol = (name: string) => {
      const idx = headers.findIndex((h) => h.includes(name.toLowerCase()));
      return idx >= 0 && idx < values.length ? values[idx] : '';
    };

    const name = getCol('name') || '';
    const surname = getCol('surname') || '';
    if (!name && !surname) continue;

    const fullName = `${name} ${surname}`.trim();
    const gothram = getCol('gothram') || '';
    const district = getCol('district') || 'Nizamabad';
    const address = getCol('address') || '';
    const pincode = getCol('pincode') || '';
    const occupation = getCol('occupation') || '';
    const phone = getCol('phone') || '';
    const bloodGroup = getCol('blood') || '';
    const membershipId = getCol('membership') || String(i);

    members.push({
      id: String(i),
      name,
      surname,
      fullName,
      gothram,
      district,
      address,
      pincode,
      occupation,
      phone,
      bloodGroup,
      membershipId,
    });
  }

  return members.length > 0 ? members : FALLBACK_MEMBERS;
}

export async function GET() {
  try {
    const res = await fetch(GOOGLE_SHEET_CSV_URL, {
      cache: 'no-store',
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
