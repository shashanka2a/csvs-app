'use client';

export interface GalleryPhoto {
  id: number;
  url: string;
  order: number;
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
    badge: 'Welcome to Chattada Sri Vaishnava Sangham',
    title: 'All About',
    titleHighlight: 'Our Community',
    description:
      'Bringing our community together across Telangana — connecting families, celebrating our heritage, and supporting one another.',
    ctaText: 'Explore Community',
    ctaLink: '/members',
  },
  contact: {
    personName: 'J Ravi Chandar',
    phone: '+91 98487 65051',
    email: 'csvsangham@gmail.com',
    address: 'Housing Board Colony, Nizamabad, Telangana 503002',
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
    return {
      hero: { ...DEFAULT_CONTENT.hero, ...(parsed.hero || {}) },
      contact: { ...DEFAULT_CONTENT.contact, ...(parsed.contact || {}) },
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
