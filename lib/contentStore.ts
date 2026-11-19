'use client';

export interface GalleryPhoto {
  id: number;
  url: string;
  order: number;
  title?: string;
  fileName?: string;
}

export interface FeaturedEvent {
  id: number;
  title: string;
  month: string;
  day: string;
  year: string;
  time: string;
  location: string;
  category: 'Spiritual' | 'Community' | 'Celebration';
  description: string;
  image: string;
}

export interface SiteContent {
  hero: {
    badge: string;
    title: string;
    titleHighlight: string;
    description: string;
    ctaText: string;
    ctaLink: string;
  };
  contact: {
    personName: string;
    phone: string;
    email: string;
    address: string;
  };
  events: FeaturedEvent[];
}

export const DEFAULT_PHOTOS: GalleryPhoto[] = [
  { id: 1, url: 'https://raw.githubusercontent.com/shashanka2a/csvs-app/refs/heads/main/public/images/1.jpg', order: 1 },
  { id: 2, url: 'https://raw.githubusercontent.com/shashanka2a/csvs-app/refs/heads/main/public/images/2.jpg', order: 2 },
  { id: 3, url: 'https://raw.githubusercontent.com/shashanka2a/csvs-app/refs/heads/main/public/images/3.jpg', order: 3 },
  { id: 4, url: 'https://raw.githubusercontent.com/shashanka2a/csvs-app/refs/heads/main/public/images/4.jpg', order: 4 },
  { id: 5, url: 'https://raw.githubusercontent.com/shashanka2a/csvs-app/refs/heads/main/public/images/5.jpg', order: 5 },
  { id: 6, url: 'https://raw.githubusercontent.com/shashanka2a/csvs-app/refs/heads/main/public/images/6.jpg', order: 6 },
  { id: 7, url: 'https://raw.githubusercontent.com/shashanka2a/csvs-app/refs/heads/main/public/images/7.jpg', order: 7 },
];

export const DEFAULT_CONTENT: SiteContent = {
  hero: {
    badge: 'Chattada Sri Vaishnava Sangham • Telangana',
    title: 'Preserving Tradition,',
    titleHighlight: 'Uniting Families',
    description:
      'Bringing our Chattada Sri Vaishnava community together across Telangana — connecting families, celebrating our sacred heritage, and supporting one another.',
    ctaText: 'Explore Directory',
    ctaLink: '/members',
  },
  contact: {
    personName: 'J Ravi Chandar',
    phone: '+91 98487 65051',
    email: 'csvsangham@gmail.com',
    address: 'Kanteshwar, Nizamabad, Telangana 503002',
  },
  events: [
    {
      id: 1,
      title: 'Community Spiritual Talk & Gathering',
      month: 'DEC',
      day: '05',
      year: '2026',
      time: '10:00 AM – 1:00 PM',
      location: 'Nizamabad Central',
      category: 'Spiritual',
      description:
        'An inspiring talk on community traditions and family values, followed by traditional prasadam and blessings.',
      image: 'https://images.unsplash.com/photo-1669394377141-490dc8776678?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 2,
      title: 'Annual Community Meeting',
      month: 'DEC',
      day: '15',
      year: '2026',
      time: '4:00 PM – 7:30 PM',
      location: 'Bodhan',
      category: 'Community',
      description:
        'An annual get-together for families, youth, and organizers to discuss community support programs and upcoming activities.',
      image: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 3,
      title: 'Festival of Lights Celebration',
      month: 'JAN',
      day: '08',
      year: '2027',
      time: '6:00 PM – 9:00 PM',
      location: 'Armoor',
      category: 'Celebration',
      description:
        'Traditional lighting of lamps, devotional songs, and a warm dinner together with community families.',
      image: 'https://images.unsplash.com/photo-1508261301902-127bcfb92787?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
  ],
};

const PHOTOS_STORAGE_KEY = 'csvs_gallery_photos';
const CONTENT_STORAGE_KEY = 'csvs_site_content';

export function getStoredPhotos(): GalleryPhoto[] {
  if (typeof window === 'undefined') return DEFAULT_PHOTOS;
  try {
    const raw = localStorage.getItem(PHOTOS_STORAGE_KEY);
    if (!raw) return DEFAULT_PHOTOS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PHOTOS;
  } catch {
    return DEFAULT_PHOTOS;
  }
}

export function saveStoredPhotos(photos: GalleryPhoto[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(photos));
    window.dispatchEvent(new Event('csvs_photos_updated'));
  } catch (err) {
    console.error('Failed to save photos to localStorage', err);
  }
}

export function resetStoredPhotos(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PHOTOS_STORAGE_KEY);
    window.dispatchEvent(new Event('csvs_photos_updated'));
  } catch (err) {
    console.error('Failed to reset photos', err);
  }
}

export function getStoredContent(): SiteContent {
  if (typeof window === 'undefined') return DEFAULT_CONTENT;
  try {
    const raw = localStorage.getItem(CONTENT_STORAGE_KEY);
    if (!raw) return DEFAULT_CONTENT;
    const parsed = JSON.parse(raw);
    const contact = { ...DEFAULT_CONTENT.contact, ...(parsed.contact || {}) };
    if (contact.address === 'Housing Board Colony, Nizamabad, Telangana 503002') {
      contact.address = 'Kanteshwar, Nizamabad, Telangana 503002';
    }
    const hero = { ...DEFAULT_CONTENT.hero, ...(parsed.hero || {}) };
    if (hero.title === 'All About') {
      hero.badge = DEFAULT_CONTENT.hero.badge;
      hero.title = DEFAULT_CONTENT.hero.title;
      hero.titleHighlight = DEFAULT_CONTENT.hero.titleHighlight;
      hero.description = DEFAULT_CONTENT.hero.description;
      hero.ctaText = DEFAULT_CONTENT.hero.ctaText;
    }
    return {
      hero,
      contact,
      events: Array.isArray(parsed.events) && parsed.events.length > 0 ? parsed.events : DEFAULT_CONTENT.events,
    };
  } catch {
    return DEFAULT_CONTENT;
  }
}

export function saveStoredContent(content: SiteContent): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(content));
    window.dispatchEvent(new Event('csvs_content_updated'));
  } catch (err) {
    console.error('Failed to save content to localStorage', err);
  }
}

export function resetStoredContent(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CONTENT_STORAGE_KEY);
    window.dispatchEvent(new Event('csvs_content_updated'));
  } catch (err) {
    console.error('Failed to reset content', err);
  }
}

export interface AdminGalleryItem {
  id: string;
  url: string;
  eventName: string;
  date: string;
  rawDate?: string;
  caption?: string;
  order?: number;
}

export interface AdminVideoItem {
  id: string;
  url: string;
  embedUrl: string;
  streamUrl?: string;
  thumbnailUrl: string;
  platform: 'youtube' | 'drive' | 'vimeo' | 'direct';
  eventName: string;
  date: string;
  rawDate?: string;
  caption?: string;
  order?: number;
}

export const CUSTOM_GALLERY_PHOTOS_KEY = 'csvs_custom_gallery_photos';
export const CUSTOM_GALLERY_VIDEOS_KEY = 'csvs_custom_gallery_videos';

export function getStoredCustomPhotos(): AdminGalleryItem[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CUSTOM_GALLERY_PHOTOS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function saveStoredCustomPhotos(photos: AdminGalleryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_GALLERY_PHOTOS_KEY, JSON.stringify(photos));
    window.dispatchEvent(new Event('csvs_gallery_custom_updated'));
  } catch (err) {
    console.error('Failed to save custom photos', err);
  }
}

export function resetStoredCustomPhotos(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CUSTOM_GALLERY_PHOTOS_KEY);
    window.dispatchEvent(new Event('csvs_gallery_custom_updated'));
  } catch (err) {
    console.error('Failed to reset custom photos', err);
  }
}

export function getStoredCustomVideos(): AdminVideoItem[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CUSTOM_GALLERY_VIDEOS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function saveStoredCustomVideos(videos: AdminVideoItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_GALLERY_VIDEOS_KEY, JSON.stringify(videos));
    window.dispatchEvent(new Event('csvs_gallery_custom_updated'));
  } catch (err) {
    console.error('Failed to save custom videos', err);
  }
}

export function resetStoredCustomVideos(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CUSTOM_GALLERY_VIDEOS_KEY);
    window.dispatchEvent(new Event('csvs_gallery_custom_updated'));
  } catch (err) {
    console.error('Failed to reset custom videos', err);
  }
}

// Convert any Google Drive sharing link to a direct preview image URL
export function formatGoogleDriveImageUrl(rawUrl: string): string {
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

export const CUSTOM_EVENTS_KEY = 'csvs_custom_events';
export const CUSTOM_MEMBERS_KEY = 'csvs_custom_members';

export function getStoredCustomEvents(): any[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CUSTOM_EVENTS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function saveStoredCustomEvents(events: any[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_EVENTS_KEY, JSON.stringify(events));
    window.dispatchEvent(new Event('csvs_events_custom_updated'));
  } catch (err) {
    console.error('Failed to save custom events', err);
  }
}

export function resetStoredCustomEvents(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CUSTOM_EVENTS_KEY);
    window.dispatchEvent(new Event('csvs_events_custom_updated'));
  } catch (err) {
    console.error('Failed to reset custom events', err);
  }
}

export function getStoredCustomMembers(): any[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CUSTOM_MEMBERS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function saveStoredCustomMembers(members: any[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_MEMBERS_KEY, JSON.stringify(members));
    window.dispatchEvent(new Event('csvs_members_custom_updated'));
  } catch (err) {
    console.error('Failed to save custom members', err);
  }
}

export function resetStoredCustomMembers(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CUSTOM_MEMBERS_KEY);
    window.dispatchEvent(new Event('csvs_members_custom_updated'));
  } catch (err) {
    console.error('Failed to reset custom members', err);
  }
}


