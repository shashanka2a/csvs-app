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
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Video,
  Play,
  Film,
  Copy,
  Edit2,
  Table,
  CheckCircle2,
  X,
  Search,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  FolderOpen,
  ArrowUpDown,
  Share2,
  Layers,
} from 'lucide-react';
import Logo from '@/components/Logo';
import {
  SiteContent,
  DEFAULT_CONTENT,
  getStoredContent,
  saveStoredContent,
  resetStoredContent,
  AdminGalleryItem,
  AdminVideoItem,
  getStoredCustomPhotos,
  saveStoredCustomPhotos,
  resetStoredCustomPhotos,
  getStoredCustomVideos,
  saveStoredCustomVideos,
  resetStoredCustomVideos,
  formatGoogleDriveImageUrl,
} from '@/lib/contentStore';

// Google Sheet URLs
const GOOGLE_SHEETS = {
  photos: {
    name: 'Photo Gallery Sheet',
    url: 'https://docs.google.com/spreadsheets/d/1mO7L6B9JewS4CitYcK3wTD-HhMBww76oeCb-3iQJr1g/edit?gid=1532582308#gid=1532582308',
    gid: '1532582308',
    description: 'Contains event names, dates, and Google Drive links for photos.',
  },
  videos: {
    name: 'Video Gallery Sheet',
    url: 'https://docs.google.com/spreadsheets/d/1dBt3frHaSwowBHPjk3YoN_41W8hqa3UWsiNwjO0nDzQ/edit?usp=sharing',
    gid: '0',
    description: 'Contains event names, dates, and video URLs (YouTube, Drive, Vimeo).',
  },
  events: {
    name: 'Sangham Events Sheet',
    url: 'https://docs.google.com/spreadsheets/d/1mUNv-OQf39D81ijUPEcSDON-VY8rmWqLlpasUQ-tSIk/edit?gid=327105065#gid=327105065',
    gid: '327105065',
    description: 'Upcoming sangham spiritual talks, meetings, and annual functions.',
  },
  members: {
    name: 'Community Directory Sheet',
    url: 'https://docs.google.com/spreadsheets/d/14e3REBG8Jh4rVtAHGs5LTq3irPBVz2bSssxysEJA_GM/edit?gid=0#gid=0',
    gid: '0',
    description: 'Sangham members directory with names, Gotram, occupation, and phone.',
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

  // Dashboard tab state
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'sheets' | 'content' | 'preview'>('photos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Google Sheets Data state
  const [loadingSheets, setLoadingSheets] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<string>('Just now');
  const [rawSheetPhotos, setRawSheetPhotos] = useState<AdminGalleryItem[]>([]);
  const [rawSheetVideos, setRawSheetVideos] = useState<AdminVideoItem[]>([]);
  const [photos, setPhotos] = useState<AdminGalleryItem[]>([]);
  const [videos, setVideos] = useState<AdminVideoItem[]>([]);
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);

  // Filtering & search
  const [photoSearch, setPhotoSearch] = useState<string>('');
  const [selectedAlbum, setSelectedAlbum] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Photo editing modal state
  const [editingPhoto, setEditingPhoto] = useState<AdminGalleryItem | null>(null);
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState<boolean>(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');
  const [newPhotoEvent, setNewPhotoEvent] = useState<string>('ప్రమాణ స్వీకారోత్సవం');
  const [newPhotoDate, setNewPhotoDate] = useState<string>('2026-10-16');
  const [newPhotoPosition, setNewPhotoPosition] = useState<'top' | 'bottom'>('top');

  // Video editing modal state
  const [editingVideo, setEditingVideo] = useState<AdminVideoItem | null>(null);
  const [isAddVideoOpen, setIsAddVideoOpen] = useState<boolean>(false);
  const [newVideoUrl, setNewVideoUrl] = useState<string>('');
  const [newVideoEvent, setNewVideoEvent] = useState<string>('ప్రమాణ స్వీకారోత్సవం');
  const [newVideoDate, setNewVideoDate] = useState<string>('2026-10-16');
  const [previewVideo, setPreviewVideo] = useState<AdminVideoItem | null>(null);

  // Google Sheet Export modal
  const [exportModalType, setExportModalType] = useState<'photos' | 'videos' | null>(null);
  const [copiedExport, setCopiedExport] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch live gallery data from Google Sheets API
  const fetchLiveSheetsData = useCallback(async (isManualSync = false) => {
    if (isManualSync) setSyncing(true);
    try {
      const res = await fetch('/api/gallery', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();

        // Flatten photos from groups
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

        // Flatten videos from videoGroups
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

        // Check if user has saved custom overrides in localStorage
        const storedPhotos = getStoredCustomPhotos();
        if (storedPhotos && storedPhotos.length > 0) {
          setPhotos(storedPhotos);
        } else {
          setPhotos(sheetPhotos);
        }

        const storedVideos = getStoredCustomVideos();
        if (storedVideos && storedVideos.length > 0) {
          setVideos(storedVideos);
        } else {
          setVideos(sheetVideos);
        }

        setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        if (isManualSync) {
          showToast(`Synced ${sheetPhotos.length} photos and ${sheetVideos.length} videos from Google Sheets!`);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch from Google Sheets API', err);
      if (isManualSync) {
        showToast('Error syncing from Google Sheets. Please check your internet connection.');
      }
    } finally {
      setLoadingSheets(false);
      if (isManualSync) setSyncing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('csvs_admin_token') || sessionStorage.getItem('csvs_admin_token');
      if (token === 'csvs_authenticated') {
        setIsAuthenticated(true);
      }
      setContent(getStoredContent());
      fetchLiveSheetsData();
    }
    setAuthChecking(false);
  }, [fetchLiveSheetsData]);

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
      setLoginError('Invalid username or password. (Demo: admin / admin123)');
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('csvs_admin_token');
    sessionStorage.removeItem('csvs_admin_token');
    setIsAuthenticated(false);
    showToast('Logged out of Admin Portal.');
  };

  // Distinct albums list for filtering
  const albumOptions = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => {
      if (p.eventName) set.add(p.eventName);
    });
    return Array.from(set);
  }, [photos]);

  // Filtered photos
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

  // --- Photo Rearrangement Handlers ---
  const movePhoto = (currentIndexInFiltered: number, direction: 'up' | 'down') => {
    const item = filteredPhotos[currentIndexInFiltered];
    if (!item) return;

    // Find original index in overall photos list
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
    showToast(`Moved photo to ${position}. Click "Save & Publish" to apply live.`);
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
      p.id === editingPhoto.id
        ? {
            ...editingPhoto,
            url: formattedUrl,
          }
        : p
    );
    setPhotos(updated);
    setEditingPhoto(null);
    showToast('Photo details updated! Remember to click "Save & Publish".');
  };

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;

    const formattedUrl = formatGoogleDriveImageUrl(newPhotoUrl.trim());
    const newId = `custom-photo-${Date.now()}`;
    const newEntry: AdminGalleryItem = {
      id: newId,
      url: formattedUrl,
      eventName: newPhotoEvent.trim() || 'CSVS Moments',
      date: newPhotoDate.trim() || new Date().toISOString().split('T')[0],
      order: newPhotoPosition === 'top' ? 1 : photos.length + 1,
    };

    let updated: AdminGalleryItem[];
    if (newPhotoPosition === 'top') {
      updated = [newEntry, ...photos];
    } else {
      updated = [...photos, newEntry];
    }

    const reordered = updated.map((p, idx) => ({ ...p, order: idx + 1 }));
    setPhotos(reordered);
    setIsAddPhotoOpen(false);
    setNewPhotoUrl('');
    showToast('Photo added! Click "Save & Publish" to apply to live website.');
  };

  const handleSaveAllPhotos = () => {
    saveStoredCustomPhotos(photos);
    showToast('Published! Photo order and edits are now LIVE across the website.');
  };

  const handleResetPhotosToSheet = () => {
    if (confirm('Revert all custom photo order and edits back to the raw Google Sheets data?')) {
      resetStoredCustomPhotos();
      setPhotos(rawSheetPhotos);
      showToast('Reverted to Google Sheets default data.');
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
    showToast(`Moved video to position #${targetIndex + 1}. Click "Save & Publish".`);
  };

  const moveVideoToExtreme = (index: number, position: 'top' | 'bottom') => {
    const updated = [...videos];
    const [moved] = updated.splice(index, 1);
    if (position === 'top') {
      updated.unshift(moved);
    } else {
      updated.push(moved);
    }

    const reordered = updated.map((v, idx) => ({ ...v, order: idx + 1 }));
    setVideos(reordered);
    showToast(`Moved video to ${position}.`);
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
    const newId = `custom-video-${Date.now()}`;
    const newEntry: AdminVideoItem = {
      id: newId,
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
    showToast('Video added! Click "Save & Publish" to update website.');
  };

  const handleSaveAllVideos = () => {
    saveStoredCustomVideos(videos);
    showToast('Published! Video rearrangements are now LIVE on the website.');
  };

  const handleResetVideosToSheet = () => {
    if (confirm('Revert all videos back to the raw Google Sheets data?')) {
      resetStoredCustomVideos();
      setVideos(rawSheetVideos);
      showToast('Reverted videos to Google Sheets default data.');
    }
  };

  // --- Website Content Handlers ---
  const handleContentChange = (section: keyof SiteContent, key: string, value: any) => {
    setContent((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [key]: value,
      },
    }));
  };

  const handleSaveContent = () => {
    saveStoredContent(content);
    showToast('Website content saved! Hero and Contact details updated across the site.');
  };

  const handleResetContent = () => {
    if (confirm('Reset website hero and contact content to defaults?')) {
      resetStoredContent();
      setContent(DEFAULT_CONTENT);
      showToast('Content reset to default values.');
    }
  };

  // --- Google Sheet Export Text Generator ---
  const generateExportText = (type: 'photos' | 'videos') => {
    if (type === 'photos') {
      // Group by event name and date
      const map = new Map<string, { eventName: string; date: string; urls: string[] }>();
      photos.forEach((p) => {
        const key = `${p.eventName}___${p.date}`;
        if (!map.has(key)) {
          map.set(key, { eventName: p.eventName, date: p.date, urls: [] });
        }
        map.get(key)!.urls.push(p.url);
      });

      const lines: string[] = ['Timestamp\tEvent Name\tDate\tPhotos'];
      map.forEach((item) => {
        const timestamp = new Date().toLocaleString('en-US');
        const photoList = item.urls.join(', ');
        lines.push(`${timestamp}\t${item.eventName}\t${item.date}\t${photoList}`);
      });
      return lines.join('\n');
    } else {
      const map = new Map<string, { eventName: string; date: string; urls: string[] }>();
      videos.forEach((v) => {
        const key = `${v.eventName}___${v.date}`;
        if (!map.has(key)) {
          map.set(key, { eventName: v.eventName, date: v.date, urls: [] });
        }
        map.get(key)!.urls.push(v.url);
      });

      const lines: string[] = ['Timestamp\tEvent Name\tDate\tVideos'];
      map.forEach((item) => {
        const timestamp = new Date().toLocaleString('en-US');
        const videoList = item.urls.join(', ');
        lines.push(`${timestamp}\t${item.eventName}\t${item.date}\t${videoList}`);
      });
      return lines.join('\n');
    }
  };

  const handleCopyExport = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2500);
    showToast('Copied rows to clipboard! You can now paste directly into your Google Sheet.');
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-9 h-9 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ==========================================
  // 1. LOGIN SCREEN (Unauthenticated)
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
  // 2. ADMIN DASHBOARD (Authenticated)
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

      {/* SINGLE DEDICATED ADMIN HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar: Brand, Status, Actions */}
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Left: Brand & Status */}
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

            {/* Right: Sync, View Website, Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => fetchLiveSheetsData(true)}
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
                <span className="hidden sm:inline">View Live Site</span>
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

            <button
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-2 py-3 px-2 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 ${
                activeTab === 'content'
                  ? 'border-brand-red text-brand-red'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Website Content</span>
            </button>

            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 py-3 px-2 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 ${
                activeTab === 'preview'
                  ? 'border-brand-red text-brand-red'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Live Preview</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ========================================================= */}
        {/* TAB 1: PHOTOS MANAGER (Google Sheets Backend)              */}
        {/* ========================================================= */}
        {activeTab === 'photos' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Toolbar Card */}
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
                  Rearrange photo order, edit titles and dates, or add new photos. Powered by Google Sheets.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  onClick={handleResetPhotosToSheet}
                  title="Discard custom rearrangements and re-sync fresh from Google Sheet"
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

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {/* Search */}
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

                {/* Album Filter */}
                <select
                  value={selectedAlbum}
                  onChange={(e) => setSelectedAlbum(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-brand-dark outline-none focus:ring-1 focus:ring-brand-red"
                >
                  <option value="all">All Event Albums ({photos.length})</option>
                  {albumOptions.map((alb) => (
                    <option key={alb} value={alb}>
                      {alb}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 text-xs text-brand-muted self-end sm:self-center">
                <span>Showing {filteredPhotos.length} of {photos.length} photos</span>
                <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-2.5 py-1 text-xs font-semibold ${
                      viewMode === 'list' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-2.5 py-1 text-xs font-semibold ${
                      viewMode === 'grid' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Grid
                  </button>
                </div>
              </div>
            </div>

            {/* Photos List View (Ideal for Rearranging) */}
            {viewMode === 'list' && (
              <div className="space-y-2.5">
                {filteredPhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left: Position badge & Thumbnail */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="w-8 h-8 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        #{index + 1}
                      </span>
                      <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 group cursor-pointer"
                           onClick={() => setEditingPhoto(photo)}>
                        <Image
                          src={photo.url}
                          alt={photo.eventName}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="80px"
                        />
                      </div>
                    </div>

                    {/* Middle: Event details */}
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

                    {/* Right: Reorder & Edit Buttons */}
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
            )}

            {/* Photos Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredPhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow group flex flex-col"
                  >
                    <div className="relative aspect-4/3 bg-slate-100">
                      <Image
                        src={photo.url}
                        alt={photo.eventName}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 20vw"
                      />
                      <span className="absolute top-2 left-2 bg-slate-900/80 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="p-3 flex-grow flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-bold text-brand-dark truncate">{photo.eventName}</p>
                        <p className="text-[11px] text-brand-muted">{photo.date}</p>
                      </div>
                      <div className="flex items-center justify-between gap-1 mt-3 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                          <button
                            title="Move Up"
                            disabled={index === 0}
                            onClick={() => movePhoto(index, 'up')}
                            className="p-1 rounded hover:bg-slate-100 disabled:opacity-20"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Move Down"
                            disabled={index === filteredPhotos.length - 1}
                            onClick={() => movePhoto(index, 'down')}
                            className="p-1 rounded hover:bg-slate-100 disabled:opacity-20"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            title="Edit"
                            onClick={() => setEditingPhoto(photo)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-700"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => removePhoto(photo.id)}
                            className="p-1 rounded hover:bg-red-50 text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: VIDEOS MANAGER                                     */}
        {/* ========================================================= */}
        {activeTab === 'videos' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Toolbar Card */}
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
                  {/* Left */}
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

                  {/* Middle */}
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

                  {/* Right Actions */}
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
        {/* TAB 3: GOOGLE SHEETS HUB                                  */}
        {/* ========================================================= */}
        {activeTab === 'sheets' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header info */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <Table className="w-5 h-5 text-emerald-600" />
                <h2 className="font-serif text-2xl font-bold text-brand-dark">
                  Google Sheets Backend Hub
                </h2>
              </div>
              <p className="text-sm text-brand-muted">
                Your website is 100% powered by live Google Sheets. You can open any sheet in Google Drive, view or edit rows, and changes reflect seamlessly across the website.
              </p>
            </div>

            {/* Sheets Cards Grid */}
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
                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono">
                    <p>Tab GID: <span className="font-bold text-slate-900">{GOOGLE_SHEETS.photos.gid}</span></p>
                    <p>Photos Loaded: <span className="font-bold text-slate-900">{photos.length}</span></p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setExportModalType('photos')}
                    className="text-xs font-semibold text-slate-700 hover:text-brand-dark bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Export Current Order
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
                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono">
                    <p>Tab: <span className="font-bold text-slate-900">Default (Sheet1)</span></p>
                    <p>Videos Loaded: <span className="font-bold text-slate-900">{videos.length}</span></p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setExportModalType('videos')}
                    className="text-xs font-semibold text-slate-700 hover:text-brand-dark bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Export Current Order
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
                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono">
                    <p>Tab GID: <span className="font-bold text-slate-900">{GOOGLE_SHEETS.events.gid}</span></p>
                    <p>Endpoint: <span className="font-bold text-slate-900">/api/events</span></p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end">
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
                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono">
                    <p>Tab GID: <span className="font-bold text-slate-900">{GOOGLE_SHEETS.members.gid}</span></p>
                    <p>Endpoint: <span className="font-bold text-slate-900">/api/members</span></p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end">
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

            {/* How It Works Guide */}
            <div className="bg-gradient-to-r from-slate-900 to-brand-dark text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-md">
              <h3 className="font-serif text-lg sm:text-xl font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>How Google Sheets Powers the CSVS Platform</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed">
                By using Google Sheets as your database, there is zero maintenance cost, no complex server management, and your Sangham organizers can update data directly in spreadsheets.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
                  <p className="font-bold text-white mb-1">1. Photo Links</p>
                  <p className="text-slate-300">Paste any Google Drive photo link into the spreadsheet. The website automatically extracts the image and renders it in high resolution.</p>
                </div>
                <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
                  <p className="font-bold text-white mb-1">2. Video Support</p>
                  <p className="text-slate-300">Paste YouTube, Google Drive, or Vimeo links in the Videos sheet. The gallery embeds them directly with custom playback.</p>
                </div>
                <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
                  <p className="font-bold text-white mb-1">3. Live Rearrangement</p>
                  <p className="text-slate-300">Rearrange any photo or video in this Admin Portal and click &ldquo;Save &amp; Publish&rdquo; for instant live reordering across all visitor browsers.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: WEBSITE CONTENT EDITOR                             */}
        {/* ========================================================= */}
        {activeTab === 'content' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-dark">
                  Website Content Editor
                </h2>
                <p className="text-xs sm:text-sm text-brand-muted mt-1">
                  Customize hero banner texts and official Sangham contact information.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetContent}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>
                <button
                  onClick={handleSaveContent}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-brand-red hover:bg-brand-redhover rounded-lg transition-colors shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save All Changes</span>
                </button>
              </div>
            </div>

            {/* SECTION 1: HERO BANNER */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-100">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif text-lg font-bold text-brand-dark">Hero Banner</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Banner Top Badge
                  </label>
                  <input
                    type="text"
                    value={content.hero.badge}
                    onChange={(e) => handleContentChange('hero', 'badge', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Main Title Prefix
                  </label>
                  <input
                    type="text"
                    value={content.hero.title}
                    onChange={(e) => handleContentChange('hero', 'title', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Highlighted Title
                  </label>
                  <input
                    type="text"
                    value={content.hero.titleHighlight}
                    onChange={(e) => handleContentChange('hero', 'titleHighlight', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Hero Description
                  </label>
                  <textarea
                    rows={3}
                    value={content.hero.description}
                    onChange={(e) => handleContentChange('hero', 'description', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: OFFICIAL CONTACT INFO */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-100">
                <Phone className="w-5 h-5 text-brand-red" />
                <h3 className="font-serif text-lg font-bold text-brand-dark">Official Contact Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Organizer / President Name
                  </label>
                  <input
                    type="text"
                    value={content.contact.personName}
                    onChange={(e) => handleContentChange('contact', 'personName', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={content.contact.phone}
                    onChange={(e) => handleContentChange('contact', 'phone', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={content.contact.email}
                    onChange={(e) => handleContentChange('contact', 'email', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Sangham Address
                  </label>
                  <input
                    type="text"
                    value={content.contact.address}
                    onChange={(e) => handleContentChange('contact', 'address', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: LIVE PREVIEW                                       */}
        {/* ========================================================= */}
        {activeTab === 'preview' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-dark">
                  Live Gallery Preview
                </h2>
                <p className="text-xs sm:text-sm text-brand-muted mt-1">
                  Preview how your rearranged photos and videos appear to visitors on the live website.
                </p>
              </div>
              <Link
                href="/gallery"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-red hover:bg-brand-redhover rounded-lg transition-colors shadow-xs"
              >
                <span>Open /gallery Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Photos Preview Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="font-serif text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-brand-red" />
                <span>Photos ({photos.length} items)</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {photos.map((p, idx) => (
                  <div key={p.id} className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
                    <Image
                      src={p.url}
                      alt={p.eventName}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-2 text-white">
                      <span className="text-[10px] font-bold text-amber-300">#{idx + 1}</span>
                      <p className="text-xs font-semibold truncate leading-tight">{p.eventName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Videos Preview Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="font-serif text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
                <Film className="w-5 h-5 text-brand-red" />
                <span>Videos ({videos.length} recordings)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {videos.map((v, idx) => (
                  <div key={v.id} className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 group cursor-pointer"
                       onClick={() => setPreviewVideo(v)}>
                    {v.thumbnailUrl ? (
                      <Image
                        src={v.thumbnailUrl}
                        alt={v.eventName}
                        fill
                        unoptimized
                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <Film className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                      <Play className="w-8 h-8 text-white drop-shadow-md fill-white" />
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 p-3 text-white">
                      <span className="text-[10px] font-mono text-amber-300">#{idx + 1}</span>
                      <p className="text-xs font-bold truncate">{v.eventName}</p>
                      <p className="text-[10px] text-slate-300">{v.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL: EDIT PHOTO DETAILS                                 */}
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
              {/* Image Preview */}
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
                  Event Date (YYYY-MM-DD or Text)
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
                <p className="text-[10px] text-slate-400 mt-1">
                  Supports Google Drive sharing links (https://drive.google.com/file/d/...) or web image URLs.
                </p>
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
                  placeholder="https://drive.google.com/file/d/... or direct image link"
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
                  placeholder="e.g. ప్రమాణ స్వీకారోత్సవం"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Event Date
                  </label>
                  <input
                    type="text"
                    required
                    value={newPhotoDate}
                    onChange={(e) => setNewPhotoDate(e.target.value)}
                    placeholder="YYYY-MM-DD"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Insert Position
                  </label>
                  <select
                    value={newPhotoPosition}
                    onChange={(e) => setNewPhotoPosition(e.target.value as 'top' | 'bottom')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-brand-dark bg-white focus:ring-1 focus:ring-brand-red outline-none"
                  >
                    <option value="top">At the Top (#1)</option>
                    <option value="bottom">At the Bottom (Last)</option>
                  </select>
                </div>
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
      {/* MODAL: EDIT VIDEO DETAILS                                 */}
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
      {/* MODAL: VIDEO PLAYBACK PREVIEW                             */}
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
                <p className="text-sm text-slate-400">No preview available for this video format.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EXPORT TO GOOGLE SHEET (COPYABLE ROWS)              */}
      {/* ========================================================= */}
      {exportModalType && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-serif text-lg font-bold text-brand-dark flex items-center gap-2">
                <Table className="w-5 h-5 text-emerald-600" />
                <span>Export to Google Sheet ({exportModalType === 'photos' ? 'Photos' : 'Videos'})</span>
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
                href={exportModalType === 'photos' ? GOOGLE_SHEETS.photos.url : GOOGLE_SHEETS.videos.url}
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
