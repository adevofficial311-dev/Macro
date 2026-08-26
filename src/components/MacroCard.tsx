import { FC } from 'react';
import { Link } from 'react-router';
import { Play, MessageSquare, Flame, ArrowUpRight, Trash2 } from 'lucide-react';
import { Macro } from '../types';
import { useAuthProfile } from '../context/AuthProfileContext';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface MacroCardProps {
  macro: Macro;
}

export const MacroCard: FC<MacroCardProps> = ({ macro }) => {
  const { isAdmin } = useAuthProfile();

  const getTypeBadgeClass = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('one shot')) {
      return 'bg-cb-red/15 text-cb-red border-cb-red/40';
    }
    if (t.includes('infinite')) {
      return 'bg-cb-yellow/15 text-cb-yellow border-cb-yellow/40';
    }
    return 'bg-cb-surface text-white border-cb-border';
  };

  const handleDelete = async () => {
    console.log('Attempting to delete macro:', macro.id);
    // Remove confirm to test mobile compatibility
    try {
        console.log('Proceeding to delete:', macro.id);
        const docRef = doc(db, 'macros', macro.id);
        await deleteDoc(docRef);
        console.log('Macro deleted successfully from Firestore.');
        alert('Deleted successfully');
    } catch (error) {
        console.error('Error deleting macro from Firestore:', error);
        alert('Error: ' + error);
    }
  };

  return (
    <div className="bg-cb-surface/80 backdrop-blur-sm border border-cb-border rounded-2xl overflow-hidden flex flex-col hover:border-cb-yellow/50 transition-all duration-300 group shadow-lg hover:shadow-cb-yellow/5">
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3 gap-2">
          <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getTypeBadgeClass(macro.macro_type)}`}>
            {macro.macro_type}
          </span>
          {isAdmin && (
            <button onClick={handleDelete} className="text-red-500 hover:text-red-400 p-1">
              <Trash2 size={16} />
            </button>
          )}
          {macro.video_url && !isAdmin && (
            <div className="text-cb-yellow bg-cb-yellow/10 border border-cb-yellow/20 p-1.5 rounded-md flex items-center gap-1">
              <Play size={12} className="fill-current" />
              <span className="text-[10px] font-bold tracking-wide uppercase">Video</span>
            </div>
          )}
        </div>
        
        <h3 className="text-lg font-bold text-white mb-1.5 line-clamp-2 group-hover:text-cb-yellow transition-colors font-display">
          {macro.title}
        </h3>
        
        <Link 
          to={`/creator/${macro.creator_name}`} 
          className="text-xs text-cb-text-muted hover:text-cb-yellow transition-colors mb-4 inline-block font-mono"
        >
          @{macro.creator_name}
        </Link>
        
        <div className="mt-auto pt-3 border-t border-cb-border/60">
          <div className="text-[10px] font-bold text-cb-text-muted uppercase tracking-wider mb-2">Build Loadout</div>
          <div className="flex flex-wrap gap-1.5">
            {[macro.fruit, macro.sword, macro.melee, macro.gun].filter(Boolean).map((item, i) => (
              <span key={i} className="px-2 py-0.5 bg-cb-bg/90 rounded text-xs font-medium text-white border border-cb-border/80 capitalize">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="px-5 py-3.5 bg-cb-bg/40 border-t border-cb-border flex items-center justify-between">
        <div className="flex gap-4 items-center">
          {macro.bounty_boost ? (
            <div className="flex items-center gap-1.5">
              <Flame size={14} className="text-cb-yellow" />
              <span className="text-xs font-bold text-cb-yellow">{macro.bounty_boost}</span>
            </div>
          ) : null}
          <div className="flex items-center gap-1.5 text-cb-text-muted text-xs">
            <MessageSquare size={14} />
            <span className="font-medium">{macro.comment_count || 0}</span>
          </div>
        </div>
        
        <Link 
          to={`/macro/${macro.id}`}
          className="text-xs font-bold text-white hover:text-black hover:bg-cb-yellow transition-all bg-cb-surface border border-cb-border hover:border-cb-yellow px-3.5 py-1.5 rounded-lg inline-flex items-center gap-1"
        >
          <span>View</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
};
