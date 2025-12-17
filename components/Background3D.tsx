
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Float, 
  MeshDistortMaterial, 
  Points, 
  PointMaterial, 
  Stars, 
  PerspectiveCamera, 
  Environment,
  Torus
} from '@react-three/drei';
import * as THREE from 'three';

const StratosphereSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current || !ringRef.current || !ringRef2.current) return;
    const time = state.clock.getElapsedTime();
    
    // Core sphere rotation
    meshRef.current.rotation.y = time * 0.1;
    meshRef.current.rotation.x = Math.sin(time * 0.15) * 0.1;
    
    // Rings rotation (orbital paths like in the logo)
    ringRef.current.rotation.x = Math.PI / 2.5 + Math.sin(time * 0.1) * 0.05;
    ringRef.current.rotation.y = time * 0.2;
    
    ringRef2.current.rotation.x = -Math.PI / 3 + Math.cos(time * 0.1) * 0.05;
    ringRef2.current.rotation.y = -time * 0.15;
    
    // Parallax effect based on mouse
    const mouseX = state.mouse.x * 0.4;
    const mouseY = state.mouse.y * 0.4;
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, mouseX, 0.05);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, mouseY, 0.05);
  });

  return (
    <group>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        {/* The Central Globe */}
        <mesh ref={meshRef} scale={1.8}>
          <sphereGeometry args={[1, 128, 128]} />
          <MeshDistortMaterial
            color="#001838"
            roughness={0.2}
            metalness={0.8}
            distort={0.2}
            speed={1.5}
            emissive="#0a2a5a"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Orbital Rings representing the rocket's path from the logo */}
        <Torus ref={ringRef} args={[2.5, 0.015, 16, 100]} rotation={[Math.PI / 2.5, 0, 0]}>
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.4} />
        </Torus>
        
        <Torus ref={ringRef2} args={[2.8, 0.01, 16, 100]} rotation={[-Math.PI / 3, 0, 0]}>
          <meshBasicMaterial color="#1e40af" transparent opacity={0.2} />
        </Torus>
      </Float>
    </group>
  );
};

const Particles = () => {
  const points = useMemo(() => {
    const p = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      p[i * 3] = (Math.random() - 0.5) * 20;
      p[i * 3 + 1] = (Math.random() - 0.5) * 20;
      p[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return p;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
  });

  return (
    <Points positions={points} ref={pointsRef}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
};

const Background3D: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-[#000814]">
      <Canvas dpr={[1, 2]} performance={{ min: 0.5 }}>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={45} />
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} color="#ffffff" castShadow />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#003366" />
        
        <StratosphereSphere />
        <Particles />
        <Stars radius={100} depth={50} count={6000} factor={6} saturation={0.5} fade speed={0.8} />
        
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default Background3D;
