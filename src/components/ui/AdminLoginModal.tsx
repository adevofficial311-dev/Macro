import React, { useState } from 'react';
import { X, ShieldCheck, Lock, AlertCircle, LogOut } from 'lucide-react';
import { useAuthProfile } from '../../context/AuthProfileContext';
import { motion } from 'motion/react';

export function AdminLoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { isAdmin, loginAdmin, logoutAdmin } = useAuthProfile();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(password)) {
      setError('');
      onClose();
    } else {
      setError('Invalid Password');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm bg-cb-surface border border-cb-border rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Admin Login</h2>
          <button onClick={onClose} className="text-cb-text-muted hover:text-white"><X size={20} /></button>
        </div>
        {isAdmin ? (
          <button onClick={logoutAdmin} className="w-full bg-red-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2">
            <LogOut size={16} /> Logout Admin
          </button>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Username (CokeBoi)" disabled className="w-full bg-cb-bg border border-cb-border rounded-lg p-2 text-white" value="CokeBoi" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full bg-cb-bg border border-cb-border rounded-lg p-2 text-white" />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full bg-cb-yellow text-black font-bold py-2 rounded-lg flex items-center justify-center gap-2">
              <ShieldCheck size={16} /> Login
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
