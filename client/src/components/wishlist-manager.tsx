import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Wishlist, Car } from "@shared/schema";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import CarCard from "@/components/car-card";
import { FaHeart, FaShare, FaTrash, FaPlus } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";

interface WishlistManagerProps {
  userId?: string;
  selectedCars?: Car[];
  onClose?: () => void;
}

export default function WishlistManager({ userId, selectedCars = [], onClose }: WishlistManagerProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [newWishlistName, setNewWishlistName] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedWishlistId, setSelectedWishlistId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's wishlists
  useEffect(() => {
    if (userId) {
      const fetchWishlists = async () => {
        setIsLoading(true);
        try {
          const response = await apiRequest('GET', `/api/wishlists/user/${userId}`);
          setWishlists(response);
        } catch (error) {
          console.error("Error fetching wishlists:", error);
          toast({
            title: "Error",
            description: "Failed to load wishlists",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchWishlists();
    }
  }, [userId, toast]);

  // Handler for creating a new wishlist
  const handleCreateWishlist = async () => {
    if (!newWishlistName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a wishlist name",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Extract car IDs from the selected cars
      const carIds = selectedCars.map(car => car.id.toString());
      
      const newWishlist = {
        name: newWishlistName,
        userId: userId || null,
        cars: carIds,
      };

      const response = await apiRequest(
        "POST",
        "/api/wishlists",
        JSON.stringify(newWishlist)
      );

      // Add the new wishlist to the state
      setWishlists([...wishlists, response]);
      
      // Reset form and close dialog
      setNewWishlistName("");
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Wishlist created successfully",
      });

      // Invalidate cache to refresh wishlists
      queryClient.invalidateQueries({ queryKey: [`/api/wishlists/user/${userId}`] });
    } catch (error) {
      console.error("Error creating wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to create wishlist",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for adding cars to an existing wishlist
  const handleAddToWishlist = async (wishlistId: number) => {
    if (selectedCars.length === 0) {
      toast({
        title: "Error",
        description: "No cars selected to add to the wishlist",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Find the existing wishlist
      const wishlist = wishlists.find(w => w.id === wishlistId);
      if (!wishlist) {
        throw new Error("Wishlist not found");
      }

      // Get existing car IDs
      const existingCarIds = wishlist.cars || [];
      
      // Add new car IDs (avoiding duplicates)
      const selectedCarIds = selectedCars.map(car => car.id.toString());
      const updatedCarIds = Array.from(new Set([...existingCarIds, ...selectedCarIds]));
      
      // Update the wishlist
      const updatedWishlist = await apiRequest(
        "PATCH",
        `/api/wishlists/${wishlistId}`,
        JSON.stringify({ cars: updatedCarIds })
      );

      // Update the state
      setWishlists(wishlists.map(w => w.id === wishlistId ? updatedWishlist : w));
      
      toast({
        title: "Success",
        description: "Cars added to wishlist",
      });

      // Close the dialog if provided
      if (onClose) onClose();

      // Invalidate cache to refresh wishlists
      queryClient.invalidateQueries({ queryKey: [`/api/wishlists/user/${userId}`] });
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to update wishlist",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for deleting a wishlist
  const handleDeleteWishlist = async (wishlistId: number) => {
    if (!confirm("Are you sure you want to delete this wishlist?")) {
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest(
        "DELETE",
        `/api/wishlists/${wishlistId}`
      );

      // Remove the deleted wishlist from state
      setWishlists(wishlists.filter(w => w.id !== wishlistId));
      
      toast({
        title: "Success",
        description: "Wishlist deleted successfully",
      });

      // Invalidate cache to refresh wishlists
      queryClient.invalidateQueries({ queryKey: [`/api/wishlists/user/${userId}`] });
    } catch (error) {
      console.error("Error deleting wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to delete wishlist",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for generating and showing share URL
  const handleShareWishlist = (wishlist: Wishlist) => {
    const shareUrl = `${window.location.origin}/wishlist/share/${wishlist.shareId}`;
    setShareUrl(shareUrl);
    setIsShareDialogOpen(true);
  };

  // Handler for copying share URL to clipboard
  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        toast({
          title: "Success",
          description: "Link copied to clipboard",
        });
      })
      .catch(err => {
        console.error("Could not copy text: ", err);
        toast({
          title: "Error",
          description: "Failed to copy link to clipboard",
          variant: "destructive"
        });
      });
  };

  // Handler for viewing a wishlist
  const handleViewWishlist = (wishlistId: number) => {
    setLocation(`/wishlist/${wishlistId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">My Wishlists</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FaPlus className="mr-2" />
              Create New Wishlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Wishlist</DialogTitle>
              <DialogDescription>
                Give your wishlist a name and it will include your currently selected cars.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Wishlist Name
                </label>
                <Input
                  id="name"
                  placeholder="My Dream Cars"
                  value={newWishlistName}
                  onChange={(e) => setNewWishlistName(e.target.value)}
                />
              </div>
              {selectedCars.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Selected Cars ({selectedCars.length})</p>
                  <ScrollArea className="h-[200px]">
                    {selectedCars.map((car) => (
                      <div key={car.id} className="py-2">
                        <div className="font-medium">{car.make} {car.model}</div>
                        <div className="text-sm text-muted-foreground">
                          {car.year} • ${car.price.toLocaleString()}
                        </div>
                        <Separator className="my-2" />
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWishlist} disabled={isLoading}>
                Create Wishlist
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <p className="text-center">Loading wishlists...</p>}

      {!isLoading && wishlists.length === 0 && (
        <div className="text-center py-8">
          <p className="text-lg text-muted-foreground">You don't have any wishlists yet.</p>
          <Button 
            className="mt-4" 
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Create Your First Wishlist
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlists.map((wishlist) => (
          <Card key={wishlist.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle>{wishlist.name}</CardTitle>
              <CardDescription>
                {wishlist.cars?.length || 0} cars • Created {new Date(wishlist.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCars.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => handleAddToWishlist(wishlist.id)}
                  className="w-full mb-4"
                >
                  <FaPlus className="mr-2" /> Add Selected Cars
                </Button>
              )}
              <ScrollArea className="h-[150px] w-full">
                {wishlist.cars && wishlist.cars.length > 0 ? (
                  wishlist.cars.map((carId, index) => (
                    <div key={`${carId}-${index}`} className="py-2">
                      <div className="font-medium">Car ID: {carId}</div>
                      <Separator className="my-2" />
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    No cars in this wishlist yet
                  </p>
                )}
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleViewWishlist(wishlist.id)}>
                View
              </Button>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShareWishlist(wishlist)}
                >
                  <FaShare />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDeleteWishlist(wishlist.id)}
                >
                  <FaTrash />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Wishlist</DialogTitle>
            <DialogDescription>
              Copy this link to share your wishlist with others.
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-2 py-4">
            <Input value={shareUrl} readOnly />
            <Button onClick={handleCopyShareUrl}>Copy</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}