import { Link } from "wouter";
import { Car } from "@shared/schema";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Fuel, 
  GaugeCircle, 
  MapPin 
} from "lucide-react";
import { formatEurPrice, formatKmDistance, milesToKm } from "@/lib/conversion";

export interface CarCardProps {
  car: Car;
  featured?: boolean;
  size?: "small" | "medium" | "large";
}

export default function CarCard({ car, featured = false, size = "medium" }: CarCardProps) {
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

  const whatsappMessage = encodeURIComponent(`I'm interested in the ${car.year} ${car.make} ${car.model} listed for ${formatEurPrice(car.price)}`);

  if (size === "small") {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg">
        <div className="relative">
          <img 
            src={car.images[0]} 
            alt={`${car.make} ${car.model}`} 
            className="w-full h-40 object-cover" 
          />
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-base font-bold text-neutral-800">{car.make} {car.model}</h3>
            <span className="text-base font-bold text-primary">{formatEurPrice(car.price)}</span>
          </div>
          <p className="text-neutral-500 text-xs mb-3">
            {car.year} • {formatNumberWithCommas(Math.round(milesToKm(car.mileage)))} km • {car.transmission}
          </p>
          <div className="flex gap-2 mb-3">
            <div className="bg-neutral-100 text-neutral-800 px-2 py-1 rounded-md text-xs flex items-center">
              <Fuel className="mr-1 h-3 w-3" /> {car.mpg ? getMpgInLitersPer100Km(car.mpg) : "N/A"}
            </div>
            <div className="bg-neutral-100 text-neutral-800 px-2 py-1 rounded-md text-xs flex items-center">
              <GaugeCircle className="mr-1 h-3 w-3" /> {car.drivetrain}
            </div>
            <div className="bg-neutral-100 text-neutral-800 px-2 py-1 rounded-md text-xs flex items-center">
              <MapPin className="mr-1 h-3 w-3" /> {formatNumberWithCommas(Math.round(milesToKm(car.mileage)))} km
            </div>
          </div>
          <div className="flex gap-2">
            <Link 
              href={`/car/${car.id}`} 
              className="flex-1 text-xs bg-neutral-100 hover:bg-neutral-200 px-3 py-2 rounded-md text-center text-neutral-800 font-medium"
            >
              Details
            </Link>
            <WhatsAppButton 
              phoneNumber={car.sellerPhone} 
              message={whatsappMessage} 
              size="small"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg">
      <div className="relative">
        {featured && (
          <Badge className="absolute top-2 left-2 z-10 bg-secondary text-white" variant="secondary">
            Featured
          </Badge>
        )}
        <img 
          src={car.images[0]} 
          alt={`${car.make} ${car.model}`} 
          className="w-full h-48 object-cover" 
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-neutral-800">{car.make} {car.model}</h3>
          <span className="text-lg font-bold text-primary">{formatEurPrice(car.price)}</span>
        </div>
        <p className="text-neutral-500 text-sm mb-3">
          {car.year} • {formatNumberWithCommas(Math.round(milesToKm(car.mileage)))} km • {car.transmission} • {car.fuelType}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {car.features?.slice(0, 4).map((feature, index) => (
            <span key={index} className="bg-neutral-100 text-neutral-800 px-2 py-1 rounded-md text-xs">
              {feature}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1" 
            asChild
          >
            <Link href={`/car/${car.id}`}>View Details</Link>
          </Button>
          <WhatsAppButton 
            phoneNumber={car.sellerPhone} 
            message={whatsappMessage} 
          />
        </div>
      </div>
    </div>
  );
}
