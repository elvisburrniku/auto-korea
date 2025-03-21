import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Wishlist, Car } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import CarCard from "@/components/car-card";
import { FaShareAlt, FaArrowLeft } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function WishlistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    const fetchWishlist = async () => {
      setIsLoading(true);
      try {
        // Determine if this is a regular wishlist or a shared wishlist
        const isSharedWishlist = location.includes('/wishlist/share/');
        
        let wishlistData;
        if (isSharedWishlist) {
          wishlistData = await apiRequest(`/api/wishlists/share/${id}`);
        } else {
          wishlistData = await apiRequest(`/api/wishlists/${id}`);
        }
        
        setWishlist(wishlistData);

        // Now fetch all cars and filter to those in the wishlist
        if (wishlistData.cars && wishlistData.cars.length > 0) {
          const allCars = await apiRequest('/api/cars');
          const wishlistCars = allCars.filter((car: Car) => 
            wishlistData.cars.includes(car.id.toString())
          );
          setCars(wishlistCars);
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        toast({
          title: "Error",
          description: "Failed to load wishlist",
          variant: "destructive"
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchWishlist();
    }
  }, [id, location, navigate, toast]);

  // Handler for sharing the wishlist
  const handleShare = () => {
    if (wishlist) {
      const url = `${window.location.origin}/wishlist/share/${wishlist.shareId}`;
      setShareUrl(url);
      setIsShareDialogOpen(true);
    }
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

  // Handler for going back
  const handleBack = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <Container className="py-10">
        <div className="flex flex-col space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[300px] w-full" />
            ))}
          </div>
        </div>
      </Container>
    );
  }

  if (!wishlist) {
    return (
      <Container className="py-10">
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold mb-4">Wishlist Not Found</h2>
          <p className="mb-6">The wishlist you're looking for doesn't exist or has been removed.</p>
          <Button onClick={handleBack}>
            <FaArrowLeft className="mr-2" /> Back to Home
          </Button>
        </div>
      </Container>
    );
  }

  const isShared = location.includes('/wishlist/share/');

  return (
    <Container className="py-10">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" onClick={handleBack}>
            <FaArrowLeft className="mr-2" /> Back
          </Button>
          {!isShared && (
            <Button onClick={handleShare}>
              <FaShareAlt className="mr-2" /> Share Wishlist
            </Button>
          )}
        </div>
        <h1 className="text-3xl font-bold">{wishlist.name}</h1>
        <p className="text-muted-foreground">
          {isShared ? "Shared Wishlist" : "My Wishlist"} • {cars.length} cars
        </p>
      </div>

      <Separator className="my-6" />

      {cars.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <h3 className="text-xl font-semibold mb-2">No Cars Found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              This wishlist doesn't have any cars yet. {!isShared && "Add some cars to your wishlist to see them here."}
            </p>
            {!isShared && (
              <Button className="mt-4" onClick={() => navigate("/browse-cars")}>
                Browse Cars
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}

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
    </Container>
  );
}