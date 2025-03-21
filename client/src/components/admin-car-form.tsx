import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { InsertCar, Car, carValidationSchema } from "@shared/schema";
import { UploadCloud, Loader2 } from "lucide-react";

interface AdminCarFormProps {
  car?: Car | null;
  onSuccess?: () => void;
}

// Current year for max year selection
const currentYear = new Date().getFullYear();

export default function AdminCarForm({ car, onSuccess }: AdminCarFormProps) {
  const [imageUrls, setImageUrls] = useState<string[]>(car?.images || []);
  const [newImageUrl, setNewImageUrl] = useState("");
  
  const isEditMode = !!car;
  
  // Use effect to reset the form and image state when car prop changes
  useEffect(() => {
    setImageUrls(car?.images || []);
    form.reset(
      car ? {
        ...car,
        // Make sure the form doesn't try to control these values
        id: undefined,
        createdAt: undefined,
      } : {
        make: "",
        model: "",
        year: currentYear,
        price: 0,
        mileage: 0,
        fuelType: "Gasoline",
        transmission: "Automatic",
        drivetrain: "FWD",
        exteriorColor: "",
        interiorColor: "",
        vin: null,
        engineDetails: null,
        mpg: null,
        features: [],
        description: null,
        sellerName: "",
        sellerPhone: "",
        sellerEmail: "",
        sellerSince: null,
        isFeatured: false,
        images: [],
      }
    );
  }, [car]);
  
  // Set up the form
  const form = useForm<InsertCar>({
    resolver: zodResolver(carValidationSchema),
    defaultValues: car ? {
      ...car,
      // Make sure the form doesn't try to control these values
      id: undefined,
      createdAt: undefined,
    } : {
      make: "",
      model: "",
      year: currentYear,
      price: 0,
      mileage: 0,
      fuelType: "Gasoline",
      transmission: "Automatic",
      drivetrain: "FWD",
      exteriorColor: "",
      interiorColor: "",
      sellerName: "AutoMarket Dealership",
      sellerPhone: "+1234567890",
      sellerSince: "March 2023",
      images: [],
      isFeatured: false,
    }
  });
  
  // Create or update car mutation
  const mutation = useMutation({
    mutationFn: async (data: InsertCar) => {
      if (isEditMode && car) {
        return apiRequest(
          'PATCH',
          `/api/cars/${car.id}`,
          data
        );
      } else {
        return apiRequest(
          'POST',
          '/api/cars',
          data
        );
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: isEditMode ? "Car updated successfully" : "Car created successfully",
      });
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save car",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: InsertCar) => {
    // Make sure images are included
    data.images = imageUrls;
    // For safety, set seller info if it's empty
    if (!data.sellerName) {
      data.sellerName = "AutoMarket Dealership";
    }
    if (!data.sellerPhone) {
      data.sellerPhone = "+1234567890";
    }
    
    mutation.mutate(data);
  };
  
  const addImageUrl = () => {
    if (!newImageUrl) return;
    
    const updatedImages = [...imageUrls, newImageUrl];
    setImageUrls(updatedImages);
    // Update the form value for images directly
    form.setValue("images", updatedImages, { shouldValidate: true });
    setNewImageUrl("");
  };
  
  const removeImageUrl = (url: string) => {
    const updatedImages = imageUrls.filter(imgUrl => imgUrl !== url);
    setImageUrls(updatedImages);
    // Update the form value for images directly
    form.setValue("images", updatedImages, { shouldValidate: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Make */}
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Make</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Toyota" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Model */}
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Camry" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Year */}
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    min="1900" 
                    max={currentYear + 1}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Price */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    min="0"
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Mileage */}
          <FormField
            control={form.control}
            name="mileage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mileage</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    min="0"
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Fuel Type */}
          <FormField
            control={form.control}
            name="fuelType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fuel Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Gasoline">Gasoline</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Transmission */}
          <FormField
            control={form.control}
            name="transmission"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transmission</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transmission" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="CVT">CVT</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Drivetrain */}
          <FormField
            control={form.control}
            name="drivetrain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Drivetrain</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select drivetrain" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="FWD">FWD</SelectItem>
                    <SelectItem value="RWD">RWD</SelectItem>
                    <SelectItem value="AWD">AWD</SelectItem>
                    <SelectItem value="4WD">4WD</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Exterior Color */}
          <FormField
            control={form.control}
            name="exteriorColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exterior Color</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Black" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Interior Color */}
          <FormField
            control={form.control}
            name="interiorColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interior Color</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Beige Leather" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* VIN */}
          <FormField
            control={form.control}
            name="vin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>VIN (optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Vehicle Identification Number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Engine Details */}
          <FormField
            control={form.control}
            name="engineDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Engine (optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. 2.0L Turbocharged" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* MPG */}
          <FormField
            control={form.control}
            name="mpg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MPG/Range (optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. 25 city / 32 highway" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Detailed description of the vehicle" 
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Seller Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="sellerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seller Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="AutoMarket Dealership" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="sellerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seller Phone</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="+1234567890" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="sellerSince"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seller Since (optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. January 2022" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Featured */}
        <FormField
          control={form.control}
          name="isFeatured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Featured Listing</FormLabel>
                <FormDescription>
                  This car will be shown in the featured listings on the homepage
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        {/* Images */}
        <div className="space-y-2">
          <FormLabel>Images</FormLabel>
          <div className="flex space-x-2">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Image URL"
              className="flex-1"
            />
            <Button type="button" onClick={addImageUrl}>
              Add Image
            </Button>
          </div>
          
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Car image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImageUrl(url)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {form.formState.errors.images && (
            <p className="text-sm font-medium text-destructive mt-2">
              {form.formState.errors.images.message}
            </p>
          )}
        </div>
        
        {/* Submit button */}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : isEditMode ? "Update Car" : "Add Car"}
        </Button>
      </form>
    </Form>
  );
}