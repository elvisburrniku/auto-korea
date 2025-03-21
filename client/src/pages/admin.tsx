import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash2, Plus, LogOut } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import AdminCarForm from "@/components/admin-car-form";
import type { Car } from "@shared/schema";

export default function AdminPage() {
  const [, navigate] = useLocation();
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isAddingCar, setIsAddingCar] = useState(false);
  const queryClient = useQueryClient();

  // Check if user is authenticated and is admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest('/api/auth/session');
        if (!response.isAuthenticated || !response.user.isAdmin) {
          navigate("/admin-login");
        }
      } catch (error) {
        navigate("/admin-login");
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Get all cars
  const { data: cars, isLoading } = useQuery({
    queryKey: ['/api/cars'],
    queryFn: async () => {
      const data = await apiRequest('/api/cars');
      return data;
    }
  });

  // Delete car mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/cars/${id}`, {
        method: 'DELETE',
      });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cars'] });
      toast({
        title: "Success",
        description: "Car deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete car",
        variant: "destructive",
      });
      console.error("Error deleting car:", error);
    }
  });

  const handleEdit = (car: Car) => {
    setSelectedCar(car);
    setIsAddingCar(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this car?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNewCar = () => {
    setSelectedCar(null);
    setIsAddingCar(true);
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      navigate("/admin-login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-6">
      <Container>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="cars">
          <TabsList className="mb-4">
            <TabsTrigger value="cars">Cars</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cars">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Car Listings</CardTitle>
                      <Button onClick={handleAddNewCar}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Car
                      </Button>
                    </div>
                    <CardDescription>
                      Manage all car listings from here
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <p>Loading cars...</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Make</TableHead>
                              <TableHead>Model</TableHead>
                              <TableHead>Year</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Featured</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cars && cars.length > 0 ? (
                              cars.map((car: Car) => (
                                <TableRow key={car.id}>
                                  <TableCell>{car.id}</TableCell>
                                  <TableCell>{car.make}</TableCell>
                                  <TableCell>{car.model}</TableCell>
                                  <TableCell>{car.year}</TableCell>
                                  <TableCell>${car.price.toLocaleString()}</TableCell>
                                  <TableCell>{car.isFeatured ? "Yes" : "No"}</TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => handleEdit(car)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="destructive" 
                                        size="sm"
                                        onClick={() => handleDelete(car.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                  No cars found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {isAddingCar 
                        ? "Add New Car" 
                        : selectedCar 
                          ? "Edit Car" 
                          : "Car Details"
                      }
                    </CardTitle>
                    <CardDescription>
                      {isAddingCar
                        ? "Add a new car to the listings"
                        : selectedCar
                          ? `Editing ${selectedCar.make} ${selectedCar.model}`
                          : "Select a car to edit its details"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(isAddingCar || selectedCar) ? (
                      <AdminCarForm 
                        car={selectedCar} 
                        onSuccess={() => {
                          setSelectedCar(null);
                          setIsAddingCar(false);
                          queryClient.invalidateQueries({ queryKey: ['/api/cars'] });
                        }}
                      />
                    ) : (
                      <p className="text-center text-muted-foreground py-6">
                        Select a car from the list to edit or click "Add New Car"
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="inquiries">
            <Card>
              <CardHeader>
                <CardTitle>Contact Inquiries</CardTitle>
                <CardDescription>
                  View and manage all customer inquiries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Inquiry management feature coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  );
}