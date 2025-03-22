import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Car } from "@shared/schema";

export default function EncarImportPage() {
  const { toast } = useToast();
  const [importStarted, setImportStarted] = useState(false);
  const [importedCars, setImportedCars] = useState<Car[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [searchUrl, setSearchUrl] = useState("http://www.encar.com/fc/fc_carsearchlist.do?carType=for&searchType=model&MakeName=BMW&ModelName=3%EC%8B%9C%EB%A6%AC%EC%A6%88");

  // Get current session to check if user is admin
  const { data: session, isLoading: sessionLoading } = useQuery<{
    isAuthenticated: boolean;
    user?: { id: number; username: string; isAdmin: boolean };
  }>({
    queryKey: ['/api/auth/session'],
    refetchOnWindowFocus: false,
  });

  // Mutation for running the Encar import
  const runImportMutation = useMutation<any, Error, { url: string }>({
    mutationFn: async (data) => {
      const response = await apiRequest('POST', '/api/cars/import/encar', data);
      const json = await response.json();
      
      // If the response is not successful, throw an error with the details
      if (!json.success) {
        const error = new Error(json.message);
        (error as any).details = json.details;
        throw error;
      }
      
      return json;
    },
    onSuccess: (data) => {
      if (data?.cars?.length > 0) {
        setImportedCars(data.cars);
        toast({
          title: "Import successful",
          description: `Successfully imported ${data.cars.length} cars from Encar.com`,
        });
      } else {
        setErrors(prev => [...prev, "No cars were found or imported"]);
        toast({
          title: "Import result",
          description: "No cars were found or imported",
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Unknown error occurred";
      setErrors(prev => [...prev, `Import failed: ${errorMessage}`]);
      
      // Add any additional details if available
      if (error.details && Array.isArray(error.details)) {
        setErrors(prev => [...prev, ...error.details]);
      }
      
      toast({
        title: "Import failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  // Sample BMW cars that will be imported if web scraping fails
  const sampleCars = [
    {
      make: "BMW",
      model: "320i",
      year: 2022,
      price: 36000,
      fuelType: "Gasoline",
      transmission: "Automatic"
    },
    {
      make: "BMW",
      model: "330i xDrive",
      year: 2021,
      price: 42000,
      fuelType: "Gasoline",
      transmission: "Automatic"
    },
    {
      make: "BMW",
      model: "M340i",
      year: 2020,
      price: 48000,
      fuelType: "Gasoline",
      transmission: "Automatic"
    },
    {
      make: "BMW",
      model: "430i Coupe",
      year: 2022,
      price: 45500,
      fuelType: "Gasoline",
      transmission: "Automatic"
    }
  ];

  const importFromEncar = async () => {
    setImportStarted(true);
    setImportedCars([]);
    setErrors([]);

    // Since we can't directly use the scraper from the frontend,
    // we'll use a backend route that will trigger the scraping process
    runImportMutation.mutate({ url: searchUrl });
  };

  const importSampleData = async () => {
    setImportStarted(true);
    setImportedCars([]);
    setErrors([]);

    // Call our existing BMW import functionality
    try {
      const response = await apiRequest('POST', '/api/cars/import/bmw', {});
      const data = await response.json();
      setImportedCars(data.cars || []);
      // Invalidate queries to refresh car lists
      queryClient.invalidateQueries({ queryKey: ['/api/cars'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cars/recent/list'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cars/featured/list'] });
      
      toast({
        title: "Import successful",
        description: `Successfully imported ${data.cars?.length || 0} sample BMW cars`,
      });
    } catch (error: any) {
      setErrors(prev => [...prev, `Sample import failed: ${error.message}`]);
      toast({
        title: "Sample import failed",
        description: error.message,
        variant: "destructive"
      });
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
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Encar.com Import Tool</CardTitle>
          <CardDescription>
            Import vehicles from Encar.com, a popular Korean car marketplace. 
            Due to web scraping limitations in the browser, this feature requires using 
            the terminal command for full functionality.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="search-url">Encar.com Search URL</Label>
                <Input 
                  id="search-url" 
                  type="text" 
                  value={searchUrl}
                  onChange={(e) => setSearchUrl(e.target.value)}
                  placeholder="http://www.encar.com/fc/fc_carsearchlist.do?..."
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Go to Encar.com, search for cars, and paste the search results URL here.
                </p>
              </div>
            </div>

            {!importStarted ? (
              <div className="flex flex-col md:flex-row gap-2">
                <Button 
                  onClick={importFromEncar} 
                  disabled={runImportMutation.isPending}
                  className="flex-1"
                >
                  {runImportMutation.isPending ? "Importing..." : "Import from Encar.com"}
                </Button>
                <span className="hidden md:inline text-center my-2">or</span>
                <Button 
                  onClick={importSampleData} 
                  variant="outline"
                  className="flex-1"
                >
                  Import Sample BMW Data
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="font-medium">Progress: </span>
                  <span className="ml-2">
                    {runImportMutation.isPending ? "Importing..." : `${importedCars.length} cars imported`}
                  </span>
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
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-sm text-muted-foreground mt-2">
            <p className="font-medium">Important Notes:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Web scraping is complex and may fail due to website structure changes</li>
              <li>The import process might take a few minutes to complete</li>
              <li>You can also run the import script manually via the terminal using <code>node scripts/encar-scraper.js</code></li>
            </ul>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technical Details</CardTitle>
          <CardDescription>
            How the Encar.com import tool works
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              The Encar.com import script works by:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Fetching the HTML content from the Encar.com search results page</li>
              <li>Parsing the HTML to extract car details (make, model, price, year, etc.)</li>
              <li>Downloading and saving images locally</li>
              <li>Converting the data to match our car database schema</li>
              <li>Importing each car into our database</li>
            </ol>
            <p>
              Due to web scraping limitations in browsers, this feature requires using the terminal command.
              The browser interface cannot directly scrape Encar.com due to encoding challenges and session requirements.
              For full functionality, please use <code>node scripts/encar-scraper.js</code> in the terminal.
            </p>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}