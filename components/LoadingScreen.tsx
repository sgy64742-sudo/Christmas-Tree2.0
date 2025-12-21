
import React from 'react';
import { useProgress } from '@react-three/drei';
import { Sparkles } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  const { progress } = useProgress();

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
      <div className="relative flex flex-col items-center">
        {/* Glowing Logo Placeholder */}
        <div className="w-24 h-24 mb-8 relative">
          <div className="absolute inset-0 bg-pink-500/20 blur-3xl animate-pulse rounded-full" />
          <Sparkles className="w-full h-full text-pink-500 relative z-10 animate-spin-slow" />
        </div>
        
        <h2 className="text-3xl font-black italic tracking-tighter bg-gradient-to-r from-pink-500 to-yellow-200 bg-clip-text text-transparent mb-2">
          ARIX SIGNATURE
        </h2>
        <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden border border-white/10">
          <div 
            className="h-full bg-gradient-to-r from-pink-500 to-yellow-500 transition-all duration-300 ease-out shadow-[0_0_10px_#ff0080]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-4 text-[10px] uppercase tracking-[0.5em] text-white/40 font-bold">
          Synthesizing Memories {Math.round(progress)}%
        </p>
      </div>
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
