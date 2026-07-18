import { Html } from '@react-three/drei';

export default function PatientWard() {
  return (
    <group>
      <Html fullscreen zIndexRange={[100, 0]}>
        <div className="w-full h-full bg-slate-950">
          <iframe 
            title="Hospital Room / Hospital Ward" 
            frameBorder="0" 
            allowFullScreen 
            allow="autoplay; fullscreen; xr-spatial-tracking" 
            className="w-full h-full"
            src="https://sketchfab.com/models/fd58a2f8e93447c18e52a5cb1c1e77dd/embed?autostart=1&ui_infos=0&ui_watermark=0&ui_controls=0&ui_stop=0&ui_annotations=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_animations=0&ui_theme=dark&dnt=1"
          />
        </div>
      </Html>
    </group>
  );
}
