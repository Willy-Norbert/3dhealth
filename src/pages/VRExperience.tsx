import { useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useProgress, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import { Leva } from 'leva';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

import HospitalReception from '../vr/scenes/HospitalReception';
import PatientWard from '../vr/scenes/PatientWard';
import CPRRoom from '../vr/scenes/CPRRoom';
import OperatingRoom from '../vr/scenes/OperatingRoom';
import EmergencyRoom from '../vr/scenes/EmergencyRoom';
import Pharmacy from '../vr/scenes/Pharmacy';
import RadiologyRoom from '../vr/scenes/RadiologyRoom';
import Ambulance from '../vr/scenes/Ambulance';

function Loader() {
  const { progress } = useProgress();
  return <Html center className="text-white text-xl font-bold">{progress.toFixed(0)} % loaded</Html>;
}

export default function VRExperience() {
  const [selectedScene, setSelectedScene] = useState('ward');
  const user = useAuthStore((state) => state.user);

  // Progress Tracking
  useEffect(() => {
    if (!user) return; // Don't track if not logged in
    
    // Ping the backend every 10 seconds to add watch time
    const interval = setInterval(async () => {
      try {
        await fetch('http://localhost:5000/api/progress/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify({
            simulationName: selectedScene,
            secondsToAdd: 10
          })
        });
      } catch (error) {
        console.error('Failed to track progress', error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user, selectedScene]);

  const renderScene = () => {
    switch (selectedScene) {
      case 'reception': return <HospitalReception />;
      case 'ward': return <PatientWard />;
      case 'cpr': return <CPRRoom />;
      case 'or': return <OperatingRoom />;
      case 'er': return <EmergencyRoom />;
      case 'pharmacy': return <Pharmacy />;
      case 'radiology': return <RadiologyRoom />;
      case 'ambulance': return <Ambulance />;
      default: return <PatientWard />;
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      <Leva collapsed />

      {/* Sidebar - Simulation Selector */}
      <div className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col z-10">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Simulations</h2>
          <p className="text-sm text-slate-400">Select a scenario to start</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {[
            { id: 'reception', name: 'Hospital Reception' },
            { id: 'er', name: 'Emergency Room' },
            { id: 'ward', name: 'Patient Ward' },
            { id: 'cpr', name: 'CPR Training Room' },
            { id: 'or', name: 'Operating Room' },
            { id: 'radiology', name: 'Radiology (CT-Scan)' },
            { id: 'ambulance', name: 'Ambulance Unit' },
          ].map((scene) => (
            <button
              key={scene.id}
              onClick={() => setSelectedScene(scene.id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition ${
                selectedScene === scene.id 
                  ? 'bg-sky-500 text-slate-900 font-bold shadow-md shadow-sky-500/20' 
                  : 'hover:bg-slate-900 text-slate-300'
              }`}
            >
              {scene.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Canvas Area */}
      <div className="flex-1 bg-gray-900 relative overflow-hidden">
        
        {/* If user is NOT logged in, apply blur and overlay */}
        <div className={`absolute inset-0 z-0 transition-all duration-500 ${!user ? 'blur-xl scale-105 opacity-50' : ''}`}>
          <Canvas shadows camera={{ position: [5, 3, 5], fov: 60 }}>
            <color attach="background" args={['#0f172a']} />
            <ambientLight intensity={0.2} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
            <Environment preset="warehouse" background blur={0.8} />
            <OrbitControls makeDefault dampingFactor={0.05} />
            <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />

            <Suspense fallback={<Loader />}>
              {renderScene()}
            </Suspense>

            <EffectComposer>
              <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
              <ToneMapping />
            </EffectComposer>
          </Canvas>
        </div>

        {/* Authentication Wall Overlay */}
        {!user && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/40">
            <div className="glass-dark p-10 rounded-3xl border border-white/10 text-center max-w-md shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
              <p className="text-slate-300 mb-8">
                You must have a registered account to view and interact with our premium medical VR simulations. Your progress will be tracked for certification.
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/login" className="bg-sky-500 text-slate-950 px-8 py-3 rounded-xl font-bold hover:bg-sky-400 transition shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                  Log In
                </Link>
                <Link to="/login" className="bg-slate-800 text-white border border-slate-700 px-8 py-3 rounded-xl font-bold hover:bg-slate-700 transition">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Overlay UI (only show if logged in) */}
        {user && (
          <div className="absolute top-6 right-6 flex gap-4 z-10">
            <div className="bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm border border-white/10 pointer-events-none">
              Use mouse to orbit • Scroll to zoom
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
