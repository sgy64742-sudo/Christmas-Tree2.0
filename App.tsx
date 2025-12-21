
import React, { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './components/Experience';
import LoadingScreen from './components/LoadingScreen';
import { TreeMorphState, PhotoData } from './types';
import { Play, Pause, RefreshCw, Share2, Upload, Sparkles, Hand, CheckCircle2, Loader2 } from 'lucide-react';
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
  const [uploadSuccess, setUploadSuccess] = useState(false);
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
      setIsUploading(true);
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      
      // 模拟上传延迟以展示反馈
      setTimeout(() => {
        setPhotos(prev => [...prev, { id: Date.now().toString(), url }]);
        setIsUploading(false);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }, 800);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden">
      {/* 这里的 LoadingScreen 移出 Suspense fallback 以避免死锁 */}
      <LoadingScreen />

      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 6, 25], fov: 40 }}>
        <Suspense fallback={null}>
          <Experience morphState={morphState} photos={photos} handData={handData} />
        </Suspense>
      </Canvas>

      {/* 上传反馈浮窗 */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 transform ${isUploading || uploadSuccess ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'}`}>
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 px-8 py-3 rounded-full flex items-center gap-4 shadow-[0_0_40px_rgba(255,105,180,0.4)]">
          {isUploading ? (
            <>
              <Loader2 className="animate-spin text-pink-400" size={20} />
              <span className="text-sm font-bold tracking-widest uppercase">Processing Photo...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="text-green-400" size={20} />
              <span className="text-sm font-bold tracking-widest uppercase">Memory Captured</span>
            </>
          )}
        </div>
      </div>

      {/* 手势状态 */}
      {cameraActive && (
        <div className="gesture-indicator group transition-all hover:scale-110">
          {handData?.gesture === Gesture.FIST && <div className="text-2xl animate-bounce">👊</div>}
          {handData?.gesture === Gesture.OPEN && <div className="text-2xl animate-pulse">🖐</div>}
          {handData?.gesture === Gesture.POINT && <div className="text-2xl animate-ping">👉</div>}
          {(!handData || handData.gesture === Gesture.NONE) && <Hand size={24} className="text-white/40" />}
          
          <div className="absolute right-full mr-6 bg-black/60 backdrop-blur-xl p-4 rounded-2xl text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 w-56 text-right shadow-2xl">
            <p className="text-pink-400 font-bold mb-1">Gesture System Active</p>
            <p className="leading-relaxed">👊 Assemble Tree<br/>🖐 Scatter Particles<br/>👉 Focus Photo</p>
          </div>
        </div>
      )}

      {/* UI 叠加层 */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-10 z-10">
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="group cursor-default">
            <h1 className="text-6xl font-black bg-gradient-to-r from-pink-500 via-yellow-200 to-pink-500 bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent italic tracking-tighter leading-none">
              Arix Signature
            </h1>
            <p className="text-pink-200/40 tracking-[0.5em] text-[10px] font-bold mt-2 uppercase transition-colors group-hover:text-pink-200/80">
              Interactive Holiday Art Installation
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleAudioToggle}
              className={`p-5 backdrop-blur-3xl rounded-full transition-all border border-white/10 shadow-2xl ${isPlaying ? 'bg-pink-500/20 text-pink-400' : 'bg-white/5 text-white'}`}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end gap-10 pointer-events-auto w-full">
          <div className="flex flex-col gap-6">
             <label className={`cursor-pointer flex items-center gap-5 px-10 py-6 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl hover:bg-white/10 hover:border-pink-500/50 transition-all group shadow-2xl ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className="p-3 bg-pink-500/20 rounded-xl group-hover:bg-pink-500/40 transition-colors">
                  <Upload size={24} className="text-pink-400" />
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-base font-black tracking-widest uppercase mb-1">Add Memory</span>
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Upload personal photo</span>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isUploading} />
              </label>
             
             <div className="flex items-center gap-4 ml-2">
                <div className="flex -space-x-3">
                  {photos.slice(-4).map((p, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-gray-900 overflow-hidden shadow-xl transform hover:scale-125 transition-transform cursor-pointer">
                      <img src={p.url} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">Recent Captures ({photos.length})</p>
             </div>
          </div>

          <button 
            onClick={toggleMorph}
            className="group relative px-24 py-8 bg-gradient-to-r from-[#ff0080] via-[#ff8c00] to-[#ff0080] bg-[length:200%_auto] animate-gradient rounded-full font-black uppercase tracking-[0.5em] transition-all hover:scale-105 active:scale-95 shadow-[0_0_100px_rgba(255,0,128,0.6)] border-t border-white/30"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
            <span className="relative z-10 flex items-center gap-6 text-base">
              <RefreshCw size={28} className={`${morphState === TreeMorphState.TREE_SHAPE ? 'rotate-180' : ''} transition-transform duration-1000`} />
              {morphState === TreeMorphState.SCATTERED ? 'Assemble Tree' : 'Scatter Nebula'}
            </span>
          </button>

          <div className="text-right p-6 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl">
            <p className="text-[10px] text-white/20 uppercase tracking-[0.6em] mb-2 font-black">Digital Experience</p>
            <p className="text-2xl font-black tracking-tighter bg-gradient-to-r from-yellow-300 to-pink-500 bg-clip-text text-transparent italic leading-none">ARIX STUDIO</p>
          </div>
        </div>
      </div>

      <audio ref={audioRef} loop src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" />

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
