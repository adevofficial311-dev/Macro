import { useState } from 'react';
import { useNavigate } from 'react-router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { SearchableSelect } from '../components/ui/SearchableSelect';
import { VideoShowcaseInput } from '../components/ui/VideoShowcaseInput';
import { AlertCircle, CheckCircle2, ArrowRight, Code, Shield, Film, Play } from 'lucide-react';
import { FRUIT_OPTIONS, SWORD_OPTIONS, MELEE_OPTIONS, GUN_OPTIONS, MACRO_TYPE_OPTIONS } from '../lib/gameData';
import { isYouTubeUrl, getYouTubeEmbedUrl } from '../lib/videoStorage';

export function PublishMacro() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'edit' | 'review'>('edit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    creator_name: '',
    title: '',
    fruit: '',
    sword: '',
    melee: '',
    gun: '',
    macro_type: '',
    bounty_boost: '',
    video_url: '',
    macro_json: '',
    notes: ''
  });

  const handleReviewStep = () => {
    if (!formData.title || !formData.macro_json || !formData.macro_type || !formData.creator_name) {
      setError('Please fill in all required fields: Creator Name, Macro Title, Type, and JSON Code.');
      return;
    }
    
    try {
      JSON.parse(formData.macro_json);
      setError('');
      setStep('review');
    } catch (e) {
      setError('Invalid Macro JSON format. Please ensure valid JSON syntax.');
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    setError('');
    try {
      const docRef = await addDoc(collection(db, 'macros'), {
        ...formData,
        comment_count: 0,
        view_count: 0,
        created_at: Date.now(),
        updated_at: Date.now(),
      });
      navigate(`/macro/${docRef.id}`);
    } catch (err: any) {
      setError('Failed to publish macro to database. Please check your connection.');
      setLoading(false);
    }
  };

  if (step === 'review') {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cb-yellow animate-pulse" />
          <h1 className="text-3xl font-display font-black text-white">Review & Confirm</h1>
        </div>
        <p className="text-cb-text-muted mb-8 text-sm">Verify all loadout details before publishing to the CokeBoys community.</p>
        
        {error && (
          <div className="bg-cb-red/10 border border-cb-red text-cb-red px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm font-medium">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-cb-surface border border-cb-border rounded-2xl p-6 mb-8 flex flex-col gap-6 shadow-xl">
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-cb-border">
            <div>
              <p className="text-xs text-cb-text-muted uppercase tracking-wider font-semibold mb-1">Creator</p>
              <p className="text-cb-yellow font-mono font-bold">@{formData.creator_name}</p>
            </div>
            <div>
              <p className="text-xs text-cb-text-muted uppercase tracking-wider font-semibold mb-1">Title</p>
              <p className="text-white font-bold">{formData.title}</p>
            </div>
            <div>
              <p className="text-xs text-cb-text-muted uppercase tracking-wider font-semibold mb-1">Macro Type</p>
              <p className="text-cb-red font-bold uppercase">{formData.macro_type}</p>
            </div>
            <div>
              <p className="text-xs text-cb-text-muted uppercase tracking-wider font-semibold mb-1">Bounty Boost</p>
              <p className="text-cb-yellow font-bold">{formData.bounty_boost || 'None'}</p>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-cb-text-muted uppercase tracking-wider font-semibold mb-2">Loadout Details</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Fruit', val: formData.fruit },
                { label: 'Sword', val: formData.sword },
                { label: 'Melee', val: formData.melee },
                { label: 'Gun', val: formData.gun },
              ].filter(item => Boolean(item.val)).map((item, i) => (
                <span key={i} className="px-3 py-1 bg-cb-bg rounded-md text-xs font-medium text-white border border-cb-border flex items-center gap-1.5 capitalize">
                  <span className="text-cb-text-muted text-[10px]">{item.label}:</span>
                  <span className="font-bold text-cb-yellow">{item.val}</span>
                </span>
              ))}
            </div>
          </div>

          {formData.video_url && (
            <div>
              <p className="text-xs text-cb-text-muted uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                <Film size={13} className="text-cb-yellow" />
                <span>Video Showcase Preview</span>
              </p>
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-cb-border bg-black max-w-lg">
                {isYouTubeUrl(formData.video_url) && getYouTubeEmbedUrl(formData.video_url) ? (
                  <iframe 
                    src={getYouTubeEmbedUrl(formData.video_url)!} 
                    className="w-full h-full"
                    allowFullScreen
                    title="Video Showcase"
                  />
                ) : (
                  <video 
                    src={formData.video_url} 
                    controls 
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-cb-text-muted uppercase tracking-wider font-semibold mb-2">JSON Configuration</p>
            <pre className="bg-cb-bg p-4 rounded-xl border border-cb-border text-xs text-cb-yellow font-mono overflow-x-auto max-h-60 custom-scrollbar">
              {formData.macro_json}
            </pre>
          </div>
          {formData.notes && (
            <div>
              <p className="text-xs text-cb-text-muted uppercase tracking-wider font-semibold mb-2">Creator Notes</p>
              <p className="bg-cb-bg p-4 rounded-xl border border-cb-border text-sm text-white font-medium">
                {formData.notes}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setStep('edit')} disabled={loading} fullWidth className="font-bold">
            Back to Edit
          </Button>
          <Button variant="primary" onClick={handlePublish} disabled={loading} fullWidth className="font-bold shadow-lg shadow-cb-yellow/20">
            {loading ? 'Publishing...' : 'Confirm & Publish Macro'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-2 mb-2">
        <h1 className="text-2xl sm:text-3xl font-display font-black text-white break-words">Publish a Macro</h1>
      </div>
      <p className="text-cb-text-muted mb-8 text-sm">
        Share your custom setup and combo timings with verified CokeBoys players.
      </p>

      {error && (
        <div className="bg-cb-red/10 border border-cb-red text-cb-red px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm font-medium">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-8">
        
        {/* SECTION: CREATOR & TITLE */}
        <section className="bg-cb-surface/80 border border-cb-border rounded-2xl p-6 shadow-md">
          <h2 className="text-base font-display font-bold text-white mb-4 flex items-center gap-2 border-b border-cb-border pb-3">
            <span className="w-6 h-6 rounded-full bg-cb-red/20 text-cb-red flex items-center justify-center text-xs font-mono font-bold">1</span>
            <span>Creator & Build Identity</span>
          </h2>
          <div className="grid gap-4">
            <Input 
              label="Creator / Player Name *"
              placeholder="e.g. ViperX"
              value={formData.creator_name}
              onChange={e => setFormData({...formData, creator_name: e.target.value})}
            />
            <Input 
              label="Macro Title *"
              placeholder="e.g. Dragon + Godhuman One Shot 100-0"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
        </section>

        {/* SECTION: LOADOUT */}
        <section className="bg-cb-surface/80 border border-cb-border rounded-2xl p-6 shadow-md">
          <h2 className="text-base font-display font-bold text-white mb-4 flex items-center gap-2 border-b border-cb-border pb-3">
            <span className="w-6 h-6 rounded-full bg-cb-yellow/20 text-cb-yellow flex items-center justify-center text-xs font-mono font-bold">2</span>
            <span>Equipped Loadout</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect 
              label="Fruit" 
              options={FRUIT_OPTIONS} 
              value={formData.fruit} 
              onChange={val => setFormData({...formData, fruit: val})} 
            />
            <SearchableSelect 
              label="Sword" 
              options={SWORD_OPTIONS} 
              value={formData.sword} 
              onChange={val => setFormData({...formData, sword: val})} 
            />
            <SearchableSelect 
              label="Melee" 
              options={MELEE_OPTIONS} 
              value={formData.melee} 
              onChange={val => setFormData({...formData, melee: val})} 
            />
            <SearchableSelect 
              label="Gun" 
              options={GUN_OPTIONS} 
              value={formData.gun} 
              onChange={val => setFormData({...formData, gun: val})} 
            />
          </div>
        </section>

        {/* SECTION: MACRO TYPE & METADATA */}
        <section className="bg-cb-surface/80 border border-cb-border rounded-2xl p-6 shadow-md">
          <h2 className="text-base font-display font-bold text-white mb-4 flex items-center gap-2 border-b border-cb-border pb-3">
            <span className="w-6 h-6 rounded-full bg-cb-red/20 text-cb-red flex items-center justify-center text-xs font-mono font-bold">3</span>
            <span>Timing & Media</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect 
              label="Macro Category *" 
              options={MACRO_TYPE_OPTIONS} 
              value={formData.macro_type} 
              onChange={val => setFormData({...formData, macro_type: val})} 
            />
            <Input 
              label="Bounty Boost Tier"
              placeholder="e.g. 500K+ / 1M+"
              value={formData.bounty_boost}
              onChange={e => setFormData({...formData, bounty_boost: e.target.value})}
            />
          </div>
          <div className="mt-5 pt-4 border-t border-cb-border/60">
            <VideoShowcaseInput 
              value={formData.video_url}
              onChange={val => setFormData({...formData, video_url: val})}
            />
          </div>
        </section>

        {/* SECTION: JSON CODE */}
        <section className="bg-cb-surface/80 border border-cb-border rounded-2xl p-6 shadow-md">
          <h2 className="text-base font-display font-bold text-white mb-4 flex items-center gap-2 border-b border-cb-border pb-3">
            <span className="w-6 h-6 rounded-full bg-cb-yellow/20 text-cb-yellow flex items-center justify-center text-xs font-mono font-bold">4</span>
            <span>JSON Macro Code *</span>
          </h2>
          <div className="flex flex-col gap-1.5 w-full">
            <textarea
              className="w-full h-56 p-4 bg-cb-bg border border-cb-border rounded-xl text-xs text-cb-yellow font-mono focus:outline-none focus:border-cb-yellow focus:ring-1 focus:ring-cb-yellow/20 transition-all custom-scrollbar"
              placeholder='{\n  "name": "Combo1",\n  "actions": [\n    { "key": "Z", "delay": 200 },\n    { "key": "X", "delay": 150 }\n  ]\n}'
              value={formData.macro_json}
              onChange={e => setFormData({...formData, macro_json: e.target.value})}
            />
          </div>
        </section>

        {/* SECTION: NOTES */}
        <section className="bg-cb-surface/80 border border-cb-border rounded-2xl p-6 shadow-md">
          <h2 className="text-base font-display font-bold text-white mb-4 flex items-center gap-2 border-b border-cb-border pb-3">
            <span className="w-6 h-6 rounded-full bg-cb-yellow/20 text-cb-yellow flex items-center justify-center text-xs font-mono font-bold">5</span>
            <span>Important Notes (Optional)</span>
          </h2>
          <div className="flex flex-col gap-1.5 w-full">
            <textarea
              className="w-full h-32 p-4 bg-cb-bg border border-cb-border rounded-xl text-sm text-white placeholder-cb-text-muted focus:outline-none focus:border-cb-yellow focus:ring-1 focus:ring-cb-yellow/20 transition-all custom-scrollbar"
              placeholder="e.g. Ensure you have high ping for this combo, wait for the fruit animation to finish..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>
        </section>

        <Button 
          variant="primary" 
          onClick={handleReviewStep} 
          className="h-14 text-base font-bold shadow-lg shadow-cb-yellow/20 gap-2"
        >
          <span>Continue to Review</span>
          <ArrowRight size={18} />
        </Button>

      </div>
    </div>
  );
}
