import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Car } from "@shared/schema";

export default function ImportCarsPage() {
  const { toast } = useToast();
  const [importStarted, setImportStarted] = useState(false);
  const [importedCars, setImportedCars] = useState<Car[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Get current session to check if user is admin
  const { data: session, isLoading: sessionLoading } = useQuery<{
    isAuthenticated: boolean;
    user?: { id: number; username: string; isAdmin: boolean };
  }>({
    queryKey: ['/api/auth/session'],
    refetchOnWindowFocus: false,
  });

  // Sample BMW cars
  const sampleCars = [
    {
      make: "BMW",
      model: "320i",
      year: 2022,
      price: 36000,
      mileage: 15000,
      fuelType: "Gasoline",
      transmission: "Automatic",
      drivetrain: "RWD",
      exteriorColor: "Alpine White",
      interiorColor: "Black",
      description: "2022 BMW 320i with Sport Package. Features include sport seats, sport suspension, and BMW M Sport steering wheel. The vehicle comes with a 2.0L turbocharged engine providing excellent performance and fuel efficiency.",
      sellerName: "Import Motors",
      sellerPhone: "+82-1234-5678",
      sellerEmail: "import@automarket.com",
      sellerLocation: "Seoul, South Korea",
      images: ["https://www.bmwusa.com/content/dam/bmwusa/3Series/MY22/BMW-MY22-3Series-330e-Gallery-05.jpg"],
      isFeatured: Math.random() > 0.7,
    },
    {
      make: "BMW",
      model: "330i xDrive",
      year: 2021,
      price: 42000,
      mileage: 22000,
      fuelType: "Gasoline",
      transmission: "Automatic",
      drivetrain: "AWD",
      exteriorColor: "Black Sapphire",
      interiorColor: "Cognac",
      description: "2021 BMW 330i xDrive with Executive Package. All-wheel drive provides excellent traction in all weather conditions. Features include premium sound system, heated seats, and advanced driver assistance systems.",
      sellerName: "Import Motors",
      sellerPhone: "+82-1234-5678",
      sellerEmail: "import@automarket.com",
      sellerLocation: "Seoul, South Korea",
      images: ["https://www.bmwusa.com/content/dam/bmwusa/3Series/MY21/BMW-MY21-3Series-330i-xDRIVE-Gallery-01.jpg"],
      isFeatured: Math.random() > 0.7,
    },
    {
      make: "BMW",
      model: "M340i",
      year: 2020,
      price: 48000,
      mileage: 35000,
      fuelType: "Gasoline",
      transmission: "Automatic",
      drivetrain: "RWD",
      exteriorColor: "Portimao Blue",
      interiorColor: "Black",
      description: "2020 BMW M340i with M Sport Package. This high-performance variant of the 3 Series features a 3.0L inline-6 turbocharged engine producing 382 horsepower. Includes adaptive M suspension, M Sport differential, and M Sport brakes.",
      sellerName: "Import Motors",
      sellerPhone: "+82-1234-5678",
      sellerEmail: "import@automarket.com",
      sellerLocation: "Seoul, South Korea",
      images: ["https://www.bmwusa.com/content/dam/bmwusa/3Series/MY20/BMW-MY20-3Series-M340i-Gallery-01.jpg"],
      isFeatured: Math.random() > 0.7,
    },
    {
      make: "BMW",
      model: "430i Coupe",
      year: 2022,
      price: 45500,
      mileage: 8000,
      fuelType: "Gasoline",
      transmission: "Automatic",
      drivetrain: "RWD",
      exteriorColor: "Arctic Race Blue",
      interiorColor: "Oyster",
      description: "2022 BMW 430i Coupe with M Sport Package. This elegant two-door coupe features BMWs latest technology and premium finishes. Equipped with a 2.0L TwinPower Turbo engine and 8-speed automatic transmission.",
      sellerName: "Import Motors",
      sellerPhone: "+82-1234-5678",
      sellerEmail: "import@automarket.com",
      sellerLocation: "Seoul, South Korea",
      images: ["https://www.bmwusa.com/content/dam/bmwusa/4Series/MY22/BMW-MY22-4Series-430i-Coupe-Gallery-01.jpg"],
      isFeatured: Math.random() > 0.7,
    },
    {
      make: "BMW",
      model: "X3 xDrive30i",
      year: 2021,
      price: 47000,
      mileage: 18000,
      fuelType: "Gasoline",
      transmission: "Automatic",
      drivetrain: "AWD",
      exteriorColor: "Phytonic Blue",
      interiorColor: "Cognac",
      description: "2021 BMW X3 xDrive30i with Premium Package. This luxury compact SUV offers the perfect blend of performance and practicality. Features include panoramic sunroof, heated seats, and driver assistance systems.",
      sellerName: "Import Motors",
      sellerPhone: "+82-1234-5678",
      sellerEmail: "import@automarket.com",
      sellerLocation: "Seoul, South Korea",
      images: ["https://www.bmwusa.com/content/dam/bmwusa/X3/MY21/BMW-MY21-X3-Gallery-07.jpg"],
      isFeatured: Math.random() > 0.7,
    },
    {
      make: "BMW",
      model: "X5 xDrive40i",
      year: 2022,
      price: 65000,
      mileage: 12000,
      fuelType: "Gasoline",
      transmission: "Automatic",
      drivetrain: "AWD",
      exteriorColor: "Mineral White",
      interiorColor: "Coffee",
      description: "2022 BMW X5 xDrive40i with Executive Package. This luxury midsize SUV offers exceptional comfort and capability. Features include 3.0L TwinPower Turbo inline-6 engine, third-row seating option, and advanced driver assistance systems.",
      sellerName: "Import Motors",
      sellerPhone: "+82-1234-5678",
      sellerEmail: "import@automarket.com",
      sellerLocation: "Seoul, South Korea",
      images: ["https://www.bmwusa.com/content/dam/bmwusa/X5/MY22/BMW-MY22-X5-Gallery-01.jpg"],
      isFeatured: Math.random() > 0.7,
    },
    {
      make: "BMW",
      model: "i4 eDrive40",
      year: 2022,
      price: 56000,
      mileage: 5000,
      fuelType: "Electric",
      transmission: "Automatic",
      drivetrain: "RWD",
      exteriorColor: "Mineral White",
      interiorColor: "Black",
      description: "2022 BMW i4 eDrive40 Gran Coupe. This all-electric sedan offers impressive range and performance. Features include 335 horsepower electric motor, up to 301 miles of range, and BMWs latest iDrive 8 system with curved display.",
      sellerName: "Import Motors",
      sellerPhone: "+82-1234-5678",
      sellerEmail: "import@automarket.com",
      sellerLocation: "Seoul, South Korea",
      images: ["https://www.bmwusa.com/content/dam/bmwusa/i4/MY22/BMW-MY22-i4-Gallery-04.jpg"],
      isFeatured: Math.random() > 0.7,
    },
    {
      make: "BMW",
      model: "iX xDrive50",
      year: 2022,
      price: 84000,
      mileage: 3000,
      fuelType: "Electric",
      transmission: "Automatic",
      drivetrain: "AWD",
      exteriorColor: "Sophisto Grey",
      interiorColor: "Stone Grey",
      description: "2022 BMW iX xDrive50. BMWs flagship electric SUV offers cutting-edge technology and sustainable luxury. Features include dual electric motors producing 516 horsepower, over 300 miles of range, and fast charging capability.",
      sellerName: "Import Motors",
      sellerPhone: "+82-1234-5678",
      sellerEmail: "import@automarket.com",
      sellerLocation: "Seoul, South Korea",
      images: ["https://www.bmwusa.com/content/dam/bmwusa/iX/MY22/BMW-MY22-iX-Gallery-09.jpg"],
      isFeatured: Math.random() > 0.7,
    }
  ];

  const createCarMutation = useMutation<Car, Error, any>({
    mutationFn: async (carData: any) => {
      const response = await apiRequest('/api/cars', 'POST', carData);
      // The response already contains the Car data, we just need to return it
      return response as unknown as Car;
    },
    onSuccess: (data: Car) => {
      setImportedCars(prev => [...prev, data]);
      // Invalidate queries to refresh car lists
      queryClient.invalidateQueries({ queryKey: ['/api/cars'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cars/recent/list'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cars/featured/list'] });
    },
    onError: (error: any) => {
      setErrors(prev => [...prev, `Failed to import car: ${error.message}`]);
      toast({
        title: "Error importing car",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const importCars = async () => {
    setImportStarted(true);
    setImportedCars([]);
    setErrors([]);

    // Import cars one by one
    for (const car of sampleCars) {
      try {
        await createCarMutation.mutateAsync(car);
        // Add a small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Import error:", error);
        // Continue with next car even if one fails
      }
    }
  };

  if (sessionLoading) {
    return (
      <Container className="py-10">
        <p>Loading...</p>
      </Container>
    );
  }

  // Check if user is admin
  if (!session?.isAuthenticated || !session?.user?.isAdmin) {
    return (
      <Container className="py-10">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You must be logged in as an admin to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <Card>
        <CardHeader>
          <CardTitle>BMW Import Tool</CardTitle>
          <CardDescription>
            Import sample BMW cars into the database. This will add {sampleCars.length} BMW models with high-quality images.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!importStarted ? (
            <Button onClick={importCars}>Import {sampleCars.length} BMW Cars</Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="font-medium">Progress: </span>
                <span className="ml-2">{importedCars.length}/{sampleCars.length} cars imported</span>
              </div>
              
              {importedCars.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-medium mb-2">Successfully Imported:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {importedCars.map((car, index) => (
                        <li key={index}>
                          {car.year} {car.make} {car.model} - {car.exteriorColor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {errors.length > 0 && (
                <>
                  <Separator />
                  <Alert variant="destructive">
                    <AlertTitle>Import Errors</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-5 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {importStarted && importedCars.length === sampleCars.length && (
            <Alert className="w-full">
              <AlertTitle>Import Complete</AlertTitle>
              <AlertDescription>
                All {sampleCars.length} BMW cars have been successfully imported.
              </AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>
    </Container>
  );
}