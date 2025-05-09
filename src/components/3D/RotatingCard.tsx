import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface RotatingCardProps {
  color?: string;
  wireframe?: boolean;
  autoRotate?: boolean;
}

const CardMesh: React.FC<RotatingCardProps> = ({
  color = "#4a9eff",
  wireframe = false,
  autoRotate = true,
}) => {
  const mesh = useRef<THREE.Mesh>(null);
  const textureLoader = new THREE.TextureLoader();
  // Use the uploaded image as a texture
  const cardTexture = textureLoader.load("blockchainCard.png");

  useFrame(({ clock }) => {
    if (!mesh.current || !autoRotate) return;
    // Faster rotation speed (increased from 0.3 to 1.0)
    mesh.current.rotation.y =
      Math.sin(clock.getElapsedTime() * 1.0) * 0.5 + Math.PI * 0.25;
    mesh.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.8) * 0.15;
  });

  return (
    <mesh ref={mesh}>
      <boxGeometry args={[3, 4, 0.2]} />
      <meshStandardMaterial
        map={cardTexture}
        wireframe={wireframe}
        roughness={0.2}
        metalness={0.5}
      />
    </mesh>
  );
};

const RotatingCard: React.FC<RotatingCardProps & { className?: string }> = ({
  color = "#4a9eff",
  wireframe = false,
  autoRotate = true,
  className = "",
}) => {
  return (
    <div className={`relative w-full h-full min-h-[300px] ${className}`}>
      <Canvas camera={{ position: [-5, -5, 6], fov: 45 }}>
        {/* Increased ambient light intensity for overall brightness */}
        <ambientLight intensity={1.2} />

        {/* Increased spotlight intensity and adjusted angle */}
        <spotLight
          position={[5, 5, 5]}
          angle={0.5}
          penumbra={0.5}
          intensity={2.0}
          castShadow
        />

        {/* Added extra point lights for more illumination from different angles */}
        <pointLight position={[-5, -5, -5]} intensity={1.5} />
        <pointLight position={[0, 0, 8]} intensity={1.0} color="#ffffff" />
        <pointLight position={[0, 5, 0]} intensity={0.8} color="#eee" />

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
