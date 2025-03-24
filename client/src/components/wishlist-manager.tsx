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

  // Merr wishlist-et e përdoruesit
  useEffect(() => {
    if (userId) {
      const fetchWishlists = async () => {
        setIsLoading(true);
        try {
          const response = await apiRequest('GET', `/api/wishlists/user/${userId}`);
          const data = await response.json();
          console.log("Wishlist-et e përdoruesit:", data);
          setWishlists(data);
        } catch (error) {
          console.error("Gabim gjatë marrëveshjes së wishlist-eve:", error);
          toast({
            title: "Gabim",
            description: "Dështim në ngarkimin e wishlist-eve",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchWishlists();
    }
  }, [userId, toast]);

  // Menaxhimi për krijimin e një wishlist-i të ri
  const handleCreateWishlist = async () => {
    if (!newWishlistName.trim()) {
      toast({
        title: "Gabim",
        description: "Ju lutem vendosni një emër për wishlist-in",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Nxjerrni ID-të e makinave nga makinat e përzgjedhura
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
      
      const data = await response.json();
      console.log("Krijuar wishlist:", data);

      // Shtoni wishlist-in e ri në shtetin
      setWishlists([...wishlists, data]);
      
      // Rinisni formularin dhe mbyllni dialogun
      setNewWishlistName("");
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Sukses",
        description: "Wishlist-i u krijua me sukses",
      });

      // Invalidoni cache-n për të rifreskuar wishlist-et
      queryClient.invalidateQueries({ queryKey: [`/api/wishlists/user/${userId}`] });
    } catch (error) {
      console.error("Gabim gjatë krijimit të wishlist-it:", error);
      toast({
        title: "Gabim",
        description: "Dështim në krijimin e wishlist-it",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Menaxhimi për shtimin e makinave në një wishlist ekzistuese
  const handleAddToWishlist = async (wishlistId: number) => {
    if (selectedCars.length === 0) {
      toast({
        title: "Gabim",
        description: "Nuk ka makina të përzgjedhura për t'u shtuar në wishlist",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Gjeni wishlist-in ekzistues
      const wishlist = wishlists.find(w => w.id === wishlistId);
      if (!wishlist) {
        throw new Error("Wishlist-i nuk u gjet");
      }

      // Merrni ID-të e makinave ekzistuese
      const existingCarIds = wishlist.cars || [];
      
      // Shtoni ID-të e makinave të reja (pa u dyfishuar)
      const selectedCarIds = selectedCars.map(car => car.id.toString());
      const updatedCarIds = Array.from(new Set([...existingCarIds, ...selectedCarIds]));
      
      // Përshtatni wishlist-in
      const response = await apiRequest(
        "PATCH",
        `/api/wishlists/${wishlistId}`,
        JSON.stringify({ cars: updatedCarIds })
      );
      
      const updatedWishlist = await response.json();
      console.log("Wishlist i përditësuar:", updatedWishlist);

      // Përshtatni shtetin
      setWishlists(wishlists.map(w => w.id === wishlistId ? updatedWishlist : w));
      
      toast({
        title: "Sukses",
        description: "Makina u shtuan në wishlist",
      });

      // Mbyllni dialogun nëse është ofruar
      if (onClose) onClose();

      // Invalidoni cache-n për të rifreskuar wishlist-et
      queryClient.invalidateQueries({ queryKey: [`/api/wishlists/user/${userId}`] });
    } catch (error) {
      console.error("Gabim gjatë shtimit në wishlist:", error);
      toast({
        title: "Gabim",
        description: "Dështim në përditësimin e wishlist-it",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Menaxhimi për fshirjen e një wishlist-i
  const handleDeleteWishlist = async (wishlistId: number) => {
    if (!confirm("Jeni të sigurt që doni të fshini këtë wishlist?")) {
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest(
        "DELETE",
        `/api/wishlists/${wishlistId}`
      );

      // Hiqni wishlist-in e fshirë nga shteti
      setWishlists(wishlists.filter(w => w.id !== wishlistId));
      
      toast({
        title: "Sukses",
        description: "Wishlist-i u fshi me sukses",
      });

      // Invalidoni cache-n për të rifreskuar wishlist-et
      queryClient.invalidateQueries({ queryKey: [`/api/wishlists/user/${userId}`] });
    } catch (error) {
      console.error("Gabim gjatë fshirjes së wishlist-it:", error);
      toast({
        title: "Gabim",
        description: "Dështim në fshirjen e wishlist-it",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Menaxhimi për krijimin dhe shfaqjen e URL-së për ndarjen
  const handleShareWishlist = (wishlist: Wishlist) => {
    const shareUrl = `${window.location.origin}/wishlist/share/${wishlist.shareId}`;
    setShareUrl(shareUrl);
    setIsShareDialogOpen(true);
  };

  // Menaxhimi për kopjimin e URL-së për ndarjen në clipboard
  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        toast({
          title: "Sukses",
          description: "Linku u kopjua në clipboard",
        });
      })
      .catch(err => {
        console.error("Nuk mund të kopjohet teksti: ", err);
        toast({
          title: "Gabim",
          description: "Dështim në kopjimin e linkut në clipboard",
          variant: "destructive"
        });
      });
  };

  // Menaxhimi për shikimin e një wishlist-i
  const handleViewWishlist = (wishlistId: number) => {
    setLocation(`/wishlist/${wishlistId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Wishlist-ët E Mia</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FaPlus className="mr-2" />
              Krijoni Wishlist të Ri
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Krijoni një Wishlist të Ri</DialogTitle>
              <DialogDescription>
                Jepni një emër wishlist-it tuaj dhe ai do të përfshijë makinat që keni përzgjedhur.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Emri i Wishlist-it
                </label>
                <Input
                  id="name"
                  placeholder="Makina ime të Dëshiruara"
                  value={newWishlistName}
                  onChange={(e) => setNewWishlistName(e.target.value)}
                />
              </div>
              {selectedCars.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Makina të Përzgjedhura ({selectedCars.length})</p>
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
                Anulo
              </Button>
              <Button onClick={handleCreateWishlist} disabled={isLoading}>
                Krijo Wishlist
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <p className="text-center">Po ngarkohen wishlist-et...</p>}

      {!isLoading && Array.isArray(wishlists) && wishlists.length === 0 && (
        <div className="text-center py-8">
          <p className="text-lg text-muted-foreground">Nuk keni asnjë wishlist deri tani.</p>
          <Button 
            className="mt-4" 
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Krijo Wishlist-in Tënd të Parë
          </Button>
        </div>
      )}

      {!isLoading && Array.isArray(wishlists) && wishlists.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlists.map((wishlist) => (
            <Card key={wishlist.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{wishlist.name}</CardTitle>
                <CardDescription>
                  {wishlist.cars?.length || 0} makina • Krijuar {new Date(wishlist.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedCars.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => handleAddToWishlist(wishlist.id)}
                    className="w-full mb-4"
                  >
                    <FaPlus className="mr-2" /> Shto Makina të Përzgjedhura
                  </Button>
                )}
                <ScrollArea className="h-[150px] w-full">
                  {wishlist.cars && wishlist.cars.length > 0 ? (
                    wishlist.cars.map((carId, index) => (
                      <div key={`${carId}-${index}`} className="py-2">
                        <div className="font-medium">ID e Makinës: {carId}</div>
                        <Separator className="my-2" />
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">
                      Nuk ka makina në këtë wishlist ende
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleViewWishlist(wishlist.id)}>
                  Shiko
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
      )}

      {/* Dialogu i Ndarjes */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ndaj Wishlist-in</DialogTitle>
            <DialogDescription>
              Kopjoni këtë lidhje për të ndarë wishlist-in tuaj me të tjerët.
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-2 py-4">
            <Input value={shareUrl} readOnly />
            <Button onClick={handleCopyShareUrl}>Kopjo</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}