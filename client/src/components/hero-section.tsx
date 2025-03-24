import { useState } from "react";
import { useLocation } from "wouter";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default function HeroSection() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    make: "Marka",
    model: "Modeli",
    priceRange: "Çmimi",
    year: "Viti"
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();

    if (searchTerm) {
      queryParams.append("search", searchTerm);
    }

    if (filters.make !== "Marka") {
      queryParams.append("make", filters.make);
    }

    if (filters.model !== "Modeli") {
      queryParams.append("model", filters.model);
    }

    if (filters.priceRange !== "Çmimi") {
      const priceRanges: Record<string, [number, number]> = {
        "Më pak se €10,000": [0, 10000],
        "€10,000 - €30,000": [10000, 30000],
        "€30,000 - €50,000": [30000, 50000],
        "Më shum se €50,000": [50000, 1000000]
      };

      const [min, max] = priceRanges[filters.priceRange];
      queryParams.append("minPrice", min.toString());
      queryParams.append("maxPrice", max.toString());
    }

    if (filters.year !== "Viti") {
      if (filters.year === "2023") {
        queryParams.append("minYear", "2023");
      } else if (filters.year === "2022") {
        queryParams.append("minYear", "2022");
        queryParams.append("maxYear", "2022");
      } else if (filters.year === "2021") {
        queryParams.append("minYear", "2021");
        queryParams.append("maxYear", "2021");
      } else if (filters.year === "2020") {
        queryParams.append("minYear", "2020");
        queryParams.append("maxYear", "2020");
      } else if (filters.year === "2019 or older") {
        queryParams.append("maxYear", "2019");
      }
    }

    const queryString = queryParams.toString();
    setLocation(`/browse-cars${queryString ? `?${queryString}` : ''}`);
  };

  const carMakes = [
  "Any Make",
  "Audi",
  "BMW",
  "Ford",
  "Honda",
  "Hyundai",
  "Kia",
  "Lexus",
  "Mazda",
  "Mercedes-Benz",
  "Nissan",
  "Toyota",
  "Volkswagen"
];

const modelsByMake: { [key: string]: string[] } = {
  "BMW": ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "X1", "X3", "X5", "M3", "M4", "M5"],
  "Toyota": ["Camry", "Corolla", "RAV4", "Highlander", "4Runner", "Tacoma", "Tundra", "Prius", "Sienna"],
  "Honda": ["Civic", "Accord", "CR-V", "Pilot", "HR-V", "Odyssey", "Ridgeline"],
  "Ford": ["Mustang", "F-150", "Escape", "Explorer", "Edge", "Bronco", "Ranger"],
  "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "S-Class", "GLA", "GLC", "GLE", "G-Class"],
  "Audi": ["A3", "A4", "A5", "A6", "Q3", "Q5", "Q7", "RS", "TT"],
  "Volkswagen": ["Golf", "Jetta", "Passat", "Tiguan", "Atlas", "ID.4", "Taos"],
  "Lexus": ["IS", "ES", "LS", "NX", "RX", "GX", "LX"],
  "Mazda": ["Mazda3", "Mazda6", "CX-3", "CX-5", "CX-9", "MX-5"],
  "Hyundai": ["Elantra", "Sonata", "Tucson", "Santa Fe", "Kona", "Palisade"],
  "Kia": ["Forte", "K5", "Sportage", "Sorento", "Telluride", "Soul"],
  "Nissan": ["Altima", "Maxima", "Sentra", "Rogue", "Murano", "Pathfinder"]
};

const getModelsForMake = (make: string) => {
  return make && make !== "Marka" ? ["Modeli", ...modelsByMake[make]] : ["Modeli"];
};
  const priceRanges = ["Çmimi", "Më pak se €10,000", "€10,000 - €30,000", "€30,000 - €50,000", "Më shum se €50,000"];
  const yearOptions = ["Viti", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015"];

  return (
    <section className="relative bg-neutral-800 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-center bg-cover opacity-50"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')"
          }}
        />
      </div>
      <Container className="py-12 md:py-20 lg:py-24 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Gjeni Veturën Tuaj të Ëndrrave Tani
          </h1>
          <p className="text-lg md:text-xl text-neutral-100 mb-8">
            Shfletoni koleksionin tonë të gjerë të veturave premium
          </p>

          {/* Search Form */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <form onSubmit={handleSearch}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                  <Input
                    type="text"
                    placeholder="Kërko sipas markës, modelit ose fjalës kyçe"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button type="submit" className="px-6 py-3">
                  Kërko Veturat
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {/* Make Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-md text-left flex justify-between items-center"
                    >
                      <span>{filters.make}</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto" align="start">
                    {carMakes.map(make => (
                      <DropdownMenuItem 
                        key={make}
                        onClick={() => setFilters({...filters, make})}
                      >
                        {make}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Model Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild disabled={!filters.make || filters.make === "Marka"}>
                    <Button 
                      variant="outline" 
                      className="w-full px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-md text-left flex justify-between items-center"
                    >
                      <span>{filters.model}</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto" align="start">
                    {getModelsForMake(filters.make).map(model => (
                      <DropdownMenuItem 
                        key={model}
                        onClick={() => setFilters({...filters, model})}
                      >
                        {model}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Price Range Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-md text-left flex justify-between items-center"
                    >
                      <span>{filters.priceRange}</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto" align="start">
                    {priceRanges.map(range => (
                      <DropdownMenuItem 
                        key={range}
                        onClick={() => setFilters({...filters, priceRange: range})}
                      >
                        {range}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Year Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-md text-left flex justify-between items-center"
                    >
                      <span>{filters.year}</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto" align="start">
                    {yearOptions.map(year => (
                      <DropdownMenuItem 
                        key={year}
                        onClick={() => setFilters({...filters, year})}
                      >
                        {year}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}