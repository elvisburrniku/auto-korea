import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Car, CarFilter } from "@shared/schema";
import { Container } from "@/components/ui/container";
import CarCard from "@/components/car-card";
import CarFilterComponent from "@/components/car-filter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function BrowseCarsPage() {
  const [location] = useLocation();
  const [searchParams, setSearchParams] = useState<URLSearchParams>(
    new URLSearchParams(window.location.search)
  );
  
  // Add useEffect to update searchParams when URL changes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setSearchParams(urlParams);
  }, [window.location.search]);
  
  const [searchTerm, setSearchTerm] = useState<string>(
    searchParams.get("search") || ""
  );
  
  // Parse filter values from URL
  const initialFilters: Partial<CarFilter> = {
    make: searchParams.get("make") || "",
    model: searchParams.get("model") || "",
    minPrice: searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : undefined,
    maxPrice: searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined,
    minYear: searchParams.get("minYear") ? parseInt(searchParams.get("minYear")!) : undefined,
    maxYear: searchParams.get("maxYear") ? parseInt(searchParams.get("maxYear")!) : undefined,
    fuelType: searchParams.get("fuelType") || "",
    transmission: searchParams.get("transmission") || "",
    search: searchParams.get("search") || "",
  };
  
  // Convert filter object to query string
  const buildQueryString = (filters: CarFilter): string => {
    const params = new URLSearchParams();
    
    if (filters.make) params.set("make", filters.make);
    if (filters.model) params.set("model", filters.model);
    if (filters.minPrice !== undefined) params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.set("maxPrice", filters.maxPrice.toString());
    if (filters.minYear !== undefined) params.set("minYear", filters.minYear.toString());
    if (filters.maxYear !== undefined) params.set("maxYear", filters.maxYear.toString());
    if (filters.fuelType) params.set("fuelType", filters.fuelType);
    if (filters.transmission) params.set("transmission", filters.transmission);
    if (filters.search) params.set("search", filters.search);
    
    return params.toString();
  };
  
  // Fetch filtered cars
  const { data: cars, isLoading, error } = useQuery<Car[]>({
    queryKey: ['/api/cars/filter', searchParams.toString()],
    queryFn: async () => {
      // Log the current search parameters for debugging
      console.log("Current search params:", searchParams.toString());
      
      const response = await apiRequest('GET', `/api/cars/filter?${searchParams.toString()}`);
      const data = await response.json();
      console.log("Filtered cars data:", data);
      return data;
    },
    // Important: Refetch whenever the searchParams change
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
  
  // Handle quick search submit
  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentParams = new URLSearchParams(window.location.search);
    if (searchTerm) {
      currentParams.set("search", searchTerm);
    } else {
      currentParams.delete("search");
    }
    
    // Update URL without page reload
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${currentParams.toString()}`
    );
    
    // Update state to trigger query refresh
    setSearchParams(currentParams);
  };
  
  const getFilterSummary = () => {
    const parts = [];
    
    if (initialFilters.make) parts.push(initialFilters.make);
    if (initialFilters.model) parts.push(initialFilters.model);
    if (initialFilters.minYear && initialFilters.maxYear) {
      parts.push(`${initialFilters.minYear}-${initialFilters.maxYear}`);
    } else if (initialFilters.minYear) {
      parts.push(`${initialFilters.minYear}+`);
    } else if (initialFilters.maxYear) {
      parts.push(`Pre-${initialFilters.maxYear}`);
    }
    
    // Add price range
    if (initialFilters.minPrice && initialFilters.maxPrice) {
      parts.push(`$${initialFilters.minPrice.toLocaleString()}-$${initialFilters.maxPrice.toLocaleString()}`);
    } else if (initialFilters.minPrice) {
      parts.push(`$${initialFilters.minPrice.toLocaleString()}+`);
    } else if (initialFilters.maxPrice) {
      parts.push(`Under $${initialFilters.maxPrice.toLocaleString()}`);
    }
    
    // Add fuel type and transmission if present
    if (initialFilters.fuelType) parts.push(initialFilters.fuelType);
    if (initialFilters.transmission) parts.push(initialFilters.transmission);
    
    return parts.length > 0 ? parts.join(" • ") : "All Cars";
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      {/* Page Header */}
      <div className="bg-primary text-white py-10">
        <Container>
          <h1 className="text-3xl font-bold mb-4">Browse Cars</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleQuickSearch} className="flex-1 flex gap-2">
              <Input
                type="text"
                placeholder="Quick search by make, model, or keywords"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white text-neutral-800"
              />
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </div>
        </Container>
      </div>
      
      <Container className="mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <CarFilterComponent 
              initialFilters={initialFilters} 
              onFilterChange={(newFilters) => {
                // Create URL params from the filter
                const params = new URLSearchParams();
                
                if (newFilters.make) params.set("make", newFilters.make);
                if (newFilters.model) params.set("model", newFilters.model);
                if (newFilters.minPrice !== undefined) params.set("minPrice", newFilters.minPrice.toString());
                if (newFilters.maxPrice !== undefined) params.set("maxPrice", newFilters.maxPrice.toString());
                if (newFilters.minYear !== undefined) params.set("minYear", newFilters.minYear.toString());
                if (newFilters.maxYear !== undefined) params.set("maxYear", newFilters.maxYear.toString());
                if (newFilters.fuelType) params.set("fuelType", newFilters.fuelType);
                if (newFilters.transmission) params.set("transmission", newFilters.transmission);
                if (searchTerm) params.set("search", searchTerm);
                
                // Update the search params
                setSearchParams(params);
              }}
            />
          </div>
          
          {/* Car Listings */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {isLoading ? "Loading..." : `${cars?.length || 0} Results`}
                </h2>
                <p className="text-sm text-neutral-500">{getFilterSummary()}</p>
              </div>
            </div>
            
            {/* Results Grid */}
            {isLoading ? (
              // Loading skeletons
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {Array(6).fill(0).map((_, i) => (
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
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
                An error occurred while fetching cars. Please try again.
              </div>
            ) : cars && cars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {cars.map((car) => (
                  <CarCard key={car.id} car={car} featured={car.isFeatured} />
                ))}
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="bg-neutral-100 p-4 rounded-full mb-4">
                    <Search className="h-8 w-8 text-neutral-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No cars found</h3>
                  <p className="text-neutral-500 mb-6">
                    We couldn't find any cars matching your search criteria. Try adjusting your filters.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Update URL without the parameters
                      window.history.pushState({}, "", "/browse-cars");
                      
                      // Reset search term
                      setSearchTerm("");
                      
                      // Update search params to empty to trigger a new query
                      const newParams = new URLSearchParams();
                      setSearchParams(newParams);
                      
                      // Force reload of the current route to reset everything
                      window.location.href = "/browse-cars";
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
