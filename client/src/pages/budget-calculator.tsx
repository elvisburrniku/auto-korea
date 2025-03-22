import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Container } from '@/components/ui/container';
import BudgetDashboard from '@/components/budget-dashboard';
import { Car } from '@shared/schema';
import { getQueryFn } from '@/lib/queryClient';
import CarCard from '@/components/car-card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Search, Calculator, ArrowRight } from 'lucide-react';

export default function BudgetCalculatorPage() {
  const [location, navigate] = useLocation();
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  
  // Get car ID from query parameters
  const carIdParam = location.includes('carId=') ? 
    location.split('carId=')[1].split('&')[0] : null;
  
  React.useEffect(() => {
    if (carIdParam) {
      setSelectedCarId(Number(carIdParam));
    }
  }, [carIdParam]);

  // Fetch all cars
  const { data: cars = [] } = useQuery({
    queryKey: ['/api/cars'],
    queryFn: getQueryFn<Car[]>({ on401: 'returnNull' }),
  });
  
  // Find selected car
  const selectedCar = cars.find(car => car.id === selectedCarId) || null;

  const handleCarSelect = (carId: number) => {
    setSelectedCarId(carId);
    // Update URL with the car ID
    navigate(`/budget-calculator?carId=${carId}`);
  };

  return (
    <Container className="py-8">
      <div className="flex flex-col lg:flex-row items-start gap-8">
        <div className="w-full lg:w-1/3 space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Car Budget Calculator
            </h1>
            <p className="text-muted-foreground mb-4">
              Plan your car purchase with our interactive savings calculator.
              Track your progress, calculate loan payments, and visualize your path to car ownership.
            </p>
            
            <div className="bg-muted p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">How to use this tool</h3>
              </div>
              <ol className="list-decimal ml-5 space-y-2 text-sm">
                <li>Select a car from the featured vehicles or enter a custom price</li>
                <li>Set your current savings and monthly contribution amount</li>
                <li>Adjust down payment percentage based on your goals</li>
                <li>Explore different financing options on the Loan Calculator tab</li>
                <li>View your savings projection to see when you'll reach your goal</li>
              </ol>
            </div>
            
            <Separator className="my-6" />
            
            <h2 className="text-xl font-semibold mb-4">Select a Vehicle</h2>
            <div className="space-y-4">
              {cars.slice(0, 5).map((car) => (
                <div 
                  key={car.id} 
                  className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${selectedCarId === car.id ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/30'}`}
                  onClick={() => handleCarSelect(car.id!)}
                >
                  <div className="flex items-center p-3">
                    <div className="flex-shrink-0 w-24 h-20 bg-muted rounded overflow-hidden mr-3">
                      {car.images && car.images.length > 0 ? (
                        <img 
                          src={car.images[0]} 
                          alt={`${car.make} ${car.model}`} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium">{car.year} {car.make} {car.model}</p>
                      <p className="text-lg font-bold">€{car.price.toLocaleString()}</p>
                    </div>
                    {selectedCarId === car.id && (
                      <div className="ml-2">
                        <div className="h-4 w-4 rounded-full bg-primary"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
                onClick={() => navigate('/browse-cars')}
              >
                <Search className="h-4 w-4" />
                Browse More Cars
              </Button>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-2/3 mt-6 lg:mt-0">
          <div className="bg-card rounded-lg shadow-sm p-2">
            {selectedCar && (
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-background rounded-lg overflow-hidden">
                    {selectedCar.images && selectedCar.images.length > 0 ? (
                      <img 
                        src={selectedCar.images[0]} 
                        alt={`${selectedCar.make} ${selectedCar.model}`} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedCar.year} {selectedCar.make} {selectedCar.model}
                    </h3>
                    <p className="text-2xl font-bold">€{selectedCar.price.toLocaleString()}</p>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto flex items-center gap-1 text-primary" 
                      onClick={() => navigate(`/car-detail?id=${selectedCar.id}`)}
                    >
                      View Details <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <BudgetDashboard selectedCar={selectedCar} />
          </div>
        </div>
      </div>
    </Container>
  );
}