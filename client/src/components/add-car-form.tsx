import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { InsertCar, carValidationSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

// Default values for the form
const defaultValues: Partial<InsertCar> = {
  make: "",
  model: "",
  year: new Date().getFullYear(),
  price: 0,
  mileage: 0,
  fuelType: "Gasoline",
  transmission: "Automatic",
  drivetrain: "FWD",
  exteriorColor: "",
  interiorColor: "",
  vin: "",
  engineDetails: "",
  mpg: "",
  description: "",
  sellerName: "",
  sellerPhone: "",
  sellerSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  images: [],
  features: [],
  isFeatured: false
};

export default function AddCarForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Setup form with validation
  const form = useForm<InsertCar>({
    resolver: zodResolver(carValidationSchema),
    defaultValues,
  });

  // Add an image URL to the list
  const addImageUrl = () => {
    if (newImageUrl && !imageUrls.includes(newImageUrl)) {
      const updatedUrls = [...imageUrls, newImageUrl];
      setImageUrls(updatedUrls);
      form.setValue("images", updatedUrls);
      setNewImageUrl("");
    }
  };

  // Remove an image URL from the list
  const removeImageUrl = (url: string) => {
    const updatedUrls = imageUrls.filter(i => i !== url);
    setImageUrls(updatedUrls);
    form.setValue("images", updatedUrls);
  };

  // Common car features
  const commonFeatures = [
    "Leather Seats", "Navigation", "Bluetooth", "Sunroof", "Backup Camera",
    "Heated Seats", "Heated Steering Wheel", "Cooled Seats", "Premium Audio",
    "Apple CarPlay", "Android Auto", "Lane Assist", "Blind Spot Monitor",
    "Adaptive Cruise Control", "Parking Sensors", "Remote Start", "Keyless Entry",
    "Push Button Start", "Third Row Seating", "Tow Package"
  ];

  // Toggle a feature selection
  const toggleFeature = (feature: string) => {
    const isSelected = selectedFeatures.includes(feature);
    let updated: string[];
    
    if (isSelected) {
      updated = selectedFeatures.filter(f => f !== feature);
    } else {
      updated = [...selectedFeatures, feature];
    }
    
    setSelectedFeatures(updated);
    form.setValue("features", updated);
  };

  // Add custom feature
  const [customFeature, setCustomFeature] = useState("");
  const addCustomFeature = () => {
    if (customFeature && !selectedFeatures.includes(customFeature)) {
      const updated = [...selectedFeatures, customFeature];
      setSelectedFeatures(updated);
      form.setValue("features", updated);
      setCustomFeature("");
    }
  };

  // Mutation for creating a car
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: InsertCar) => {
      const res = await apiRequest("POST", "/api/cars", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cars'] });
      toast({
        title: "Success!",
        description: "Your car has been successfully listed.",
      });
      navigate("/browse-cars");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: InsertCar) => {
    // Ensure images and features are set correctly
    data.images = imageUrls;
    data.features = selectedFeatures;
    
    mutate(data);
  };

  // Generate years for dropdown (from 1950 to current year + 1)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1950 + 2 }, (_, i) => currentYear - i + 1).reverse();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>List Your Car</CardTitle>
        <CardDescription>
          Provide details about your vehicle to create a listing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                
                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Toyota" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Camry" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year*</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="e.g. 25000"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mileage*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="e.g. 15000"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="vin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VIN</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 1HGCM82633A123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Vehicle Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Vehicle Details</h3>
                
                <FormField
                  control={form.control}
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuel Type*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Fuel Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Gasoline">Gasoline</SelectItem>
                          <SelectItem value="Diesel">Diesel</SelectItem>
                          <SelectItem value="Electric">Electric</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                          <SelectItem value="Plug-in Hybrid">Plug-in Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="transmission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transmission*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Transmission" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Automatic">Automatic</SelectItem>
                          <SelectItem value="Manual">Manual</SelectItem>
                          <SelectItem value="CVT">CVT</SelectItem>
                          <SelectItem value="Dual-Clutch">Dual-Clutch</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="drivetrain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Drivetrain*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Drivetrain" />
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
                
                <FormField
                  control={form.control}
                  name="exteriorColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exterior Color*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Midnight Blue" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="interiorColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interior Color*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Black Leather" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="engineDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Engine Details</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 2.5L I4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="mpg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MPG / Range</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 30 city / 38 highway" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your vehicle in detail..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Features */}
            <div>
              <FormLabel className="block mb-2">Features</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {commonFeatures.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={`feature-${feature}`}
                      checked={selectedFeatures.includes(feature)}
                      onCheckedChange={() => toggleFeature(feature)}
                    />
                    <label
                      htmlFor={`feature-${feature}`}
                      className="text-sm cursor-pointer"
                    >
                      {feature}
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="flex items-end gap-2 mt-2">
                <div className="flex-grow">
                  <FormLabel htmlFor="custom-feature">
                    Add Custom Feature
                  </FormLabel>
                  <Input
                    id="custom-feature"
                    value={customFeature}
                    onChange={(e) => setCustomFeature(e.target.value)}
                    placeholder="e.g. Panoramic Roof"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCustomFeature}
                  disabled={!customFeature}
                >
                  Add
                </Button>
              </div>
            </div>
            
            {/* Images */}
            <div>
              <FormLabel className="block mb-2">Images*</FormLabel>
              <FormDescription className="mb-2">
                Add URLs of your vehicle images. At least one image is required.
              </FormDescription>
              
              <div className="flex items-end gap-2">
                <div className="flex-grow">
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Image URL"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addImageUrl}
                  disabled={!newImageUrl}
                >
                  Add
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
            
            {/* Seller Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="sellerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. John Smith" {...field} />
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
                    <FormLabel>Phone Number (for WhatsApp)*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. +1234567890" {...field} />
                    </FormControl>
                    <FormDescription>
                      Include country code (e.g., +1 for US)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Featured Listing */}
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Featured Listing</FormLabel>
                    <FormDescription>
                      Make your listing appear as featured (premium)
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Creating Listing..." : "Create Listing"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
