import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus, LogOut, ExternalLink, Mail, Phone } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import AdminCarForm from "@/components/admin-car-form";
import type { Car, ContactMessage } from "@shared/schema";

export default function AdminPage() {
  const [, navigate] = useLocation();
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isAddingCar, setIsAddingCar] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  
  // Helper function to safely format dates
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return 'N/A';
    try {
      return new Date(dateValue).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Helper function to safely format time
  const formatTime = (dateValue: any): string => {
    if (!dateValue) return '';
    try {
      return new Date(dateValue).toLocaleTimeString();
    } catch (e) {
      return '';
    }
  };
  const queryClient = useQueryClient();

  // Check if user is authenticated and is admin
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/auth/session');
      const data = await response.json();
      console.log("Admin session check:", data);
      return data;
    }
  });

  // Get all cars - declare query even if we're not authenticated yet
  // We'll only use the data if we're authenticated
  const { data: cars, isLoading } = useQuery({
    queryKey: ['/api/cars'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/cars');
      const data = await response.json();
      console.log("Cars data:", data);
      return data;
    },
    // Only fetch if we're authenticated and admin
    enabled: !!(session?.isAuthenticated && session?.user?.isAdmin)
  });

  // Get all contact messages
  const { data: contactMessages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['/api/contact'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/contact');
      const data = await response.json();
      console.log("Contact messages data:", data);
      return data;
    },
    // Only fetch if we're authenticated and admin
    enabled: !!(session?.isAuthenticated && session?.user?.isAdmin)
  });

  useEffect(() => {
    if (!isSessionLoading && (!session?.isAuthenticated || !session?.user?.isAdmin)) {
      console.log("Not authenticated or not admin, redirecting to login");
      navigate("/admin-login");
    }
  }, [session, isSessionLoading, navigate]);

  // Delete car mutation - defined regardless of authentication state
  // to maintain consistent hook order between renders
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(
        'DELETE',
        `/api/cars/${id}`
      );
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
  
  if (isSessionLoading) {
    return <div>Loading...</div>;
  }

  if (!session?.isAuthenticated || !session?.user?.isAdmin) {
    return null;
  }

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
      await apiRequest(
        'POST',
        '/api/auth/logout'
      );
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
                {isLoadingMessages ? (
                  <p>Loading inquiries...</p>
                ) : contactMessages && contactMessages.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Car</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Message</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contactMessages.map((message: ContactMessage) => {
                          // Find corresponding car
                          const car = cars?.find((c: Car) => c.id === message.carId);
                          return (
                            <TableRow key={message.id}>
                              <TableCell className="whitespace-nowrap">
                                {formatDate(message.createdAt)}
                              </TableCell>
                              <TableCell>{message.name}</TableCell>
                              <TableCell>
                                {car ? (
                                  <span className="whitespace-nowrap">
                                    {car.make} {car.model} ({car.year})
                                    <a href={`/car-detail/${car.id}`} target="_blank" className="ml-1 inline-block">
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </span>
                                ) : (
                                  <Badge variant="outline">Car #{message.carId}</Badge>
                                )}
                              </TableCell>
                              <TableCell>{message.subject || 'N/A'}</TableCell>
                              <TableCell>
                                <div className="flex flex-col space-y-1">
                                  <a 
                                    href={`mailto:${message.email}`} 
                                    className="flex items-center hover:underline"
                                  >
                                    <Mail className="h-3 w-3 mr-1" />
                                    {message.email}
                                  </a>
                                  {message.phone && (
                                    <a 
                                      href={`tel:${message.phone}`} 
                                      className="flex items-center hover:underline"
                                    >
                                      <Phone className="h-3 w-3 mr-1" />
                                      {message.phone}
                                    </a>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  className="p-0 h-auto hover:bg-transparent"
                                  onClick={() => {
                                    setSelectedMessage(message);
                                    setMessageDialogOpen(true);
                                  }}
                                >
                                  <div className="max-w-xs truncate text-left">
                                    {message.message}
                                  </div>
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No inquiries found</p>
                    <p className="text-sm mt-2">Customer inquiries will appear here when they contact you about a car</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Container>
      
      {/* Message Detail Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Inquiry from {selectedMessage?.name}
              {selectedMessage?.subject && <span className="text-muted-foreground"> - {selectedMessage.subject}</span>}
            </DialogTitle>
            <DialogDescription>
              {selectedMessage && (
                <div className="flex flex-col gap-1 mt-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>
                      {formatDate(selectedMessage.createdAt) !== 'N/A' && (
                        <>
                          {formatDate(selectedMessage.createdAt)} at {' '}
                          {formatTime(selectedMessage.createdAt)}
                        </>
                      )}
                    </span>
                    {cars && selectedMessage && (
                      <span>
                        {(() => {
                          const car = cars.find((c: Car) => c.id === selectedMessage.carId);
                          return car 
                            ? `${car.make} ${car.model} (${car.year})`
                            : `Car #${selectedMessage.carId}`;
                        })()}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 mt-1">
                    <a 
                      href={`mailto:${selectedMessage.email}`}
                      className="flex items-center text-primary hover:underline"
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      {selectedMessage.email}
                    </a>
                    {selectedMessage.phone && (
                      <a 
                        href={`tel:${selectedMessage.phone}`}
                        className="flex items-center text-primary hover:underline"
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        {selectedMessage.phone}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="mt-4 p-4 bg-muted rounded-md whitespace-pre-wrap">
              {selectedMessage.message}
            </div>
          )}
          
          <div className="flex justify-between mt-6">
            <Button 
              variant="secondary" 
              onClick={() => setMessageDialogOpen(false)}
            >
              Close
            </Button>
            {selectedMessage && (
              <Button 
                variant="default"
                onClick={() => {
                  window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Your inquiry'}&body=Hello ${selectedMessage.name},%0D%0A%0D%0AThank you for your interest in our vehicle.%0D%0A%0D%0A`;
                }}
              >
                <Mail className="h-4 w-4 mr-2" />
                Reply via Email
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}