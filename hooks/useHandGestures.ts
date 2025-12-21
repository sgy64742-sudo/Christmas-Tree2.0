
import { useEffect, useRef, useState } from 'react';

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
  
  useEffect(() => {
    const videoElement = document.getElementById('input_video') as HTMLVideoElement;
    if (!videoElement) return;

    // @ts-ignore
    const hands = new window.Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    const isFingersRaised = (landmarks: any) => {
      const fingerTips = [8, 12, 16, 20];
      const fingerPips = [6, 10, 14, 18];
      return fingerTips.map((tip, i) => landmarks[tip].y < landmarks[fingerPips[i]].y);
    };

    hands.onResults((results: any) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const raised = isFingersRaised(landmarks);
        const raisedCount = raised.filter(r => r).length;

        let gesture = Gesture.NONE;
        if (raisedCount === 0) gesture = Gesture.FIST;
        else if (raisedCount >= 4) gesture = Gesture.OPEN;
        else if (raisedCount === 1 && raised[0]) gesture = Gesture.POINT;

        onGesture({
          gesture,
          x: landmarks[9].x, // Middle finger base
          y: landmarks[9].y,
          z: landmarks[9].z,
        });
      }
    });

    // @ts-ignore
    const camera = new window.Camera(videoElement, {
      onFrame: async () => {
        await hands.send({ image: videoElement });
      },
      width: 640,
      height: 480,
    });

    camera.start().then(() => setIsActive(true));

    return () => {
      camera.stop();
      hands.close();
    };
  }, []);

  return { isActive };
};
