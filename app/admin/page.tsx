'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Lock,
  LogOut,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Save,
  RotateCcw,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  ImageIcon,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Film,
  Play,
  Copy,
  Edit2,
  Table,
  CheckCircle2,
  X,
  Search,
  Users,
  CalendarDays,
  Clock,
  Briefcase,
} from 'lucide-react';
import Logo from '@/components/Logo';
import {
  AdminGalleryItem,
  AdminVideoItem,
  getStoredCustomPhotos,
  saveStoredCustomPhotos,
  resetStoredCustomPhotos,
  getStoredCustomVideos,
  saveStoredCustomVideos,
  resetStoredCustomVideos,
  getStoredCustomEvents,
  saveStoredCustomEvents,
  resetStoredCustomEvents,
  getStoredCustomMembers,
  saveStoredCustomMembers,
  resetStoredCustomMembers,
  formatGoogleDriveImageUrl,
} from '@/lib/contentStore';
import type { SanghamEvent } from '@/app/api/events/route';
import type { CommunityMember } from '@/app/api/members/route';

// Google Sheet URLs
const GOOGLE_SHEETS = {
  photos: {
    name: 'Photo Gallery Sheet',
    url: 'https://docs.google.com/spreadsheets/d/1mO7L6B9JewS4CitYcK3wTD-HhMBww76oeCb-3iQJr1g/edit?gid=1532582308#gid=1532582308',
    gid: '1532582308',
    description: 'Event photo albums and Google Drive image links.',
  },
  videos: {
    name: 'Video Gallery Sheet',
    url: 'https://docs.google.com/spreadsheets/d/1dBt3frHaSwowBHPjk3YoN_41W8hqa3UWsiNwjO0nDzQ/edit?usp=sharing',
    gid: '0',
    description: 'YouTube, Google Drive, and Vimeo community video recordings.',
  },
  events: {
    name: 'Sangham Events Sheet',
    url: 'https://docs.google.com/spreadsheets/d/1mUNv-OQf39D81ijUPEcSDON-VY8rmWqLlpasUQ-tSIk/edit?gid=327105065#gid=327105065',
    gid: '327105065',
    description: 'Upcoming spiritual talks, community meetings, and annual functions.',
  },
  members: {
    name: 'Community Directory Sheet',
    url: 'https://docs.google.com/spreadsheets/d/14e3REBG8Jh4rVtAHGs5LTq3irPBVz2bSssxysEJA_GM/edit?gid=0#gid=0',
    gid: '0',
    description: 'Member directory with names, Gotram, occupation, and phone.',
  },
};

// Parse video URL to extract platform and embed info
function parseVideoInput(rawUrl: string): {
  url: string;
  embedUrl: string;
  streamUrl?: string;
  thumbnailUrl: string;
  platform: 'youtube' | 'drive' | 'vimeo' | 'direct';
} {
  const clean = rawUrl.trim().replace(/^["'\s]+|["'\s,;]+$/g, '');
  if (!clean) {
    return { url: '', embedUrl: '', thumbnailUrl: '', platform: 'direct' };
  }

  // YouTube
  const ytMatch =
    clean.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/) ||
    clean.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      url: clean,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`,
      streamUrl: '',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      platform: 'youtube',
    };
  }

  // Google Drive
  const driveMatch =
    clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    clean.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (
    driveMatch &&
    driveMatch[1] &&
    (clean.includes('drive.google.com') ||
      clean.includes('docs.google.com') ||
      clean.includes('googleusercontent.com'))
  ) {
    const fileId = driveMatch[1];
    return {
      url: clean,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      streamUrl: `/api/video-stream?id=${fileId}`,
      thumbnailUrl: `https://lh3.googleusercontent.com/d/${fileId}`,
      platform: 'drive',
    };
  }

  // Vimeo
  const vimeoMatch = clean.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    const vimeoId = vimeoMatch[1];
    return {
      url: clean,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1`,
      thumbnailUrl: '',
      platform: 'vimeo',
    };
  }

  return {
    url: clean,
    embedUrl: clean,
    streamUrl: clean,
    thumbnailUrl: '',
    platform: 'direct',
  };
}

export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');

  // Active tab: photos, videos, events, members, sheets
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'events' | 'members' | 'sheets'>('photos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state
  const [syncing, setSyncing] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<string>('Just now');

  // --- Photos & Videos State ---
  const [rawSheetPhotos, setRawSheetPhotos] = useState<AdminGalleryItem[]>([]);
  const [rawSheetVideos, setRawSheetVideos] = useState<AdminVideoItem[]>([]);
  const [photos, setPhotos] = useState<AdminGalleryItem[]>([]);
  const [videos, setVideos] = useState<AdminVideoItem[]>([]);
  const [photoSearch, setPhotoSearch] = useState<string>('');
  const [selectedAlbum, setSelectedAlbum] = useState<string>('all');
  const [editingPhoto, setEditingPhoto] = useState<AdminGalleryItem | null>(null);
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState<boolean>(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');
  const [newPhotoEvent, setNewPhotoEvent] = useState<string>('ప్రమాణ స్వీకారోత్సవం');
  const [newPhotoDate, setNewPhotoDate] = useState<string>('2026-10-16');
  const [editingVideo, setEditingVideo] = useState<AdminVideoItem | null>(null);
  const [isAddVideoOpen, setIsAddVideoOpen] = useState<boolean>(false);
  const [newVideoUrl, setNewVideoUrl] = useState<string>('');
  const [newVideoEvent, setNewVideoEvent] = useState<string>('ప్రమాణ స్వీకారోత్సవం');
  const [newVideoDate, setNewVideoDate] = useState<string>('2026-10-16');
  const [previewVideo, setPreviewVideo] = useState<AdminVideoItem | null>(null);

  // --- Events State ---
  const [rawSheetEvents, setRawSheetEvents] = useState<SanghamEvent[]>([]);
  const [events, setEvents] = useState<SanghamEvent[]>([]);
  const [eventSearch, setEventSearch] = useState<string>('');
  const [selectedEventType, setSelectedEventType] = useState<string>('All');
  const [editingEvent, setEditingEvent] = useState<SanghamEvent | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState<boolean>(false);
  const [newEvent, setNewEvent] = useState<Partial<SanghamEvent>>({
    title: '',
    type: 'Community',
    date: '2026-12-05',
    time: '10:00 AM – 1:00 PM',
    location: 'Nizamabad',
    description: '',
    image: '',
  });

  // --- Members State ---
  const [rawSheetMembers, setRawSheetMembers] = useState<CommunityMember[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [memberSearch, setMemberSearch] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [editingMember, setEditingMember] = useState<CommunityMember | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState<boolean>(false);
  const [newMember, setNewMember] = useState<Partial<CommunityMember>>({
    fullName: '',
    surname: '',
    name: '',
    district: 'Nizamabad',
    occupation: '',
    membershipId: '',
    photo: '',
  });

  // Export Modal
  const [exportModalType, setExportModalType] = useState<'photos' | 'videos' | 'events' | 'members' | null>(null);
  const [copiedExport, setCopiedExport] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch all Google Sheets data
  const fetchAllSheetsData = useCallback(async (isManualSync = false) => {
    if (isManualSync) setSyncing(true);
    try {
      const [galleryRes, eventsRes, membersRes] = await Promise.all([
        fetch('/api/gallery', { cache: 'no-store' }),
        fetch('/api/events', { cache: 'no-store' }),
        fetch('/api/members', { cache: 'no-store' }),
      ]);

      // 1. Process Photos & Videos
      if (galleryRes.ok) {
        const data = await galleryRes.json();
        const sheetPhotos: AdminGalleryItem[] = [];
        if (Array.isArray(data.groups)) {
          data.groups.forEach((g: any, gIdx: number) => {
            if (Array.isArray(g.photos)) {
              g.photos.forEach((p: any, pIdx: number) => {
                sheetPhotos.push({
                  id: p.id || `photo-${gIdx}-${pIdx}`,
                  url: p.url,
                  eventName: p.eventName || g.eventName || 'CSVS Moments',
                  date: p.date || g.date || '',
                  rawDate: p.rawDate || g.date || '',
                  order: sheetPhotos.length + 1,
                });
              });
            }
          });
        }

        const sheetVideos: AdminVideoItem[] = [];
        if (Array.isArray(data.videoGroups)) {
          data.videoGroups.forEach((vg: any, vgIdx: number) => {
            if (Array.isArray(vg.videos)) {
              vg.videos.forEach((v: any, vIdx: number) => {
                sheetVideos.push({
                  id: v.id || `video-${vgIdx}-${vIdx}`,
                  url: v.url,
                  embedUrl: v.embedUrl,
                  streamUrl: v.streamUrl,
                  thumbnailUrl: v.thumbnailUrl,
                  platform: v.platform || 'drive',
                  eventName: v.eventName || vg.eventName || 'CSVS Videos',
                  date: v.date || vg.date || '',
                  rawDate: v.rawDate || vg.date || '',
                  order: sheetVideos.length + 1,
                });
              });
            }
          });
        }

        setRawSheetPhotos(sheetPhotos);
        setRawSheetVideos(sheetVideos);

        const storedPhotos = getStoredCustomPhotos();
        setPhotos(storedPhotos && storedPhotos.length > 0 ? storedPhotos : sheetPhotos);

        const storedVideos = getStoredCustomVideos();
        setVideos(storedVideos && storedVideos.length > 0 ? storedVideos : sheetVideos);
      }

      // 2. Process Events
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        const sheetEvents: SanghamEvent[] = Array.isArray(eventsData.events) ? eventsData.events : [];
        setRawSheetEvents(sheetEvents);

        const storedEvents = getStoredCustomEvents();
        setEvents(storedEvents && storedEvents.length > 0 ? storedEvents : sheetEvents);
      }

      // 3. Process Members
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        const sheetMembers: CommunityMember[] = Array.isArray(membersData.members) ? membersData.members : [];
        setRawSheetMembers(sheetMembers);

        const storedMembers = getStoredCustomMembers();
        setMembers(storedMembers && storedMembers.length > 0 ? storedMembers : sheetMembers);
      }

      setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      if (isManualSync) {
        showToast('All Google Sheets data refreshed successfully!');
      }
    } catch (err) {
      console.warn('Failed to fetch from Google Sheets', err);
      if (isManualSync) {
        showToast('Error syncing from Google Sheets.');
      }
    } finally {
      if (isManualSync) setSyncing(false);
    }
  }, []);

  // Check login state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('csvs_admin_token') || sessionStorage.getItem('csvs_admin_token');
      if (token === 'csvs_authenticated') {
        setIsAuthenticated(true);
      }
      fetchAllSheetsData();
    }
    setAuthChecking(false);
  }, [fetchAllSheetsData]);

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const validUsername =
      username.trim().toLowerCase() === 'admin' ||
      username.trim().toLowerCase() === 'csvsangham@gmail.com';
    const validPassword = password === 'Demo@123' || password === 'admin123';

    if (validUsername && validPassword) {
      localStorage.setItem('csvs_admin_token', 'csvs_authenticated');
      setIsAuthenticated(true);
      showToast('Logged in successfully to CSVS Admin Portal!');
    } else {
      setLoginError('Invalid credentials. (Demo: admin / admin123)');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('csvs_admin_token');
    sessionStorage.removeItem('csvs_admin_token');
    setIsAuthenticated(false);
    showToast('Logged out of Admin Portal.');
  };

  // --- Photo Filters & Handlers ---
  const albumOptions = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => {
      if (p.eventName) set.add(p.eventName);
    });
    return Array.from(set);
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    return photos.filter((p) => {
      const matchesAlbum = selectedAlbum === 'all' || p.eventName === selectedAlbum;
      const q = photoSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.eventName.toLowerCase().includes(q) ||
        p.date.toLowerCase().includes(q) ||
        p.url.toLowerCase().includes(q);
      return matchesAlbum && matchesSearch;
    });
  }, [photos, selectedAlbum, photoSearch]);

  const movePhoto = (currentIndexInFiltered: number, direction: 'up' | 'down') => {
    const item = filteredPhotos[currentIndexInFiltered];
    if (!item) return;

    const originalIndex = photos.findIndex((p) => p.id === item.id);
    if (originalIndex === -1) return;

    const targetIndex = direction === 'up' ? originalIndex - 1 : originalIndex + 1;
    if (targetIndex < 0 || targetIndex >= photos.length) return;

    const updated = [...photos];
    const [moved] = updated.splice(originalIndex, 1);
    updated.splice(targetIndex, 0, moved);

    const reordered = updated.map((p, idx) => ({ ...p, order: idx + 1 }));
    setPhotos(reordered);
    showToast(`Moved photo to position #${targetIndex + 1}. Remember to click "Save & Publish".`);
  };

  const movePhotoToExtreme = (currentIndexInFiltered: number, position: 'top' | 'bottom') => {
    const item = filteredPhotos[currentIndexInFiltered];
    if (!item) return;

    const originalIndex = photos.findIndex((p) => p.id === item.id);
    if (originalIndex === -1) return;

    const updated = [...photos];
    const [moved] = updated.splice(originalIndex, 1);
    if (position === 'top') {
      updated.unshift(moved);
    } else {
      updated.push(moved);
    }

    const reordered = updated.map((p, idx) => ({ ...p, order: idx + 1 }));
    setPhotos(reordered);
    showToast(`Moved photo to ${position}. Click "Save & Publish" to apply.`);
  };

  const removePhoto = (id: string) => {
    if (!confirm('Are you sure you want to remove this photo?')) return;
    const updated = photos.filter((p) => p.id !== id).map((p, idx) => ({ ...p, order: idx + 1 }));
    setPhotos(updated);
    showToast('Photo removed. Click "Save & Publish" to update website.');
  };

  const handleSavePhotoDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;

    const formattedUrl = formatGoogleDriveImageUrl(editingPhoto.url);
    const updated = photos.map((p) =>
      p.id === editingPhoto.id ? { ...editingPhoto, url: formattedUrl } : p
    );
    setPhotos(updated);
    setEditingPhoto(null);
    showToast('Photo updated! Remember to click "Save & Publish".');
  };

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;

    const formattedUrl = formatGoogleDriveImageUrl(newPhotoUrl.trim());
    const newEntry: AdminGalleryItem = {
      id: `custom-photo-${Date.now()}`,
      url: formattedUrl,
      eventName: newPhotoEvent.trim() || 'CSVS Moments',
      date: newPhotoDate.trim() || new Date().toISOString().split('T')[0],
      order: 1,
    };

    const updated = [newEntry, ...photos].map((p, idx) => ({ ...p, order: idx + 1 }));
    setPhotos(updated);
    setIsAddPhotoOpen(false);
    setNewPhotoUrl('');
    showToast('Photo added! Click "Save & Publish" to apply.');
  };

  const handleSaveAllPhotos = () => {
    saveStoredCustomPhotos(photos);
    showToast('Published! Photo rearrangements are LIVE on website.');
  };

  const handleResetPhotosToSheet = () => {
    if (confirm('Revert all photos back to the raw Google Sheets data?')) {
      resetStoredCustomPhotos();
      setPhotos(rawSheetPhotos);
      showToast('Reverted photos to Google Sheets default.');
    }
  };

  // --- Video Handlers ---
  const moveVideo = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= videos.length) return;

    const updated = [...videos];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    const reordered = updated.map((v, idx) => ({ ...v, order: idx + 1 }));
    setVideos(reordered);
    showToast(`Moved video to position #${targetIndex + 1}.`);
  };

  const removeVideo = (id: string) => {
    if (!confirm('Are you sure you want to remove this video?')) return;
    const updated = videos.filter((v) => v.id !== id).map((v, idx) => ({ ...v, order: idx + 1 }));
    setVideos(updated);
    showToast('Video removed.');
  };

  const handleSaveVideoDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    const parsed = parseVideoInput(editingVideo.url);
    const updated = videos.map((v) =>
      v.id === editingVideo.id
        ? {
            ...editingVideo,
            url: parsed.url || editingVideo.url,
            embedUrl: parsed.embedUrl,
            streamUrl: parsed.streamUrl,
            thumbnailUrl: parsed.thumbnailUrl || editingVideo.thumbnailUrl,
            platform: parsed.platform,
          }
        : v
    );
    setVideos(updated);
    setEditingVideo(null);
    showToast('Video details updated! Click "Save & Publish" to apply.');
  };

  const handleAddVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoUrl.trim()) return;

    const parsed = parseVideoInput(newVideoUrl.trim());
    const newEntry: AdminVideoItem = {
      id: `custom-video-${Date.now()}`,
      url: parsed.url || newVideoUrl.trim(),
      embedUrl: parsed.embedUrl,
      streamUrl: parsed.streamUrl,
      thumbnailUrl: parsed.thumbnailUrl,
      platform: parsed.platform,
      eventName: newVideoEvent.trim() || 'CSVS Videos',
      date: newVideoDate.trim() || new Date().toISOString().split('T')[0],
      order: videos.length + 1,
    };

    const updated = [...videos, newEntry].map((v, idx) => ({ ...v, order: idx + 1 }));
    setVideos(updated);
    setIsAddVideoOpen(false);
    setNewVideoUrl('');
    showToast('Video added! Click "Save & Publish" to apply.');
  };

  const handleSaveAllVideos = () => {
    saveStoredCustomVideos(videos);
    showToast('Published! Video rearrangements are LIVE on website.');
  };

  const handleResetVideosToSheet = () => {
    if (confirm('Revert all videos back to the raw Google Sheets data?')) {
      resetStoredCustomVideos();
      setVideos(rawSheetVideos);
      showToast('Reverted videos to Google Sheets default.');
    }
  };

  // --- Events Handlers ---
  const eventTypes = useMemo(() => {
    const set = new Set<string>();
    events.forEach((ev) => {
      if (ev.type) set.add(ev.type);
    });
    return Array.from(set);
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesType = selectedEventType === 'All' || ev.type === selectedEventType;
      const q = eventSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ev.title.toLowerCase().includes(q) ||
        ev.location.toLowerCase().includes(q) ||
        ev.date.toLowerCase().includes(q) ||
        ev.description.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [events, selectedEventType, eventSearch]);

  const moveEvent = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= events.length) return;

    const updated = [...events];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    setEvents(updated);
    showToast(`Moved event to position #${targetIndex + 1}.`);
  };

  const removeEvent = (id: string | number) => {
    if (!confirm('Are you sure you want to remove this event?')) return;
    const updated = events.filter((ev) => ev.id !== id);
    setEvents(updated);
    showToast('Event removed.');
  };

  const handleSaveEventDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    const formattedImage = editingEvent.image ? formatGoogleDriveImageUrl(editingEvent.image) : '';
    const updated = events.map((ev) =>
      ev.id === editingEvent.id
        ? {
            ...editingEvent,
            image: formattedImage,
          }
        : ev
    );
    setEvents(updated);
    setEditingEvent(null);
    showToast('Event details updated! Remember to click "Save & Publish".');
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title?.trim()) return;

    const formattedImage = newEvent.image ? formatGoogleDriveImageUrl(newEvent.image) : '';
    const d = new Date(newEvent.date || '');
    let month = 'EVENT';
    let day = '••';
    let year = '';
    if (!isNaN(d.getTime())) {
      month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      day = String(d.getDate()).padStart(2, '0');
      year = String(d.getFullYear());
    }

    const newEntry: SanghamEvent = {
      id: `custom-event-${Date.now()}`,
      title: newEvent.title.trim(),
      type: newEvent.type || 'Community',
      date: newEvent.date || '',
      time: newEvent.time || '',
      location: newEvent.location || 'Nizamabad',
      description: newEvent.description || '',
      image: formattedImage,
      month,
      day,
      year,
    };

    const updated = [newEntry, ...events];
    setEvents(updated);
    setIsAddEventOpen(false);
    setNewEvent({
      title: '',
      type: 'Community',
      date: '2026-12-05',
      time: '10:00 AM – 1:00 PM',
      location: 'Nizamabad',
      description: '',
      image: '',
    });
    showToast('Event added! Click "Save & Publish" to update website.');
  };

  const handleSaveAllEvents = () => {
    saveStoredCustomEvents(events);
    showToast('Published! Events are now LIVE across the website.');
  };

  const handleResetEventsToSheet = () => {
    if (confirm('Revert all events back to the raw Google Sheets data?')) {
      resetStoredCustomEvents();
      setEvents(rawSheetEvents);
      showToast('Reverted events to Google Sheets default.');
    }
  };

  // --- Members Handlers ---
  const districtOptions = useMemo(() => {
    const set = new Set<string>();
    members.forEach((m) => {
      if (m.district) set.add(m.district);
    });
    return Array.from(set);
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesDistrict = selectedDistrict === 'All' || m.district === selectedDistrict;
      const q = memberSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.fullName.toLowerCase().includes(q) ||
        m.surname.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.occupation.toLowerCase().includes(q) ||
        (m.membershipId && m.membershipId.toLowerCase().includes(q));
      return matchesDistrict && matchesSearch;
    });
  }, [members, selectedDistrict, memberSearch]);

  const removeMember = (id: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    const updated = members.filter((m) => m.id !== id);
    setMembers(updated);
    showToast('Member removed.');
  };

  const handleSaveMemberDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const formattedPhoto = editingMember.photo ? formatGoogleDriveImageUrl(editingMember.photo) : '';
    const updated = members.map((m) =>
      m.id === editingMember.id
        ? {
            ...editingMember,
            photo: formattedPhoto,
            fullName: `${editingMember.surname || ''} ${editingMember.name || ''}`.trim() || editingMember.fullName,
          }
        : m
    );
    setMembers(updated);
    setEditingMember(null);
    showToast('Member details updated! Click "Save & Publish".');
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name?.trim()) return;

    const formattedPhoto = newMember.photo ? formatGoogleDriveImageUrl(newMember.photo) : '';
    const fullName = `${newMember.surname || ''} ${newMember.name || ''}`.trim() || newMember.fullName || 'Member';
    const newEntry: CommunityMember = {
      id: `custom-member-${Date.now()}`,
      name: newMember.name.trim(),
      surname: newMember.surname || '',
      fullName,
      district: newMember.district || 'Nizamabad',
      occupation: newMember.occupation || '',
      membershipId: newMember.membershipId || '',
      photo: formattedPhoto,
    };

    const updated = [newEntry, ...members];
    setMembers(updated);
    setIsAddMemberOpen(false);
    setNewMember({
      fullName: '',
      surname: '',
      name: '',
      district: 'Nizamabad',
      occupation: '',
      membershipId: '',
      photo: '',
    });
    showToast('Member added! Click "Save & Publish" to update website.');
  };

  const handleSaveAllMembers = () => {
    saveStoredCustomMembers(members);
    showToast('Published! Member directory is now LIVE across the website.');
  };

  const handleResetMembersToSheet = () => {
    if (confirm('Revert all members back to the raw Google Sheets data?')) {
      resetStoredCustomMembers();
      setMembers(rawSheetMembers);
      showToast('Reverted members to Google Sheets default.');
    }
  };

  // --- Google Sheet Export Text Generator ---
  const generateExportText = (type: 'photos' | 'videos' | 'events' | 'members') => {
    if (type === 'photos') {
      const map = new Map<string, { eventName: string; date: string; urls: string[] }>();
      photos.forEach((p) => {
        const key = `${p.eventName}___${p.date}`;
        if (!map.has(key)) map.set(key, { eventName: p.eventName, date: p.date, urls: [] });
        map.get(key)!.urls.push(p.url);
      });
      const lines = ['Timestamp\tEvent Name\tDate\tPhotos'];
      map.forEach((item) => {
        lines.push(`${new Date().toLocaleString()}\t${item.eventName}\t${item.date}\t${item.urls.join(', ')}`);
      });
      return lines.join('\n');
    }

    if (type === 'videos') {
      const map = new Map<string, { eventName: string; date: string; urls: string[] }>();
      videos.forEach((v) => {
        const key = `${v.eventName}___${v.date}`;
        if (!map.has(key)) map.set(key, { eventName: v.eventName, date: v.date, urls: [] });
        map.get(key)!.urls.push(v.url);
      });
      const lines = ['Timestamp\tEvent Name\tDate\tVideos'];
      map.forEach((item) => {
        lines.push(`${new Date().toLocaleString()}\t${item.eventName}\t${item.date}\t${item.urls.join(', ')}`);
      });
      return lines.join('\n');
    }

    if (type === 'events') {
      const lines = ['Timestamp\tEvent Name\tDescription\tType\tDate\tTime\tLocation\tPhoto'];
      events.forEach((ev) => {
        lines.push(
          `${new Date().toLocaleString()}\t${ev.title}\t${ev.description}\t${ev.type}\t${ev.date}\t${ev.time}\t${ev.location}\t${ev.image || ''}`
        );
      });
      return lines.join('\n');
    }

    if (type === 'members') {
      const lines = ['Membership ID\tSurname\tName\tFull Name\tDistrict\tOccupation\tPhoto'];
      members.forEach((m) => {
        lines.push(
          `${m.membershipId || ''}\t${m.surname}\t${m.name}\t${m.fullName}\t${m.district}\t${m.occupation}\t${m.photo || ''}`
        );
      });
      return lines.join('\n');
    }

    return '';
  };

  const handleCopyExport = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2500);
    showToast('Copied rows to clipboard! You can paste directly into Google Sheets.');
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-9 h-9 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ==========================================
  // 1. LOGIN SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#141A24] to-brand-dark flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <Logo className="w-14 h-14 rounded-xl shadow-md" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark">
              CSVS Admin Portal
            </h1>
            <p className="text-brand-muted text-xs sm:text-sm mt-1">
              Chattada Sri Vaishnava Sangham • Nizamabad
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Google Sheets Backend Connected</span>
            </div>
          </div>

          {loginError && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                Username or Email
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin or csvsangham@gmail.com"
                className="w-full px-4 py-3 rounded-lg border border-brand-border text-brand-dark focus:ring-2 focus:ring-brand-red focus:border-brand-red outline-none text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 rounded-lg border border-brand-border text-brand-dark focus:ring-2 focus:ring-brand-red focus:border-brand-red outline-none text-sm transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-red hover:bg-brand-redhover text-white font-medium py-3.5 px-4 rounded-lg transition-colors shadow-md text-sm flex items-center justify-center gap-2 mt-2"
            >
              <Lock className="w-4 h-4" />
              <span>Sign In as Administrator</span>
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-gray-100 text-center">
            <Link
              href="/"
              className="inline-block text-xs font-medium text-brand-muted hover:text-brand-red transition-colors"
            >
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. ADMIN DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-100 text-brand-dark pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10 animate-fade-in text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* DEDICATED ADMIN HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-2.5">
                <Logo className="w-9 h-9 rounded-lg shadow-xs shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-lg text-brand-red leading-tight">
                      CSVS Admin
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 tracking-wide uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Sheets Live
                    </span>
                  </div>
                  <p className="text-[11px] text-brand-muted hidden sm:block">
                    Synced: {lastSynced}
                  </p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => fetchAllSheetsData(true)}
                disabled={syncing}
                title="Fetch fresh data from Google Sheets"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors disabled:opacity-50 shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-brand-red ${syncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{syncing ? 'Syncing...' : 'Sync Sheets'}</span>
              </button>

              <Link
                href="/gallery"
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View Site</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 transition-colors shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto no-scrollbar gap-1 sm:gap-6 border-t border-slate-100 pt-1">
            <button
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-2 py-3 px-2 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 ${
                activeTab === 'photos'
                  ? 'border-brand-red text-brand-red'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Photos Manager</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-red-50 text-brand-red font-bold">
                {photos.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-2 py-3 px-2 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 ${
                activeTab === 'videos'
                  ? 'border-brand-red text-brand-red'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Videos Manager</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold">
                {videos.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-2 py-3 px-2 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 ${
                activeTab === 'events'
                  ? 'border-brand-red text-brand-red'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Events Editor</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-50 text-amber-800 font-bold">
                {events.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 py-3 px-2 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 ${
                activeTab === 'members'
                  ? 'border-brand-red text-brand-red'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Members Editor</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-50 text-blue-800 font-bold">
                {members.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('sheets')}
              className={`flex items-center gap-2 py-3 px-2 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 ${
                activeTab === 'sheets'
                  ? 'border-brand-red text-brand-red'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Google Sheets Hub</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-bold">
                4 Sheets
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ========================================================= */}
        {/* TAB 1: PHOTOS MANAGER                                     */}
        {/* ========================================================= */}
        {activeTab === 'photos' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-dark">
                    Gallery Photos Manager
                  </h2>
                  <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                    {photos.length} photos
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-brand-muted mt-1">
                  Rearrange photo order, edit titles and dates, or add new photos from Google Drive.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  onClick={handleResetPhotosToSheet}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Sheet</span>
                </button>

                <button
                  onClick={() => setExportModalType('photos')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Export to Sheet</span>
                </button>

                <button
                  onClick={() => setIsAddPhotoOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Photo</span>
                </button>

                <button
                  onClick={handleSaveAllPhotos}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-red hover:bg-brand-redhover rounded-lg transition-colors shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save &amp; Publish Live</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-grow sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={photoSearch}
                    onChange={(e) => setPhotoSearch(e.target.value)}
                    placeholder="Search by event, date..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>

                <select
                  value={selectedAlbum}
                  onChange={(e) => setSelectedAlbum(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-brand-dark outline-none focus:ring-1 focus:ring-brand-red"
                >
                  <option value="all">All Albums ({photos.length})</option>
                  {albumOptions.map((alb) => (
                    <option key={alb} value={alb}>
                      {alb}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-xs text-brand-muted">
                Showing {filteredPhotos.length} of {photos.length} photos
              </span>
            </div>

            {/* Photos List */}
            <div className="space-y-2.5">
              {filteredPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="w-8 h-8 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      #{index + 1}
                    </span>
                    <div
                      className="relative w-20 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 cursor-pointer"
                      onClick={() => setEditingPhoto(photo)}
                    >
                      <Image
                        src={photo.url}
                        alt={photo.eventName}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-brand-dark truncate">{photo.eventName}</p>
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                        {photo.date}
                      </span>
                    </div>
                    <p className="text-xs text-brand-muted truncate mt-0.5 font-mono">
                      {photo.url}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                    <button
                      title="Move Up"
                      disabled={index === 0}
                      onClick={() => movePhoto(index, 'up')}
                      className="p-1.5 sm:p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      title="Move Down"
                      disabled={index === filteredPhotos.length - 1}
                      onClick={() => movePhoto(index, 'down')}
                      className="p-1.5 sm:p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      title="Move to Top"
                      disabled={index === 0}
                      onClick={() => movePhotoToExtreme(index, 'top')}
                      className="px-2 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Top
                    </button>
                    <button
                      title="Edit Details"
                      onClick={() => setEditingPhoto(photo)}
                      className="p-1.5 sm:p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors ml-1"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      title="Remove Photo"
                      onClick={() => removePhoto(photo.id)}
                      className="p-1.5 sm:p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: VIDEOS MANAGER                                     */}
        {/* ========================================================= */}
        {activeTab === 'videos' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-dark">
                    Gallery Videos Manager
                  </h2>
                  <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                    {videos.length} videos
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-brand-muted mt-1">
                  Manage YouTube, Google Drive, and Vimeo video recordings from community events.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  onClick={handleResetVideosToSheet}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Sheet</span>
                </button>

                <button
                  onClick={() => setExportModalType('videos')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Export to Sheet</span>
                </button>

                <button
                  onClick={() => setIsAddVideoOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Video</span>
                </button>

                <button
                  onClick={handleSaveAllVideos}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-red hover:bg-brand-redhover rounded-lg transition-colors shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save &amp; Publish Live</span>
                </button>
              </div>
            </div>

            {/* Video List */}
            <div className="space-y-3">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="w-8 h-8 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      #{index + 1}
                    </span>
                    <div
                      onClick={() => setPreviewVideo(video)}
                      className="relative w-24 h-16 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 shrink-0 cursor-pointer group flex items-center justify-center"
                    >
                      {video.thumbnailUrl ? (
                        <Image
                          src={video.thumbnailUrl}
                          alt={video.eventName}
                          fill
                          unoptimized
                          className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <Film className="w-6 h-6 text-slate-400" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                        <Play className="w-6 h-6 text-white drop-shadow-md fill-white" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-brand-dark truncate">{video.eventName}</p>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                        {video.platform}
                      </span>
                      <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full shrink-0">
                        {video.date}
                      </span>
                    </div>
                    <p className="text-xs text-brand-muted truncate mt-0.5 font-mono">
                      {video.url}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                    <button
                      title="Move Up"
                      disabled={index === 0}
                      onClick={() => moveVideo(index, 'up')}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      title="Move Down"
                      disabled={index === videos.length - 1}
                      onClick={() => moveVideo(index, 'down')}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      title="Preview Playback"
                      onClick={() => setPreviewVideo(video)}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      title="Edit Details"
                      onClick={() => setEditingVideo(video)}
                      className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors ml-1"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      title="Remove Video"
                      onClick={() => removeVideo(video.id)}
                      className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: EVENTS EDITOR                                      */}
        {/* ========================================================= */}
        {activeTab === 'events' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-dark">
                    Sangham Events Editor
                  </h2>
                  <span className="text-xs bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded-md">
                    {events.length} events
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-brand-muted mt-1">
                  Manage upcoming community functions, spiritual meetings, and celebrations.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  onClick={handleResetEventsToSheet}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Sheet</span>
                </button>

                <button
                  onClick={() => setExportModalType('events')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Export to Sheet</span>
                </button>

                <button
                  onClick={() => setIsAddEventOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Event</span>
                </button>

                <button
                  onClick={handleSaveAllEvents}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-red hover:bg-brand-redhover rounded-lg transition-colors shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save &amp; Publish Live</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-grow sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    placeholder="Search title, location, description..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>

                <select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-brand-dark outline-none focus:ring-1 focus:ring-brand-red"
                >
                  <option value="All">All Categories ({events.length})</option>
                  {eventTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-xs text-brand-muted">
                Showing {filteredEvents.length} of {events.length} events
              </span>
            </div>

            {/* Event Cards */}
            <div className="space-y-3">
              {filteredEvents.map((ev, index) => (
                <div
                  key={ev.id}
                  className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Date Badge */}
                    <div className="w-16 h-16 rounded-xl bg-red-50 border border-brand-red/20 flex flex-col items-center justify-center shrink-0 text-center">
                      <span className="text-[10px] font-bold text-brand-red uppercase">{ev.month || 'EVENT'}</span>
                      <span className="text-lg font-serif font-bold text-brand-dark leading-none">{ev.day || '••'}</span>
                      <span className="text-[9px] text-brand-muted">{ev.year}</span>
                    </div>

                    {/* Image thumbnail if present */}
                    {ev.image && (
                      <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 hidden sm:block">
                        <Image
                          src={ev.image}
                          alt={ev.title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Details */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-brand-dark">{ev.title}</h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          {ev.type}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-brand-muted mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ev.time}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ev.location}</span>
                        </span>
                      </div>

                      {ev.description && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-1 max-w-2xl">
                          {ev.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                    <button
                      title="Move Up"
                      disabled={index === 0}
                      onClick={() => moveEvent(index, 'up')}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      title="Move Down"
                      disabled={index === events.length - 1}
                      onClick={() => moveEvent(index, 'down')}
                      className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      title="Edit Details"
                      onClick={() => setEditingEvent(ev)}
                      className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors ml-1"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      title="Remove Event"
                      onClick={() => removeEvent(ev.id)}
                      className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: MEMBERS EDITOR                                     */}
        {/* ========================================================= */}
        {activeTab === 'members' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-dark">
                    Community Members Directory Editor
                  </h2>
                  <span className="text-xs bg-blue-50 text-blue-800 font-semibold px-2 py-0.5 rounded-md">
                    {members.length} members
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-brand-muted mt-1">
                  Manage member profiles, occupations, districts, and membership IDs.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  onClick={handleResetMembersToSheet}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Sheet</span>
                </button>

                <button
                  onClick={() => setExportModalType('members')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Export to Sheet</span>
                </button>

                <button
                  onClick={() => setIsAddMemberOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Member</span>
                </button>

                <button
                  onClick={handleSaveAllMembers}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-red hover:bg-brand-redhover rounded-lg transition-colors shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save &amp; Publish Live</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-grow sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search by name, surname, occupation..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>

                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-brand-dark outline-none focus:ring-1 focus:ring-brand-red"
                >
                  <option value="All">All Districts ({members.length})</option>
                  {districtOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-xs text-brand-muted">
                Showing {filteredMembers.length} of {members.length} members
              </span>
            </div>

            {/* Members Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredMembers.map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-brand-red/10 border border-brand-red/20 shrink-0 flex items-center justify-center text-brand-red font-bold text-sm">
                      {m.photo ? (
                        <Image
                          src={m.photo}
                          alt={m.fullName}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <span>{m.fullName.charAt(0) || 'M'}</span>
                      )}
                    </div>

                    {/* Member Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-brand-dark truncate">{m.fullName}</p>
                        {m.membershipId && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-mono font-bold px-1.5 py-0.2 rounded shrink-0">
                            #{m.membershipId}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-brand-muted mt-0.5">
                        <span className="truncate">{m.occupation || 'Community Member'}</span>
                        <span>•</span>
                        <span className="truncate">{m.district}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      title="Edit Member"
                      onClick={() => setEditingMember(m)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Remove Member"
                      onClick={() => removeMember(m.id)}
                      className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: GOOGLE SHEETS HUB                                  */}
        {/* ========================================================= */}
        {activeTab === 'sheets' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <Table className="w-5 h-5 text-emerald-600" />
                <h2 className="font-serif text-2xl font-bold text-brand-dark">
                  Google Sheets Backend Hub
                </h2>
              </div>
              <p className="text-sm text-brand-muted">
                Your entire website is connected directly to 4 live Google Sheets. You can open any sheet in Google Drive, view or edit rows, and changes reflect live across the website.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Sheet 1: Photos */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-red bg-red-50 px-2.5 py-1 rounded-md">
                      Gallery Photos
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Live Connected
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-brand-dark mb-1">
                    {GOOGLE_SHEETS.photos.name}
                  </h3>
                  <p className="text-xs text-brand-muted mb-4">
                    {GOOGLE_SHEETS.photos.description}
                  </p>
                  <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono">
                    <p>Tab GID: <span className="font-bold text-slate-900">{GOOGLE_SHEETS.photos.gid}</span></p>
                    <p>Photos Loaded: <span className="font-bold text-slate-900">{photos.length}</span></p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setExportModalType('photos')}
                    className="text-xs font-semibold text-slate-700 hover:text-brand-dark bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Export Rows
                  </button>
                  <a
                    href={GOOGLE_SHEETS.photos.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs"
                  >
                    <span>Open in Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Sheet 2: Videos */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">
                      Gallery Videos
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Live Connected
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-brand-dark mb-1">
                    {GOOGLE_SHEETS.videos.name}
                  </h3>
                  <p className="text-xs text-brand-muted mb-4">
                    {GOOGLE_SHEETS.videos.description}
                  </p>
                  <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono">
                    <p>Videos Loaded: <span className="font-bold text-slate-900">{videos.length}</span></p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setExportModalType('videos')}
                    className="text-xs font-semibold text-slate-700 hover:text-brand-dark bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Export Rows
                  </button>
                  <a
                    href={GOOGLE_SHEETS.videos.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs"
                  >
                    <span>Open in Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Sheet 3: Events */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                      Sangham Events
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Live Connected
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-brand-dark mb-1">
                    {GOOGLE_SHEETS.events.name}
                  </h3>
                  <p className="text-xs text-brand-muted mb-4">
                    {GOOGLE_SHEETS.events.description}
                  </p>
                  <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono">
                    <p>Tab GID: <span className="font-bold text-slate-900">{GOOGLE_SHEETS.events.gid}</span></p>
                    <p>Events Loaded: <span className="font-bold text-slate-900">{events.length}</span></p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setExportModalType('events')}
                    className="text-xs font-semibold text-slate-700 hover:text-brand-dark bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Export Rows
                  </button>
                  <a
                    href={GOOGLE_SHEETS.events.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs"
                  >
                    <span>Open in Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Sheet 4: Members */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                      Community Directory
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Live Connected
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-brand-dark mb-1">
                    {GOOGLE_SHEETS.members.name}
                  </h3>
                  <p className="text-xs text-brand-muted mb-4">
                    {GOOGLE_SHEETS.members.description}
                  </p>
                  <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono">
                    <p>Members Loaded: <span className="font-bold text-slate-900">{members.length}</span></p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setExportModalType('members')}
                    className="text-xs font-semibold text-slate-700 hover:text-brand-dark bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Export Rows
                  </button>
                  <a
                    href={GOOGLE_SHEETS.members.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs"
                  >
                    <span>Open in Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL: EDIT PHOTO                                         */}
      {/* ========================================================= */}
      {editingPhoto && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-serif text-lg font-bold text-brand-dark flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-brand-red" />
                <span>Edit Photo Details</span>
              </h3>
              <button
                onClick={() => setEditingPhoto(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePhotoDetails} className="space-y-4 text-xs">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <Image
                  src={editingPhoto.url}
                  alt={editingPhoto.eventName}
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Event Album Name
                </label>
                <input
                  type="text"
                  required
                  value={editingPhoto.eventName}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, eventName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Event Date
                </label>
                <input
                  type="text"
                  required
                  value={editingPhoto.date}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Photo URL or Google Drive Link
                </label>
                <input
                  type="text"
                  required
                  value={editingPhoto.url}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, url: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark font-mono text-[11px] focus:ring-1 focus:ring-brand-red outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-brand-red hover:bg-brand-redhover text-white font-bold shadow-xs"
                >
                  Update Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD PHOTO                                          */}
      {/* ========================================================= */}
      {isAddPhotoOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-serif text-lg font-bold text-brand-dark flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-red" />
                <span>Add Photo to Gallery</span>
              </h3>
              <button
                onClick={() => setIsAddPhotoOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPhotoSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Google Drive Link or Image URL
                </label>
                <input
                  type="text"
                  required
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark font-mono text-[11px] focus:ring-1 focus:ring-brand-red outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Event Album Name
                </label>
                <input
                  type="text"
                  required
                  value={newPhotoEvent}
                  onChange={(e) => setNewPhotoEvent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Event Date
                </label>
                <input
                  type="text"
                  required
                  value={newPhotoDate}
                  onChange={(e) => setNewPhotoDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddPhotoOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-brand-red hover:bg-brand-redhover text-white font-bold shadow-xs"
                >
                  Add Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT VIDEO                                         */}
      {/* ========================================================= */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-serif text-lg font-bold text-brand-dark flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-brand-red" />
                <span>Edit Video Details</span>
              </h3>
              <button
                onClick={() => setEditingVideo(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVideoDetails} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Video URL (YouTube, Drive, Vimeo)
                </label>
                <input
                  type="text"
                  required
                  value={editingVideo.url}
                  onChange={(e) => setEditingVideo({ ...editingVideo, url: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark font-mono text-[11px] focus:ring-1 focus:ring-brand-red outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={editingVideo.eventName}
                  onChange={(e) => setEditingVideo({ ...editingVideo, eventName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Date
                </label>
                <input
                  type="text"
                  required
                  value={editingVideo.date}
                  onChange={(e) => setEditingVideo({ ...editingVideo, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-brand-red hover:bg-brand-redhover text-white font-bold shadow-xs"
                >
                  Update Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD VIDEO                                          */}
      {/* ========================================================= */}
      {isAddVideoOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-serif text-lg font-bold text-brand-dark flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-red" />
                <span>Add Video Recording</span>
              </h3>
              <button
                onClick={() => setIsAddVideoOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVideoSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Video Link (YouTube, Drive, Vimeo)
                </label>
                <input
                  type="text"
                  required
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="https://youtu.be/... or Google Drive video link"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark font-mono text-[11px] focus:ring-1 focus:ring-brand-red outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  required
                  value={newVideoEvent}
                  onChange={(e) => setNewVideoEvent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Date
                </label>
                <input
                  type="text"
                  required
                  value={newVideoDate}
                  onChange={(e) => setNewVideoDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddVideoOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-brand-red hover:bg-brand-redhover text-white font-bold shadow-xs"
                >
                  Add Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT EVENT DETAILS                                 */}
      {/* ========================================================= */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-serif text-lg font-bold text-brand-dark flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-brand-red" />
                <span>Edit Event Details</span>
              </h3>
              <button
                onClick={() => setEditingEvent(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEventDetails} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Category / Type
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEvent.type}
                    onChange={(e) => setEditingEvent({ ...editingEvent, type: e.target.value })}
                    placeholder="Community, Spiritual..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={editingEvent.time}
                    onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                    placeholder="e.g. 10:00 AM – 1:00 PM"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingEvent.location}
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    placeholder="e.g. Nizamabad"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Event Banner / Photo URL
                </label>
                <input
                  type="text"
                  value={editingEvent.image || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, image: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark font-mono text-[11px] focus:ring-1 focus:ring-brand-red outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-brand-red hover:bg-brand-redhover text-white font-bold shadow-xs"
                >
                  Update Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD EVENT                                          */}
      {/* ========================================================= */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-serif text-lg font-bold text-brand-dark flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-red" />
                <span>Add Community Event</span>
              </h3>
              <button
                onClick={() => setIsAddEventOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEventSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g. Annual Community Spiritual Gathering"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                    placeholder="Community, Spiritual..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Date (YYYY-MM-DD)
                  </label>
                  <input
                    type="text"
                    required
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    placeholder="10:00 AM – 1:00 PM"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Nizamabad Central"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Details about the function, blessings, prasadam, etc."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Banner / Image Link
                </label>
                <input
                  type="text"
                  value={newEvent.image}
                  onChange={(e) => setNewEvent({ ...newEvent, image: e.target.value })}
                  placeholder="https://drive.google.com/file/d/... or image URL"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark font-mono text-[11px] focus:ring-1 focus:ring-brand-red outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-brand-red hover:bg-brand-redhover text-white font-bold shadow-xs"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT MEMBER DETAILS                                */}
      {/* ========================================================= */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-serif text-lg font-bold text-brand-dark flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-brand-red" />
                <span>Edit Member Details</span>
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMemberDetails} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    First / Given Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Surname / Gotram
                  </label>
                  <input
                    type="text"
                    value={editingMember.surname}
                    onChange={(e) => setEditingMember({ ...editingMember, surname: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Full Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editingMember.fullName}
                  onChange={(e) => setEditingMember({ ...editingMember, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    District / City
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMember.district}
                    onChange={(e) => setEditingMember({ ...editingMember, district: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Membership ID
                  </label>
                  <input
                    type="text"
                    value={editingMember.membershipId || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, membershipId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Occupation / Profession
                </label>
                <input
                  type="text"
                  value={editingMember.occupation}
                  onChange={(e) => setEditingMember({ ...editingMember, occupation: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Photo URL or Drive Link
                </label>
                <input
                  type="text"
                  value={editingMember.photo || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, photo: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark font-mono text-[11px] focus:ring-1 focus:ring-brand-red outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-brand-red hover:bg-brand-redhover text-white font-bold shadow-xs"
                >
                  Update Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD MEMBER                                         */}
      {/* ========================================================= */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-serif text-lg font-bold text-brand-dark flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-red" />
                <span>Add Community Member</span>
              </h3>
              <button
                onClick={() => setIsAddMemberOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="e.g. Ramesh"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Surname / Gotram
                  </label>
                  <input
                    type="text"
                    value={newMember.surname}
                    onChange={(e) => setNewMember({ ...newMember, surname: e.target.value })}
                    placeholder="e.g. Jagannatham"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    required
                    value={newMember.district}
                    onChange={(e) => setNewMember({ ...newMember, district: e.target.value })}
                    placeholder="Nizamabad"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Membership ID
                  </label>
                  <input
                    type="text"
                    value={newMember.membershipId}
                    onChange={(e) => setNewMember({ ...newMember, membershipId: e.target.value })}
                    placeholder="e.g. 104"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Occupation / Profession
                </label>
                <input
                  type="text"
                  value={newMember.occupation}
                  onChange={(e) => setNewMember({ ...newMember, occupation: e.target.value })}
                  placeholder="e.g. Business / Teacher / Engineer"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Photo URL or Drive Link
                </label>
                <input
                  type="text"
                  value={newMember.photo}
                  onChange={(e) => setNewMember({ ...newMember, photo: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark font-mono text-[11px] focus:ring-1 focus:ring-brand-red outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-brand-red hover:bg-brand-redhover text-white font-bold shadow-xs"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: VIDEO PREVIEW                                      */}
      {/* ========================================================= */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-white/10">
            <div className="flex items-center justify-between p-4 border-b border-white/10 text-white">
              <div>
                <h4 className="font-bold text-sm">{previewVideo.eventName}</h4>
                <p className="text-xs text-slate-400">{previewVideo.date} • {previewVideo.platform}</p>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center">
              {previewVideo.streamUrl ? (
                <video
                  src={previewVideo.streamUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : previewVideo.embedUrl ? (
                <iframe
                  src={previewVideo.embedUrl}
                  title={previewVideo.eventName}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <p className="text-sm text-slate-400">No playback preview available.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EXPORT TO GOOGLE SHEET                             */}
      {/* ========================================================= */}
      {exportModalType && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-serif text-lg font-bold text-brand-dark flex items-center gap-2">
                <Table className="w-5 h-5 text-emerald-600" />
                <span className="capitalize">Export {exportModalType} to Google Sheet</span>
              </h3>
              <button
                onClick={() => setExportModalType(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-brand-muted mb-3 leading-relaxed">
              Copy these tab-separated rows and paste directly into row 2 of your Google Sheet to permanently sync your custom order with the master spreadsheet.
            </p>

            <div className="relative mb-4">
              <textarea
                readOnly
                rows={8}
                value={generateExportText(exportModalType)}
                className="w-full p-3 font-mono text-[11px] bg-slate-900 text-emerald-400 rounded-xl border border-slate-800 outline-none leading-relaxed overflow-x-auto select-all"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <a
                href={GOOGLE_SHEETS[exportModalType].url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg transition-colors"
              >
                <span>Open Google Sheet in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExportModalType(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => handleCopyExport(generateExportText(exportModalType))}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  {copiedExport ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedExport ? 'Copied to Clipboard!' : 'Copy All Rows'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
