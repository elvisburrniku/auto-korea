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
  { min: 0, max: 10000, label: "Under €10,000" },
  { min: 10000, max: 20000, label: "€10,000 - €20,000" },
  { min: 20000, max: 30000, label: "€20,000 - €30,000" },
  { min: 30000, max: 50000, label: "€30,000 - €50,000" },
  { min: 50000, max: 100000, label: "€50,000 - €100,000" },
  { min: 100000, max: null, label: "Over €100,000" },
];

const YEAR_RANGES = [
  { min: 2020, max: null, label: "2020 & Newer" },
  { min: 2015, max: 2019, label: "2015 - 2019" },
  { min: 2010, max: 2014, label: "2010 - 2014" },
  { min: 2005, max: 2009, label: "2005 - 2009" },
  { min: 2000, max: 2004, label: "2000 - 2004" },
  { min: null, max: 1999, label: "1999 & Më e vjetër" },
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

  // Get available years from the data
  const availableYears = allCars
    ? Array.from(new Set(allCars.map(car => car.year))).sort((a, b) => b - a) // Sort descending
    : [];

  // Unique fuel types and transmissions
  const fuelTypes = allCars 
    ? Array.from(new Set(allCars.map(car => car.fuelType))).sort() 
    : ["Benzinë", "Dizell", "Elektrik", "Hybrid"];

  const transmissions = allCars 
    ? Array.from(new Set(allCars.map(car => car.transmission))).sort() 
    : ["Automatik", "Manual"];

  // Selected price range for display
  const selectedPriceRange = (() => {
    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      const range = PRICE_RANGES.find(
        range => range.min === filters.minPrice && range.max === filters.maxPrice
      );
      return range?.label || `$${filters.minPrice} - $${filters.maxPrice}`;
    }
    return "Çdo çmim";
  })();

  // Selected year range for display
  const selectedYearRange = (() => {
    if (filters.minYear !== undefined && filters.maxYear !== undefined) {
      const range = YEAR_RANGES.find(
        range => range.min === filters.minYear && range.max === filters.maxYear
      );
      return range?.label || `${filters.minYear} - ${filters.maxYear}`;
    } else if (filters.minYear !== undefined) {
      return `${filters.minYear} & Më e re`;
    } else if (filters.maxYear !== undefined) {
      return `${filters.maxYear} & Më e vjetër`;
    }
    return "Çdo vit";
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
    // Call the onFilterChange callback with the current filters
    if (onFilterChange) {
      onFilterChange(filters);
    }
  };

  // Reset filters
  const resetFilters = () => {
    // Reset the filters state
    const emptyFilters = {
      make: "",
      model: "",
      minPrice: undefined,
      maxPrice: undefined,
      minYear: undefined,
      maxYear: undefined,
      fuelType: "",
      transmission: "",
      search: "",
    };
    
    // Set the filters to empty
    setFilters(emptyFilters);
    
    // Notify parent component through callback
    if (onFilterChange) {
      onFilterChange(emptyFilters);
    }
    
    // For safety, also clear the URL parameters and navigate
    window.location.href = '/browse-cars';
  };

  return (
    <div className={className}>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="filters">
          <AccordionTrigger className="text-lg font-medium">Filtro veturat</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              {/* Search */}
              <div>
                <Label htmlFor="search">Kërkim me fjalë kyçe</Label>
                <Input
                  id="search"
                  placeholder="Kërko sipas fjalës kyçe..."
                  value={filters.search || ""}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Make and Model */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="make">Marka</Label>
                  <Select
                    value={filters.make || "any"}
                    onValueChange={(value) => setFilters({ ...filters, make: value === "any" ? "" : value, model: "" })}
                  >
                    <SelectTrigger id="make" className="mt-1">
                      <SelectValue placeholder="Çdo markë" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Çdo markë</SelectItem>
                      {uniqueMakes.map((make) => (
                        <SelectItem key={make} value={make}>
                          {make}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="model">Modeli</Label>
                  <Select
                    value={filters.model || "any"}
                    onValueChange={(value) => setFilters({ ...filters, model: value === "any" ? "" : value })}
                    disabled={!filters.make}
                  >
                    <SelectTrigger id="model" className="mt-1">
                      <SelectValue placeholder={filters.make ? "Selekto Model" : "Slektoni marken fillimishtë"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Çdo Model</SelectItem>
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
                <Label>Çmimi: {selectedPriceRange}</Label>
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
                      <SelectValue placeholder="Çdo çmim" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Çdo çmim">Çdo çmim</SelectItem>
                      {PRICE_RANGES.map((range) => (
                        <SelectItem key={range.label} value={range.label}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Min Year */}
              <div>
                <Label htmlFor="minYear">Min Viti</Label>
                <Select
                  value={filters.minYear?.toString() || "any"}
                  onValueChange={(value) => {
                    setFilters({
                      ...filters,
                      minYear: value === "any" ? undefined : parseInt(value),
                      // If min year is greater than max year, reset max year
                      ...(filters.maxYear !== undefined && value !== "any" && parseInt(value) > filters.maxYear 
                          ? { maxYear: undefined } 
                          : {})
                    });
                  }}
                >
                  <SelectTrigger id="minYear" className="mt-1">
                    <SelectValue placeholder="Çdo Min Vit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Çdo Min Vit</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={`min-${year}`} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Max Year */}
              <div>
                <Label htmlFor="maxYear">Max Viti</Label>
                <Select
                  value={filters.maxYear?.toString() || "any"}
                  onValueChange={(value) => {
                    setFilters({
                      ...filters,
                      maxYear: value === "any" ? undefined : parseInt(value),
                      // If max year is less than min year, reset min year
                      ...(filters.minYear !== undefined && value !== "any" && parseInt(value) < filters.minYear 
                          ? { minYear: undefined } 
                          : {})
                    });
                  }}
                >
                  <SelectTrigger id="maxYear" className="mt-1">
                    <SelectValue placeholder="Çdo Max Vit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Çdo Max Vit</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={`max-${year}`} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fuel Type */}
              <div>
                <Label htmlFor="fuelType">Lloji i karburantit</Label>
                <Select
                  value={filters.fuelType || "any"}
                  onValueChange={(value) => setFilters({ ...filters, fuelType: value === "any" ? "" : value })}
                >
                  <SelectTrigger id="fuelType" className="mt-1">
                    <SelectValue placeholder="Çdo lloj i karburantit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Çdo lloj i karburantit</SelectItem>
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
                <Label htmlFor="transmission">Transmisioni</Label>
                <Select
                  value={filters.transmission || "any"}
                  onValueChange={(value) => setFilters({ ...filters, transmission: value === "any" ? "" : value })}
                >
                  <SelectTrigger id="transmission" className="mt-1">
                    <SelectValue placeholder="Çdo Transmision" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Çdo Transmision</SelectItem>
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
                  Apliko filtrat
                </Button>
                <Button variant="outline" onClick={resetFilters} className="flex-1">
                  Rivendos filtrat
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}