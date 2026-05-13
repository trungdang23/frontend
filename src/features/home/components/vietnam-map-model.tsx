import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  Bounds,
  Center,
  ContactShadows,
  OrbitControls,
  useGLTF,
} from '@react-three/drei';
import type { Group } from 'three';

const VIETNAM_MAP_MODEL_URL = '/model/Map3d.glb';
const VIETNAM_MAP_MODEL_SCALE = 0.9;

useGLTF.preload(VIETNAM_MAP_MODEL_URL);

function VietnamMapMesh() {
  const { scene } = useGLTF(VIETNAM_MAP_MODEL_URL) as { scene: Group };

  return (
    <Center
      cacheKey={VIETNAM_MAP_MODEL_URL}
      position={[0, 0, 0]}
      precise
      scale={VIETNAM_MAP_MODEL_SCALE}
    >
      <primitive object={scene} />
    </Center>
  );
}

export function VietnamMapModel() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.8], fov: 38 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <ambientLight intensity={1.2} color="#fdf2d0" />
      <directionalLight intensity={1.6} position={[5, 8, 5]} color="#fff8ea" />
      <directionalLight intensity={0.6} position={[-3, 2, -2]} color="#d4b483" />

      <Suspense fallback={null}>
        <Bounds clip fit margin={1.14} observe>
          <VietnamMapMesh />
        </Bounds>
        <ContactShadows blur={2.4} far={3.4} opacity={0.24} position={[0, -1.75, 0]} scale={5.8} />
      </Suspense>
      <OrbitControls
        enableDamping
        enablePan={false}
        makeDefault
        maxDistance={12}
        minDistance={1.8}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
