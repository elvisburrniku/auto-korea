import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Car } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// Import from centralized AR core module
import { HTMLAFrameSceneElement, cleanupARScene, isARReady, initialize } from '@/lib/ar-core';

interface ARViewProps {
  car: Car;
  onClose: () => void;
}

export default function ARView({ car, onClose }: ARViewProps) {
  const sceneRef = useRef<HTMLAFrameSceneElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    
    // Initialize AR and check camera permissions
    async function setupAR() {
      try {
        setIsLoading(true);
        
        // Dynamically initialize AR libraries
        const success = await initialize();
        
        if (!mounted) return;
        
        if (!success) {
          setError('Failed to initialize AR components');
          console.error('AR initialization failed');
          return;
        }
        
        // Check if camera is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError('Your browser does not support camera access');
          return;
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        if (stream && mounted) {
          setHasPermission(true);
          // Stop the stream since A-Frame will request it separately
          stream.getTracks().forEach(track => track.stop());
        }
        
      } catch (err) {
        console.error('AR setup error:', err);
        if (mounted) {
          setError('Camera permission denied');
          toast({
            title: 'Camera Access Denied',
            description: 'Please grant camera permission to use AR features',
            variant: 'destructive',
          });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    setupAR();

    // Clean up
    return () => {
      mounted = false;
      // Use our centralized cleanup function
      cleanupARScene();
    };
  }, [toast]);

  // Determine car type based on make/model and drivetrain
  const inferCarType = (car: Car): 'suv' | 'sedan' | 'coupe' | 'hatchback' | 'truck' | 'other' => {
    const makeModel = `${car.make} ${car.model}`.toLowerCase();
    
    // Check for SUVs (based on common keywords or drivetrain)
    if (
      makeModel.includes('suv') || 
      makeModel.includes('crossover') ||
      makeModel.includes('navigator') ||
      makeModel.includes('expedition') ||
      makeModel.includes('escalade') ||
      makeModel.includes('suburban') ||
      makeModel.includes('tahoe') ||
      makeModel.includes('highlander') ||
      makeModel.includes('4runner') ||
      makeModel.includes('land cruiser') ||
      makeModel.includes('range rover') ||
      makeModel.includes('discovery') ||
      makeModel.includes('cherokee') ||
      makeModel.includes('explorer') ||
      makeModel.includes('blazer') ||
      makeModel.includes('pilot') ||
      makeModel.includes('pathfinder') ||
      makeModel.includes('armada') ||
      (car.drivetrain === 'AWD' || car.drivetrain === '4WD')
    ) {
      return 'suv';
    }
    
    // Check for trucks
    if (
      makeModel.includes('truck') ||
      makeModel.includes('pickup') ||
      makeModel.includes('f-150') ||
      makeModel.includes('silverado') ||
      makeModel.includes('sierra') ||
      makeModel.includes('ram') ||
      makeModel.includes('tundra') ||
      makeModel.includes('tacoma') ||
      makeModel.includes('frontier') ||
      makeModel.includes('ridgeline') ||
      makeModel.includes('colorado') ||
      makeModel.includes('canyon')
    ) {
      return 'truck';
    }
    
    // Check for coupes
    if (
      makeModel.includes('coupe') ||
      makeModel.includes('convertible') ||
      makeModel.includes('mustang') ||
      makeModel.includes('camaro') ||
      makeModel.includes('challenger') ||
      makeModel.includes('corvette') ||
      makeModel.includes('86') ||
      makeModel.includes('brz') ||
      makeModel.includes('miata') ||
      makeModel.includes('mx-5') ||
      makeModel.includes('z4') ||
      makeModel.includes('cayman') ||
      makeModel.includes('boxster')
    ) {
      return 'coupe';
    }
    
    // Check for hatchbacks
    if (
      makeModel.includes('hatchback') ||
      makeModel.includes('hatch') ||
      makeModel.includes('golf') ||
      makeModel.includes('fit') ||
      makeModel.includes('yaris') ||
      makeModel.includes('veloster') ||
      makeModel.includes('civic hatch') ||
      makeModel.includes('mazda3') ||
      makeModel.includes('impreza') ||
      makeModel.includes('soul') ||
      makeModel.includes('prius')
    ) {
      return 'hatchback';
    }
    
    // Default to sedan
    return 'sedan';
  };

  // Generate a car model based on inferred car type
  const getCarModel = () => {
    let scale = '1 1 1';
    // Use exterior color for the model, default to gray
    let color = car.exteriorColor?.toLowerCase() || 'gray';
    
    // Set scale based on inferred car type
    const carType = inferCarType(car);
    
    switch (carType) {
      case 'suv': 
        scale = '1.5 1.2 3';
        break;
      case 'sedan': 
        scale = '1.3 0.8 3';
        break;
      case 'coupe': 
        scale = '1.2 0.7 2.5';
        break;
      case 'hatchback': 
        scale = '1.2 1 2.5';
        break;
      case 'truck': 
        scale = '1.6 1.3 4';
        break;
      default:
        scale = '1.3 0.8 3';
    }
    
    return { scale, color };
  };

  const { scale, color } = getCarModel();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="mt-4">Initializing AR view...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="bg-destructive/20 rounded-full p-6 mb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-destructive"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">AR Not Available</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={onClose}>Go Back</Button>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="bg-warning/20 rounded-full p-6 mb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-warning"
          >
            <path d="M12 9v4" />
            <path d="M12 16h.01" />
            <path d="M3.8 15.8c-1.3-2.3-1.3-5.3 0-7.6C5.1 5.9 7.4 4.2 10 4m4 0c2.6.2 4.9 1.9 6.2 4.2c1.3 2.3 1.3 5.3 0 7.6c-1.3 2.3-3.6 4-6.2 4.2" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Camera Permission Required</h2>
        <p className="text-muted-foreground mb-6">Please allow camera access to use AR features</p>
        <Button onClick={onClose}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="relative h-[80vh] overflow-hidden">
      {/* A-Frame Scene */}
      <a-scene
        ref={sceneRef}
        embedded
        arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
        vr-mode-ui="enabled: false"
        renderer="logarithmicDepthBuffer: true;"
        className="w-full h-full"
      >
        {/* Camera marker component for AR.js */}
        <a-marker preset="hiro">
          {/* Car box model - simplified representation */}
          <a-box 
            position="0 0.5 0" 
            scale={scale} 
            color={color} 
            opacity="0.9"
            animation="property: rotation; to: 0 360 0; loop: true; dur: 10000; easing: linear"
          ></a-box>
          
          {/* Car name text */}
          <a-text 
            value={`${car.make} ${car.model}`}
            position="0 1.5 0" 
            color="white" 
            align="center"
            scale="1 1 1"
          ></a-text>
          
          {/* Car floor shadow */}
          <a-plane 
            position="0 0 0" 
            rotation="-90 0 0" 
            width="4" 
            height="4" 
            color="#CCCCCC" 
            opacity="0.5"
          ></a-plane>
        </a-marker>

        {/* Camera */}
        <a-entity camera></a-entity>
      </a-scene>

      {/* Overlay controls */}
      <div className="absolute top-4 left-0 right-0 flex justify-center">
        <Badge variant="outline" className="bg-background/80 px-4 py-2">
          {car.make} {car.model} - AR View
        </Badge>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <div className="bg-background/80 p-4 rounded-md">
          <p className="text-center mb-2 font-semibold">Point camera at a flat surface</p>
          <p className="text-sm text-center mb-4">Show the HIRO marker (or tap on screen) to place the car</p>
          <Button onClick={onClose} size="lg">
            Exit AR View
          </Button>
        </div>
      </div>
    </div>
  );
}