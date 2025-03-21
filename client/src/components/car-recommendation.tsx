import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Car } from "@shared/schema";

interface CarRecommendationProps {
  carId: number;
  className?: string;
}

export default function CarRecommendation({ carId, className = "" }: CarRecommendationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [_, setLocation] = useLocation();
  
  // Fetch similar cars
  const { data: similarCars, isLoading } = useQuery({
    queryKey: ['/api/cars', carId, 'similar'],
    queryFn: async () => {
      const res = await fetch(`/api/cars/${carId}/similar`);
      if (!res.ok) throw new Error('Failed to fetch similar cars');
      return res.json() as Promise<Car[]>;
    },
    enabled: !!carId,
  });

  // Open recommendation popup after a delay
  useEffect(() => {
    // Only show the popup if we have similar cars to recommend
    if (similarCars && similarCars.length > 0) {
      const timer = setTimeout(() => setIsOpen(true), 3000); // 3 seconds delay
      return () => clearTimeout(timer);
    }
  }, [similarCars]);

  // If no similar cars, don't render the component
  if (!similarCars || similarCars.length === 0) {
    return null;
  }

  // Format price to display as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Format number to include commas for thousands
  const formatNumberWithCommas = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn("fixed bottom-5 right-5 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 z-50", className)}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-neutral-800">You might also like</h3>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6" 
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {similarCars.slice(0, 2).map((car) => (
                <div 
                  key={car.id} 
                  className="flex bg-neutral-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setLocation(`/cars/${car.id}`);
                    setIsOpen(false);
                  }}
                >
                  <div className="w-20 h-20 flex-shrink-0">
                    <img 
                      src={car.images[0]} 
                      alt={`${car.make} ${car.model}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center p-2 flex-1">
                    <h4 className="font-medium text-sm">{car.make} {car.model}</h4>
                    <p className="text-xs text-neutral-500">{car.year} • {formatNumberWithCommas(car.mileage)} miles</p>
                    <p className="text-sm font-semibold text-primary">{formatPrice(car.price)}</p>
                  </div>
                  <div className="flex items-center pr-2">
                    <ArrowRight className="h-4 w-4 text-neutral-400" />
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              variant="link" 
              className="mt-2 w-full text-primary"
              onClick={() => {
                setLocation('/browse-cars');
                setIsOpen(false);
              }}
            >
              View all similar cars
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}