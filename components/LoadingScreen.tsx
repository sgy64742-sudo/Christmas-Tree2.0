
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
    const timer = setInterval(() => {
      const hands = (window as any).Hands || (window as any).hands?.Hands;
      const camera = (window as any).Camera || (window as any).camera?.Camera;
      
      if (hands && camera) {
        setEngineReady(true);
        clearInterval(timer);
      } else {
        setErrorCount(prev => prev + 1);
        if (errorCount > 30) {
          setEngineReady(true);
          clearInterval(timer);
        }
      }
    }, 500);
    return () => clearInterval(timer);
  }, [errorCount]);

  useEffect(() => {
    if ((progress >= 100 || !active) && engineReady) {
      const timer = setTimeout(() => setIsReady(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [progress, active, engineReady]);

  const handleStart = () => {
    setIsVisible(false);
    onStart();
    setTimeout(() => {
      const el = document.getElementById('loading-overlay');
      if (el) el.style.display = 'none';
    }, 1200);
  };

  if (!isVisible) return null;

  return (
    <div 
      id="loading-overlay"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] transition-opacity duration-1000 overflow-hidden"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {/* External Font Import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        
        @keyframes snow {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        .animate-snow {
          animation-name: snow;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .cursive-quote {
          font-family: 'Great Vibes', cursive;
          font-weight: 400; /* Consistent weight */
        }
      `}</style>

      {/* Intensified Snow Animation */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        {[...Array(60)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-white rounded-full animate-snow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              animationDuration: `${Math.random() * 12 + 8}s`,
              animationDelay: `${Math.random() * 15}s`,
              filter: `blur(${Math.random() * 2}px)`,
              opacity: Math.random() * 0.7 + 0.3
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center max-w-2xl w-full px-6 text-center z-10">
        {/* Elegant Icon Container */}
        <div className="w-48 h-48 mb-16 relative flex items-center justify-center">
          <div className="absolute inset-0 border border-white/5 rounded-full animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-4 border border-white/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
          <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent blur-3xl rounded-full" />
          <span className="text-7xl relative z-10 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">🎄</span>
        </div>
        
        <div className="space-y-2 mb-14">
          <h2 className="cursive-quote text-4xl md:text-5xl text-white leading-tight">
            Every Xmas bell rings <br/>
            for our unending love.
          </h2>
          <div className="h-px w-12 bg-white/20 mx-auto mt-6" />
        </div>
        
        {!isReady ? (
          <div className="w-80 space-y-8">
            <div className="relative h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-pink-400 to-transparent transition-all duration-700 ease-out shadow-[0_0_10px_rgba(244,114,182,0.8)]"
                style={{ width: `${Math.max(progress, 5)}%` }}
              />
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <Loader2 size={12} className="animate-spin text-white/30" />
                <p className="text-[10px] uppercase tracking-[0.8em] text-white/40 font-medium">
                  {!engineReady ? 'Initializing AI Vision' : `Harmonizing Stars ${Math.round(progress)}%`}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 flex flex-col items-center gap-10">
            <button 
              onClick={handleStart}
              className="group relative flex items-center gap-8 px-20 py-6 bg-white text-black rounded-full font-bold uppercase tracking-[0.6em] text-xs hover:tracking-[0.8em] hover:bg-pink-50 transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
              Open Invitation
              <ArrowRight size={18} className="group-hover:translate-x-3 transition-transform duration-500" />
            </button>
            
            <div className="flex flex-col items-center gap-2">
              <p className="text-[10px] text-white/30 tracking-[0.4em] uppercase font-bold animate-pulse">
                Camera access required for AI
              </p>
              {errorCount > 30 && (
                <p className="text-[9px] text-yellow-500/50 uppercase tracking-widest font-medium">
                  Vision engine bypass active
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
