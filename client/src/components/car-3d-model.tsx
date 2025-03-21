import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, useTexture, useGLTF, OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Car } from '@shared/schema';

interface CarModelProps {
  car: Car;
  rotation?: boolean;
}

// Simple box-based car model
function SimpleCarModel({ car, rotation = true }: CarModelProps) {
  const group = useRef<THREE.Group>(null);
  
  // Use car type and other properties to determine dimensions
  const getDimensions = () => {
    const type = car.type?.toLowerCase() || 'sedan';
    
    switch (type) {
      case 'suv':
        return { width: 1.8, height: 1.7, length: 4.5 };
      case 'sedan':
        return { width: 1.8, height: 1.4, length: 4.8 };
      case 'coupe':
        return { width: 1.9, height: 1.3, length: 4.5 };
      case 'hatchback':
        return { width: 1.7, height: 1.5, length: 4.2 };
      case 'truck':
        return { width: 2.0, height: 1.9, length: 5.5 };
      default:
        return { width: 1.8, height: 1.4, length: 4.8 };
    }
  };
  
  const { width, height, length } = getDimensions();
  
  // Car color based on the car's color property
  const getCarColor = () => {
    const colorMap: Record<string, string> = {
      'red': '#e53935',
      'blue': '#1e88e5',
      'green': '#43a047',
      'black': '#212121',
      'white': '#f5f5f5',
      'silver': '#bdbdbd',
      'gray': '#757575',
      'yellow': '#fdd835',
      'orange': '#fb8c00',
      'purple': '#8e24aa'
    };
    
    const carColor = car.color?.toLowerCase() || 'silver';
    return colorMap[carColor] || colorMap.silver;
  };
  
  // Add rotation animation
  useFrame((state) => {
    if (rotation && group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <group ref={group}>
      {/* Main car body */}
      <Box args={[width, height * 0.6, length]} position={[0, height * 0.3, 0]}>
        <meshStandardMaterial color={getCarColor()} metalness={0.6} roughness={0.3} />
      </Box>
      
      {/* Car roof */}
      <Box 
        args={[width * 0.8, height * 0.4, length * 0.5]} 
        position={[0, height * 0.8, 0]}
      >
        <meshStandardMaterial color={getCarColor()} metalness={0.7} roughness={0.2} />
      </Box>
      
      {/* Wheels */}
      <Wheel position={[-width/2 - 0.1, height * 0.25, length/3]} />
      <Wheel position={[width/2 + 0.1, height * 0.25, length/3]} />
      <Wheel position={[-width/2 - 0.1, height * 0.25, -length/3]} />
      <Wheel position={[width/2 + 0.1, height * 0.25, -length/3]} />
      
      {/* Windshield */}
      <Box 
        args={[width * 0.78, height * 0.4, 0.05]} 
        position={[0, height * 0.7, length/4 + 0.1]}
        rotation={[Math.PI / 8, 0, 0]}
      >
        <meshStandardMaterial color="#a7c5eb" metalness={0.2} roughness={0.1} transparent opacity={0.8} />
      </Box>
      
      {/* Headlights */}
      <Box args={[width * 0.2, height * 0.1, 0.1]} position={[-width/3, height * 0.4, length/2]}>
        <meshStandardMaterial color="#fffde7" emissive="#fffde7" emissiveIntensity={1} />
      </Box>
      <Box args={[width * 0.2, height * 0.1, 0.1]} position={[width/3, height * 0.4, length/2]}>
        <meshStandardMaterial color="#fffde7" emissive="#fffde7" emissiveIntensity={1} />
      </Box>
    </group>
  );
}

// Wheel component
function Wheel({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} rotation={[Math.PI / 2, 0, 0]} />
      <meshStandardMaterial color="#121212" metalness={0.6} roughness={0.1} />
    </mesh>
  );
}

interface Car3DModelProps {
  car: Car;
  height?: string;
  className?: string;
  controls?: boolean;
  autoRotate?: boolean;
}

export default function Car3DModel({ 
  car, 
  height = "300px", 
  className = "", 
  controls = true,
  autoRotate = true
}: Car3DModelProps) {
  return (
    <div style={{ height, width: '100%' }} className={className}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <PerspectiveCamera makeDefault position={[0, 2, 10]} />
        
        <SimpleCarModel car={car} rotation={autoRotate} />
        
        {controls && <OrbitControls enablePan={false} />}
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}