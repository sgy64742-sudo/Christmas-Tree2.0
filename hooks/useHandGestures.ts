
import { useEffect, useState, useCallback, useRef } from 'react';

export enum Gesture {
  NONE = 'NONE',
  FIST = 'FIST',
  OPEN = 'OPEN',
  POINT = 'POINT'
}

interface HandData {
  gesture: Gesture;
  x: number;
  y: number;
  z: number;
}

export const useHandGestures = (onGesture: (data: HandData) => void) => {
  const [isActive, setIsActive] = useState(false);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  const startTracking = useCallback(async () => {
    const videoElement = document.getElementById('input_video') as HTMLVideoElement;
    if (!videoElement) {
      console.error('[AI Vision] Video element not found');
      return;
    }

    // Comprehensive global check for Mediapipe
    // Different versions/loading methods might put it in different places
    const HandsCtor = (window as any).Hands || (window as any).hands?.Hands;
    const CameraCtor = (window as any).Camera || (window as any).camera?.Camera;

    if (!HandsCtor || !CameraCtor) {
      console.error('[AI Vision] Mediapipe globals missing.', { 
        Hands: !!HandsCtor, 
        Camera: !!CameraCtor,
        windowKeys: Object.keys(window).filter(k => k.toLowerCase().includes('hands') || k.toLowerCase().includes('camera'))
      });
      return;
    }

    try {
      console.log('[AI Vision] Initializing engine...');
      
      const hands = new HandsCtor({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.5,
      });

      hands.onResults((results: any) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0];
          
          const isFingerRaised = (tipIdx: number, pipIdx: number) => landmarks[tipIdx].y < landmarks[pipIdx].y;
          
          const indexRaised = isFingerRaised(8, 6);
          const middleRaised = isFingerRaised(12, 10);
          const ringRaised = isFingerRaised(16, 14);
          const pinkyRaised = isFingerRaised(20, 18);

          const raisedCount = [indexRaised, middleRaised, ringRaised, pinkyRaised].filter(v => v).length;

          let gesture = Gesture.NONE;
          
          if (raisedCount === 0) {
            gesture = Gesture.FIST;
          } else if (indexRaised && raisedCount === 1) {
            gesture = Gesture.POINT;
          } else if (raisedCount >= 3) {
            gesture = Gesture.OPEN;
          }

          onGesture({
            gesture,
            x: landmarks[9].x,
            y: landmarks[9].y,
            z: landmarks[9].z,
          });
        } else {
          onGesture({ gesture: Gesture.NONE, x: 0.5, y: 0.5, z: 0 });
        }
      });

      const camera = new CameraCtor(videoElement, {
        onFrame: async () => {
          if (handsRef.current) {
            await handsRef.current.send({ image: videoElement });
          }
        },
        width: 640,
        height: 480,
      });

      console.log('[AI Vision] Starting camera...');
      await camera.start();
      
      handsRef.current = hands;
      cameraRef.current = camera;
      setIsActive(true);
      console.log('[AI Vision] Active.');
    } catch (err) {
      console.error('[AI Vision] Initialization failed:', err);
    }
  }, [onGesture]);

  useEffect(() => {
    return () => {
      if (cameraRef.current) {
        try { cameraRef.current.stop(); } catch(e) {}
      }
      if (handsRef.current) {
        try { handsRef.current.close(); } catch(e) {}
      }
    };
  }, []);

  return { isActive, startTracking };
};
