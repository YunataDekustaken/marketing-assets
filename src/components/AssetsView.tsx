import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  FileText, 
  FolderOpen, 
  Cloud, 
  RefreshCw, 
  ExternalLink, 
  LayoutGrid, 
  List, 
  ChevronRight, 
  Home,
  Grid2X2,
  Square,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Asset, ASSET_CATEGORIES } from '../types';
import { GoogleAuth } from './GoogleAuth';
import { AssetGallery } from './AssetGallery';
import { UploadZone } from './UploadZone';
import { useGoogleDrive, ROOT_FOLDER_ID } from '../hooks/useGoogleDrive';

export const AssetsView = ({ 
  assets, 
  categoryFilter, 
  setCategoryFilter, 
  searchQuery, 
  setSearchQuery,
  googleAccessToken,
  onGoogleLogout
}: { 
  assets: Asset[];
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  googleAccessToken: string | null;
  onGoogleLogout: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<'local' | 'drive'>('local');
  const [gridSize, setGridSize] = useState<'list' | 'small' | 'medium' | 'large'>('medium');
  const [folderStack, setFolderStack] = useState<{id: string, name: string}[]>([{id: ROOT_FOLDER_ID, name: 'Root'}]);
  
  const currentFolder = folderStack[folderStack.length - 1];
  const { files, loading, fetchFiles, uploadFile, deleteFile } = useGoogleDrive(googleAccessToken, currentFolder.id, onGoogleLogout);

  useEffect(() => {
    if (googleAccessToken && activeTab === 'drive') {
      fetchFiles();
    }
  }, [googleAccessToken, fetchFiles, activeTab, currentFolder.id]);

  const handleFolderClick = (folderId: string, folderName: string) => {
    setFolderStack(prev => [...prev, { id: folderId, name: folderName }]);
  };

  const navigateToBreadcrumb = (index: number) => {
    setFolderStack(prev => prev.slice(0, index + 1));
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        asset.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || asset.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const gridSizeIcons = {
    list: <List className="w-4 h-4" />,
    small: <Grid2X2 className="w-4 h-4" />,
    medium: <LayoutGrid className="w-4 h-4" />,
    large: <Square className="w-4 h-4" />
  };

  return (
    <div className="space-y-8">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('local')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'local' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          Local Library
        </button>
        <button
          onClick={() => setActiveTab('drive')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'drive' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Cloud className="w-4 h-4" />
          Google Drive
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'local' ? (
          <motion.div
            key="local"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search assets... (logo, template, guidelines, etc.)"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                <button 
                  onClick={() => setCategoryFilter('All')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${categoryFilter === 'All' ? 'bg-amber-500 text-primary-dark shadow-md shadow-amber-200' : 'bg-white text-slate-500 border border-slate-200 hover:border-amber-500 hover:text-amber-600'}`}
                >
                  All
                </button>
                {ASSET_CATEGORIES.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${categoryFilter === cat ? 'bg-amber-500 text-primary-dark shadow-md shadow-amber-200' : 'bg-white text-slate-500 border border-slate-200 hover:border-amber-500 hover:text-amber-600'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <AnimatePresence mode="wait">
              {filteredAssets.length > 0 ? (
                <motion.div 
                  key={categoryFilter + searchQuery}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredAssets.map(asset => (
                    <div 
                      key={asset.id} 
                      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                          <FileText className="w-6 h-6 text-amber-600" />
                        </div>
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
                          {asset.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-6 line-clamp-2 min-h-[3.5rem]">{asset.title}</h3>
                      <a 
                        href={asset.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-primary-dark hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-slate-200"
                      >
                        <FolderOpen className="w-4 h-4" />
                        Open in Google Drive
                      </a>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="no-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm"
                >
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Asset not found?</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">Try a different search term or request the asset from the marketing team below.</p>
                
                <form 
                  className="max-w-md mx-auto space-y-4 text-left p-6 bg-slate-50 rounded-2xl border border-slate-100"
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert('✅ Request submitted! Marketing team will review and add the asset soon.');
                    (e.target as HTMLFormElement).reset();
                  }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Name</label>
                      <input required type="text" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500/20" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</label>
                      <select required className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500/20">
                        <option value="">Select...</option>
                        <option value="Sales">Sales</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Customer Success">Customer Success</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requested Asset</label>
                    <input required type="text" placeholder="e.g. Holiday campaign banner" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500/20" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-sm font-bold transition-all shadow-md shadow-amber-100">
                    Submit Request
                  </button>
                </form>
              </motion.div>
            )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="drive"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-900">Google Drive Assets</h2>
                  {googleAccessToken && (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => fetchFiles()}
                        disabled={loading}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all disabled:opacity-50"
                        title="Refresh files"
                      >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                      </button>
                      <a 
                        href={`https://drive.google.com/drive/folders/1MWfdDx8uR55IKsgo9Y741BuxR-EJoesU`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                        title="Open Folder in Drive"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                  )}
                </div>
                <p className="text-slate-500 text-sm">Manage files directly in your shared marketing folder.</p>
              </div>
            </div>

            {googleAccessToken ? (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                      {folderStack.map((folder, index) => (
                        <React.Fragment key={folder.id}>
                          {index > 0 && <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />}
                          <button
                            onClick={() => navigateToBreadcrumb(index)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                              index === folderStack.length - 1
                                ? 'bg-amber-50 text-amber-700'
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            {index === 0 ? <Home className="w-4 h-4" /> : <FolderOpen className="w-4 h-4" />}
                            {folder.name}
                          </button>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <UploadZone onUpload={uploadFile} loading={loading} isSmall />
                    
                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                      {(['list', 'small', 'medium', 'large'] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => setGridSize(size)}
                          className={`p-2 rounded-lg transition-all relative group ${
                            gridSize === size 
                              ? 'bg-white text-slate-900 shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {gridSizeIcons[size]}
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            {size.charAt(0).toUpperCase() + size.slice(1)} View
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <AssetGallery 
                    files={files} 
                    loading={loading} 
                    onDelete={deleteFile} 
                    onFolderClick={handleFolderClick}
                    gridSize={gridSize}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Cloud className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Google Drive Not Connected</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">Please go to the Admin Center to connect your Google Drive account and access shared assets.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

