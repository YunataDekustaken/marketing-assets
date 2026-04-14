import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { 
  Plus, 
  AlertCircle, 
  Edit2, 
  Trash2, 
  ExternalLink,
  X,
  Facebook,
  Instagram,
  Linkedin,
  FolderOpen,
  Info,
  Music2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Asset, ASSET_CATEGORIES } from '../types';

export const AdminView = ({ 
  socialLinks,
  onUpdateSocialLinks,
  assets,
  handleSaveAsset,
  handleDeleteAsset,
  assetFormData,
  setAssetFormData,
  editingAsset,
  setEditingAsset,
  isAssetModalOpen,
  setIsAssetModalOpen
}: { 
  socialLinks: { facebook: string, instagram: string, linkedin: string, tiktok: string },
  onUpdateSocialLinks: (links: any) => void,
  assets: Asset[],
  handleSaveAsset: () => Promise<void>,
  handleDeleteAsset: (id: string) => Promise<void>,
  assetFormData: Partial<Asset>,
  setAssetFormData: Dispatch<SetStateAction<Partial<Asset>>>,
  editingAsset: Asset | null,
  setEditingAsset: Dispatch<SetStateAction<Asset | null>>,
  isAssetModalOpen: boolean,
  setIsAssetModalOpen: Dispatch<SetStateAction<boolean>>
}) => {
  const [localLinks, setLocalLinks] = useState(socialLinks);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setLocalLinks(socialLinks);
  }, [socialLinks]);

  const handleSaveLinks = () => {
    setShowConfirm(true);
  };

  const confirmSave = () => {
    onUpdateSocialLinks(localLinks);
    setShowConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Asset Management */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl">
              <FolderOpen className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Asset Library Management</h3>
              <p className="text-xs text-slate-500">Add or remove marketing assets from the library.</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setEditingAsset(null);
              setAssetFormData({ title: '', category: ASSET_CATEGORIES[0], link: '' });
              setIsAssetModalOpen(true);
            }}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Asset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map(asset => (
            <div key={asset.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/30 flex items-center justify-between group">
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{asset.title}</p>
                <p className="text-[10px] text-slate-500">{asset.category}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => {
                    setEditingAsset(asset);
                    setAssetFormData(asset);
                    setIsAssetModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-white rounded-lg transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteAsset(asset.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <ExternalLink className="w-6 h-6 text-indigo-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Social Media Redirection Links</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Facebook className="w-3 h-3 text-[#1877F2]" />
              Facebook URL
            </label>
            <input 
              type="url" 
              placeholder="https://facebook.com/yourpage"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
              value={localLinks.facebook}
              onChange={(e) => setLocalLinks(prev => ({ ...prev, facebook: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Instagram className="w-3 h-3 text-[#E4405F]" />
              Instagram URL
            </label>
            <input 
              type="url" 
              placeholder="https://instagram.com/yourprofile"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
              value={localLinks.instagram}
              onChange={(e) => setLocalLinks(prev => ({ ...prev, instagram: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Linkedin className="w-3 h-3 text-[#0A66C2]" />
              LinkedIn URL
            </label>
            <input 
              type="url" 
              placeholder="https://linkedin.com/company/yourcompany"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
              value={localLinks.linkedin}
              onChange={(e) => setLocalLinks(prev => ({ ...prev, linkedin: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Music2 className="w-3 h-3 text-[#000000]" />
              TikTok URL
            </label>
            <input 
              type="url" 
              placeholder="https://tiktok.com/@yourprofile"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
              value={localLinks.tiktok}
              onChange={(e) => setLocalLinks(prev => ({ ...prev, tiktok: e.target.value }))}
            />
          </div>
        </div>

        <button 
          onClick={handleSaveLinks}
          className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-primary-dark rounded-xl text-sm font-bold transition-all shadow-sm"
        >
          Save Social Links
        </button>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-slate-50 rounded-xl">
            <Info className="w-6 h-6 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">App Info</h3>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Application Name</p>
            <p className="text-sm font-bold text-slate-900">Marketing Operations Portal</p>
          </div>
          <div className="pt-6 border-t border-slate-100">
            <p className="text-xs italic text-slate-400">Admin Center is only accessible to Marketing Supervisors.</p>
          </div>
        </div>
      </div>

      {/* Save Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary-dark/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Confirm Changes</h3>
                    <p className="text-sm text-slate-500">Are you sure you want to update the social media redirection links?</p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">Cancel</button>
                <button onClick={confirmSave} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-primary-dark text-sm font-bold rounded-lg transition-colors shadow-sm">Confirm & Save</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Asset Modal */}
      <AnimatePresence>
        {isAssetModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary-dark/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900">{editingAsset ? 'Edit Asset' : 'Add New Asset'}</h2>
                <button onClick={() => setIsAssetModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Asset Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    value={assetFormData.title}
                    onChange={(e) => setAssetFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Primary Logo Kit"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    value={assetFormData.category}
                    onChange={(e) => setAssetFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {ASSET_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Google Drive Link</label>
                  <input 
                    type="url" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    value={assetFormData.link}
                    onChange={(e) => setAssetFormData(prev => ({ ...prev, link: e.target.value }))}
                    placeholder="https://drive.google.com/..."
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={() => setIsAssetModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancel</button>
                <button 
                  onClick={handleSaveAsset}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-primary-dark text-sm font-bold rounded-lg transition-colors shadow-sm"
                >
                  {editingAsset ? 'Update Asset' : 'Add Asset'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
