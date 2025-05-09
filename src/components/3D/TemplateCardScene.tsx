import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Float } from "@react-three/drei";
import * as THREE from "three";

interface TemplateCardSceneProps {
  title: string;
  color?: string;
  hoverEffect?: boolean;
}

const CardMesh: React.FC<TemplateCardSceneProps> = ({
  title,
  color = "#8B5CF6",
  hoverEffect = true,
}) => {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.1;
    group.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={mesh} castShadow receiveShadow>
          <boxGeometry args={[3, 4, 0.2]} />
          <meshStandardMaterial
            color={color}
            roughness={0.2}
            metalness={0.6}
            emissive={color}
            emissiveIntensity={0.3}
          />
        </mesh>

        <Text
          position={[0, 0, 0.11]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.5}
          lineHeight={1.2}
        >
          {title}
        </Text>

        {/* Add decorative elements */}
        <mesh position={[0, 1.5, 0.11]}>
          <circleGeometry args={[0.3, 32]} />
          <meshBasicMaterial color="white" opacity={0.3} transparent />
        </mesh>

        <mesh position={[0, -1.5, 0.11]}>
          <planeGeometry args={[2, 0.6]} />
          <meshBasicMaterial color="white" opacity={0.2} transparent />
        </mesh>
      </Float>
    </group>
  );
};

const TemplateCardScene: React.FC<
  TemplateCardSceneProps & { className?: string }
> = ({ title, color = "#8B5CF6", hoverEffect = true, className = "" }) => {
  return (
    <div className={`relative w-full h-full min-h-[300px] ${className}`}>
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
        {/* Enhanced lighting for better visibility */}
        <ambientLight intensity={1.2} />

        {/* Adjusted spotlight for brighter illumination */}
        <spotLight
          position={[5, 5, 5]}
          angle={0.5}
          penumbra={0.5}
          intensity={2.0}
          castShadow
        />

        {/* Additional point lights for better illumination */}
        <pointLight position={[-5, -5, -5]} intensity={1.5} />
        <pointLight position={[0, 0, 8]} intensity={0.8} color="#ffffff" />

        {/* The 3D Card Mesh */}
        <CardMesh title={title} color={color} hoverEffect={hoverEffect} />

        {/* Orbit Controls */}
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

export default TemplateCardScene;
