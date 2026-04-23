import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const FileManager = () => {
  const [files, setFiles] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sn_files') || '[]');
    } catch {
      return [];
    }
  });
  const [uploading, setUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const fileInputRef = useRef(null);
  const { currentUser } = useAuth();

  const FOLDERS = [
    { id: 'all', name: 'All Files', icon: '📁' },
    { id: 'photos', name: 'Photos', icon: '🖼️' },
    { id: 'documents', name: 'Documents', icon: '📄' },
    { id: 'others', name: 'Others', icon: '📎' },
  ];

  const getFileCategory = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const docExts = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'];
    
    if (imageExts.includes(ext)) return 'photos';
    if (docExts.includes(ext)) return 'documents';
    return 'others';
  };

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const newFiles = [];

    for (const file of selectedFiles) {
      const reader = new FileReader();
      
      const fileData = await new Promise((resolve) => {
        reader.onload = (event) => {
          const newFile = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            category: getFileCategory(file.name),
            data: event.target.result,
            uploadedAt: new Date().toISOString(),
            folder: getFileCategory(file.name),
          };
          resolve(newFile);
        };
        reader.readAsDataURL(file);
      });

      newFiles.push(fileData);
    }

    const updatedFiles = [...newFiles, ...files];
    setFiles(updatedFiles);
    localStorage.setItem('sn_files', JSON.stringify(updatedFiles));
    setUploading(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = (fileId) => {
    if (!window.confirm('Delete this file?')) return;
    
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    localStorage.setItem('sn_files', JSON.stringify(updatedFiles));
  };

  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    link.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const filteredFiles = files.filter(file => {
    if (selectedFolder === 'all') return true;
    return file.category === selectedFolder;
  });

  const getStorageUsed = () => {
    const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
    return formatFileSize(totalBytes);
  };

  return (
    <div className="sn-dashboard">
      <div className="sn-dash-header">
        <div>
          <h2 className="sn-dash-greeting">Private Files 📁</h2>
          <p className="sn-dash-sub">Securely store your files and photos</p>
        </div>
        <div className="sn-dash-actions">
          <label className="sn-upload-btn">
            {uploading ? '⏳ Uploading...' : '⬆ Upload Files'}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <div className="sn-file-manager">
        {/* Folder Sidebar */}
        <div className="sn-file-sidebar">
          <div className="sn-folder-list">
            {FOLDERS.map(folder => (
              <button
                key={folder.id}
                className={`sn-folder-item ${selectedFolder === folder.id ? 'active' : ''}`}
                onClick={() => setSelectedFolder(folder.id)}
              >
                <span className="sn-folder-icon">{folder.icon}</span>
                <span className="sn-folder-name">{folder.name}</span>
                <span className="sn-folder-count">
                  {folder.id === 'all' 
                    ? files.length 
                    : files.filter(f => f.category === folder.id).length}
                </span>
              </button>
            ))}
          </div>
          <div className="sn-storage-info">
            <span>Storage Used:</span>
            <strong>{getStorageUsed()}</strong>
          </div>
        </div>

        {/* File Grid */}
        <div className="sn-file-content">
          <div className="sn-file-stats">
            <div className="sn-stat-card">
              <span className="sn-stat-value">{files.length}</span>
              <span className="sn-stat-label">Total Files</span>
            </div>
            <div className="sn-stat-card">
              <span className="sn-stat-value">
                {files.filter(f => f.category === 'photos').length}
              </span>
              <span className="sn-stat-label">Photos</span>
            </div>
            <div className="sn-stat-card">
              <span className="sn-stat-value">
                {files.filter(f => f.category === 'documents').length}
              </span>
              <span className="sn-stat-label">Documents</span>
            </div>
          </div>

          {filteredFiles.length === 0 ? (
            <div className="sn-empty-state">
              <span className="sn-empty-icon">📂</span>
              <p className="sn-empty-title">No files yet</p>
              <p className="sn-empty-desc">Upload files to get started!</p>
            </div>
          ) : (
            <div className="sn-file-grid">
              {filteredFiles.map(file => (
                <div key={file.id} className="sn-file-item">
                  {file.category === 'photos' ? (
                    <div className="sn-file-preview">
                      <img src={file.data} alt={file.name} />
                    </div>
                  ) : (
                    <div className="sn-file-preview sn-file-icon">
                      {file.category === 'documents' ? '📄' : '📎'}
                    </div>
                  )}
                  <div className="sn-file-info">
                    <span className="sn-file-name" title={file.name}>
                      {file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}
                    </span>
                    <span className="sn-file-meta">
                      {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                    </span>
                  </div>
                  <div className="sn-file-actions">
                    <button 
                      className="sn-file-action-btn" 
                      onClick={() => handleDownload(file)}
                      title="Download"
                    >
                      ⬇
                    </button>
                    <button 
                      className="sn-file-action-btn sn-file-delete" 
                      onClick={() => handleDeleteFile(file.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileManager;