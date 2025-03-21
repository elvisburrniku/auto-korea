import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Container } from "@/components/ui/container";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import WishlistManager from "@/components/wishlist-manager";
import { useToast } from "@/hooks/use-toast";

export default function WishlistsPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // We'll implement proper authentication later if needed
        // For now, let's just use a temporary ID for wishlists
        setIsLoggedIn(true);
        setUserId('guest-user');
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking authentication:", error);
        toast({
          title: "Error",
          description: "Failed to verify authentication status",
          variant: "destructive",
        });
        setIsLoggedIn(false);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [toast]);

  if (isLoading) {
    return (
      <Container className="py-10">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </Container>
    );
  }

  if (!isLoggedIn) {
    return (
      <Container className="py-10">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
          <p className="mb-6">
            You need to sign in to access your wishlists. Please log in to continue.
          </p>
          <Button onClick={() => setLocation("/admin-login")}>
            Sign In
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <h1 className="text-3xl font-bold mb-8">My Wishlists</h1>
      
      <WishlistManager userId={userId || undefined} />
    </Container>
  );
}