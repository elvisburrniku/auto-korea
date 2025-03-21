import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, Car } from "lucide-react";
import { Car as CarType } from "@shared/schema";
import HeroSection from "@/components/hero-section";
import CarCard from "@/components/car-card";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

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
      

    </>
  );
}
