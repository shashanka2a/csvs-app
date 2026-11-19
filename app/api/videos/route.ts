import { NextResponse } from 'next/server';
import { VideoGroup } from '@/app/api/gallery/route';

const GOOGLE_SHEET_VIDEOS_CSV_URL =
  process.env.GOOGLE_SHEET_VIDEOS_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/1dBt3frHaSwowBHPjk3YoN_41W8hqa3UWsiNwjO0nDzQ/export?format=csv';

const GOOGLE_SHEET_VIDEOS_GVIZ_URL =
  'https://docs.google.com/spreadsheets/d/1dBt3frHaSwowBHPjk3YoN_41W8hqa3UWsiNwjO0nDzQ/gviz/tq?tqx=out:csv';

export async function GET() {
  try {
    const res = await fetch('/api/gallery', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        videoGroups: data.videoGroups || [],
        total: data.totalVideos || 0,
        source: 'google-sheet',
      });
    }
  } catch (e) {
    // fallback
  }

  return NextResponse.json({
    videoGroups: [],
    total: 0,
    source: 'google-sheet',
  });
}
