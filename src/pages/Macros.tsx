import { useState, useEffect, memo } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Macro } from '../types';
import { MacroCard } from '../components/MacroCard';
import { Input } from '../components/ui/Input';
import { SearchableSelect } from '../components/ui/SearchableSelect';
import { Button } from '../components/ui/Button';
import { Filter, X, RotateCcw, SlidersHorizontal, Flame } from 'lucide-react';
import { FRUIT_OPTIONS, SWORD_OPTIONS, MELEE_OPTIONS, GUN_OPTIONS } from '../lib/gameData';

const FILTER_FRUIT_OPTIONS = [
  { value: 'all', label: 'All Fruits' },
  ...FRUIT_OPTIONS,
];

const FILTER_SWORD_OPTIONS = [
  { value: 'all', label: 'All Swords' },
  ...SWORD_OPTIONS,
];

const FILTER_MELEE_OPTIONS = [
  { value: 'all', label: 'All Melees' },
  ...MELEE_OPTIONS,
];

const FILTER_GUN_OPTIONS = [
  { value: 'all', label: 'All Guns' },
  ...GUN_OPTIONS,
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'one shot', label: 'One Shot' },
  { value: 'infinite combo', label: 'Infinite Combo' },
];

const FilterContent = memo(({
  search, setSearch,
  fruitFilter, setFruitFilter,
  swordFilter, setSwordFilter,
  meleeFilter, setMeleeFilter,
  gunFilter, setGunFilter,
  typeFilter, setTypeFilter,
  activeFilterCount,
  resetFilters,
  setMobileFilterOpen
}: any) => (
  <div className="flex flex-col gap-5 bg-cb-surface/80 border border-cb-border rounded-2xl p-5 shadow-lg">
    <div className="flex items-center justify-between border-b border-cb-border/80 pb-3">
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={18} className="text-cb-yellow" />
        <h3 className="text-base font-bold text-white font-display">Filter Combos</h3>
      </div>
      {activeFilterCount > 0 && (
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cb-red text-white">
          {activeFilterCount} Active
        </span>
      )}
    </div>

    <Input 
      placeholder="Search combo by title..." 
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
    
    <div className="flex flex-col gap-3.5">
      <SearchableSelect label="Macro Type" options={TYPE_OPTIONS} value={typeFilter} onChange={setTypeFilter} />
      <SearchableSelect label="Fruit" options={FILTER_FRUIT_OPTIONS} value={fruitFilter} onChange={setFruitFilter} />
      <SearchableSelect label="Sword" options={FILTER_SWORD_OPTIONS} value={swordFilter} onChange={setSwordFilter} />
      <SearchableSelect label="Melee" options={FILTER_MELEE_OPTIONS} value={meleeFilter} onChange={setMeleeFilter} />
      <SearchableSelect label="Gun" options={FILTER_GUN_OPTIONS} value={gunFilter} onChange={setGunFilter} />
    </div>

    <div className="pt-3 border-t border-cb-border/80 flex flex-col gap-2">
      <Button variant="primary" fullWidth onClick={() => setMobileFilterOpen(false)} className="md:hidden">
        Apply Filters
      </Button>
      {activeFilterCount > 0 && (
        <Button variant="ghost" fullWidth onClick={resetFilters} className="text-cb-red hover:text-cb-red-hover hover:bg-cb-red/10 gap-1.5">
          <RotateCcw size={14} />
          <span>Reset All Filters</span>
        </Button>
      )}
    </div>
  </div>
));

export function Macros() {
  const [macros, setMacros] = useState<Macro[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  
  // Filters
  const [fruitFilter, setFruitFilter] = useState('all');
  const [swordFilter, setSwordFilter] = useState('all');
  const [meleeFilter, setMeleeFilter] = useState('all');
  const [gunFilter, setGunFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'macros'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const macroData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Macro[];
      setMacros(macroData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredMacros = macros.filter(macro => {
    if (search && !macro.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (fruitFilter !== 'all' && macro.fruit?.toLowerCase() !== fruitFilter) return false;
    if (swordFilter !== 'all' && macro.sword?.toLowerCase() !== swordFilter) return false;
    if (meleeFilter !== 'all' && macro.melee?.toLowerCase() !== meleeFilter) return false;
    if (gunFilter !== 'all' && macro.gun?.toLowerCase() !== gunFilter) return false;
    if (typeFilter !== 'all') {
      const macroType = macro.macro_type.toLowerCase();
      if (typeFilter === 'infinite combo') {
        if (!macroType.includes('infinite')) return false;
      } else if (typeFilter === 'one shot') {
        if (!macroType.includes('one shot')) return false;
      } else if (macroType !== typeFilter) {
        return false;
      }
    }
    return true;
  });

  const resetFilters = () => {
    setSearch('');
    setFruitFilter('all');
    setSwordFilter('all');
    setMeleeFilter('all');
    setGunFilter('all');
    setTypeFilter('all');
  };

  const activeFilterCount = [fruitFilter, swordFilter, meleeFilter, gunFilter, typeFilter].filter(f => f !== 'all').length + (search ? 1 : 0);



  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col md:flex-row gap-8">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 shrink-0">
        <div className="sticky top-[96px]">
          <FilterContent 
            search={search} setSearch={setSearch}
            fruitFilter={fruitFilter} setFruitFilter={setFruitFilter}
            swordFilter={swordFilter} setSwordFilter={setSwordFilter}
            meleeFilter={meleeFilter} setMeleeFilter={setMeleeFilter}
            gunFilter={gunFilter} setGunFilter={setGunFilter}
            typeFilter={typeFilter} setTypeFilter={setTypeFilter}
            activeFilterCount={activeFilterCount}
            resetFilters={resetFilters}
            setMobileFilterOpen={setMobileFilterOpen}
          />
        </div>
      </aside>

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
          <div className="relative mt-auto w-full bg-cb-surface rounded-t-2xl p-6 border-t border-cb-border max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => setMobileFilterOpen(false)}
              className="absolute top-4 right-4 text-cb-text-muted hover:text-white"
            >
              <X size={24} />
            </button>
            <FilterContent 
              search={search} setSearch={setSearch}
              fruitFilter={fruitFilter} setFruitFilter={setFruitFilter}
              swordFilter={swordFilter} setSwordFilter={setSwordFilter}
              meleeFilter={meleeFilter} setMeleeFilter={setMeleeFilter}
              gunFilter={gunFilter} setGunFilter={setGunFilter}
              typeFilter={typeFilter} setTypeFilter={setTypeFilter}
              activeFilterCount={activeFilterCount}
              resetFilters={resetFilters}
              setMobileFilterOpen={setMobileFilterOpen}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-cb-border/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-black text-white break-words">Community Macros</h1>
            </div>
            <p className="text-xs sm:text-sm text-cb-text-muted">
              Showing {filteredMacros.length} verified builds across all loadouts
            </p>
          </div>
          
          <Button 
            variant="outline" 
            className="md:hidden flex items-center gap-2 border-cb-yellow/40 text-cb-yellow" 
            onClick={() => setMobileFilterOpen(true)}
          >
            <Filter size={16} />
            <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-cb-surface/60 border border-cb-border rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredMacros.length === 0 ? (
          <div className="text-center py-20 bg-cb-surface/60 border border-cb-border rounded-2xl p-8">
            <div className="w-16 h-16 rounded-full bg-cb-bg border border-cb-border mx-auto flex items-center justify-center mb-4">
              <SlidersHorizontal size={24} className="text-cb-text-muted" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-display">No Macros Found</h3>
            <p className="text-cb-text-muted mb-6 text-sm max-w-sm mx-auto">
              No builds match the currently applied criteria. Try changing or clearing your filters.
            </p>
            <Button variant="primary" onClick={resetFilters} className="inline-flex items-center gap-2">
              <RotateCcw size={16} />
              <span>Reset Filters</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMacros.map(macro => (
              <MacroCard key={macro.id} macro={macro} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
