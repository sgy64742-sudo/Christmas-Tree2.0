
import React, { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './components/Experience';
import LoadingScreen from './components/LoadingScreen';
import { TreeMorphState, PhotoData } from './types';
import { Play, Pause, RefreshCw, Share2, Upload, Sparkles, Hand, CheckCircle2 } from 'lucide-react';
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
  const [uploadFeedback, setUploadFeedback] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Gesture handling
  const { isActive: cameraActive } = useHandGestures((data) => {
    setHandData(data);
    if (data.gesture === Gesture.FIST && morphState !== TreeMorphState.TREE_SHAPE) {
      setMorphState(TreeMorphState.TREE_SHAPE);
    } else if (data.gesture === Gesture.OPEN && morphState !== TreeMorphState.SCATTERED) {
      setMorphState(TreeMorphState.SCATTERED);
    }
  });

  const toggleMorph = () => {
    setMorphState(prev => 
      prev === TreeMorphState.SCATTERED ? TreeMorphState.TREE_SHAPE : TreeMorphState.SCATTERED
    );
  };

  const handleAudioToggle = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("Audio play blocked", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPhotos(prev => [...prev, { id: Date.now().toString(), url }]);
      
      // Feedback UI
      setUploadFeedback(true);
      setTimeout(() => setUploadFeedback(false), 3000);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden">
      {/* 3D Canvas with Stylized Loader */}
      <Suspense fallback={<LoadingScreen />}>
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 6, 25], fov: 40 }}>
          <Experience morphState={morphState} photos={photos} handData={handData} />
        </Canvas>
      </Suspense>

      {/* Upload Toast Feedback */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 transform ${uploadFeedback ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}>
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(255,105,180,0.3)]">
          <CheckCircle2 className="text-pink-400" size={20} />
          <span className="text-sm font-bold tracking-widest uppercase">Photo Uploaded Successfully</span>
        </div>
      </div>

      {/* Gesture Status Indicator */}
      {cameraActive && (
        <div className="gesture-indicator group cursor-help transition-all hover:bg-white/20">
          {handData?.gesture === Gesture.FIST && <div className="text-xl animate-bounce">👊</div>}
          {handData?.gesture === Gesture.OPEN && <div className="text-xl animate-pulse">🖐</div>}
          {handData?.gesture === Gesture.POINT && <div className="text-xl animate-ping">👉</div>}
          {(!handData || handData.gesture === Gesture.NONE) && <Hand size={24} className="text-white/30" />}
          
          <div className="absolute right-full mr-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 w-48 text-right">
            Camera active. Use 👊 to assemble, 🖐 to scatter, 👉 to zoom.
          </div>
        </div>
      )}

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-8 z-10">
        {/* Header */}
        <div className="flex justify-between items-start pointer-events-auto">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-pink-500 via-yellow-200 to-pink-500 bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent italic tracking-tighter">
              Arix Signature
            </h1>
            <p className="text-pink-200/40 tracking-[0.4em] text-[10px] font-bold mt-1 uppercase">interactive holiday showcase</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleAudioToggle}
              className="p-4 bg-white/5 backdrop-blur-xl rounded-full hover:bg-white/10 transition-all border border-white/10 shadow-2xl"
              title="Toggle Christmas List Music"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button className="p-4 bg-white/5 backdrop-blur-xl rounded-full hover:bg-white/10 transition-all border border-white/10 shadow-2xl">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Center Prompt */}
        <div className="flex flex-col items-center justify-center">
           {morphState === TreeMorphState.SCATTERED && (
             <div className="bg-white/5 backdrop-blur-md px-8 py-3 rounded-full border border-white/10 flex flex-col items-center gap-1">
               <div className="flex items-center gap-3">
                 <Sparkles size={16} className="text-yellow-400 animate-pulse" />
                 <span className="text-xs tracking-[0.3em] font-black uppercase text-pink-200">Nebula Exploration</span>
                 <Sparkles size={16} className="text-yellow-400 animate-pulse" />
               </div>
               <p className="text-[8px] text-white/30 tracking-[0.2em] uppercase">Move your hand to rotate space</p>
             </div>
           )}
        </div>

        {/* Bottom Controls */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 pointer-events-auto">
          <div className="flex flex-col gap-4">
             <div className="flex gap-4">
               <label className="cursor-pointer flex items-center gap-4 px-10 py-5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-pink-500/50 transition-all group shadow-2xl">
                <div className="p-2 bg-pink-500/20 rounded-lg group-hover:bg-pink-500/40 transition-colors">
                  <Upload size={20} className="text-pink-400" />
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-sm font-black tracking-widest uppercase mb-1">Upload Photo</span>
                  <span className="text-[9px] text-white/30 uppercase tracking-widest">JPG, PNG allowed</span>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </label>
             </div>
             <div className="flex items-center gap-4 ml-2">
                <div className="flex -space-x-2">
                  {photos.slice(0, 3).map((p, i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-gray-800 overflow-hidden">
                      <img src={p.url} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="w-6 h-6 rounded-full border-2 border-black bg-pink-900/50 flex items-center justify-center text-[8px] font-bold">
                    +{photos.length}
                  </div>
                </div>
                <p className="text-[9px] text-white/40 uppercase tracking-[0.2em]">Live Gallery Status</p>
             </div>
          </div>

          <button 
            onClick={toggleMorph}
            className="group relative px-20 py-6 bg-gradient-to-r from-[#ff0080] via-[#ff8c00] to-[#ff0080] bg-[length:200%_auto] animate-gradient rounded-full font-black uppercase tracking-[0.4em] transition-all hover:scale-105 active:scale-95 shadow-[0_0_80px_rgba(255,0,128,0.5)] border-t border-white/20"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center gap-6 text-sm">
              <RefreshCw size={24} className={`${morphState === TreeMorphState.TREE_SHAPE ? 'rotate-180' : ''} transition-transform duration-1000 ease-in-out`} />
              {morphState === TreeMorphState.SCATTERED ? 'Assemble Signature Tree' : 'Release Particle Nebula'}
            </span>
          </button>

          <div className="text-right p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5">
            <p className="text-[10px] text-white/20 uppercase tracking-[0.5em] mb-2 font-bold">digital design by</p>
            <p className="text-xl font-black tracking-tighter bg-gradient-to-r from-yellow-300 to-pink-500 bg-clip-text text-transparent italic">ARIX STUDIO</p>
          </div>
        </div>
      </div>

      <audio 
        ref={audioRef} 
        loop 
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" 
      />

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
