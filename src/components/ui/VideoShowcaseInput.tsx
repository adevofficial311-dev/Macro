import React, { useState, useRef } from 'react';
import { Link2, UploadCloud, Video, Trash2, CheckCircle2, Play, Film, AlertCircle } from 'lucide-react';
import { isYouTubeUrl, getYouTubeEmbedUrl, saveLocalVideo } from '../../lib/videoStorage';

interface VideoShowcaseInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const VideoShowcaseInput: React.FC<VideoShowcaseInputProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'upload'>('link');
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setLocalPreviewUrl('');
    setFileName('');
    setFileSize('');
    setError('');
  };

  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file (MP4, WebM, MOV, MKV, etc.).');
      return;
    }

    setError('');
    setUploading(true);
    setFileName(file.name);
    
    // Format file size
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setFileSize(`${sizeInMB} MB`);

    try {
      const vidId = `local_vid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      await saveLocalVideo(vidId, file);
      
      const objectUrl = URL.createObjectURL(file);
      setLocalPreviewUrl(objectUrl);

      // If file is small (< 800KB), create dataUrl fallback so it travels with cloud doc too
      if (file.size < 800 * 1024) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            onChange(reader.result);
          } else {
            onChange(vidId);
          }
        };
        reader.readAsDataURL(file);
      } else {
        onChange(vidId);
      }
    } catch (err) {
      console.error('File process error:', err);
      setError('Failed to process video file. You can also provide a web link.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    onChange('');
    setFileName('');
    setFileSize('');
    setLocalPreviewUrl('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isYT = isYouTubeUrl(value);
  const ytEmbed = isYT ? getYouTubeEmbedUrl(value) : null;
  const hasVideo = Boolean(value || localPreviewUrl);

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {/* Label and Option Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Film size={14} className="text-cb-yellow" />
          <span>Video Showcase <span className="text-cb-text-muted font-normal normal-case">(Link or Upload from Files)</span></span>
        </label>

        {/* Tab Pills */}
        <div className="flex bg-cb-bg border border-cb-border rounded-lg p-0.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
              activeTab === 'link'
                ? 'bg-cb-yellow text-black shadow-sm'
                : 'text-cb-text-muted hover:text-white'
            }`}
          >
            <Link2 size={13} />
            <span>Web Link</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
              activeTab === 'upload'
                ? 'bg-cb-yellow text-black shadow-sm'
                : 'text-cb-text-muted hover:text-white'
            }`}
          >
            <UploadCloud size={13} />
            <span>Upload From Files</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Web Link Input */}
      {activeTab === 'link' && (
        <div className="flex flex-col gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Paste YouTube Guide, Streamable, or direct MP4/WebM URL..."
              value={value.startsWith('local_vid_') || value.startsWith('data:video/') ? '' : value}
              onChange={handleLinkChange}
              className="w-full bg-cb-bg border border-cb-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-cb-text-muted focus:outline-none focus:border-cb-yellow focus:ring-1 focus:ring-cb-yellow/20 transition-all"
            />
            {value && !value.startsWith('local_vid_') && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cb-text-muted hover:text-cb-red transition-colors p-1"
                title="Clear URL"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
          <p className="text-[11px] text-cb-text-muted">
            Supports YouTube videos & shorts, Streamable, Discord video links, and direct .mp4/.webm links.
          </p>
        </div>
      )}

      {/* Mode 2: Upload From Files */}
      {activeTab === 'upload' && (
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!hasVideo || (!value.startsWith('local_vid_') && !value.startsWith('data:video/') && !localPreviewUrl) ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-cb-yellow bg-cb-yellow/10'
                  : 'border-cb-border hover:border-cb-yellow/60 bg-cb-bg/60 hover:bg-cb-bg'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-cb-surface border border-cb-border flex items-center justify-center mb-3 text-cb-yellow">
                <UploadCloud size={24} />
              </div>
              <p className="text-sm font-bold text-white mb-1">
                {uploading ? 'Processing Video...' : 'Click to Upload or Drag & Drop Video File'}
              </p>
              <p className="text-xs text-cb-text-muted">
                Supports MP4, WebM, MOV, and MKV combo showcase clips
              </p>
            </div>
          ) : (
            <div className="bg-cb-bg border border-cb-border rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-9 h-9 rounded-lg bg-cb-yellow/15 text-cb-yellow border border-cb-yellow/30 flex items-center justify-center shrink-0">
                  <Video size={18} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{fileName || 'Uploaded Video Showcase'}</p>
                  <p className="text-[10px] text-cb-text-muted flex items-center gap-1 font-mono">
                    <CheckCircle2 size={10} className="text-green-400" />
                    <span>{fileSize || 'Local File Ready'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 text-xs font-medium text-cb-yellow hover:text-white bg-cb-surface border border-cb-border hover:border-cb-yellow rounded-lg transition-all"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 text-cb-text-muted hover:text-cb-red hover:bg-cb-red/10 rounded-lg transition-all"
                  title="Remove video"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="text-xs text-cb-red flex items-center gap-1.5 mt-1">
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}

      {/* Instant Video Showcase Preview */}
      {hasVideo && (
        <div className="mt-2 bg-cb-bg rounded-xl border border-cb-border p-3">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold text-cb-yellow uppercase tracking-wider flex items-center gap-1.5">
              <Play size={12} className="fill-current" />
              <span>Showcase Preview</span>
            </span>
            <span className="text-[10px] text-cb-text-muted">Live Preview</span>
          </div>

          <div className="w-full aspect-video rounded-lg overflow-hidden border border-cb-border/80 bg-black flex items-center justify-center">
            {isYT && ytEmbed ? (
              <iframe
                src={ytEmbed}
                className="w-full h-full"
                title="Video Showcase Preview"
                allowFullScreen
              />
            ) : localPreviewUrl || value ? (
              <video
                src={localPreviewUrl || value}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-xs text-cb-text-muted flex items-center gap-2">
                <Video size={16} />
                <span>No playable video stream</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
