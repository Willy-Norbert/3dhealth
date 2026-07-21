import { useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useProgress, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import { Leva } from 'leva';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

import HospitalReception from '../vr/scenes/HospitalReception';
import PatientWard from '../vr/scenes/PatientWard';
import CPRRoom from '../vr/scenes/CPRRoom';
import OperatingRoom from '../vr/scenes/OperatingRoom';
import EmergencyRoom from '../vr/scenes/EmergencyRoom';
import Pharmacy from '../vr/scenes/Pharmacy';
import RadiologyRoom from '../vr/scenes/RadiologyRoom';
import Ambulance from '../vr/scenes/Ambulance';

const scenes = [
  { id: 'reception', name: 'Hospital Reception', emoji: '🏥' },
  { id: 'er',        name: 'Emergency Room',     emoji: '🚨' },
  { id: 'ward',      name: 'Patient Ward',        emoji: '🛏️' },
  { id: 'cpr',       name: 'CPR Training',        emoji: '❤️' },
  { id: 'or',        name: 'Operating Room',      emoji: '🔬' },
  { id: 'radiology', name: 'Radiology (CT-Scan)', emoji: '📡' },
  { id: 'ambulance', name: 'Ambulance Unit',      emoji: '🚑' },
];

function Loader() {
  const { progress } = useProgress();
  return <Html center className="text-white text-xl font-bold">{progress.toFixed(0)} % loaded</Html>;
}

export default function VRExperience() {
  const [selectedScene, setSelectedScene] = useState('ward');
  // sidebarExpanded: on mobile, false = icon-only strip, true = full names panel
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const user = useAuthStore((state) => state.user);

  // Progress tracking
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      try {
        await fetch('http://localhost:5000/api/progress/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
          body: JSON.stringify({ simulationName: selectedScene, secondsToAdd: 10 }),
        });
      } catch (e) { /* silent */ }
    }, 10000);
    return () => clearInterval(interval);
  }, [user, selectedScene]);

  const renderScene = () => {
    switch (selectedScene) {
      case 'reception': return <HospitalReception />;
      case 'ward':      return <PatientWard />;
      case 'cpr':       return <CPRRoom />;
      case 'or':        return <OperatingRoom />;
      case 'er':        return <EmergencyRoom />;
      case 'pharmacy':  return <Pharmacy />;
      case 'radiology': return <RadiologyRoom />;
      case 'ambulance': return <Ambulance />;
      default:          return <PatientWard />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <Leva collapsed hidden />

      {/* ── SIDEBAR (always visible on all screen sizes) ── */}
      <aside
        className={`
          relative flex flex-col bg-slate-950 border-r border-slate-800 z-10 shrink-0
          transition-all duration-300 ease-in-out
          ${sidebarExpanded ? 'w-64' : 'w-16'}
        `}
      >
        {/* Header — only shown when expanded */}
        <div className={`border-b border-slate-800 overflow-hidden transition-all duration-300 ${sidebarExpanded ? 'p-4 opacity-100' : 'p-0 h-0 opacity-0'}`}>
          <h2 className="text-base font-bold text-white whitespace-nowrap">Simulations</h2>
          <p className="text-xs text-slate-400 mt-0.5 whitespace-nowrap">Select a scenario</p>
        </div>

        {/* Scene buttons */}
        <div className="flex-1 overflow-y-auto py-3 space-y-1 px-2">
          {scenes.map((scene) => {
            const isActive = selectedScene === scene.id;
            return (
              <button
                key={scene.id}
                onClick={() => setSelectedScene(scene.id)}
                title={scene.name}
                className={`
                  w-full flex items-center gap-3 rounded-xl transition-all duration-200
                  ${sidebarExpanded ? 'px-3 py-3' : 'px-0 py-3 justify-center'}
                  ${isActive
                    ? 'bg-sky-500 text-slate-900 font-bold shadow-md shadow-sky-500/30'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }
                `}
              >
                {/* Emoji icon — always visible */}
                <span className={`text-xl leading-none shrink-0 ${sidebarExpanded ? '' : 'mx-auto'}`}>
                  {scene.emoji}
                </span>
                {/* Name — only when expanded */}
                <span
                  className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${sidebarExpanded ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'}`}
                >
                  {scene.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Toggle button at bottom */}
        <button
          onClick={() => setSidebarExpanded(v => !v)}
          className="shrink-0 flex items-center justify-center gap-2 border-t border-slate-800 py-3 text-slate-400 hover:text-white hover:bg-slate-900 transition"
          title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarExpanded ? (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs whitespace-nowrap">Collapse</span>
            </>
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </aside>

      {/* ── MAIN CANVAS AREA ── */}
      <div className="flex-1 bg-gray-900 relative overflow-hidden">

        {/* Canvas (blurred for guests) */}
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

        {/* Auth Wall */}
        {!user && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/40 p-4">
            <div className="glass-dark p-6 sm:p-10 rounded-3xl border border-white/10 text-center max-w-md shadow-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Access Restricted</h2>
              <p className="text-slate-300 mb-6 text-sm sm:text-base">
                You must have a registered account to view and interact with our premium medical VR simulations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/login" className="bg-sky-500 text-slate-950 px-6 py-3 rounded-xl font-bold hover:bg-sky-400 transition shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                  Log In
                </Link>
                <Link to="/login" className="bg-slate-800 text-white border border-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-700 transition">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Hint overlay (desktop only) */}
        {user && (
          <div className="absolute top-4 right-4 z-10 hidden sm:block">
            <div className="bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs border border-white/10 pointer-events-none">
              Use mouse to orbit • Scroll to zoom
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
