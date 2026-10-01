import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Upload,
  Cloud,
  CheckCircle2,
  Copy,
  ExternalLink,
  Film,
  Image as ImageIcon,
  X,
  AlertCircle,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { mediaAPI } from '../../services/api';

export const MediaUploaderModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState('portfolio');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    // Check size limit: 100MB
    if (selectedFile.size > 100 * 1024 * 1024) {
      setErrorMsg('File exceeds 100MB limit.');
      return;
    }

    setFile(selectedFile);
    setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    setErrorMsg('');
    setUploadResult(null);

    // Create local object URL for instant preview
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select an image or video file to upload.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('title', title || file.name);

      const res = await mediaAPI.upload(formData);

      if (res && res.data) {
        setUploadResult(res.data);
        if (onUploadSuccess) {
          onUploadSuccess(res.data);
        }
      } else {
        throw new Error('Upload succeeded but no media data was returned.');
      }
    } catch (err) {
      console.error('[Upload Error]', err);
      setErrorMsg(
        err.message || 'Failed to upload media. Please check storage credentials.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const resetForm = () => {
    setFile(null);
    setPreviewUrl('');
    setUploadResult(null);
    setErrorMsg('');
    setTitle('');
  };

  const isVideo = file?.type?.startsWith('video') || uploadResult?.type === 'video';

  return typeof document !== 'undefined' ? createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={() => {
        resetForm();
        onClose();
      }}
    >
      <div 
        className="bg-[#121622] border border-white/15 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-semibold text-white">
                Upload Media & Get Stored URL
              </h3>
              <p className="text-xs text-slate-400">
                Pipes directly to active storage provider and saves link to database
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-400" />
              <div className="flex-1">
                <span className="font-semibold block">Upload Failed</span>
                <span className="text-slate-300">{errorMsg}</span>
              </div>
            </div>
          )}

          {!uploadResult ? (
            <form onSubmit={handleUpload} className="space-y-4">
              {/* Active Storage Destination Banner */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <Cloud className="w-4 h-4 text-[#C9A96E]" />
                  <span>Storage Destination:</span>
                  <span className="font-semibold text-white">Active Provider (Managed in Admin Settings)</span>
                </div>
                <span className="text-[10px] text-[#C9A96E] bg-[#C9A96E]/10 px-2.5 py-0.5 rounded-full border border-[#C9A96E]/20">
                  Automatic Routing
                </span>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#C9A96E] bg-[#C9A96E]/10 scale-[0.99]'
                    : file
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                />

                {previewUrl ? (
                  <div className="space-y-3">
                    <div className="relative max-h-48 mx-auto rounded-2xl overflow-hidden border border-white/15 flex items-center justify-center bg-black/40">
                      {isVideo ? (
                        <video src={previewUrl} controls className="max-h-48 w-full object-contain" />
                      ) : (
                        <img src={previewUrl} alt="Preview" className="max-h-48 w-full object-contain" />
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Click or drag another file to replace</p>
                  </div>
                ) : (
                  <div className="space-y-3 py-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#C9A96E]">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Click to upload or drag & drop
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        High-resolution Images (JPEG, PNG, WebP) or 4K Cinema Videos (MP4, MOV, WebM)
                      </p>
                    </div>
                    <span className="inline-block text-[10px] px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 font-mono">
                      Max file size: 100MB
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Folder Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Asset Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Royal Palace Reception Highlights"
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Cloud Folder</label>
                  <input
                    type="text"
                    value={folder}
                    onChange={(e) => setFolder(e.target.value)}
                    placeholder="portfolio"
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!file || isUploading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow flex items-center gap-2 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>Uploading to active storage...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-black" />
                      <span>Upload & Get Link</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Upload Success Result Display */
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                <div>
                  <div className="font-semibold text-white">Media Uploaded & Saved to MongoDB!</div>
                  <div className="text-emerald-400 text-[11px]">
                    Stored via active provider: {uploadResult.storageProvider} • Record ID: {uploadResult._id}
                  </div>
                </div>
              </div>

              {/* Media Preview */}
              <div className="rounded-2xl overflow-hidden border border-white/15 bg-black/60 flex items-center justify-center max-h-56">
                {uploadResult.type === 'video' ? (
                  <video src={uploadResult.url} controls className="max-h-56 w-full object-contain" />
                ) : (
                  <img src={uploadResult.url} alt={uploadResult.title} className="max-h-56 w-full object-contain" />
                )}
              </div>

              {/* Generated URL Box with Copy Button */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium flex items-center justify-between">
                  <span>Direct Hosted Media URL</span>
                  {copied && (
                    <span className="text-[10px] text-emerald-400 font-semibold animate-fade-in">
                      ✓ Copied to clipboard!
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={uploadResult.url}
                    className="flex-1 p-3 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-[#E5D2A8] font-mono select-all"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(uploadResult.url)}
                    className="p-3 rounded-xl bg-[#C9A96E] hover:bg-[#b8955a] text-black font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    title="Copy URL"
                  >
                    <Copy className="w-4 h-4 text-black" />
                    <span>Copy</span>
                  </button>
                  <a
                    href={uploadResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs flex items-center transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Metadata Details */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Type:</span>
                  <span className="text-white font-mono font-semibold uppercase">{uploadResult.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Size:</span>
                  <span className="text-white font-mono">
                    {(uploadResult.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Format:</span>
                  <span className="text-white font-mono">{uploadResult.mimeType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Key:</span>
                  <span className="text-white font-mono truncate block" title={uploadResult.fileKey}>
                    {uploadResult.fileKey || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Upload Another</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#A37E3E] text-black font-semibold text-xs shadow-gold-glow hover:opacity-95 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
