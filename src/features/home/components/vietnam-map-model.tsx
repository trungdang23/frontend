import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows } from '@react-three/drei';
import type { Group } from 'three';

function VietnamMapMesh() {
  const { scene } = useGLTF('/model/Map3d.glb') as { scene: Group };

  return (
    <primitive
      object={scene}
      position={[0, -0.4, 0]}
      rotation={[0.35, 0, 0]}
      scale={2.6}
    />
  );
}

function FallbackMap() {
  return (
    <mesh>
      <boxGeometry args={[2, 3, 0.1]} />
      <meshStandardMaterial color="#d4b483" wireframe />
    </mesh>
  );
}

export function VietnamMapModel() {
  return (
    <div className="h-full w-full">
      <Canvas
        camera={{ position: [0, 0.3, 5.5], fov: 32 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={1.2} color="#fdf2d0" />
        <directionalLight
          intensity={1.6}
          position={[5, 8, 5]}
          color="#fff8ea"
        />
        <directionalLight
          intensity={0.6}
          position={[-3, 2, -2]}
          color="#d4b483"
        />
        <Suspense fallback={<FallbackMap />}>
          <VietnamMapMesh />
          <ContactShadows
            blur={2}
            far={3}
            opacity={0.25}
            position={[0, -1.8, 0]}
            scale={6}
          />
        </Suspense>
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
