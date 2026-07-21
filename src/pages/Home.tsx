import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PlayCircle, ShieldCheck, Stethoscope } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage } from '@react-three/drei';
import { Suspense } from 'react';


// Pre-load the hospital model
useGLTF.preload('/models/hospital.glb');

// Component to render the 3D hospital model
function HospitalModel() {
  const { scene } = useGLTF('/models/hospital.glb');
  return <primitive object={scene} />;
}

export default function Home() {
  return (
    <div className="flex flex-col items-center pb-16 md:pb-0">
      {/* Hero Section — full bleed with image.png background */}
      <section
        className="w-full relative flex flex-col lg:flex-row items-center gap-12 px-6 py-24"
        style={{
          backgroundImage: 'url(/image.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark overlay so text stays readable */}
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]" />
        
        {/* Content above overlay */}
        <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12">

          {/* LEFT SIDE: 3D Hospital Model */}
          <motion.div 
            className="flex-1 relative w-full h-[400px] lg:h-[600px]"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 w-full h-full">
              <Canvas shadows camera={{ position: [0, 0, 10], fov: 45 }}>
                <Suspense fallback={null}>
                  <Stage environment="city" intensity={0.6} adjustCamera>
                    <HospitalModel />
                  </Stage>
                </Suspense>
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} makeDefault />
              </Canvas>
            </div>
          </motion.div>

          {/* RIGHT SIDE: Text and Actions */}
          <motion.div 
            className="flex-1 space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-5xl lg:text-7xl font-medium tracking-tight text-white leading-tight">
              Next-Gen <span className="text-sky-400 font-semibold">Medical</span> Training in VR
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl">
              Experience highly immersive and interactive healthcare simulations. Practice life-saving procedures in a risk-free virtual environment.
            </p>
            <div className="flex gap-4 pt-4">
              <Link to="/vr-experience" className="bg-sky-500 text-slate-950 px-8 py-3 rounded-full font-medium hover:bg-sky-400 transition shadow-[0_0_20px_rgba(14,165,233,0.5)] flex items-center gap-2">
                <PlayCircle className="w-5 h-5" /> Start Simulation
              </Link>
              <Link to="/login" className="bg-slate-900/80 text-slate-300 border border-slate-700 px-8 py-3 rounded-full font-medium hover:bg-slate-800 transition">
                Student Portal
              </Link>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Features */}
      <section className="w-full bg-transparent py-24 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {[
            { title: "Risk-Free Practice", desc: "Train without putting actual patients at risk.", icon: ShieldCheck, color: "text-sky-400" },
            { title: "Real-time Feedback", desc: "Get instant AI-driven analytics on your performance.", icon: Stethoscope, color: "text-emerald-400" },
            { title: "Anywhere, Anytime", desc: "Accessible via web browser with WebXR capabilities.", icon: PlayCircle, color: "text-indigo-400" },
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:shadow-[0_0_20px_rgba(14,165,233,0.15)] transition duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <feature.icon className={`w-10 h-10 mb-4 ${feature.color}`} />
              <h3 className="text-xl font-medium mb-2 text-white">{feature.title}</h3>
              <p className="text-slate-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
