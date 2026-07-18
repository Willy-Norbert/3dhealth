import { Box, Cylinder, Text, Html } from '@react-three/drei';

export default function Pharmacy() {
  return (
    <group>
      {/* Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#fef3c7" />
      </mesh>

      {/* Pharmacy Counter */}
      <Box args={[5, 1.2, 1]} position={[0, 0.6, -1]} castShadow receiveShadow>
        <meshStandardMaterial color="#d97706" />
      </Box>
      <Box args={[5.2, 0.1, 1.2]} position={[0, 1.25, -1]} castShadow receiveShadow>
        <meshStandardMaterial color="#fef3c7" />
      </Box>
      <Text position={[0, 1.5, -0.5]} fontSize={0.2} color="#b45309">
        MEDICATION DISPENSARY
      </Text>

      {/* Shelves */}
      <group position={[0, 0, -3]}>
        <Box args={[6, 3, 0.5]} position={[0, 1.5, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#78350f" />
        </Box>
        {/* Medicine Bottles */}
        {[...Array(10)].map((_, i) => (
          <Cylinder 
            key={`med1-${i}`}
            args={[0.08, 0.08, 0.2, 16]} 
            position={[-2.5 + i * 0.5, 1.1, 0.35]} 
            castShadow
          >
            <meshStandardMaterial color="#34d399" />
          </Cylinder>
        ))}
        {[...Array(10)].map((_, i) => (
          <Cylinder 
            key={`med2-${i}`}
            args={[0.06, 0.06, 0.15, 16]} 
            position={[-2.5 + i * 0.5, 2.1, 0.35]} 
            castShadow
          >
            <meshStandardMaterial color="#f87171" />
          </Cylinder>
        ))}
      </group>

      {/* Info Panel */}
      <Html position={[0, 2.5, -1]} center>
        <div className="bg-yellow-900/80 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm border border-yellow-500 pointer-events-none">
          Verify Prescriptions Here
        </div>
      </Html>
    </group>
  );
}
