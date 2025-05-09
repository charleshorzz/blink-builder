
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface RotatingCardProps {
  color?: string;
  wireframe?: boolean;
  autoRotate?: boolean;
}

const CardMesh: React.FC<RotatingCardProps> = ({ color = '#4a9eff', wireframe = false, autoRotate = true }) => {
  const mesh = useRef<THREE.Mesh>(null);
  const textureLoader = new THREE.TextureLoader();
  // Use the uploaded image as a texture
  const cardTexture = textureLoader.load('/blockchain-card.jpeg');
  
  useFrame(({ clock }) => {
    if (!mesh.current || !autoRotate) return;
    // Faster rotation speed (increased from 0.3 to 1.0)
    mesh.current.rotation.y = Math.sin(clock.getElapsedTime() * 1.0) * 0.5 + Math.PI * 0.25;
    mesh.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.8) * 0.15;
  });

  return (
    <mesh ref={mesh}>
      <boxGeometry args={[3, 4, 0.2]} />
      <meshStandardMaterial 
        map={cardTexture}
        wireframe={wireframe}
        roughness={0.3}
        metalness={0.7}
      />
    </mesh>
  );
};

const RotatingCard: React.FC<RotatingCardProps & { className?: string }> = ({ 
  color = '#4a9eff', 
  wireframe = false, 
  autoRotate = true,
  className = ''
}) => {
  return (
    <div className={`relative w-full h-full min-h-[300px] ${className}`}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <CardMesh color={color} wireframe={wireframe} autoRotate={autoRotate} />
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          minPolarAngle={Math.PI / 3} 
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
};

export default RotatingCard;
