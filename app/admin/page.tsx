'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import Logo from '@/components/Logo';
import {
  GalleryPhoto,
  SiteContent,
  DEFAULT_PHOTOS,
  DEFAULT_CONTENT,
  getStoredPhotos,
  saveStoredPhotos,
  resetStoredPhotos,
  getStoredContent,
  saveStoredContent,
  resetStoredContent,
} from '@/lib/contentStore';

export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'photos' | 'content' | 'preview'>('photos');
  const [photos, setPhotos] = useState<GalleryPhoto[]>(DEFAULT_PHOTOS);
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New photo input state
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('/images/1.jpg');
  const [newPhotoTitle, setNewPhotoTitle] = useState<string>('');

  // Check login state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('csvs_admin_token') || sessionStorage.getItem('csvs_admin_token');
      if (token === 'csvs_authenticated') {
        setIsAuthenticated(true);
      }
      setPhotos(getStoredPhotos());
      setContent(getStoredContent());
    }
    setAuthChecking(false);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Acceptable admin credentials
    const validUsername =
      username.trim().toLowerCase() === 'admin' ||
      username.trim().toLowerCase() === 'csvsangham@gmail.com';
    const validPassword = password === 'Demo@123' || password === 'admin123';

    if (validUsername && validPassword) {
      localStorage.setItem('csvs_admin_token', 'csvs_authenticated');
      setIsAuthenticated(true);
      showToast('Logged in successfully as Administrator!');
    } else {
      setLoginError('Invalid username or password. Please check your credentials.');
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('csvs_admin_token');
    sessionStorage.removeItem('csvs_admin_token');
    setIsAuthenticated(false);
    showToast('Logged out of Admin Portal.');
  };

  // --- Photo Rearrangement Handlers ---
  const movePhoto = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= photos.length) return;

    const newPhotos = [...photos];
    const [moved] = newPhotos.splice(index, 1);
    newPhotos.splice(targetIndex, 0, moved);

    // Update order indices
    const reordered = newPhotos.map((item, idx) => ({ ...item, order: idx + 1 }));
    setPhotos(reordered);
    saveStoredPhotos(reordered);
    showToast(`Moved photo to position #${targetIndex + 1}`);
  };

  const movePhotoToExtreme = (index: number, position: 'top' | 'bottom') => {
    const newPhotos = [...photos];
    const [moved] = newPhotos.splice(index, 1);
    if (position === 'top') {
      newPhotos.unshift(moved);
    } else {
      newPhotos.push(moved);
    }
    const reordered = newPhotos.map((item, idx) => ({ ...item, order: idx + 1 }));
    setPhotos(reordered);
    saveStoredPhotos(reordered);
    showToast(`Moved photo to ${position}`);
  };

  const removePhoto = (id: number) => {
    if (photos.length <= 1) {
      alert('You must have at least one photo in the gallery.');
      return;
    }
    const updated = photos.filter((p) => p.id !== id).map((item, idx) => ({ ...item, order: idx + 1 }));
    setPhotos(updated);
    saveStoredPhotos(updated);
    showToast('Photo removed from gallery.');
  };

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = Math.max(...photos.map((p) => p.id), 0) + 1;
    const newPhoto: GalleryPhoto = {
      id: newId,
      url: newPhotoUrl.trim(),
      order: photos.length + 1,
    };
    const updated = [...photos, newPhoto];
    setPhotos(updated);
    saveStoredPhotos(updated);
    showToast('New photo added to gallery!');
  };

  const handleSavePhotos = () => {
    saveStoredPhotos(photos);
    showToast('All photo arrangements saved successfully!');
  };

  const handleResetPhotos = () => {
    if (confirm('Reset gallery photos and order back to original default?')) {
      resetStoredPhotos();
      setPhotos(DEFAULT_PHOTOS);
      showToast('Photos reset to default.');
    }
  };

  // --- Content Edit Handlers ---
  const handleContentChange = (section: keyof SiteContent, key: string, value: any) => {
    setContent((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [key]: value,
      },
    }));
  };

  const handleEventChange = (eventId: number, key: string, value: any) => {
    setContent((prev) => ({
      ...prev,
      events: prev.events.map((ev) => (ev.id === eventId ? { ...ev, [key]: value } : ev)),
    }));
  };

  const handleSaveContent = () => {
    saveStoredContent(content);
    showToast('Website content saved successfully! Changes are live across the site.');
  };

  const handleResetContent = () => {
    if (confirm('Reset all website text content back to default values?')) {
      resetStoredContent();
      setContent(DEFAULT_CONTENT);
      showToast('Content reset to default.');
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ==========================================
  // 1. LOGIN SCREEN (Visible when NOT logged in)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-dark via-[#1E2530] to-black flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-white/10 p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <Logo className="w-14 h-14 rounded-xl shadow-md" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark mb-1">
              Admin Portal
            </h1>
            <p className="text-brand-muted text-xs sm:text-sm">
              Chattada Sri Vaishnava Sangham (CSVS)
            </p>
          </div>

          {/* Login Error Notification */}
          {loginError && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                Admin Username or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username or email"
                  className="w-full px-4 py-3 rounded-lg border border-brand-border text-brand-dark focus:ring-2 focus:ring-brand-red focus:border-brand-red outline-none text-sm transition-all"
                />
              </div>
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
                  placeholder="Enter admin password"
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
              <span>Sign In to Admin Portal</span>
            </button>
          </form>

          {/* Return link */}
          <div className="mt-8 pt-4 border-t border-gray-100 text-center">
            <Link
              href="/"
              className="inline-block text-xs text-brand-muted hover:text-brand-red transition-colors"
            >
              ← Return to CSVS Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. ADMIN DASHBOARD (Visible ONLY upon login)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-100 text-brand-dark">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-brand-dark text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10 animate-fade-in text-sm font-medium">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Navigation Bar */}
      <header className="bg-white border-b border-brand-border sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8 rounded-md shrink-0 shadow-xs" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg text-brand-red leading-none">
                  CSVS Admin
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-brand-muted hidden sm:block">
                Content Management &amp; Photo Rearranger
              </p>
            </div>
          </div>

          {/* Quick links & Logout */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-muted hover:text-brand-dark bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md transition-colors"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-white bg-red-50 hover:bg-red-600 px-3 py-1.5 rounded-md transition-colors border border-red-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-brand-border/60">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-2 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'photos'
                  ? 'border-brand-red text-brand-red'
                  : 'border-transparent text-brand-muted hover:text-brand-dark'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Rearrange Photos ({photos.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-2 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'content'
                  ? 'border-brand-red text-brand-red'
                  : 'border-transparent text-brand-muted hover:text-brand-dark'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Edit Website Content</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'preview'
                  ? 'border-brand-red text-brand-red'
                  : 'border-transparent text-brand-muted hover:text-brand-dark'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Quick Preview</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================================= */}
        {/* TAB 1: REARRANGE PHOTOS                                   */}
        {/* ========================================================= */}
        {activeTab === 'photos' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header / Actions toolbar */}
            <div className="bg-white p-6 rounded-2xl border border-brand-border/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-brand-dark">
                  Gallery Photo Manager
                </h2>
                <p className="text-sm text-brand-muted mt-1">
                  Rearrange photo order and edit photo titles. Changes update live across the gallery.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetPhotos}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Default</span>
                </button>
                <button
                  onClick={handleSavePhotos}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-brand-red hover:bg-brand-redhover rounded-lg transition-colors shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Photo Order</span>
                </button>
              </div>
            </div>

            {/* Reorderable Photo List */}
            <div className="space-y-3">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="bg-white rounded-xl p-4 sm:p-5 border border-brand-border/80 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Index badge & Image thumbnail */}
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="w-9 h-9 rounded-lg bg-brand-dark text-white font-serif font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                      #{index + 1}
                    </span>
                    <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-brand-cream border border-brand-border shrink-0">
                      <Image
                        src={photo.url}
                        alt={photo.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-brand-muted">{photo.url}</p>
                    </div>
                  </div>

                  {/* Middle: Photo Info */}
                  <div className="flex-grow max-w-xl">
                    <p className="text-sm font-semibold text-brand-dark">Photo #{index + 1}</p>
                    <p className="text-xs text-brand-muted">
                      Source: <span className="font-mono text-brand-dark">{photo.url}</span>
                    </p>
                  </div>

                  {/* Right: Reorder buttons & delete */}
                  <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                    <button
                      title="Move Up"
                      disabled={index === 0}
                      onClick={() => movePhoto(index, 'up')}
                      className="p-2 rounded-lg border border-brand-border hover:bg-slate-100 text-brand-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      title="Move Down"
                      disabled={index === photos.length - 1}
                      onClick={() => movePhoto(index, 'down')}
                      className="p-2 rounded-lg border border-brand-border hover:bg-slate-100 text-brand-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      title="Move to Top"
                      disabled={index === 0}
                      onClick={() => movePhotoToExtreme(index, 'top')}
                      className="px-2.5 py-1.5 rounded-lg border border-brand-border hover:bg-slate-100 text-xs font-semibold text-brand-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Top
                    </button>
                    <button
                      title="Remove Photo"
                      onClick={() => removePhoto(photo.id)}
                      className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Photo Card */}
            <div className="bg-white p-6 rounded-2xl border border-dashed border-brand-border shadow-xs">
              <h3 className="font-serif text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-red" />
                <span>Add Another Photo to Gallery</span>
              </h3>
              <form onSubmit={handleAddPhoto} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                    Photo URL or Local Path
                  </label>
                  <input
                    type="text"
                    required
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="/images/1.jpg or https://..."
                    className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                  <span className="text-[11px] text-brand-muted mt-1 block">
                    Choose from available: <code>/images/1.jpg</code> through <code>/images/12.jpg</code>
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                    Photo Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newPhotoTitle}
                    onChange={(e) => setNewPhotoTitle(e.target.value)}
                    placeholder="e.g. Festival Gathering"
                    className="w-full px-3 py-2 rounded-lg border border-brand-border text-sm text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-redhover text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Gallery</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: EDIT WEBSITE CONTENT                              */}
        {/* ========================================================= */}
        {activeTab === 'content' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header / Actions toolbar */}
            <div className="bg-white p-6 rounded-2xl border border-brand-border/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-brand-dark">
                  Website Content Editor
                </h2>
                <p className="text-sm text-brand-muted mt-1">
                  Customize hero banner texts, upcoming community events, and official contact information.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetContent}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-brand-border/80 shadow-xs">
              <div className="flex items-center gap-2.5 mb-6 pb-3 border-b border-brand-border">
                <Sparkles className="w-5 h-5 text-brand-gold" />
                <h3 className="font-serif text-xl font-bold text-brand-dark">
                  Hero Banner Section
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                    Welcome Banner Badge
                  </label>
                  <input
                    type="text"
                    value={content.hero.badge}
                    onChange={(e) => handleContentChange('hero', 'badge', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-sm text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                    Headline Prefix
                  </label>
                  <input
                    type="text"
                    value={content.hero.title}
                    onChange={(e) => handleContentChange('hero', 'title', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-sm text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                    Headline Highlighted Text
                  </label>
                  <input
                    type="text"
                    value={content.hero.titleHighlight}
                    onChange={(e) => handleContentChange('hero', 'titleHighlight', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-sm text-brand-dark focus:ring-1 focus:ring-brand-red outline-none font-serif italic"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                    Description Paragraph
                  </label>
                  <textarea
                    rows={3}
                    value={content.hero.description}
                    onChange={(e) => handleContentChange('hero', 'description', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-sm text-brand-dark focus:ring-1 focus:ring-brand-red outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={content.hero.ctaText}
                    onChange={(e) => handleContentChange('hero', 'ctaText', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-sm text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                    Button Link URL
                  </label>
                  <input
                    type="text"
                    value={content.hero.ctaLink}
                    onChange={(e) => handleContentChange('hero', 'ctaLink', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-sm text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: CONTACT DETAILS */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-brand-border/80 shadow-xs">
              <div className="flex items-center gap-2.5 mb-6 pb-3 border-b border-brand-border">
                <Phone className="w-5 h-5 text-brand-gold" />
                <h3 className="font-serif text-xl font-bold text-brand-dark">
                  Official Contact Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                    Coordinator Name
                  </label>
                  <input
                    type="text"
                    value={content.contact.personName}
                    onChange={(e) => handleContentChange('contact', 'personName', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-sm text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={content.contact.phone}
                    onChange={(e) => handleContentChange('contact', 'phone', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-sm text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={content.contact.email}
                    onChange={(e) => handleContentChange('contact', 'email', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-sm text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                    Sangham Office Address
                  </label>
                  <input
                    type="text"
                    value={content.contact.address}
                    onChange={(e) => handleContentChange('contact', 'address', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-brand-border text-sm text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: FEATURED EVENTS */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-brand-border/80 shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-brand-border">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-brand-gold" />
                  <h3 className="font-serif text-xl font-bold text-brand-dark">
                    Upcoming Community Events ({content.events.length})
                  </h3>
                </div>
              </div>

              <div className="space-y-6">
                {content.events.map((event, idx) => (
                  <div
                    key={event.id}
                    className="p-5 rounded-xl border border-brand-border bg-slate-50/70 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-dark text-white">
                        Event #{idx + 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                          Event Title
                        </label>
                        <input
                          type="text"
                          value={event.title}
                          onChange={(e) => handleEventChange(event.id, 'title', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-brand-border bg-white text-sm text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                          Category
                        </label>
                        <select
                          value={event.category}
                          onChange={(e) => handleEventChange(event.id, 'category', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-brand-border bg-white text-sm text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                        >
                          <option value="Spiritual">Spiritual</option>
                          <option value="Community">Community</option>
                          <option value="Celebration">Celebration</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                          Month (3-letter)
                        </label>
                        <input
                          type="text"
                          value={event.month}
                          onChange={(e) => handleEventChange(event.id, 'month', e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 rounded-lg border border-brand-border bg-white text-sm text-brand-dark font-mono uppercase focus:ring-1 focus:ring-brand-red outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                          Day
                        </label>
                        <input
                          type="text"
                          value={event.day}
                          onChange={(e) => handleEventChange(event.id, 'day', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-brand-border bg-white text-sm text-brand-dark font-mono focus:ring-1 focus:ring-brand-red outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                          Year
                        </label>
                        <input
                          type="text"
                          value={event.year}
                          onChange={(e) => handleEventChange(event.id, 'year', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-brand-border bg-white text-sm text-brand-dark font-mono focus:ring-1 focus:ring-brand-red outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                          Time Range
                        </label>
                        <input
                          type="text"
                          value={event.time}
                          onChange={(e) => handleEventChange(event.id, 'time', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-brand-border bg-white text-sm text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                          Location (Town / Mandal)
                        </label>
                        <input
                          type="text"
                          value={event.location}
                          onChange={(e) => handleEventChange(event.id, 'location', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-brand-border bg-white text-sm text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                          Short Description
                        </label>
                        <textarea
                          rows={2}
                          value={event.description}
                          onChange={(e) => handleEventChange(event.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-brand-border bg-white text-sm text-brand-dark focus:ring-1 focus:ring-brand-red outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: LIVE PREVIEW                                      */}
        {/* ========================================================= */}
        {activeTab === 'preview' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl border border-brand-border/80 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-brand-dark">
                  Live Preview Mode
                </h2>
                <p className="text-sm text-brand-muted mt-1">
                  Here is how your modified content and rearranged photos will look to visitors.
                </p>
              </div>
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-red hover:bg-brand-redhover text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
              >
                <span>Open Full Homepage</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Preview 1: Hero Banner */}
            <div className="bg-brand-dark text-white rounded-2xl p-8 sm:p-12 shadow-md relative overflow-hidden">
              <span className="text-brand-gold text-xs font-bold tracking-widest uppercase mb-2 block">
                {content.hero.badge}
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-3">
                {content.hero.title} <span className="italic">{content.hero.titleHighlight}</span>
              </h1>
              <p className="text-gray-300 text-sm sm:text-base max-w-xl leading-relaxed mb-6">
                {content.hero.description}
              </p>
              <span className="inline-block bg-brand-red text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-sm">
                {content.hero.ctaText}
              </span>
            </div>

            {/* Preview 2: Top Gallery Photos (First 3 in current order) */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-brand-border/80 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-brand-gold text-xs font-bold uppercase tracking-wider block">
                    Homepage Gallery Preview
                  </span>
                  <h3 className="font-serif text-xl font-bold text-brand-dark">
                    Top 3 Photos in Homepage Grid
                  </h3>
                </div>
                <span className="text-xs text-brand-muted">
                  First 3 will appear on the homepage
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {photos.slice(0, 3).map((p, idx) => (
                  <div
                    key={p.id}
                    className="relative rounded-xl overflow-hidden border border-brand-border h-48 bg-brand-cream group"
                  >
                    <Image src={p.url} alt={p.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                      <span className="text-[10px] font-bold uppercase text-brand-gold">
                        Position #{idx + 1}
                      </span>
                      <p className="text-white font-serif font-bold text-sm">{p.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
