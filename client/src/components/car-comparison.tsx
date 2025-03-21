import React, { useState } from 'react';
import { Car } from '@shared/schema';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { X, PlusCircle, ArrowLeftRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { WhatsAppButton } from './whatsapp-button';
import { useToast } from '@/hooks/use-toast';
import { getQueryFn, apiRequest } from '@/lib/queryClient';
import { useFavorites } from '@/lib/useFavorites';

export default function CarComparison() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [selectedCars, setSelectedCars] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Get all cars for selection
  const { data: allCars = [], isLoading } = useQuery<Car[]>({
    queryKey: ['/api/cars'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  // Get favorites from local storage
  const { favorites, toggleFavorite } = useFavorites();

  // Filter cars by search term
  const filteredCars = searchTerm
    ? allCars.filter((car: Car) =>
        `${car.make} ${car.model} ${car.year}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : allCars;

  // Add a car to comparison
  const addToComparison = (car: Car) => {
    if (selectedCars.length >= 3) {
      toast({
        title: 'Maximum cars reached',
        description: 'You can compare up to 3 cars at a time',
        variant: 'destructive',
      });
      return;
    }
    
    if (selectedCars.some(c => c.id === car.id)) {
      toast({
        title: 'Car already added',
        description: 'This car is already in your comparison',
        variant: 'destructive',
      });
      return;
    }
    
    setSelectedCars([...selectedCars, car]);
  };

  // Remove a car from comparison
  const removeFromComparison = (carId: number) => {
    setSelectedCars(selectedCars.filter(car => car.id !== carId));
  };

  // Clear all cars from comparison
  const clearComparison = () => {
    setSelectedCars([]);
  };

  // Generate a WhatsApp message with comparison details
  const generateWhatsAppMessage = () => {
    const compareUrl = window.location.href;
    const carNames = selectedCars.map(car => `${car.year} ${car.make} ${car.model}`).join(', ');
    
    return `I'm interested in comparing these vehicles: ${carNames}. Please provide more information.`;
  };

  // Card view for mobile
  const renderMobileView = () => (
    <div className="space-y-4">
      {selectedCars.map((car) => (
        <Card key={car.id} className="relative p-4">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2"
            onClick={() => removeFromComparison(car.id)}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex flex-col items-center">
            <img
              src={car.images[0]}
              alt={`${car.make} ${car.model}`}
              className="h-32 object-contain mb-4"
            />
            <h3 className="text-lg font-bold">{car.year} {car.make} {car.model}</h3>
            <p className="text-xl font-bold text-primary">${car.price.toLocaleString()}</p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mileage:</span>
              <span>{car.mileage.toLocaleString()} miles</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fuel Type:</span>
              <span>{car.fuelType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transmission:</span>
              <span>{car.transmission}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Color:</span>
              <span>{car.exteriorColor}</span>
            </div>
          </div>
        </Card>
      ))}
      
      {selectedCars.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Select cars to compare</p>
        </div>
      )}
    </div>
  );
  
  // Table view for desktop
  const renderDesktopView = () => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Feature</TableHead>
            {selectedCars.map((car) => (
              <TableHead key={car.id} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={() => removeFromComparison(car.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="flex flex-col items-center pt-8">
                  <img
                    src={car.images[0]}
                    alt={`${car.make} ${car.model}`}
                    className="h-24 object-contain mb-2"
                  />
                  <h3 className="text-base font-bold">{car.year} {car.make} {car.model}</h3>
                  <p className="text-lg font-bold text-primary">${car.price.toLocaleString()}</p>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Mileage</TableCell>
            {selectedCars.map((car) => (
              <TableCell key={car.id}>{car.mileage.toLocaleString()} miles</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Year</TableCell>
            {selectedCars.map((car) => (
              <TableCell key={car.id}>{car.year}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Fuel Type</TableCell>
            {selectedCars.map((car) => (
              <TableCell key={car.id}>{car.fuelType}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Transmission</TableCell>
            {selectedCars.map((car) => (
              <TableCell key={car.id}>{car.transmission}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Drivetrain</TableCell>
            {selectedCars.map((car) => (
              <TableCell key={car.id}>{car.drivetrain}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Exterior Color</TableCell>
            {selectedCars.map((car) => (
              <TableCell key={car.id}>{car.exteriorColor}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Interior Color</TableCell>
            {selectedCars.map((car) => (
              <TableCell key={car.id}>{car.interiorColor}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">MPG</TableCell>
            {selectedCars.map((car) => (
              <TableCell key={car.id}>{car.mpg || 'N/A'}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Engine</TableCell>
            {selectedCars.map((car) => (
              <TableCell key={car.id}>{car.engineDetails || 'N/A'}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Contact</TableCell>
            {selectedCars.map((car) => (
              <TableCell key={car.id}>
                <Button
                  onClick={() => window.open(`https://wa.me/${car.sellerPhone}?text=${encodeURIComponent(`I'm interested in the ${car.year} ${car.make} ${car.model}`)}`, '_blank')}
                  size="sm"
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                  </svg>
                  Contact
                </Button>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
      
      {selectedCars.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Select cars to compare</p>
        </div>
      )}
    </div>
  );

  // Search and selection section
  const renderCarSelection = () => (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-2">Choose Cars to Compare</h3>
      
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search by make, model, or year..."
          className="w-full p-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {filteredCars.slice(0, 9).map((car: Car) => (
          <Card key={car.id} className="p-4 relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2"
              onClick={() => toggleFavorite(car.id)}
            >
              {favorites.includes(car.id) ? '❤️' : '🤍'}
            </Button>
            
            <div className="flex items-center gap-4">
              <img
                src={car.images[0]}
                alt={`${car.make} ${car.model}`}
                className="h-16 w-16 object-contain"
              />
              <div className="flex-1">
                <h4 className="font-medium">{car.year} {car.make} {car.model}</h4>
                <p className="text-sm text-muted-foreground">
                  {car.mileage.toLocaleString()} miles • {car.fuelType}
                </p>
                <p className="font-bold text-primary">${car.price.toLocaleString()}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addToComparison(car)}
                disabled={selectedCars.some(c => c.id === car.id)}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Compare
              </Button>
            </div>
          </Card>
        ))}
      </div>
      
      {isLoading && (
        <div className="text-center py-4">
          <p>Loading cars...</p>
        </div>
      )}
      
      {!isLoading && filteredCars.length === 0 && (
        <div className="text-center py-4">
          <p>No cars found matching your search</p>
        </div>
      )}
    </div>
  );

  return (
    <Container className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Compare Cars</h2>
        {selectedCars.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearComparison}>
              Clear All
            </Button>
            {selectedCars.length >= 2 && (
              <Button 
                onClick={() => window.open(`https://wa.me/123456789?text=${encodeURIComponent(generateWhatsAppMessage())}`, '_blank')}
                className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Ask About Comparison
              </Button>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-muted rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ArrowLeftRight className="h-5 w-5" />
          <p className="text-sm">
            Select up to 3 cars to compare their features side by side.
          </p>
        </div>
      </div>
      
      {/* Display the comparison */}
      {isMobile ? renderMobileView() : renderDesktopView()}
      
      {/* Car selection section */}
      {renderCarSelection()}
    </Container>
  );
}