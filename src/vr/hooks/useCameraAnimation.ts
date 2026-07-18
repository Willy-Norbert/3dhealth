import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';

export function useCameraAnimation(targetPosition: [number, number, number], targetLookAt: [number, number, number]) {
  const { camera, controls } = useThree();

  useEffect(() => {
    // Animate Camera Position
    gsap.to(camera.position, {
      x: targetPosition[0],
      y: targetPosition[1],
      z: targetPosition[2],
      duration: 1.5,
      ease: 'power3.inOut',
    });

    // If using OrbitControls, animate the target it looks at
    if (controls && (controls as any).target) {
      gsap.to((controls as any).target, {
        x: targetLookAt[0],
        y: targetLookAt[1],
        z: targetLookAt[2],
        duration: 1.5,
        ease: 'power3.inOut',
      });
    }
  }, [camera, controls, targetPosition, targetLookAt]);
}
