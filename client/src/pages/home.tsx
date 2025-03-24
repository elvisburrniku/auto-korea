import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, Car, Calculator, PiggyBank } from "lucide-react";
import { Car as CarType } from "@shared/schema";
import HeroSection from "@/components/hero-section";
import CarCard from "@/components/car-card";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  // Get featured cars
  const { data: featuredCars, isLoading: featuredLoading } = useQuery<CarType[]>({
    queryKey: ['/api/cars/featured/list'],
  });

  // Get recent cars
  const { data: recentCars, isLoading: recentLoading } = useQuery<CarType[]>({
    queryKey: ['/api/cars/recent/list'],
  });

  return (
    <>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Featured Listings */}
      <section className="py-12 bg-white">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-800">Në Ofertë</h2>
            <Link href="/browse-cars" className="text-primary hover:text-primary-dark font-medium flex items-center">
              Shiko të gjitha
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredLoading ? (
              // Loading skeletons
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="h-5 w-24 bg-gray-200 rounded"></div>
                      <div className="h-5 w-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 w-48 bg-gray-200 rounded mb-3"></div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="h-6 w-20 bg-gray-200 rounded"></div>
                      <div className="h-6 w-24 bg-gray-200 rounded"></div>
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-10 bg-gray-200 rounded"></div>
                      <div className="h-10 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : featuredCars && featuredCars.length > 0 ? (
              featuredCars.map(car => (
                <CarCard key={car.id} car={car} featured={true} />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-neutral-500">Nuk ka vetura ne ofertë.</p>
              </div>
            )}
          </div>
        </Container>
      </section>
      
      {/* Recent Listings */}
      <section className="py-12 bg-neutral-50">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-800">Listimet e fundit</h2>
            <Link href="/browse-cars" className="text-primary hover:text-primary-dark font-medium flex items-center">
              Shiko të gjitha
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentLoading ? (
              // Loading skeletons
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-40 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                      <div className="h-4 w-14 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-3 w-40 bg-gray-200 rounded mb-3"></div>
                    <div className="flex gap-2 mb-3">
                      <div className="h-5 w-16 bg-gray-200 rounded"></div>
                      <div className="h-5 w-16 bg-gray-200 rounded"></div>
                      <div className="h-5 w-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                      <div className="h-8 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : recentCars && recentCars.length > 0 ? (
              recentCars.map(car => (
                <CarCard key={car.id} car={car} size="small" />
              ))
            ) : (
              <div className="col-span-4 text-center py-8">
                <p className="text-neutral-500">Nuk ka listime të fundit të disponueshme për momentin.</p>
              </div>
            )}
          </div>
        </Container>
      </section>
      
      {/* Budget Calculator Section */}
      <section className="py-12 bg-white">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-800">Planifikoni blerjen e makinës suaj</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-lg border-primary/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center">
                  <Calculator className="h-6 w-6 mr-2 text-primary" />
                  Llogaritësi i buxhetit
                </CardTitle>
                <CardDescription>
                  Zbuloni se çfarë veture mund të përballoni bazuar në buxhetin tuaj dhe planin tuaj të kursimeve.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-neutral-600">
                  Kalkulatori ynë interaktiv i buxhetit ju ndihmon të vizualizoni progresin e kursimeve tuaja dhe të planifikoni paraprakisht blerjen e veturës suaj të ëndrrave.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Kalkuloni pagesat mujore</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Vizualizoni progresin e kursimeve me matës të animuar</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Planifikoni pagesat fillestare dhe opsionet e financimit</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/budget-calculator">
                    Provoni Kalkulatorin e Buxhetit
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <div className="bg-neutral-50 rounded-lg shadow-md p-6 flex flex-col justify-center">
              <div className="mb-6">
                <PiggyBank className="h-16 w-16 text-primary mb-4" />
                <h3 className="text-xl font-bold text-neutral-800 mb-2">Vizualizimi i Kursimeve</h3>
                <p className="text-neutral-600">
                  Shikoni se si kursimet tuaja mujore grumbullohen drejt synimit tuaj për blerjen e veturës me matësin tonë të animuar të kursimeve.
                  Mësoni saktësisht kur do ta arrini objektivin tuaj.
                </p>
              </div>
              
              <div className="mt-auto pt-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-neutral-200">
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-500">Kursimet aktuale</span>
                      <span className="font-medium">€5,000</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: "25%" }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Targeti: €20,000</span>
                    <span className="text-neutral-500">25% Pëfunduar</span>
                  </div>
                </div>
                
                <Button variant="outline" asChild className="w-full mt-4">
                  <Link href="/budget-calculator">
                    Filloni Planifikimin
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

    </>
  );
}
