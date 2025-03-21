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
      
      {/* Sell Your Car Section */}
      <section className="py-12 bg-primary bg-opacity-5">
        <Container>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-4">Ready to Sell Your Car?</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              List your vehicle on AutoMarket and connect with interested buyers through WhatsApp or our inquiry system.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary bg-opacity-10 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-2">Take Photos</h3>
              <p className="text-neutral-600">
                Snap high-quality photos of your vehicle from different angles to showcase its best features.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary bg-opacity-10 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-2">Create Listing</h3>
              <p className="text-neutral-600">
                Fill in your vehicle details, add description, specify your price and upload your photos.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary bg-opacity-10 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-2">Connect</h3>
              <p className="text-neutral-600">
                Receive inquiries directly through WhatsApp or our messaging system and connect with buyers.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <Button size="lg" asChild>
              <Link href="/sell-car">List Your Car Now</Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
