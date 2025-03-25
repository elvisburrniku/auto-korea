import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, CheckCircle, User, Phone, View, Calculator } from "lucide-react";
import { Car } from "@shared/schema";
import { Container } from "@/components/ui/container";
import CarGallery from "@/components/car-gallery";
import { WhatsAppButton } from "@/components/whatsapp-button";
import InquiryForm from "@/components/inquiry-form";
import AddToWishlist from "@/components/add-to-wishlist";
import CarRecommendation from "@/components/car-recommendation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useFavorites } from '../lib/useFavorites';
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";
import { formatEurPrice, formatKmDistance, milesToKm } from "@/lib/conversion";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";


export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const carId = parseInt(id);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);

  const { data: car, isLoading, error } = useQuery<Car>({
    queryKey: [`/api/cars/${carId}`],
    enabled: !isNaN(carId),
  });

  const formatNumberWithCommas = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  
  // Convert mpg to l/100km (European standard)
  const getMpgInLitersPer100Km = (mpg: string | undefined | null) => {
    if (!mpg) return "N/A";
    const parts = mpg.split(' ');
    const valueStr = parts.length > 0 ? parts[0] : "0";
    const mpgValue = parseFloat(valueStr);
    if (isNaN(mpgValue) || mpgValue === 0) return "N/A";
    // Convert MPG to l/100km formula: 235.214 / mpg
    const litersPer100Km = Math.round(235.214 / mpgValue * 10) / 10;
    return `${litersPer100Km} l/100km`;
  };

  const { toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();

  useEffect(() => {
    // Check if the user is authenticated
    const checkSession = async () => {
      try {
        const response = await apiRequest('GET', '/api/auth/session');
        const sessionData = await response.json();
        console.log("Session check:", sessionData);
        
        setIsAuthenticated(sessionData.isAuthenticated);
        
        if (sessionData.isAuthenticated && sessionData.user) {
          setUser({ id: sessionData.user.id, isAdmin: sessionData.user.isAdmin });
        } else {
          setUser({ id: 'guest-user', isAdmin: false });
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsAuthenticated(false);
        setUser({ id: 'guest-user', isAdmin: false });
      }
    };

    checkSession();
  }, []);

  if (isNaN(carId)) {
    return (
      <Container className="py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-xl font-bold text-red-700 mb-2">ID e veturës është e pavlefshme</h1>
          <p className="text-red-600 mb-4">ID-ja e veturës që keni dhënë nuk është e vlefshme.</p>
          <Button asChild>
            <Link href="/browse-cars">Kërko të gjitha veturat</Link>
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
          <h1 className="text-xl font-bold text-red-700 mb-2">Vetura nuk u gjet</h1>
          <p className="text-red-600 mb-4">Nuk mundëm të gjejmë veturën që po kërkoni. Mund të jetë hequr ose shitur.</p>
          <Button asChild>
            <Link href="/browse-cars">Kërko të gjitha veturat</Link>
          </Button>
        </div>
      </Container>
    );
  }

  // Get the current URL to include in the WhatsApp message
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const whatsappMessage = `I'm interested in your ${car.year} ${car.full_name} listed for ${formatEurPrice(car.price)}. ${currentUrl}`;

  return (
    <Container className="py-12">
      <div className="mb-6">
        <Link href="/browse-cars" className="text-primary hover:text-primary-dark font-medium flex items-center">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Kthehu te Listimet
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <CarGallery 
            images={car.images} 
            alt={`${car.full_name}`}
          />

          <div className="mt-8">
            <h3 className="text-xl font-bold text-neutral-800 mb-4">Specifikimet e Veturës</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <h4 className="font-medium text-neutral-500 mb-1">Informacione Bazë</h4>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-neutral-500">Marka</span>
                    <span className="font-medium">{car.make}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-neutral-500">Modeli</span>
                    <span className="font-medium">{car.model}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-neutral-500">Tipi</span>
                    <span className="font-medium">{car.grade}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-neutral-500">Viti</span>
                    <span className="font-medium">{car.year}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-neutral-500">Kilometrazhi</span>
                    <span className="font-medium">{formatNumberWithCommas(Math.round(milesToKm(car.mileage)))} km</span>
                  </li>
                  {car.vin && (
                    <li className="flex justify-between">
                      <span className="text-neutral-500">Numri i shasis</span>
                      <span className="font-medium">{car.vin}</span>
                    </li>
                  )}
                  <li className="flex justify-between">
                    <span className="text-neutral-500">Ngjyra e jashtme</span>
                    <span className="font-medium">{car.exteriorColor}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-neutral-500">Ngjyra e brendshme</span>
                    <span className="font-medium">{car.interiorColor}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-neutral-50 p-4 rounded-lg">
                <h4 className="font-medium text-neutral-500 mb-1">Performanca</h4>
                <ul className="space-y-2">
                  {car.engineDetails && (
                    <li className="flex justify-between">
                      <span className="text-neutral-500">Motorri</span>
                      <span className="font-medium">{car.engineDetails}</span>
                    </li>
                  )}
                  <li className="flex justify-between">
                    <span className="text-neutral-500">Transmisioni</span>
                    <span className="font-medium">{car.transmission}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-neutral-500">Sistemi i lëvizjes (Drivetrain)</span>
                    <span className="font-medium">{car.drivetrain}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-neutral-500">Lloji i Karburantit</span>
                    <span className="font-medium">{car.fuelType}</span>
                  </li>
                  {car.mpg && car.fuelType?.toLowerCase() !== 'electric' && (
                    <li className="flex justify-between">
                      <span className="text-neutral-500">Konsumi i Karburantit</span>
                      <span className="font-medium">{getMpgInLitersPer100Km(car.mpg)}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {car.features && car.features.length > 0 && (
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <h4 className="font-medium text-neutral-500 mb-1">Veçoritë dhe Opsionet</h4>
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
                  <h4 className="font-medium text-neutral-500 mb-1">Pëshkrimi</h4>
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
                <h1 className="text-2xl font-bold text-neutral-800">{car.full_name}</h1>
                <p className="text-neutral-500">{car.year} • {formatNumberWithCommas(Math.round(milesToKm(car.mileage)))} km • {car.transmission}</p>
              </div>
              <span className="text-2xl font-bold text-primary">{formatEurPrice(car.price)}</span>
            </div>

            <div className="border-t border-b border-neutral-200 py-4 my-4">
              <h4 className="font-medium text-neutral-800 mb-2">Informacioni i Shitësit</h4>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-neutral-200 rounded-full overflow-hidden mr-3 flex items-center justify-center">
                  <User className="h-8 w-8 text-neutral-400" />
                </div>
                <div>
                  <p className="font-medium">{car.sellerName}</p>
                  {car.sellerSince && (
                    <p className="text-sm text-neutral-500">Anëtar që nga {car.sellerSince}</p>
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
                Thirr Shitësin
              </a>

              <Button 
                variant="outline" 
                className="w-full flex items-center mt-2"
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
                Ruaje te të Preferuarat
              </Button>
              
              <AddToWishlist className="w-full" car={car} />
              
              <Link href={`/ar-comparison?carId=${car.id}`}>
                <Button variant="outline" className="w-full flex items-center mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M21 4v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"></path>
                    <path d="m6 9 6-3 6 3"></path>
                    <path d="m6 12 6 3 6-3"></path>
                    <path d="m6 15 6 3 6-3"></path>
                  </svg>
                  Shiko në AR (Argumented Reality)
                  <Badge variant="secondary" className="ml-2 text-xs">New</Badge>
                </Button>
              </Link>

              {isAuthenticated && user?.isAdmin ? (
                <a target="_blank" href={`https://fem.encar.com/cars/detail/${car.car_id}`}>
                  <Button variant="outline" className="w-full flex items-center mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M21 4v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"></path>
                      <path d="m6 9 6-3 6 3"></path>
                      <path d="m6 12 6 3 6-3"></path>
                      <path d="m6 15 6 3 6-3"></path>
                    </svg>
                    Shiko në Encar
                    <Badge variant="secondary" className="ml-2 text-xs">New</Badge>
                  </Button>
                </a>
              ) : ''}
              <Link href={`/budget-calculator?carId=${car.id}`}>
                <Button variant="outline" className="w-full flex items-center mt-2">
                  <Calculator className="h-5 w-5 mr-2" />
                  Kalkulatori i Buxhetit
                  <Badge variant="secondary" className="ml-2 text-xs">New</Badge>
                </Button>
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200">
              <h4 className="font-medium text-neutral-800 mb-4">Dërgo një Mesazh</h4>
              <InquiryForm carId={car.id} carName={`${car.year} ${car.full_name}`} />
            </div>
          </div>
        </div>
      </div>
      {/* Add the car recommendation component */}
      <CarRecommendation carId={carId} />
    </Container>
  );
}