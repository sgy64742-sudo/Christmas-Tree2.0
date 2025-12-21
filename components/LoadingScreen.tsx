
import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { Sparkles, Loader2 } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  const { progress, active } = useProgress();
  const [visible, setVisible] = useState(true);

  // 当加载完成且 progress 到达 100 时，延迟隐藏
  useEffect(() => {
    if (!active && progress === 100) {
      const timer = setTimeout(() => setVisible(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [progress, active]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-opacity duration-1000 ease-in-out">
      <div className="relative flex flex-col items-center">
        {/* 核心光效 */}
        <div className="w-32 h-32 mb-10 relative">
          <div className="absolute inset-0 bg-pink-500/30 blur-[60px] animate-pulse rounded-full" />
          <Sparkles className="w-full h-full text-pink-500 relative z-10 animate-spin-slow shadow-[0_0_30px_#ff0080]" />
        </div>
        
        <h2 className="text-4xl font-black italic tracking-tighter bg-gradient-to-r from-pink-500 via-yellow-200 to-pink-500 bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent mb-4">
          ARIX SIGNATURE
        </h2>
        
        <div className="w-72 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400 transition-all duration-500 ease-out shadow-[0_0_20px_#ff0080]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-6 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
             <Loader2 className="animate-spin text-white/20" size={12} />
             <p className="text-[10px] uppercase tracking-[0.6em] text-white/50 font-black">
                {progress < 100 ? 'Synthesizing 3D Assets' : 'System Ready'}
             </p>
          </div>
          <p className="text-2xl font-black tabular-nums text-pink-500/80">{Math.round(progress)}%</p>
        </div>
      </div>
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
