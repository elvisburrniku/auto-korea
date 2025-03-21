import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Car, CarFilter } from "@shared/schema";
import { Container } from "@/components/ui/container";

const PRICE_RANGES = [
  { min: 0, max: 10000, label: "Under $10,000" },
  { min: 10000, max: 20000, label: "$10,000 - $20,000" },
  { min: 20000, max: 30000, label: "$20,000 - $30,000" },
  { min: 30000, max: 50000, label: "$30,000 - $50,000" },
  { min: 50000, max: 100000, label: "$50,000 - $100,000" },
  { min: 100000, max: null, label: "Over $100,000" },
];

const YEAR_RANGES = [
  { min: 2020, max: null, label: "2020 & Newer" },
  { min: 2015, max: 2019, label: "2015 - 2019" },
  { min: 2010, max: 2014, label: "2010 - 2014" },
  { min: 2005, max: 2009, label: "2005 - 2009" },
  { min: 2000, max: 2004, label: "2000 - 2004" },
  { min: null, max: 1999, label: "1999 & Older" },
];

interface CarFilterProps {
  initialFilters?: Partial<CarFilter>;
  onFilterChange?: (filters: CarFilter) => void;
  className?: string;
}

export default function CarFilterComponent({ 
  initialFilters, 
  onFilterChange,
  className
}: CarFilterProps) {
  // Get all cars to extract makes and models
  const { data: allCars } = useQuery<Car[]>({
    queryKey: ['/api/cars'],
  });

  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));
  
  const [filters, setFilters] = useState<CarFilter>({
    make: initialFilters?.make || "",
    model: initialFilters?.model || "",
    minPrice: initialFilters?.minPrice || undefined,
    maxPrice: initialFilters?.maxPrice || undefined,
    minYear: initialFilters?.minYear || undefined,
    maxYear: initialFilters?.maxYear || undefined,
    fuelType: initialFilters?.fuelType || "",
    transmission: initialFilters?.transmission || "",
    search: initialFilters?.search || "",
  });

  // Extract unique makes and models from data
  const uniqueMakes = allCars ? Array.from(new Set(allCars.map(car => car.make))).sort() : [];
  
  // Get models for the selected make
  const availableModels = allCars && filters.make
    ? Array.from(new Set(allCars.filter(car => car.make === filters.make).map(car => car.model))).sort()
    : [];

  // Unique fuel types and transmissions
  const fuelTypes = allCars 
    ? Array.from(new Set(allCars.map(car => car.fuelType))).sort() 
    : ["Gasoline", "Diesel", "Electric", "Hybrid"];
  
  const transmissions = allCars 
    ? Array.from(new Set(allCars.map(car => car.transmission))).sort() 
    : ["Automatic", "Manual"];

  // Selected price range for display
  const selectedPriceRange = (() => {
    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      const range = PRICE_RANGES.find(
        range => range.min === filters.minPrice && range.max === filters.maxPrice
      );
      return range?.label || `$${filters.minPrice} - $${filters.maxPrice}`;
    }
    return "Any Price";
  })();

  // Selected year range for display
  const selectedYearRange = (() => {
    if (filters.minYear !== undefined && filters.maxYear !== undefined) {
      const range = YEAR_RANGES.find(
        range => range.min === filters.minYear && range.max === filters.maxYear
      );
      return range?.label || `${filters.minYear} - ${filters.maxYear}`;
    } else if (filters.minYear !== undefined) {
      return `${filters.minYear} & Newer`;
    } else if (filters.maxYear !== undefined) {
      return `${filters.maxYear} & Older`;
    }
    return "Any Year";
  })();

  // Update URL when filters change
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
    
    const params = new URLSearchParams();
    
    if (filters.make) params.set('make', filters.make);
    if (filters.model) params.set('model', filters.model);
    if (filters.minPrice !== undefined) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.minYear !== undefined) params.set('minYear', filters.minYear.toString());
    if (filters.maxYear !== undefined) params.set('maxYear', filters.maxYear.toString());
    if (filters.fuelType) params.set('fuelType', filters.fuelType);
    if (filters.transmission) params.set('transmission', filters.transmission);
    if (filters.search) params.set('search', filters.search);
    
    setSearchParams(params);
  }, [filters, onFilterChange]);

  // Apply filters
  const applyFilters = () => {
    setLocation(`/browse-cars?${searchParams.toString()}`);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      make: "",
      model: "",
      minPrice: undefined,
      maxPrice: undefined,
      minYear: undefined,
      maxYear: undefined,
      fuelType: "",
      transmission: "",
      search: "",
    });
  };

  return (
    <div className={className}>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="filters">
          <AccordionTrigger className="text-lg font-medium">Filter Cars</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              {/* Search */}
              <div>
                <Label htmlFor="search">Keyword Search</Label>
                <Input
                  id="search"
                  placeholder="Search by keyword..."
                  value={filters.search || ""}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              {/* Make and Model */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="make">Make</Label>
                  <Select
                    value={filters.make || "any"}
                    onValueChange={(value) => setFilters({ ...filters, make: value === "any" ? "" : value, model: "" })}
                  >
                    <SelectTrigger id="make" className="mt-1">
                      <SelectValue placeholder="Any Make" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Make</SelectItem>
                      {uniqueMakes.map((make) => (
                        <SelectItem key={make} value={make}>
                          {make}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Select
                    value={filters.model || "any"}
                    onValueChange={(value) => setFilters({ ...filters, model: value === "any" ? "" : value })}
                    disabled={!filters.make}
                  >
                    <SelectTrigger id="model" className="mt-1">
                      <SelectValue placeholder="Any Model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Model</SelectItem>
                      {availableModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Price Range */}
              <div>
                <Label>Price Range: {selectedPriceRange}</Label>
                <div className="mt-1">
                  <Select
                    value={selectedPriceRange}
                    onValueChange={(value) => {
                      const range = PRICE_RANGES.find(r => r.label === value);
                      if (range) {
                        setFilters({ 
                          ...filters, 
                          minPrice: range.min,
                          maxPrice: range.max !== null ? range.max : undefined
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Any Price">Any Price</SelectItem>
                      {PRICE_RANGES.map((range) => (
                        <SelectItem key={range.label} value={range.label}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Year Range */}
              <div>
                <Label>Year Range: {selectedYearRange}</Label>
                <div className="mt-1">
                  <Select
                    value={selectedYearRange}
                    onValueChange={(value) => {
                      const range = YEAR_RANGES.find(r => r.label === value);
                      if (range) {
                        setFilters({ 
                          ...filters, 
                          minYear: range.min !== null ? range.min : undefined,
                          maxYear: range.max !== null ? range.max : undefined
                        });
                      } else if (value === "Any Year") {
                        setFilters({
                          ...filters,
                          minYear: undefined,
                          maxYear: undefined
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Any Year">Any Year</SelectItem>
                      {YEAR_RANGES.map((range) => (
                        <SelectItem key={range.label} value={range.label}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Fuel Type */}
              <div>
                <Label htmlFor="fuelType">Fuel Type</Label>
                <Select
                  value={filters.fuelType || "any"}
                  onValueChange={(value) => setFilters({ ...filters, fuelType: value === "any" ? "" : value })}
                >
                  <SelectTrigger id="fuelType" className="mt-1">
                    <SelectValue placeholder="Any Fuel Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Fuel Type</SelectItem>
                    {fuelTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Transmission */}
              <div>
                <Label htmlFor="transmission">Transmission</Label>
                <Select
                  value={filters.transmission || ""}
                  onValueChange={(value) => setFilters({ ...filters, transmission: value })}
                >
                  <SelectTrigger id="transmission" className="mt-1">
                    <SelectValue placeholder="Any Transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Transmission</SelectItem>
                    {transmissions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Filter Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={applyFilters} className="flex-1">
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={resetFilters} className="flex-1">
                  Reset Filters
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
