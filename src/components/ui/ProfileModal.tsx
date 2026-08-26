import React, { useState } from 'react';
import { X, User, Check, Save } from 'lucide-react';
import { useAuthProfile } from '../../context/AuthProfileContext';
import { motion, AnimatePresence } from 'motion/react';

export function ProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { profile, updateProfile } = useAuthProfile();
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState(profile.avatar);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ username, bio, avatar });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm bg-cb-surface border border-cb-border rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Edit Profile</h2>
          <button onClick={onClose} className="text-cb-text-muted hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full bg-cb-bg border border-cb-border rounded-lg p-2 text-white" />
          <input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="Avatar URL" className="w-full bg-cb-bg border border-cb-border rounded-lg p-2 text-white" />
          <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio" className="w-full bg-cb-bg border border-cb-border rounded-lg p-2 text-white" />
          <button type="submit" className="w-full bg-cb-yellow text-black font-bold py-2 rounded-lg flex items-center justify-center gap-2">
            <Save size={16} /> Save
          </button>
        </form>
      </motion.div>
    </div>
  );
}
