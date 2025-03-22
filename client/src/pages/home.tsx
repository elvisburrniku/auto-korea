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
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-800">Featured Vehicles</h2>
            <Link href="/browse-cars" className="text-primary hover:text-primary-dark font-medium flex items-center">
              View All 
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
                <p className="text-neutral-500">No featured vehicles available at the moment.</p>
              </div>
            )}
          </div>
        </Container>
      </section>
      
      {/* Recent Listings */}
      <section className="py-12 bg-neutral-50">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-800">Recent Listings</h2>
            <Link href="/browse-cars" className="text-primary hover:text-primary-dark font-medium flex items-center">
              View All 
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
                <p className="text-neutral-500">No recent listings available at the moment.</p>
              </div>
            )}
          </div>
        </Container>
      </section>
      
      {/* Budget Calculator Section */}
      <section className="py-12 bg-white">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-800">Plan Your Car Purchase</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-lg border-primary/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center">
                  <Calculator className="h-6 w-6 mr-2 text-primary" />
                  Budget Calculator
                </CardTitle>
                <CardDescription>
                  Find out how much car you can afford based on your budget and savings plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-neutral-600">
                  Our interactive budget calculator helps you visualize your savings progress
                  and plan ahead for your dream car purchase.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Calculate monthly payments</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Visualize savings progress with animated meter</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Plan for down payments and financing options</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/budget-calculator">
                    Try Budget Calculator
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <div className="bg-neutral-50 rounded-lg shadow-md p-6 flex flex-col justify-center">
              <div className="mb-6">
                <PiggyBank className="h-16 w-16 text-primary mb-4" />
                <h3 className="text-xl font-bold text-neutral-800 mb-2">Savings Visualization</h3>
                <p className="text-neutral-600">
                  See how your monthly savings add up towards your car purchase goal with our
                  animated savings meter. Know exactly when you'll reach your target.
                </p>
              </div>
              
              <div className="mt-auto pt-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-neutral-200">
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-500">Current Savings</span>
                      <span className="font-medium">€5,000</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: "25%" }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Target: €20,000</span>
                    <span className="text-neutral-500">25% Complete</span>
                  </div>
                </div>
                
                <Button variant="outline" asChild className="w-full mt-4">
                  <Link href="/budget-calculator">
                    Start Planning
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
