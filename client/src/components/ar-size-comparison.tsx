import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Container } from '@/components/ui/container';
import { 
  Car,
  CarFilter
} from '@shared/schema';
import { useIsMobile } from '@/hooks/use-mobile';
import CarCard from '@/components/car-card';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { isARReady, initialize, cleanupARScene } from '@/lib/ar-core';

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

// Get scale factor based on inferred car type
const getCarScale = (car: Car) => {
  const carType = inferCarType(car);
  
  switch(carType) {
    case 'suv': return 1.5;
    case 'sedan': return 1.0;
    case 'coupe': return 0.9;
    case 'hatchback': return 0.8;
    case 'truck': return 1.8;
    default: return 1.0;
  }
};

export default function ARSizeComparison() {
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [carScale, setCarScale] = useState<number>(1);
  const [isARMode, setIsARMode] = useState<boolean>(false);
  const webcamRef = useRef<Webcam>(null);
  const arContainerRef = useRef<HTMLDivElement>(null);
  const carOutlineRef = useRef<HTMLDivElement>(null);
  const [_, navigate] = useLocation();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Fetch cars
  useEffect(() => {
    const fetchCars = async () => {
      try {
        console.log('Fetching cars for AR comparison...');
        const response = await apiRequest({
          url: '/api/cars',
          method: 'GET',
          params: {},
        });
        
        if (!response || !Array.isArray(response) || response.length === 0) {
          console.error('API returned empty car list or invalid format');
          toast({
            title: 'Error',
            description: 'No cars available for comparison. Please try again later.',
            variant: 'destructive',
          });
          return;
        }
        
        console.log(`Successfully loaded ${response.length} cars`);
        setCars(response as Car[]);
      } catch (error) {
        console.error('Error fetching cars:', error);
        toast({
          title: 'Error',
          description: 'Failed to load cars. Please try again later.',
          variant: 'destructive',
        });
      }
    };

    fetchCars();
  }, [toast]);

  // Handle car selection
  const handleSelectCar = (car: Car) => {
    setSelectedCar(car);
    // Set initial scale based on car type
    setCarScale(getCarScale(car));
  };

  // Toggle AR mode
  const toggleARMode = async () => {
    if (!selectedCar) {
      toast({
        title: 'Select a car',
        description: 'Please select a car before entering AR mode',
        variant: 'default',
      });
      return;
    }

    if (!isARMode) {
      console.log('Entering AR mode...');
      
      // Check if browser supports camera/webcam
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Browser does not support getUserMedia');
        toast({
          title: 'Not supported',
          description: 'Your browser does not support camera access for AR',
          variant: 'destructive',
        });
        return;
      }

      try {
        // First request camera permission before trying to initialize AR
        console.log('Requesting camera permission...');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Stop the stream as it will be used by the webcam component
        stream.getTracks().forEach(track => track.stop());
        console.log('Camera permission granted');
      } catch (error) {
        console.error('Camera permission error:', error);
        toast({
          title: 'Camera Access Denied',
          description: 'Please allow camera access to use AR features',
          variant: 'destructive',
        });
        return;
      }
      
      try {
        // Now try to initialize AR components with our new direct script loading approach
        console.log('Initializing AR libraries...');
        const success = await initialize();
        
        if (!success) {
          console.error('Failed to initialize AR components');
          toast({
            title: 'AR Not Ready',
            description: 'Could not initialize AR components',
            variant: 'destructive',
          });
          return;
        }
        
        console.log('AR initialization successful');
      } catch (error) {
        console.error('Error initializing AR:', error);
        toast({
          title: 'AR Error',
          description: 'Failed to initialize AR components',
          variant: 'destructive',
        });
        return;
      }
    } else {
      // When exiting AR mode, clean up any AR scene elements
      console.log('Exiting AR mode, cleaning up...');
      cleanupARScene();
    }

    console.log(`Toggling AR mode from ${isARMode} to ${!isARMode}`);
    setIsARMode(!isARMode);
  };

  // Update car size based on scale
  useEffect(() => {
    if (carOutlineRef.current && selectedCar) {
      // Base width in pixels (adjust as needed)
      const baseWidth = 150;
      const width = baseWidth * carScale;
      
      // Aspect ratio estimates based on inferred car type
      const carType = inferCarType(selectedCar);
      let aspectRatio;
      
      switch(carType) {
        case 'suv': aspectRatio = 0.6; break; // taller
        case 'sedan': aspectRatio = 0.45; break;
        case 'coupe': aspectRatio = 0.4; break;
        case 'hatchback': aspectRatio = 0.5; break;
        case 'truck': aspectRatio = 0.65; break;
        default: aspectRatio = 0.45;
      }
      
      const height = width * aspectRatio;
      
      carOutlineRef.current.style.width = `${width}px`;
      carOutlineRef.current.style.height = `${height}px`;
    }
  }, [carScale, selectedCar]);

  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold mb-6">AR Car Size Comparison</h1>
      
      {!isARMode ? (
        <div className="space-y-6">
          <p className="text-lg">
            Select a car and use AR mode to visualize its size in your environment
          </p>
          
          {selectedCar ? (
            <Card className="p-4 border-2 border-primary">
              <h2 className="text-xl font-semibold">Selected Car</h2>
              <CarCard car={selectedCar} size="small" />
              
              <div className="mt-4">
                <div className="flex items-center gap-4 mb-2">
                  <span className="min-w-[100px]">Size Scale:</span>
                  <Slider
                    value={[carScale]}
                    min={0.5}
                    max={2}
                    step={0.1}
                    onValueChange={(value) => setCarScale(value[0])}
                    className="w-full"
                  />
                  <span className="min-w-[40px]">{carScale.toFixed(1)}x</span>
                </div>
              </div>
            </Card>
          ) : (
            <p className="italic text-muted-foreground">No car selected</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {cars.map((car) => (
              <div
                key={car.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-lg",
                  selectedCar?.id === car.id && "ring-2 ring-primary"
                )}
                onClick={() => handleSelectCar(car)}
              >
                <CarCard car={car} size="small" />
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <Button 
              size="lg" 
              onClick={toggleARMode}
              disabled={!selectedCar}
            >
              Enter AR Mode
            </Button>
          </div>
        </div>
      ) : (
        <div className="ar-mode-container">
          <div className="relative overflow-hidden rounded-lg" ref={arContainerRef}>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: isMobile ? "environment" : "user"
              }}
              className="w-full rounded-lg"
              style={{
                height: "calc(100vh - 250px)",
                objectFit: "cover"
              }}
            />
            
            <div
              ref={carOutlineRef}
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-primary rounded-md bg-primary/20"
              style={{
                width: "150px",
                height: "70px", 
                touchAction: "none",
                cursor: "move",
              }}
              draggable="true"
            >
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-semibold">
                {selectedCar?.make} {selectedCar?.model}
              </div>
            </div>
          </div>
          
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-4">
              <span>Size:</span>
              <Slider
                value={[carScale]}
                min={0.5}
                max={3}
                step={0.1}
                onValueChange={(value) => setCarScale(value[0])}
                className="flex-1"
              />
              <span>{carScale.toFixed(1)}x</span>
            </div>
            
            <div className="flex justify-center gap-4 mt-4">
              <Button onClick={toggleARMode} variant="outline">
                Exit AR Mode
              </Button>
              {isMobile && (
                <Button
                  onClick={() => {
                    if (webcamRef.current && webcamRef.current.video) {
                      // Stop all tracks before switching camera
                      if (webcamRef.current.video.srcObject) {
                        const stream = webcamRef.current.video.srcObject as MediaStream;
                        if (stream) {
                          stream.getTracks().forEach(track => track.stop());
                        }
                      }
                      
                      // Clear the current video stream
                      webcamRef.current.video.srcObject = null;
                      
                      // Force a remount of the Webcam component by toggling a flag
                      setIsARMode(false);
                      setTimeout(() => {
                        setIsARMode(true);
                      }, 100);
                    }
                  }}
                  variant="outline"
                >
                  Switch Camera
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}