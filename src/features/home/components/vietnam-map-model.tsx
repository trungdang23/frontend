import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Center, ContactShadows, OrbitControls, useGLTF } from '@react-three/drei';
import type { Group } from 'three';

const VIETNAM_MAP_MODEL_URL = '/model/Map3d.glb';

useGLTF.preload(VIETNAM_MAP_MODEL_URL);

function VietnamMapMesh() {
  const { scene } = useGLTF(VIETNAM_MAP_MODEL_URL) as { scene: Group };

  return (
    <Center
      cacheKey={VIETNAM_MAP_MODEL_URL}
      position={[0, 0, 0]}
      precise
      scale={0.84}
    >
      <primitive object={scene} />
    </Center>
  );
}

export function VietnamMapModel() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.2], fov: 35 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <ambientLight intensity={1.2} color="#fdf2d0" />
      <directionalLight intensity={1.6} position={[5, 8, 5]} color="#fff8ea" />
      <directionalLight intensity={0.6} position={[-3, 2, -2]} color="#d4b483" />

      <Suspense fallback={null}>
        <VietnamMapMesh />
        <ContactShadows blur={2} far={3} opacity={0.25} position={[0, -1.8, 0]} scale={6} />
      </Suspense>
      <OrbitControls
        enableDamping
        enablePan={false}
        makeDefault
        maxDistance={8}
        minDistance={3.5}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
