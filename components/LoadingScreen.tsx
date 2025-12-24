
import React, { useState, useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import { ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface LoadingScreenProps {
  onStart: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onStart }) => {
  const { progress, active } = useProgress();
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [engineReady, setEngineReady] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    // Poll for the global Mediapipe objects with improved diagnostic checks
    const timer = setInterval(() => {
      const hands = (window as any).Hands || (window as any).hands?.Hands;
      const camera = (window as any).Camera || (window as any).camera?.Camera;
      
      if (hands && camera) {
        setEngineReady(true);
        clearInterval(timer);
      } else {
        setErrorCount(prev => prev + 1);
        // If it's been about 15 seconds
        if (errorCount > 30) {
          console.warn('[AI Vision] Mediapipe script detection timeout. Hands:', !!hands, 'Camera:', !!camera);
          setEngineReady(true); // Allow manual bypass so user isn't stuck forever
          clearInterval(timer);
        }
      }
    }, 500);
    return () => clearInterval(timer);
  }, [errorCount]);

  useEffect(() => {
    // Assets are ready AND engine is either ready or bypassed
    if ((progress >= 100 || !active) && engineReady) {
      const timer = setTimeout(() => setIsReady(true), 800);
      return () => clearTimeout(timer);
    }
  }, [progress, active, engineReady]);

  const handleStart = () => {
    setIsVisible(false);
    onStart();
    setTimeout(() => {
      const el = document.getElementById('loading-overlay');
      if (el) el.style.display = 'none';
    }, 1000);
  };

  if (!isVisible) return null;

  return (
    <div 
      id="loading-overlay"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-opacity duration-1000"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      <div className="relative flex flex-col items-center max-w-2xl w-full px-6 text-center">
        <div className="w-40 h-40 mb-12 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-pink-500/30 blur-[80px] rounded-full animate-pulse" />
          <span className="text-8xl relative z-10 cursor-default select-none animate-bounce">🎁</span>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-10 max-w-lg leading-tight uppercase italic">
          Arix Signature <br/>
          <span className="bg-gradient-to-r from-pink-400 to-yellow-200 bg-clip-text text-transparent">Christmas 2024</span>
        </h2>
        
        {!isReady ? (
          <div className="w-72 space-y-6">
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 via-yellow-400 to-pink-500 transition-all duration-300"
                style={{ width: `${Math.max(progress, 5)}%` }}
              />
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-pink-400" />
                <p className="text-[11px] uppercase tracking-[0.6em] text-white/60 font-black">
                  {!engineReady ? 'Initializing AI Engine...' : `Illuminating Stars ${Math.round(progress)}%`}
                </p>
              </div>
              <p className="text-[9px] text-white/20 tracking-[0.3em] uppercase">
                Preparing interactives
              </p>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in duration-1000 flex flex-col items-center gap-8">
            <button 
              onClick={handleStart}
              className="group relative flex items-center gap-6 px-16 py-7 bg-white text-black rounded-full font-black uppercase tracking-[0.4em] text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_60px_rgba(255,255,255,0.4)]"
            >
              <Sparkles size={20} className="text-pink-500 animate-pulse" />
              Open Invitation
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
            
            {errorCount > 30 && (
              <div className="flex items-center gap-2 text-yellow-500/70 text-[10px] uppercase tracking-widest font-bold bg-yellow-500/5 px-4 py-2 rounded-full border border-yellow-500/10">
                <AlertCircle size={12} />
                AI Vision may be restricted by network or browser
              </div>
            )}
            
            <p className="text-[10px] text-white/30 tracking-[0.4em] uppercase font-bold animate-pulse">
              Click to grant camera access
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
