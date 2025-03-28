import { useState, useEffect } from "react";
import { Car } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FaHeart } from "react-icons/fa";
import WishlistManager from "@/components/wishlist-manager";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AddToWishlistProps {
  car: Car;
  userId?: string;
  variant?: "icon" | "default";
  className?: string;
}

export default function AddToWishlist({ car, userId, variant = "default", className = "" }: AddToWishlistProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(!!userId);

  useEffect(() => {
    // Check if user is logged in
    if (!userId) {
      const checkSession = async () => {
        try {
          const response = await apiRequest('GET', '/api/auth/session');
          const data = await response.json();
          console.log("Session data:", data);
          setIsLoggedIn(data.isAuthenticated);
        } catch (error) {
          console.error("Error checking session:", error);
        }
      };
      
      checkSession();
    } else {
      setIsLoggedIn(true);
    }
  }, [userId]);

  const handleAddToWishlist = () => {
    if (!isLoggedIn) {
      toast({
        title: "Kërkohet Autentifikim",
        description: "Ju lutemi hyni për të shtuar vetura në listën tuaj të dëshirave",
        variant: "destructive"
      });
      return;
    }
    
    setIsDialogOpen(true);
  };

  return (
    <>
      {variant === "icon" ? (
        <Button 
          variant="ghost" 
          size="icon" 
          className={className} 
          onClick={handleAddToWishlist}
          aria-label="Add to wishlist"
        >
          <FaHeart className="h-5 w-5" />
        </Button>
      ) : (
        <Button 
          variant="outline" 
          className={`${className} flex items-center`} 
          onClick={handleAddToWishlist}
        >
          <FaHeart className="mr-2 h-4 w-4" />
          Shto në Listën e Dëshirave
        </Button>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Shto në Listën e Dëshirave</DialogTitle>
            <DialogDescription>
              Shtoni këtë veturë në një listë ekzistuese të dëshirave ose krijoni një të re.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <WishlistManager 
              userId={userId} 
              selectedCars={[car]} 
              onClose={() => setIsDialogOpen(false)} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}