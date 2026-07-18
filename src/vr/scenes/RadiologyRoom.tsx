import { Html } from '@react-three/drei';

export default function RadiologyRoom() {
  return (
    <group>
      <Html fullscreen zIndexRange={[100, 0]}>
        <div className="w-full h-full bg-slate-950">
          <iframe 
            title="MEDICAL SPACES-RADIOLOGY-CT-SCAN ROOM" 
            frameBorder="0" 
            allowFullScreen 
            allow="autoplay; fullscreen; xr-spatial-tracking" 
            className="w-full h-full"
            src="https://sketchfab.com/models/c89d0b01ac6e49bd981bb8e487342777/embed?autostart=1&ui_infos=0&ui_watermark=0&ui_controls=0&ui_stop=0&ui_annotations=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_animations=0&ui_theme=dark&dnt=1"
          />
        </div>
      </Html>
    </group>
  );
}
