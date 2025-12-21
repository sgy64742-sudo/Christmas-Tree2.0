
import React, { useState, useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import { Sparkles, ArrowRight } from 'lucide-react';

interface LoadingScreenProps {
  onStart: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onStart }) => {
  const { progress, active } = useProgress();
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 强制设定：如果进度大于99或不再活跃，则认为准备就绪
    if (progress >= 99 || !active) {
      const timer = setTimeout(() => setIsReady(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [progress, active]);

  const handleStart = () => {
    setIsVisible(false);
    onStart();
    // 给动画留一点消失时间
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
      <div className="relative flex flex-col items-center max-w-md w-full px-6">
        <div className="w-32 h-32 mb-12 relative">
          <div className="absolute inset-0 bg-pink-500/20 blur-[60px] animate-pulse rounded-full" />
          <Sparkles className="w-full h-full text-pink-500 relative z-10 animate-spin-slow" />
        </div>
        
        <h2 className="text-4xl font-black italic tracking-tighter bg-gradient-to-r from-pink-500 via-yellow-200 to-pink-500 bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent mb-8 text-center">
          ARIX SIGNATURE
        </h2>
        
        {!isReady ? (
          <div className="w-full space-y-4">
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 to-yellow-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-bold text-center">
              Materializing Scene... {Math.round(progress)}%
            </p>
          </div>
        ) : (
          <button 
            onClick={handleStart}
            className="group flex items-center gap-4 px-12 py-5 bg-white text-black rounded-full font-black uppercase tracking-[0.3em] text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.3)] animate-in fade-in slide-in-from-bottom-4 duration-700"
          >
            Enter Experience
            <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
          </button>
        )}
      </div>
      
      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-gradient { animation: gradient 4s linear infinite; }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
