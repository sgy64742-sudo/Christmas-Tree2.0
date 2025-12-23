
import React, { useState, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './components/Experience';
import LoadingScreen from './components/LoadingScreen';
import { TreeMorphState, PhotoData } from './types';
import { Play, Pause, RefreshCw, Upload, Hand, Music } from 'lucide-react';
import { useHandGestures, Gesture } from './hooks/useHandGestures';

const INITIAL_PHOTOS: PhotoData[] = [
  { id: '1', url: 'https://picsum.photos/seed/arix1/600/600' },
  { id: '2', url: 'https://picsum.photos/seed/arix2/600/600' },
  { id: '3', url: 'https://picsum.photos/seed/arix3/600/600' },
  { id: '4', url: 'https://picsum.photos/seed/arix4/600/600' },
  { id: '5', url: 'https://picsum.photos/seed/arix5/600/600' },
];

const App: React.FC = () => {
  const [morphState, setMorphState] = useState<TreeMorphState>(TreeMorphState.SCATTERED);
  const [photos, setPhotos] = useState<PhotoData[]>(INITIAL_PHOTOS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [handData, setHandData] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { isActive: cameraActive } = useHandGestures((data) => {
    setHandData(data);
    
    setMorphState(current => {
      if (data.gesture === Gesture.FIST && current !== TreeMorphState.TREE_SHAPE) {
        return TreeMorphState.TREE_SHAPE;
      } 
      if (data.gesture === Gesture.OPEN && current !== TreeMorphState.SCATTERED) {
        return TreeMorphState.SCATTERED;
      }
      return current;
    });
  });

  const onExperienceStart = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log("Auto-play prevented", e));
    }
    
    setTimeout(() => {
      setMorphState(TreeMorphState.TREE_SHAPE);
    }, 1200);
  };

  const toggleMorph = () => {
    setMorphState(prev => prev === TreeMorphState.SCATTERED ? TreeMorphState.TREE_SHAPE : TreeMorphState.SCATTERED);
  };

  const handleAudioToggle = () => {
    if (audioRef.current) {
      if (isPlaying) { audioRef.current.pause(); } 
      else { audioRef.current.play(); }
      setIsPlaying(!isPlaying);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const url = URL.createObjectURL(e.target.files[0]);
      setTimeout(() => {
        setPhotos(prev => [...prev, { id: Date.now().toString(), url }]);
        setIsUploading(false);
      }, 800);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden">
      <LoadingScreen onStart={onExperienceStart} />

      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 6, 24], fov: 45 }}>
        <Suspense fallback={null}>
          <Experience morphState={morphState} photos={photos} handData={handData} />
        </Suspense>
      </Canvas>

      {cameraActive && (
        <div className="fixed top-8 right-8 flex flex-col items-end gap-2 z-50">
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full shadow-2xl">
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/60">
              {handData?.gesture === Gesture.NONE || !handData ? 'AI Camera Active' : `Gesture: ${handData.gesture}`}
            </span>
            <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full border border-white/20">
              {handData?.gesture === Gesture.FIST && <div className="text-xl animate-bounce">👊</div>}
              {handData?.gesture === Gesture.OPEN && <div className="text-xl animate-pulse">🖐</div>}
              {handData?.gesture === Gesture.POINT && <div className="text-xl animate-ping">👉</div>}
              {(!handData || handData.gesture === Gesture.NONE) && <Hand size={20} className="text-pink-400" />}
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-10 z-10">
        <div className="flex justify-between items-start pointer-events-auto">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-pink-500 via-yellow-200 to-pink-500 bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent italic tracking-tighter leading-none">Arix Signature</h1>
            <div className="flex items-center gap-3 mt-3">
              <Music size={12} className="text-pink-400 animate-pulse" />
              <p className="text-pink-200/40 tracking-[0.3em] text-[10px] font-bold uppercase">Now Playing: Christmas List</p>
            </div>
          </div>
          <button onClick={handleAudioToggle} className={`p-5 backdrop-blur-3xl rounded-full border border-white/10 shadow-2xl transition-all ${isPlaying ? 'bg-pink-500/20 text-pink-400 scale-110' : 'bg-white/5 text-white'}`}>
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end gap-10 pointer-events-auto w-full">
          <label className="cursor-pointer flex items-center gap-5 px-10 py-6 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all shadow-2xl">
            <Upload size={24} className="text-pink-400" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-base font-black tracking-widest uppercase mb-1">Add Memory</span>
              <span className="text-[10px] text-white/30 tracking-widest uppercase">Select Photo</span>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isUploading} />
          </label>

          <button onClick={toggleMorph} className="group px-20 py-8 bg-gradient-to-r from-[#ff0080] via-[#ff8c00] to-[#ff0080] bg-[length:200%_auto] animate-gradient rounded-full font-black uppercase tracking-[0.5em] transition-all hover:scale-105 shadow-[0_0_80px_rgba(255,0,128,0.4)]">
            <span className="flex items-center gap-6 text-sm">
              <RefreshCw size={24} className={`${morphState === TreeMorphState.TREE_SHAPE ? 'rotate-180' : ''} transition-transform duration-700`} />
              {morphState === TreeMorphState.SCATTERED ? 'Assemble Tree' : 'Scatter Nebula'}
            </span>
          </button>

          <div className="text-right p-6 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-xl">
            <p className="text-[10px] text-white/20 tracking-[0.6em] mb-1 uppercase font-black text-xs">Arix Signature Edition</p>
            <p className="text-xl font-black italic bg-gradient-to-r from-yellow-300 to-pink-500 bg-clip-text text-transparent tracking-tighter">CHRISTMAS 2024</p>
          </div>
        </div>
      </div>

      <audio ref={audioRef} loop src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" />
      <style>{`
        @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-gradient { animation: gradient 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default App;
