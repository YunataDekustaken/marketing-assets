import React from 'react';
import { Search, FileText, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Asset, ASSET_CATEGORIES } from '../types';

export const AssetsView = ({ 
  assets, 
  categoryFilter, 
  setCategoryFilter, 
  searchQuery, 
  setSearchQuery 
}: { 
  assets: Asset[];
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) => {
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        asset.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || asset.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
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
    </div>
  );
};
