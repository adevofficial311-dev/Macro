import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { doc, getDoc, updateDoc, increment, collection, addDoc, query, where, orderBy, onSnapshot, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Macro, Comment } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthProfile } from '../context/AuthProfileContext';
import { ProfileModal } from '../components/ui/ProfileModal';
import { isYouTubeUrl, getYouTubeEmbedUrl, getLocalVideo } from '../lib/videoStorage';
import { Copy, Check, ChevronLeft, Flame, Eye, MessageSquare, Play, Send, ShieldCheck, Heart } from 'lucide-react';

export function ViewMacro() {
  const { id } = useParams();
  const { profile, isAdmin } = useAuthProfile();
  const [macro, setMacro] = useState<Macro | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string | null>(null);
  
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editMacro, setEditMacro] = useState<Macro | null>(null);

  useEffect(() => {
    return () => {
      if (resolvedVideoUrl) {
        URL.revokeObjectURL(resolvedVideoUrl);
      }
    };
  }, [resolvedVideoUrl]);

  useEffect(() => {
    if (!id) return;
    
    // Fetch Macro
    const fetchMacro = async () => {
      try {
        const docRef = doc(db, 'macros', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Macro;
          const userId = profile.userId;
          
          // Ensure arrays exist
          if (!data.views) data.views = [];
          if (!data.likes) data.likes = [];
          
          // Track unique views
          if (!data.views.includes(userId)) {
              if (userId) {
                await updateDoc(docRef, {
                  views: arrayUnion(userId),
                  view_count: increment(1)
                });
                data.views = [...data.views, userId];
                data.view_count += 1;
              }
          }
          setMacro(data);
          
          // Resolve video URL if needed (e.g. from IndexedDB)
          if (data.video_url) {
            if (data.video_url.startsWith('local_vid_')) {
              getLocalVideo(data.video_url).then(blob => {
                if (blob) {
                  setResolvedVideoUrl(URL.createObjectURL(blob));
                }
              });
            } else {
              setResolvedVideoUrl(data.video_url);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMacro();

    // Listen Comments
    const q = query(collection(db, 'comments'), where('macro_id', '==', id), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Comment)));
    });
    
    return () => unsubscribe();
  }, [id]);

  const handleCopy = () => {
    if (!macro) return;
    navigator.clipboard.writeText(macro.macro_json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;
    if (profile.username === 'Gamer') {
      setProfileOpen(true);
      return;
    }

    setSubmittingComment(true);
    try {
      await addDoc(collection(db, 'comments'), {
        macro_id: id,
        creator_name: profile.username,
        creator_avatar: profile.avatar,
        content: newComment.trim(),
        created_at: Date.now()
      });
      
      await updateDoc(doc(db, 'macros', id), { comment_count: increment(1) });
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLike = async () => {
      if (!macro || !id) return;
      const docRef = doc(db, 'macros', id);
      const userId = profile.userId;
      if (!userId) return; // User must have a profile

      // Ensure likes array exists locally
      const currentLikes = macro.likes || [];
      const isLiked = currentLikes.includes(userId);
      
      if (isLiked) {
          await updateDoc(docRef, { likes: arrayRemove(userId) });
          setMacro(prev => prev ? {...prev, likes: currentLikes.filter(uid => uid !== userId)} : null);
      } else {
          await updateDoc(docRef, { likes: arrayUnion(userId) });
          setMacro(prev => prev ? {...prev, likes: [...currentLikes, userId]} : null);
      }
  };

  const handleUpdateMacro = async () => {
    if (!editMacro || !id) return;
    try {
      await updateDoc(doc(db, 'macros', id), {
        title: editMacro.title,
        notes: editMacro.notes,
        macro_json: editMacro.macro_json
      });
      setMacro(editMacro);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const getEmbedUrl = (url: string) => {
    try {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
      return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-8 h-8 border-2 border-cb-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-cb-text-muted">Loading verified macro...</p>
      </div>
    );
  }

  if (!macro) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-2 font-display">Macro Not Found</h2>
        <p className="text-cb-text-muted mb-6">The requested build could not be located or has been deleted.</p>
        <Link to="/macros" className="inline-flex items-center text-cb-yellow hover:underline font-bold">
          <ChevronLeft size={18} className="mr-1" />
          Back to Community Macros
        </Link>
      </div>
    );
  }

  const isYT = macro.video_url ? isYouTubeUrl(macro.video_url) : false;
  const embedUrl = isYT && macro.video_url ? getYouTubeEmbedUrl(macro.video_url) : null;
  const hasVideoShowcase = Boolean(embedUrl || resolvedVideoUrl);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      
      {/* Top breadcrumb */}
      <div className="flex items-center justify-between">
        <Link to="/macros" className="inline-flex items-center text-sm font-medium text-cb-text-muted hover:text-cb-yellow transition-colors gap-1">
          <ChevronLeft size={18} />
          <span>Back to Macros</span>
        </Link>

        <div className="flex items-center gap-4 text-xs text-cb-text-muted">
          <div className="flex items-center gap-1.5">
            <Eye size={14} />
            <span>{macro.view_count || 1} Views</span>
          </div>
          <button onClick={handleLike} className={`flex items-center gap-1.5 hover:text-cb-yellow transition-colors ${macro.likes?.includes(profile.userId) ? 'text-cb-yellow' : ''}`}>
            <Heart size={14} fill={macro.likes?.includes(profile.userId) ? "currentColor" : "none"} />
            <span>{macro.likes?.length || 0} Likes</span>
          </button>
          <div className="flex items-center gap-1.5">
            <MessageSquare size={14} />
            <span>{macro.comment_count || comments.length} Comments</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: DETAILS & VIDEO */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-cb-surface/80 border border-cb-border rounded-2xl p-6 shadow-xl">
            
          {/* Header info */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {isAdmin && !isEditing && (
                <Button variant="secondary" className="h-7 text-xs px-2" onClick={() => {
                  setEditMacro(macro);
                  setIsEditing(true);
                }}>Edit Macro</Button>
              )}
              {isEditing && (
                <div className="flex gap-2">
                    <Button variant="primary" className="h-7 text-xs px-2" onClick={handleUpdateMacro}>Save Changes</Button>
                    <Button variant="secondary" className="h-7 text-xs px-2" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              )}
              <span className={`text-xs px-2.5 py-0.5 rounded font-bold uppercase tracking-wider border ${
                macro.macro_type.toLowerCase().includes('one shot')
                  ? 'bg-cb-red/20 text-cb-red border-cb-red/30'
                  : 'bg-cb-yellow/20 text-cb-yellow border-cb-yellow/30'
              }`}>
                {macro.macro_type}
              </span>
              {macro.bounty_boost && (
                <span className="bg-cb-yellow/15 text-cb-yellow border border-cb-yellow/30 text-xs px-2.5 py-0.5 rounded font-bold flex items-center gap-1 font-mono">
                  <Flame size={12} />
                  Boost: {macro.bounty_boost}
                </span>
              )}
              <span className="text-xs text-cb-text-muted ml-auto">
                {new Date(macro.created_at).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl md:text-4xl font-display font-black text-white tracking-tight leading-tight mb-3 break-words">
              {isEditing ? (
                <Input value={editMacro?.title} onChange={(e) => setEditMacro(prev => prev ? {...prev, title: e.target.value} : null)} />
              ) : macro.title}
            </h1>

            <div className="flex items-center gap-2 text-sm mb-6">
              <span className="text-cb-text-muted">Created by</span>
              <Link to={`/creator/${macro.creator_name}`} className="text-cb-yellow hover:text-cb-yellow-hover font-bold font-mono">
                @{macro.creator_name}
              </Link>
            </div>

            {/* Loadout elements */}
            <div>
              <div className="text-xs font-bold text-cb-text-muted uppercase tracking-wider mb-2.5">
                Equipped Loadout
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Fruit', val: macro.fruit },
                  { label: 'Sword', val: macro.sword },
                  { label: 'Melee', val: macro.melee },
                  { label: 'Gun', val: macro.gun },
                ].filter(item => Boolean(item.val)).map((item, i) => (
                  <div key={i} className="px-3 py-1.5 bg-cb-bg rounded-lg text-xs font-medium text-white border border-cb-border/80 flex items-center gap-2">
                    <span className="text-cb-text-muted uppercase text-[10px]">{item.label}:</span>
                    <span className="capitalize font-bold text-cb-yellow">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {macro.notes && !isEditing && (
              <div className="mt-6">
                <div className="text-xs font-bold text-cb-text-muted uppercase tracking-wider mb-2.5">
                  Creator Notes
                </div>
                <div className="bg-cb-bg p-4 rounded-xl border border-cb-border text-sm text-white font-medium">
                  {macro.notes}
                </div>
              </div>
            )}
            {isEditing && (
              <div className="mt-6">
                <div className="text-xs font-bold text-cb-text-muted uppercase tracking-wider mb-2.5">
                  Creator Notes
                </div>
                <textarea
                  className="w-full p-3 bg-cb-bg border border-cb-border rounded-lg text-sm text-white"
                  value={editMacro?.notes}
                  onChange={(e) => setEditMacro(prev => prev ? {...prev, notes: e.target.value} : null)}
                />
              </div>
            )}
          </div>

          {/* Video Showcase */}
          {hasVideoShowcase && (
            <div className="bg-cb-surface/80 border border-cb-border rounded-2xl overflow-hidden shadow-xl p-4">
              <div className="flex items-center justify-between gap-2 mb-3 px-2">
                <div className="flex items-center gap-2">
                  <Play size={16} className="text-cb-yellow fill-current" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider font-display">Video Showcase & Timing Guide</h2>
                </div>
                {resolvedVideoUrl && !isYT && (
                  <span className="text-[10px] text-cb-yellow bg-cb-yellow/10 border border-cb-yellow/30 px-2 py-0.5 rounded font-mono font-bold">
                    Uploaded File Clip
                  </span>
                )}
              </div>
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-cb-border bg-black flex items-center justify-center">
                {embedUrl ? (
                  <iframe 
                    src={embedUrl} 
                    className="w-full h-full"
                    allowFullScreen
                    title="Video Showcase"
                  />
                ) : resolvedVideoUrl ? (
                  <video 
                    src={resolvedVideoUrl} 
                    controls 
                    preload="metadata"
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: JSON MACRO CODE */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-cb-surface/90 border border-cb-border rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
            <div className="flex items-center justify-between bg-cb-surface border-b border-cb-border px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cb-red/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-cb-yellow/80 inline-block" />
                <span className="text-xs font-bold text-white font-mono ml-1">macro_config.json</span>
              </div>

              <Button 
                variant={copied ? "primary" : "secondary"} 
                onClick={handleCopy} 
                className="h-8 px-3 text-xs font-bold gap-1.5"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-black" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy JSON</span>
                  </>
                )}
              </Button>
            </div>

            <div className="flex-1 bg-cb-bg p-4 overflow-auto custom-scrollbar">
              <pre className="text-xs text-cb-yellow font-mono leading-relaxed whitespace-pre-wrap">
                {isEditing ? (
                  <textarea 
                    className="w-full h-full bg-transparent text-cb-yellow border-none focus:ring-0 p-0"
                    value={editMacro?.macro_json}
                    onChange={(e) => setEditMacro(prev => prev ? {...prev, macro_json: e.target.value} : null)}
                  />
                ) : macro.macro_json}
              </pre>
            </div>

            <div className="p-3 bg-cb-surface border-t border-cb-border text-center text-[11px] text-cb-text-muted flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} className="text-cb-yellow" />
              <span>Compatible with standard macro clients and keybind managers</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM: COMMENTS SECTION */}
      <div className="w-full max-w-4xl border-t border-cb-border/80 pt-10 mt-4">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare size={20} className="text-cb-yellow" />
          <h3 className="text-xl font-display font-black text-white">Community Feedback ({comments.length})</h3>
        </div>
        
        {/* Comment Form */}
        {profile.username === 'Gamer' ? (
          <div className="bg-cb-surface/80 border border-cb-border rounded-2xl p-5 mb-8 shadow-lg text-center">
            <p className="text-cb-text-muted mb-4">Please create your profile to post comments.</p>
            <Button onClick={() => setProfileOpen(true)} variant="primary">Create Profile</Button>
          </div>
        ) : (
          <form onSubmit={handleAddComment} className="bg-cb-surface/80 border border-cb-border rounded-2xl p-5 mb-8 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
                <img src={profile.avatar} className="w-10 h-10 rounded-full" />
                <span className="font-bold text-white">@{profile.username}</span>
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share feedback, suggested delays, or keybind optimizations..."
              className="w-full h-24 p-3.5 bg-cb-bg border border-cb-border rounded-lg text-sm text-white placeholder-cb-text-muted focus:outline-none focus:border-cb-yellow focus:ring-1 focus:ring-cb-yellow/20 resize-none mb-3 custom-scrollbar"
            />
            <div className="flex justify-end">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={submittingComment || !newComment.trim()}
                className="gap-2 font-bold"
              >
                <Send size={14} />
                <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
              </Button>
            </div>
          </form>
        )}
        <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

        {/* Comment List */}
        <div className="flex flex-col gap-3">
          {comments.length === 0 ? (
            <div className="text-center py-10 bg-cb-surface/40 border border-cb-border rounded-xl text-cb-text-muted text-sm">
              No comments yet. Be the first to share your thoughts on this macro!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-cb-surface/70 border border-cb-border rounded-xl p-4 transition-colors hover:border-cb-border-hover">
                <div className="flex items-center gap-3 mb-2">
                  <img src={comment.creator_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} className="w-8 h-8 rounded-full" />
                  <span className="font-bold text-white text-sm font-mono text-cb-yellow">@{comment.creator_name}</span>
                  <span className="text-[11px] text-cb-text-muted ml-auto">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-cb-text leading-relaxed ml-11">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
