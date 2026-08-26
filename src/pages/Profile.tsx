import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Macro } from '../types';
import { MacroCard } from '../components/MacroCard';
import { ChevronLeft, User, Code, Shield } from 'lucide-react';

export function Profile() {
  const { name } = useParams();
  const [macros, setMacros] = useState<Macro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!name) return;
    
    const fetchMacros = async () => {
      const q = query(
        collection(db, 'macros'),
        where('creator_name', '==', name)
      );
      try {
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Macro));
        data.sort((a, b) => b.created_at - a.created_at);
        setMacros(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMacros();
  }, [name]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-8 h-8 border-2 border-cb-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-cb-text-muted">Loading creator profile...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/macros" className="inline-flex items-center text-sm font-medium text-cb-text-muted hover:text-cb-yellow transition-colors mb-8 gap-1">
        <ChevronLeft size={18} />
        <span>Back to Macros</span>
      </Link>

      <div className="flex flex-col items-center text-center mb-14 bg-cb-surface/80 border border-cb-border rounded-2xl p-8 shadow-xl max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-cb-bg border-2 border-cb-yellow rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(255,193,7,0.2)]">
          <span className="text-3xl font-display font-black text-cb-yellow uppercase">
            {name?.charAt(0)}
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-black text-white mb-2 break-all">@{name}</h1>
        <div className="flex items-center gap-3 text-xs text-cb-text-muted">
          <span className="px-2.5 py-0.5 rounded bg-cb-red/20 text-cb-red border border-cb-red/30 font-bold uppercase">
            Verified Creator
          </span>
          <span>•</span>
          <span className="font-bold text-white">{macros.length} Macros Published</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-cb-border">
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Code size={18} className="text-cb-yellow" />
            <span>Published Macros by @{name}</span>
          </h2>
          <span className="text-xs text-cb-text-muted">{macros.length} Total</span>
        </div>

        {macros.length === 0 ? (
          <div className="text-center py-16 bg-cb-surface/40 border border-cb-border rounded-2xl p-6">
            <p className="text-cb-text-muted text-sm">This creator hasn't published any macros yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {macros.map(macro => (
              <MacroCard key={macro.id} macro={macro} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
