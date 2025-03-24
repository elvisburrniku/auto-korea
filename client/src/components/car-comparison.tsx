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
import { formatEurPrice, milesToKm } from '@/lib/conversion';

export default function CarComparison() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [selectedCars, setSelectedCars] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Shteti për filtrat e avancuar
  const [advancedFilter, setAdvancedFilter] = useState<{
    make: string;
    minYear: string;
    maxYear: string;
    minPrice: string;
    maxPrice: string;
    transmission: string;
    fuelType: string;
  }>({
    make: '',
    minYear: '',
    maxYear: '',
    minPrice: '',
    maxPrice: '',
    transmission: '',
    fuelType: '',
  });
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Merr të gjitha makinat për zgjedhje
  const { data: allCars = [], isLoading } = useQuery<Car[]>({
    queryKey: ['/api/cars'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  // Merr makinat e filtruar kur filtrat e avancuar janë aplikuar
  const { data: filteredApiCars = [], isLoading: isFilterLoading } = useQuery<Car[]>({
    queryKey: ['/api/cars/filter', 
      advancedFilter.make,
      advancedFilter.minYear,
      advancedFilter.maxYear,
      advancedFilter.minPrice,
      advancedFilter.maxPrice,
      advancedFilter.transmission,
      advancedFilter.fuelType
    ],
    queryFn: async () => {
      // Ndërto parametrat e filtrit
      const params = new URLSearchParams();
      if (advancedFilter.make) params.append('make', advancedFilter.make);
      if (advancedFilter.minYear) params.append('minYear', advancedFilter.minYear);
      if (advancedFilter.maxYear) params.append('maxYear', advancedFilter.maxYear);
      if (advancedFilter.minPrice) params.append('minPrice', advancedFilter.minPrice);
      if (advancedFilter.maxPrice) params.append('maxPrice', advancedFilter.maxPrice);
      if (advancedFilter.transmission) params.append('transmission', advancedFilter.transmission);
      if (advancedFilter.fuelType) params.append('fuelType', advancedFilter.fuelType);
      
      const response = await apiRequest('GET', `/api/cars/filter?${params.toString()}`);
      const data = await response.json();
      console.log("Të dhënat e filtrit të makinave:", data);
      return data;
    },
    // Ekzekuto pyetjen vetëm nëse është aplikuar të paktën një filtër
    enabled: Object.values(advancedFilter).some(v => !!v),
  });

  // Merr preferencat nga ruajtja lokale
  const { favorites, toggleFavorite } = useFavorites();

  // Makina bazë për filtrim (ose të gjitha makinat ose makinat e filtruar nga API)
  const carsToFilter = Object.values(advancedFilter).some(v => !!v)
    ? filteredApiCars
    : allCars;

  // Filtron makinat sipas termit të kërkimit
  const filteredCars = searchTerm
    ? carsToFilter.filter((car: Car) =>
        `${car.make} ${car.model} ${car.year}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : carsToFilter;
  
  // Merr marka unike për dropdown-in e filtrit
  const makesSet = new Set<string>();
  allCars.forEach(car => makesSet.add(car.make));
  const uniqueMakes = Array.from(makesSet).sort();
  
  // Merr vitet minimale/maksimale për dropdown-et e filtrave
  const years = allCars.map(car => car.year).sort((a, b) => a - b);
  const minYear = years.length > 0 ? Math.min(...years) : new Date().getFullYear() - 10;
  const maxYear = years.length > 0 ? Math.max(...years) : new Date().getFullYear();
  
  // Vitet e mundshme për dropdown
  const yearOptions = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => minYear + i
  ).reverse();
  
  // Pastro të gjitha filtrat
  const resetFilters = () => {
    setAdvancedFilter({
      make: '',
      minYear: '',
      maxYear: '',
      minPrice: '',
      maxPrice: '',
      transmission: '',
      fuelType: '',
    });
    setSearchTerm('');
  };

  // Shto një makinë në krahasim
  const addToComparison = (car: Car) => {
    if (selectedCars.length >= 3) {
      toast({
        title: 'Arritët në makinat maksimale',
        description: 'Mund të krahasoni deri në 3 makina në të njëjtën kohë',
        variant: 'destructive',
      });
      return;
    }
    
    if (selectedCars.some(c => c.id === car.id)) {
      toast({
        title: 'Makinë tashmë e shtuar',
        description: 'Kjo makinë është tashmë në krahasimin tuaj',
        variant: 'destructive',
      });
      return;
    }
    
    setSelectedCars([...selectedCars, car]);
  };

  // Hiq një makinë nga krahasimi
  const removeFromComparison = (carId: number) => {
    setSelectedCars(selectedCars.filter(car => car.id !== carId));
  };

  // Pastro të gjitha makinat nga krahasimi
  const clearComparison = () => {
    setSelectedCars([]);
  };

  // Gjenero një mesazh WhatsApp me detajet e krahasimit
  const generateWhatsAppMessage = () => {
    const compareUrl = window.location.href;
    const carDetails = selectedCars.map(car => {
      const kmMileage = Math.round(milesToKm(car.mileage)).toLocaleString();
      const eurPrice = formatEurPrice(car.price);
      return `${car.year} ${car.make} ${car.model} (${eurPrice}, ${kmMileage} km)`;
    }).join(', ');
    
    return `Jam i interesuar për të krahasuar këto mjete: ${carDetails}. Ju lutem më jepni më shumë informacion.`;
  };

  // Pamja për celular
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
            <p className="text-xl font-bold text-primary">{formatEurPrice(car.price)}</p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kilometrazhi:</span>
              <span>{Math.round(milesToKm(car.mileage)).toLocaleString()} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lloji i Karburantit:</span>
              <span>{car.fuelType}</span>
            </div>
            {car.fuelType?.toLowerCase() !== 'electric' && car.mpg && typeof car.mpg === 'number' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Efikasiteti i Karburantit:</span>
                <span>{(235.214583 / car.mpg).toFixed(1)} l/100km</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transmetimi:</span>
              <span>{car.transmission}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ngjyra e Jashtme:</span>
              <span>{car.exteriorColor}</span>
            </div>
          </div>
        </Card>
      ))}
      
      {selectedCars.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Zgjidhni makina për të krahasuar</p>
        </div>
      )}
    </div>
  );
  
  // Pamja për desktop
  const renderDesktopView = () => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Karakteristika</TableHead>
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
                  <p className="text-lg font-bold text-primary">{formatEurPrice(car.price)}</p>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Kilometrazhi</TableCell>
            {selectedCars.map((car) => (
              <TableCell key={car.id}>{Math.round(milesToKm(car.mileage)).toLocaleString()} km</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Viti</TableCell>
            {selectedCars.map((car) => (
              <TableCell key={car.id}>{car.year}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Lloji i Karburantit</TableCell>
            {selectedCars.map((car) => (
              <TableCell key={car.id}>{car.fuelType}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Transmetimi</TableCell>
            {selectedCars.map((car) => (
              <TableCell key={car.id}>{car.transmission}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Traksioni</TableCell>
            {selectedCars.map((car) => (
              <TableCell key={car.id}>{car.drivetrain}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Ngjyra e Jashtme</TableCell>
            {selectedCars.map((car) => (
              <TableCell key={car.id}>{car.exteriorColor}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Ngjyra e Brendshme</TableCell>
            {selectedCars.map((car) => (
              <TableCell key={car.id}>{car.interiorColor}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Efikasiteti i Karburantit (l/100km)</TableCell>
            {selectedCars.map((car) => {
              // Për makinat elektrike, shfaq "Elektrike" në vend të efikasitetit të karburantit
              if (car.fuelType?.toLowerCase() === 'electric') {
                return <TableCell key={car.id}>Elektrike</TableCell>;
              }
              
              let liters100km = null;
              if (car.mpg && typeof car.mpg === 'number') {
                // Konverto MPG në l/100km (235.214583 është faktori i konvertimit)
                liters100km = (235.214583 / car.mpg).toFixed(1);
              }
              return (
                <TableCell key={car.id}>{liters100km || 'N/A'}</TableCell>
              );
            })}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Motori</TableCell>
            {selectedCars.map((car) => (
              <TableCell key={car.id}>{car.engineDetails || 'N/A'}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Kontakti</TableCell>
            {selectedCars.map((car) => (
              <TableCell key={car.id}>
                <Button
                  onClick={() => {
                    const kmMileage = Math.round(milesToKm(car.mileage)).toLocaleString();
                    const eurPrice = formatEurPrice(car.price);
                    window.open(
                      `https://wa.me/${car.sellerPhone}?text=${encodeURIComponent(`Jam i interesuar për ${car.year} ${car.make} ${car.model} (${eurPrice}, ${kmMileage} km)`)}`, 
                      '_blank'
                    )
                  }}
                  size="sm"
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                  </svg>
                  Kontaktoni
                </Button>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
      
      {selectedCars.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Zgjidhni makina për të krahasuar</p>
        </div>
      )}
    </div>
  );

  // Seksioni i kërkimit dhe zgjedhjes
  const renderCarSelection = () => (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-2">Zgjidhni Makina për të Krahasuar</h3>
      
      <div className="relative mb-4">
        <div className="flex items-center mb-2">
          <input
            type="text"
            placeholder="Kërko sipas markës, modelit, ose vitit..."
            className="w-full p-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button 
            className="ml-2" 
            variant="outline" 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            {showAdvancedFilters ? 'Fshih Filtrat' : 'Filtra të Avancuar'}
          </Button>
        </div>
        
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-muted p-4 rounded-lg mb-4">
            {/* Filtri për Markën */}
            <div>
              <label className="block text-sm font-medium mb-1">Marka</label>
              <select 
                className="w-full p-2 border rounded-lg" 
                value={advancedFilter.make}
                onChange={(e) => setAdvancedFilter({...advancedFilter, make: e.target.value})}
              >
                <option value="">Çdo Markë</option>
                {uniqueMakes.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>
            
            {/* Intervali i Vitit */}
            <div>
              <label className="block text-sm font-medium mb-1">Viti Min.</label>
              <select 
                className="w-full p-2 border rounded-lg"
                value={advancedFilter.minYear}
                onChange={(e) => setAdvancedFilter({...advancedFilter, minYear: e.target.value})}
              >
                <option value="">Çdo Vit</option>
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Viti Max.</label>
              <select 
                className="w-full p-2 border rounded-lg"
                value={advancedFilter.maxYear}
                onChange={(e) => setAdvancedFilter({...advancedFilter, maxYear: e.target.value})}
              >
                <option value="">Çdo Vit</option>
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            {/* Intervali i Çmimit */}
            <div>
              <label className="block text-sm font-medium mb-1">Çmimi Min.</label>
              <select 
                className="w-full p-2 border rounded-lg"
                value={advancedFilter.minPrice}
                onChange={(e) => setAdvancedFilter({...advancedFilter, minPrice: e.target.value})}
              >
                <option value="">Çdo Çmim</option>
                <option value="10000">€9,000</option>
                <option value="20000">€18,000</option>
                <option value="30000">€27,000</option>
                <option value="40000">€36,000</option>
                <option value="50000">€45,000</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Çmimi Max.</label>
              <select 
                className="w-full p-2 border rounded-lg"
                value={advancedFilter.maxPrice}
                onChange={(e) => setAdvancedFilter({...advancedFilter, maxPrice: e.target.value})}
              >
                <option value="">Çdo Çmim</option>
                <option value="20000">€18,000</option>
                <option value="30000">€27,000</option>
                <option value="40000">€36,000</option>
                <option value="50000">€45,000</option>
                <option value="75000">€67,500</option>
                <option value="100000">€90,000+</option>
              </select>
            </div>
            
            {/* Transmetimi */}
            <div>
              <label className="block text-sm font-medium mb-1">Transmetimi</label>
              <select 
                className="w-full p-2 border rounded-lg"
                value={advancedFilter.transmission}
                onChange={(e) => setAdvancedFilter({...advancedFilter, transmission: e.target.value})}
              >
                <option value="">Çdo Transmetim</option>
                <option value="Automatic">Automatik</option>
                <option value="Manual">Manual</option>
                <option value="CVT">CVT</option>
              </select>
            </div>
            
            {/* Lloji i Karburantit */}
            <div>
              <label className="block text-sm font-medium mb-1">Lloji i Karburantit</label>
              <select 
                className="w-full p-2 border rounded-lg"
                value={advancedFilter.fuelType}
                onChange={(e) => setAdvancedFilter({...advancedFilter, fuelType: e.target.value})}
              >
                <option value="">Çdo Lloj Karburanti</option>
                <option value="Gasoline">Benzinë</option>
                <option value="Diesel">Naftë</option>
                <option value="Hybrid">Hibrid</option>
                <option value="Electric">Elektrik</option>
              </select>
            </div>
            
            {/* Butoni për Pastrimin */}
            <div className="md:col-span-3 flex justify-end mt-2">
              <Button variant="outline" className="mr-2" onClick={resetFilters}>
                Pastroni Filtrat
              </Button>
            </div>
          </div>
        )}
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
                  {Math.round(milesToKm(car.mileage)).toLocaleString()} km • {car.fuelType}
                </p>
                <p className="font-bold text-primary">{formatEurPrice(car.price)}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addToComparison(car)}
                disabled={selectedCars.some(c => c.id === car.id)}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Krahaso
              </Button>
            </div>
          </Card>
        ))}
      </div>
      
      {isLoading && (
        <div className="text-center py-4">
          <p>Po ngarkohen makinat...</p>
        </div>
      )}
      
      {!isLoading && filteredCars.length === 0 && (
        <div className="text-center py-4">
          <p>Nuk ka makina që përputhen me kërkesën tuaj</p>
        </div>
      )}
    </div>
  );

  return (
    <Container className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Krahaso Makina</h2>
        {selectedCars.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearComparison}>
              Pastro të Gjitha
            </Button>
            {selectedCars.length >= 2 && (
              <Button 
                onClick={() => window.open(`https://wa.me/123456789?text=${encodeURIComponent(generateWhatsAppMessage())}`, '_blank')}
                className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                </svg>
                Pyesni për Krahasimin
              </Button>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-muted rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ArrowLeftRight className="h-5 w-5" />
          <p className="text-sm">
            Zgjidhni deri në 3 makina për të krahasuar karakteristikat e tyre krah për krah.
          </p>
        </div>
      </div>
      
      {/* Shfaq krahasimin */}
      {isMobile ? renderMobileView() : renderDesktopView()}
      
      {/* Seksioni i zgjedhjes së makinave */}
      {renderCarSelection()}
    </Container>
  );
}