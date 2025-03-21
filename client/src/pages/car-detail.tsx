import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, CheckCircle, User, Phone } from "lucide-react";
import { Car } from "@shared/schema";
import { Container } from "@/components/ui/container";
import CarGallery from "@/components/car-gallery";
import { WhatsAppButton } from "@/components/whatsapp-button";
import InquiryForm from "@/components/inquiry-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useFavorites } from '../lib/useFavorites';
import { useToast } from '@/hooks/use-toast';


export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const carId = parseInt(id);

  const { data: car, isLoading, error } = useQuery<Car>({
    queryKey: [`/api/cars/${carId}`],
    enabled: !isNaN(carId),
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatNumberWithCommas = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const { toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();

  if (isNaN(carId)) {
    return (
      <Container className="py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-xl font-bold text-red-700 mb-2">Invalid Car ID</h1>
          <p className="text-red-600 mb-4">The car ID provided is not valid.</p>
          <Button asChild>
            <Link href="/browse-cars">Browse All Cars</Link>
          </Button>
        </div>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container className="py-12">
        <div className="animate-pulse">
          <div className="mb-6">
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-gray-200 rounded-lg h-96 mb-4"></div>
              <div className="grid grid-cols-5 gap-2">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>

              <div className="mt-8">
                <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
                    <div className="space-y-2">
                      {Array(7).fill(0).map((_, i) => (
                        <div key={i} className="flex justify-between">
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                          <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
                    <div className="space-y-2">
                      {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="flex justify-between">
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                          <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
                <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
                <div className="h-5 w-32 bg-gray-200 rounded mb-4"></div>

                <div className="border-t border-b border-neutral-200 py-4 my-4">
                  <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-3"></div>
                    <div>
                      <div className="h-5 w-24 bg-gray-200 rounded"></div>
                      <div className="h-4 w-32 bg-gray-200 rounded mt-1"></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded-md"></div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <div className="h-5 w-32 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 rounded-md"></div>
                    ))}
                    <div className="h-32 bg-gray-200 rounded-md"></div>
                    <div className="h-12 bg-gray-200 rounded-md"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (error || !car) {
    return (
      <Container className="py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-xl font-bold text-red-700 mb-2">Car Not Found</h1>
          <p className="text-red-600 mb-4">We couldn't find the car you're looking for. It may have been removed or sold.</p>
          <Button asChild>
            <Link href="/browse-cars">Browse All Cars</Link>
          </Button>
        </div>
      </Container>
    );
  }

  const whatsappMessage = encodeURIComponent(`I'm interested in your ${car.year} ${car.make} ${car.model} listed for ${formatPrice(car.price)}`);

  return (
    <Container className="py-12">
      <div className="mb-6">
        <Link href="/browse-cars" className="text-primary hover:text-primary-dark font-medium flex items-center">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Listings
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <CarGallery 
            images={car.images} 
            alt={`${car.make} ${car.model}`}
          />

          <div className="mt-8">
            <h3 className="text-xl font-bold text-neutral-800 mb-4">Vehicle Specifications</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <h4 className="font-medium text-neutral-500 mb-1">Basic Information</h4>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-neutral-500">Make</span>
                    <span className="font-medium">{car.make}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-neutral-500">Model</span>
                    <span className="font-medium">{car.model}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-neutral-500">Year</span>
                    <span className="font-medium">{car.year}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-neutral-500">Mileage</span>
                    <span className="font-medium">{formatNumberWithCommas(car.mileage)} miles</span>
                  </li>
                  {car.vin && (
                    <li className="flex justify-between">
                      <span className="text-neutral-500">VIN</span>
                      <span className="font-medium">{car.vin}</span>
                    </li>
                  )}
                  <li className="flex justify-between">
                    <span className="text-neutral-500">Exterior Color</span>
                    <span className="font-medium">{car.exteriorColor}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-neutral-500">Interior Color</span>
                    <span className="font-medium">{car.interiorColor}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-neutral-50 p-4 rounded-lg">
                <h4 className="font-medium text-neutral-500 mb-1">Performance</h4>
                <ul className="space-y-2">
                  {car.engineDetails && (
                    <li className="flex justify-between">
                      <span className="text-neutral-500">Engine</span>
                      <span className="font-medium">{car.engineDetails}</span>
                    </li>
                  )}
                  <li className="flex justify-between">
                    <span className="text-neutral-500">Transmission</span>
                    <span className="font-medium">{car.transmission}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-neutral-500">Drivetrain</span>
                    <span className="font-medium">{car.drivetrain}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-neutral-500">Fuel Type</span>
                    <span className="font-medium">{car.fuelType}</span>
                  </li>
                  {car.mpg && (
                    <li className="flex justify-between">
                      <span className="text-neutral-500">MPG</span>
                      <span className="font-medium">{car.mpg}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {car.features && car.features.length > 0 && (
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <h4 className="font-medium text-neutral-500 mb-1">Features & Options</h4>
                  <ul className="grid grid-cols-2 gap-y-2">
                    {car.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="text-primary mr-2 h-4 w-4" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {car.description && (
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <h4 className="font-medium text-neutral-500 mb-1">Description</h4>
                  <p className="text-neutral-700">{car.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm sticky top-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-neutral-800">{car.make} {car.model}</h1>
                <p className="text-neutral-500">{car.year} • {formatNumberWithCommas(car.mileage)} miles • {car.transmission}</p>
              </div>
              <span className="text-2xl font-bold text-primary">{formatPrice(car.price)}</span>
            </div>

            <div className="border-t border-b border-neutral-200 py-4 my-4">
              <h4 className="font-medium text-neutral-800 mb-2">Seller Information</h4>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-neutral-200 rounded-full overflow-hidden mr-3 flex items-center justify-center">
                  <User className="h-8 w-8 text-neutral-400" />
                </div>
                <div>
                  <p className="font-medium">{car.sellerName}</p>
                  {car.sellerSince && (
                    <p className="text-sm text-neutral-500">Member since {car.sellerSince}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <WhatsAppButton 
                phoneNumber={car.sellerPhone} 
                message={whatsappMessage}
                size="large" 
                className="w-full" 
              />

              <a 
                href={`tel:${car.sellerPhone}`} 
                className="block w-full px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md font-medium text-center flex justify-center items-center"
              >
                <Phone className="text-xl mr-2 h-5 w-5" />
                Call Seller
              </a>

              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={() => {
                  toggleFavorite(car.id);
                  toast({
                    title: isFavorite(car.id) ? "Removed from favorites" : "Added to favorites",
                    description: isFavorite(car.id) 
                      ? `${car.year} ${car.make} ${car.model} removed from favorites`
                      : `${car.year} ${car.make} ${car.model} added to favorites`
                  });
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                Save to Favorites
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200">
              <h4 className="font-medium text-neutral-800 mb-4">Send a Message</h4>
              <InquiryForm carId={car.id} carName={`${car.year} ${car.make} ${car.model}`} />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}