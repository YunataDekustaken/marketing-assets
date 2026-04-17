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
  googleAccessToken,
  onGoogleLogout,
  addNotification,
  initialPreviewFile,
  onClearInitialPreview,
  initialFolder,
  onClearInitialFolder,
  pinnedAssets = [],
  onTogglePin
}: { 
  key?: React.Key;
  googleAccessToken: string | null;
  onGoogleLogout: () => void;
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning', settingKey?: string, file?: any) => void;
  initialPreviewFile?: any | null;
  onClearInitialPreview?: () => void;
  initialFolder?: any | null;
  onClearInitialFolder?: () => void;
  pinnedAssets?: any[];
  onTogglePin?: (asset: any) => void;
}) => {
  const [gridSize, setGridSize] = useState<'list' | 'small' | 'medium' | 'large'>('medium');
  const [folderStack, setFolderStack] = useState<{id: string, name: string}[]>([{id: ROOT_FOLDER_ID, name: 'Root'}]);
  
  useEffect(() => {
    if (initialFolder) {
      setFolderStack([{id: ROOT_FOLDER_ID, name: 'Root'}, {id: initialFolder.id, name: initialFolder.name}]);
      onClearInitialFolder?.();
    }
  }, [initialFolder, onClearInitialFolder]);

  const currentFolder = folderStack[folderStack.length - 1];
  const { files, loading, fetchFiles, uploadFile: originalUpload, deleteFile: originalDelete } = useGoogleDrive(googleAccessToken, currentFolder.id, onGoogleLogout);

  const uploadFile = async (file: File) => {
    try {
      addNotification('Upload Started', `Uploading ${file.name}...`, 'info', 'driveUploads');
      await originalUpload(file);
      addNotification('Upload Successful', `Successfully uploaded ${file.name}`, 'success', 'driveUploads');
    } catch (err: any) {
      addNotification('Upload Failed', `Failed to upload ${file.name}: ${err.message}`, 'warning', 'driveUploads');
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      await originalDelete(fileId);
      addNotification('Deleted', `Item deleted successfully`, 'success');
    } catch (err: any) {
      addNotification('Delete Error', `Failed to delete item: ${err.message}`, 'warning');
    }
  };

  useEffect(() => {
    if (googleAccessToken) {
      fetchFiles();
    }
  }, [googleAccessToken, fetchFiles, currentFolder.id]);

  const handleFolderClick = (folderId: string, folderName: string) => {
    setFolderStack(prev => [...prev, { id: folderId, name: folderName }]);
  };

  const navigateToBreadcrumb = (index: number) => {
    setFolderStack(prev => prev.slice(0, index + 1));
  };

  const gridSizeIcons = {
    list: <List className="w-4 h-4" />,
    small: <Grid2X2 className="w-4 h-4" />,
    medium: <LayoutGrid className="w-4 h-4" />,
    large: <Square className="w-4 h-4" />
  };

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        <motion.div
          key="drive"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6"
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
              <div className="space-y-6">
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

                  <div className="flex items-center gap-3">
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
                    addNotification={addNotification}
                    initialPreviewFile={initialPreviewFile}
                    onClearInitialPreview={onClearInitialPreview}
                    pinnedAssets={pinnedAssets}
                    onTogglePin={onTogglePin}
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
      </AnimatePresence>
    </div>
  );
};

