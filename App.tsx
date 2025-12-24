
import React, { useState, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './components/Experience';
import LoadingScreen from './components/LoadingScreen';
import { TreeMorphState, PhotoData } from './types';
import { RefreshCw, Upload, Hand, Camera } from 'lucide-react';
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
  const [handData, setHandData] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [started, setStarted] = useState(false);

  const handleGesture = useCallback((data: any) => {
    setHandData(data);
    setMorphState(current => {
      if (data.gesture === Gesture.FIST && current !== TreeMorphState.TREE_SHAPE) return TreeMorphState.TREE_SHAPE;
      if (data.gesture === Gesture.OPEN && current !== TreeMorphState.SCATTERED) return TreeMorphState.SCATTERED;
      return current;
    });
  }, []);

  const { isActive: cameraActive, startTracking } = useHandGestures(handleGesture);

  const onExperienceStart = () => {
    setStarted(true);
    startTracking(); // 核心：由用户直接触发
    setTimeout(() => {
      setMorphState(TreeMorphState.TREE_SHAPE);
    }, 1500);
  };

  const toggleMorph = () => {
    setMorphState(prev => prev === TreeMorphState.SCATTERED ? TreeMorphState.TREE_SHAPE : TreeMorphState.SCATTERED);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const url = URL.createObjectURL(e.target.files[0]);
      setTimeout(() => {
        setPhotos(prev => [...prev, { id: Date.now().toString(), url }]);
        setIsUploading(false);
      }, 1000);
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

      {/* 手势状态提示器 - 右上角 */}
      <div className={`fixed top-8 right-8 flex flex-col items-end gap-3 z-50 pointer-events-none transition-all duration-1000 ${started ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-40px]'}`}>
        <div className="flex items-center gap-4 bg-black/60 backdrop-blur-3xl border border-white/10 px-6 py-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col items-end leading-none">
            <span className="text-[9px] uppercase font-black tracking-[0.3em] text-pink-400 mb-1">AI Hand Tracking</span>
            <span className="text-[12px] font-black tracking-widest uppercase">
              {cameraActive ? (handData?.gesture || 'DETECTING...') : 'CAMERA INITIALIZING...'}
            </span>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/20">
            {!cameraActive && <Camera size={20} className="text-white/20 animate-pulse" />}
            {cameraActive && (
              <>
                {handData?.gesture === Gesture.FIST && <div className="text-2xl animate-bounce">👊</div>}
                {handData?.gesture === Gesture.OPEN && <div className="text-2xl animate-pulse">🖐</div>}
                {handData?.gesture === Gesture.POINT && <div className="text-2xl animate-ping">👉</div>}
                {(handData?.gesture === Gesture.NONE || !handData?.gesture) && <Hand size={22} className="text-pink-400/80" />}
              </>
            )}
            {/* 扫描动画 */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-500/20 to-transparent h-1 w-full top-0 animate-[scan_2s_ease-in-out_infinite]" />
          </div>
        </div>
        
        {/* 操作指南 */}
        <div className="flex flex-col items-end gap-1 opacity-40">
           <p className="text-[8px] uppercase tracking-widest font-bold">👊 Fist to Assemble</p>
           <p className="text-[8px] uppercase tracking-widest font-bold">🖐 Open to Scatter</p>
           <p className="text-[8px] uppercase tracking-widest font-bold">👉 Point to Focus</p>
        </div>
      </div>

      {/* 底部交互 UI */}
      <div className={`absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-10 z-10 transition-opacity duration-1000 ${started ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
             <h1 className="text-5xl font-black italic tracking-tighter bg-gradient-to-r from-pink-500 via-yellow-200 to-pink-500 bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent opacity-60 select-none">ARIX</h1>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 pointer-events-auto w-full">
          <label className="cursor-pointer flex items-center gap-5 px-10 py-6 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all shadow-2xl group flex-1 md:flex-none">
            <Upload size={24} className="text-pink-400 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-base font-black tracking-widest uppercase mb-1 text-nowrap">Add Memory</span>
              <span className="text-[10px] text-white/30 tracking-widest uppercase">Capture Moments</span>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isUploading} />
          </label>

          <button onClick={toggleMorph} className="group px-12 md:px-20 py-8 bg-gradient-to-r from-[#ff0080] via-[#ff8c00] to-[#ff0080] bg-[length:200%_auto] animate-gradient rounded-full font-black uppercase tracking-[0.5em] transition-all hover:scale-105 shadow-[0_0_80px_rgba(255,0,128,0.4)] flex-1 md:flex-none">
            <span className="flex items-center justify-center gap-6 text-sm">
              <RefreshCw size={24} className={`${morphState === TreeMorphState.TREE_SHAPE ? 'rotate-180' : ''} transition-transform duration-700`} />
              <span>{morphState === TreeMorphState.SCATTERED ? 'Assemble' : 'Scatter'}</span>
            </span>
          </button>

          <div className="pointer-events-auto flex justify-end flex-1 md:flex-none">
            <div className="p-1 bg-white/5 backdrop-blur-xl rounded-[20px] border border-white/10 shadow-2xl overflow-hidden">
              <iframe 
                src="https://enamscard.pages.dev/?id=1999170057,1902453366&theme=dark&themeColor=%2300ff88" 
                width="260" 
                height="110" 
                style={{ border: 'none', borderRadius: '16px' }} 
                frameBorder="0"
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-gradient { animation: gradient 8s ease-in-out infinite; }
        @keyframes scan { 0% { top: 0% } 50% { top: 90% } 100% { top: 0% } }
      `}</style>
    </div>
  );
};

export default App;
