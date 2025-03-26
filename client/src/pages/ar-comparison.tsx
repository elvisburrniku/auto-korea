import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Container } from '@/components/ui/container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ARSizeComparison from '@/components/ar-size-comparison';
import ARView from '@/components/ar-view';
import { Car } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import CarCard from '@/components/car-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { isARReady } from '@/lib/ar-core';

export default function ARComparisonPage() {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [showARView, setShowARView] = useState(false);
  const [defaultTab, setDefaultTab] = useState("simple");
  const { toast } = useToast();
  
  const { data: cars, isLoading, error } = useQuery({
    queryKey: ['/api/cars/no-filter/all'],
    queryFn: async () => {
      console.log('Fetching cars for AR comparison...');
      const response = await fetch('/api/cars/no-filter/all');
      if (!response.ok) {
        throw new Error('Failed to fetch cars');
      }
      const data = await response.json();
      console.log('Successfully loaded', data.length, 'cars');
      return data as Car[];
    },
  });
  
  // Check URL parameters for car ID to pre-select
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const carId = searchParams.get('carId');
    
    if (carId && cars) {
      const car = cars.cars.find(c => c.id === parseInt(carId));
      if (car) {
        setSelectedCar(car);
        setDefaultTab("advanced");
      }
    }
  }, [cars]);

  const handleSelectCar = (car: Car) => {
    setSelectedCar(car);
  };

  const handleStartAR = () => {
    if (!selectedCar) {
      toast({
        title: 'Select a car',
        description: 'Please select a car before starting AR mode',
        variant: 'default',
      });
      return;
    }
    
    // Check if browser supports WebXR or AR features using our centralized module
    const xrSupported = 'xr' in navigator;
    const arJsSupported = isARReady();
    
    if (!xrSupported && !arJsSupported) {
      toast({
        title: 'AR Not Supported',
        description: 'Your browser does not support AR features. Try using Chrome or Safari.',
        variant: 'destructive',
      });
      return;
    }
    
    setShowARView(true);
  };

  const handleCloseAR = () => {
    setShowARView(false);
  };

  if (showARView && selectedCar) {
    return <ARView car={selectedCar} onClose={handleCloseAR} />;
  }

  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold mb-2">Car Size Comparison Tool</h1>
      <p className="text-muted-foreground mb-6">
        Visualize cars with interactive tools to better understand their size and appearance
      </p>

      <Tabs defaultValue={defaultTab} value={defaultTab} onValueChange={setDefaultTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="simple">Camera Visualization</TabsTrigger>
          <TabsTrigger value="advanced">3D Model View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="simple">
          <ARSizeComparison />
        </TabsContent>
        
        <TabsContent value="advanced">
          <div className="space-y-6">
            <div className="p-4 bg-muted rounded-lg">
              <h2 className="text-xl font-semibold mb-2">3D Model Viewer</h2>
              <p>
                This feature allows you to view a 3D model of your selected car.
                Select a car below and click "View 3D Model" to begin.
              </p>
              
              {selectedCar && (
                <div className="mt-4 p-4 border-2 border-primary rounded-lg">
                  <h3 className="font-medium mb-2">Selected Car</h3>
                  <CarCard car={selectedCar} size="small" />
                </div>
              )}
              
              <div className="mt-6 flex justify-center">
                <Button 
                  size="lg" 
                  onClick={handleStartAR}
                  disabled={!selectedCar}
                >
                  View 3D Model
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Select a Car for 3D View</h3>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="rounded-lg overflow-hidden border">
                      <Skeleton className="h-48 w-full" />
                      <div className="p-4">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="p-8 text-center text-destructive">
                  <p>Failed to load cars. Please try again.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cars && cars.map(car => (
                    <div 
                      key={car.id}
                      onClick={() => handleSelectCar(car)}
                      className={`cursor-pointer transition-all border rounded-lg overflow-hidden hover:shadow-md ${
                        selectedCar?.id === car.id ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <CarCard car={car} size="small" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Container>
  );
}