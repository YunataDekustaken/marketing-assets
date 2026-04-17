/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import { 
  Plus, 
  Search, 
  AlertCircle, 
  Edit2, 
  Trash2, 
  ExternalLink,
  X,
  Loader2,
  Copy,
  Check,
  Lock,
  Bell,
  User as UserIcon,
  ShieldCheck,
  Info,
  PanelLeftClose,
  PanelLeftOpen,
  Facebook,
  Instagram,
  Linkedin,
  FolderOpen,
  FileText,
  Sparkles,
  Music2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Asset, ASSET_CATEGORIES, ViewMode } from './types';
import { auth, db, googleProvider, isFirebaseConfigured } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
} from 'firebase/firestore';
import { persistenceService } from './services/persistenceService';

import { AdminView } from './components/AdminView';
import { AssetsView } from './components/AssetsView';
import { ROOT_FOLDER_ID } from './hooks/useGoogleDrive';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  console.error('Firestore Error: ', error, operationType, path);
};

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('assets');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetCategoryFilter, setAssetCategoryFilter] = useState('All');
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [assetFormData, setAssetFormData] = useState<Partial<Asset>>({
    title: '',
    category: ASSET_CATEGORIES[0],
    link: ''
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    linkedin: '',
    tiktok: ''
  });
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(() => {
    const token = localStorage.getItem('drive_token');
    const expiresAt = localStorage.getItem('drive_expires_at');
    if (token && expiresAt && Date.now() < parseInt(expiresAt)) {
      return token;
    }
    return null;
  });

  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsAuthReady(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = persistenceService.subscribeToAssets((data) => {
      setAssets(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setViewMode('assets');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleGoogleAuthSuccess = (token: string, expiresAt: number) => {
    setGoogleAccessToken(token);
    localStorage.setItem('drive_token', token);
    localStorage.setItem('drive_expires_at', expiresAt.toString());
  };

  const handleGoogleLogout = () => {
    setGoogleAccessToken(null);
    localStorage.removeItem('drive_token');
    localStorage.removeItem('drive_expires_at');
  };

  const handleSaveAsset = async () => {
    if (!assetFormData.title || !assetFormData.link) return;
    
    const assetToSave: Asset = {
      id: editingAsset?.id || `asset_${Date.now()}`,
      title: assetFormData.title,
      category: assetFormData.category || ASSET_CATEGORIES[0],
      link: assetFormData.link,
      userId: user?.uid
    };

    try {
      await persistenceService.saveAsset(assetToSave);
      setIsAssetModalOpen(false);
      setAssetFormData({ title: '', category: ASSET_CATEGORIES[0], link: '' });
      setEditingAsset(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'assets');
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await persistenceService.deleteAsset(id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'assets');
    }
  };

  const handleUpdateSocialLinks = (links: any) => {
    setSocialLinks(links);
    // In a real app, we would save this to Firestore settings
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg-main font-sans text-slate-900">
      {/* Sidebar */}
      <aside 
        onMouseEnter={() => isSidebarCollapsed && setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`flex flex-col shrink-0 bg-primary-dark text-slate-300 relative z-30 shadow-2xl transition-[width] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isSidebarCollapsed && !isSidebarHovered ? 'w-20' : 'w-64'}`}
      >
        <div className={`px-4 pt-4 flex ${isSidebarCollapsed && !isSidebarHovered ? 'justify-center' : 'justify-start'}`}>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all"
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>

        <div className={`p-6 pt-2 flex items-center transition-all duration-500 ${isSidebarCollapsed && !isSidebarHovered ? 'justify-center' : 'gap-3'}`}>
          <div className="relative shrink-0">
            {/* Main Square Logo */}
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-xs tracking-tighter shadow-lg shadow-amber-500/20">
              STLAF
            </div>
            
            {/* Star Icon Overlay */}
            <div className="absolute -right-1.5 -top-1.5 bg-white rounded-lg p-1 shadow-sm border border-slate-100">
              <Sparkles className="w-3 h-3 text-amber-500" />
            </div>
          </div>
          <AnimatePresence mode="wait">
            {(!isSidebarCollapsed || isSidebarHovered) && (
              <motion.div 
                key="logo-text"
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h2 className="text-sm font-bold text-white leading-tight">Assets Portal</h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Marketing Dept</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto no-scrollbar overflow-x-hidden">
          <button 
            onClick={() => setViewMode('assets')}
            className={`w-full flex items-center ${isSidebarCollapsed && !isSidebarHovered ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl font-semibold transition-all duration-300 ease-in-out ${viewMode === 'assets' ? 'bg-slate-700/50 text-amber-500 border-l-4 border-amber-500' : 'hover:bg-white/10 hover:text-white text-slate-400'}`}
          >
            <FolderOpen className="w-5 h-5 shrink-0" />
            <AnimatePresence>
              {(!isSidebarCollapsed || isSidebarHovered) && (
                <motion.span 
                  key="assets-text"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Assets Library
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          
          <div className="pt-4 mt-4 border-t border-slate-700/50">
            <button 
              onClick={() => setViewMode('admin')}
              className={`w-full flex items-center ${isSidebarCollapsed && !isSidebarHovered ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl font-semibold transition-all duration-300 ease-in-out ${viewMode === 'admin' ? 'bg-slate-700/50 text-amber-500 border-l-4 border-amber-500' : 'hover:bg-white/10 hover:text-white text-slate-400'}`}
            >
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <AnimatePresence>
                {(!isSidebarCollapsed || isSidebarHovered) && (
                  <motion.span 
                    key="admin-text"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    Admin Center
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          <AnimatePresence>
            {(!isSidebarCollapsed || isSidebarHovered) && (
              <motion.div 
                key="quick-links"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-8 px-4 overflow-hidden"
              >
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <a href="#" className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
                    <ExternalLink className="w-3 h-3" />
                    Marketing Guidelines
                  </a>
                  <a href="#" className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
                    <ExternalLink className="w-3 h-3" />
                    Brand Voice Guide
                  </a>
                  <a href="#" className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
                    <ExternalLink className="w-3 h-3" />
                    Support Desk
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {isFirebaseConfigured && (
          <div className="p-4 border-t border-slate-700/50">
            {user ? (
              <div className={`flex items-center ${isSidebarCollapsed && !isSidebarHovered ? 'justify-center' : 'gap-3'}`}>
                {user.photoURL && <img src={user.photoURL} className="w-8 h-8 rounded-full border border-slate-600 shrink-0" alt="Profile" referrerPolicy="no-referrer" />}
                {(!isSidebarCollapsed || isSidebarHovered) && (
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{user.displayName}</p>
                    <button onClick={handleLogout} className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className={`w-full flex items-center justify-center ${isSidebarCollapsed && !isSidebarHovered ? 'p-2' : 'gap-2 px-4 py-2'} bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-all`}
              >
                <Lock className="w-3.5 h-3.5 shrink-0" />
                {(!isSidebarCollapsed || isSidebarHovered) && <span>Sign In</span>}
              </button>
            )}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-lg font-bold text-slate-800">
            {viewMode === 'assets' ? 'Marketing Assets' : 'Admin Center'}
          </h1>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl text-sm font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Request Asset
            </button>
            {/* Social Links in Header */}
            <div className="hidden md:flex items-center gap-3">
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 rounded-lg text-[#1877F2] hover:bg-[#1877F2]/10 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 rounded-lg text-[#E4405F] hover:bg-[#E4405F]/10 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 rounded-lg text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {socialLinks.tiktok && (
                <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 rounded-lg text-[#000000] hover:bg-[#000000]/10 transition-colors">
                  <Music2 className="w-4 h-4" />
                </a>
              )}
            </div>
            
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-full transition-all ${showNotifications ? 'bg-slate-100 text-amber-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                <Bell className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 text-center"
                  >
                    <p className="text-xs text-slate-500">No new notifications</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {viewMode === 'assets' ? (
              <AssetsView 
                assets={assets}
                categoryFilter={assetCategoryFilter}
                setCategoryFilter={setAssetCategoryFilter}
                searchQuery={assetSearchQuery}
                setSearchQuery={setAssetSearchQuery}
                googleAccessToken={googleAccessToken}
                onGoogleLogout={handleGoogleLogout}
              />
            ) : (
              <AdminView 
                socialLinks={socialLinks}
                onUpdateSocialLinks={handleUpdateSocialLinks}
                assets={assets}
                handleSaveAsset={handleSaveAsset}
                handleDeleteAsset={handleDeleteAsset}
                assetFormData={assetFormData}
                setAssetFormData={setAssetFormData}
                editingAsset={editingAsset}
                setEditingAsset={setEditingAsset}
                isAssetModalOpen={isAssetModalOpen}
                setIsAssetModalOpen={setIsAssetModalOpen}
                googleAccessToken={googleAccessToken}
                onGoogleAuthSuccess={handleGoogleAuthSuccess}
                onGoogleLogout={handleGoogleLogout}
              />
            )}
          </div>
        </main>
      </div>

      {/* Request Asset Modal */}
      <AnimatePresence>
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary-dark/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900">Request an Asset</h2>
                <button onClick={() => setIsRequestModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('✅ Request submitted! Marketing team will review and add the asset soon.');
                  setIsRequestModalOpen(false);
                }}
              >
                <div className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Your Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Department</label>
                    <select 
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    >
                      <option value="">Select...</option>
                      <option value="Sales">Sales</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Customer Success">Customer Success</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Requested Asset</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                      placeholder="e.g. Holiday campaign banner"
                    />
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsRequestModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancel</button>
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-primary-dark text-sm font-bold rounded-lg transition-colors shadow-sm"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
