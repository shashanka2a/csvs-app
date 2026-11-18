'use client';

export interface GalleryPhoto {
  id: number;
  url: string;
  title: string;
  tag: 'Festivals' | 'Weddings' | 'Community' | 'Cultural';
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
  { id: 1, url: '/images/1.jpg', title: 'Community Gathering', tag: 'Community', order: 1 },
  { id: 2, url: '/images/2.jpg', title: 'Festive Celebrations', tag: 'Festivals', order: 2 },
  { id: 3, url: '/images/3.jpg', title: 'Community Meeting', tag: 'Community', order: 3 },
  { id: 4, url: '/images/4.jpg', title: 'Cultural Program', tag: 'Cultural', order: 4 },
  { id: 5, url: '/images/5.jpg', title: 'Family Gathering', tag: 'Community', order: 5 },
  { id: 6, url: '/images/6.jpg', title: 'Traditional Celebrations', tag: 'Cultural', order: 6 },
  { id: 7, url: '/images/7.jpg', title: 'Festival of Lights', tag: 'Festivals', order: 7 },
  { id: 8, url: '/images/8.jpg', title: 'Community Assembly', tag: 'Community', order: 8 },
  { id: 9, url: '/images/9.jpg', title: 'Traditional Ceremony', tag: 'Cultural', order: 9 },
  { id: 10, url: '/images/10.jpg', title: 'Sangham Members Meet', tag: 'Community', order: 10 },
  { id: 11, url: '/images/11.jpg', title: 'Annual Celebrations', tag: 'Festivals', order: 11 },
  { id: 12, url: '/images/12.jpg', title: 'Community Group Photo', tag: 'Community', order: 12 },
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
    address: 'Ambedkar Colony, Nizamabad, Telangana 503002',
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
