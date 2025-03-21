import { useState } from "react";
import { cn } from "@/lib/utils";

interface CarGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

export default function CarGallery({ images, alt, className }: CarGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={cn("bg-neutral-100 rounded-lg overflow-hidden", className)}>
        <div className="w-full h-64 flex items-center justify-center">
          <p className="text-neutral-500">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="bg-neutral-100 rounded-lg overflow-hidden mb-4">
        <img 
          src={images[selectedImage]} 
          alt={`${alt} - Image ${selectedImage + 1}`} 
          className="w-full h-auto object-cover rounded-lg"
        />
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {images.map((image, index) => (
          <img 
            key={index}
            src={image} 
            alt={`${alt} - Thumbnail ${index + 1}`} 
            className={cn(
              "w-full h-16 md:h-20 object-cover rounded cursor-pointer transition-all",
              selectedImage === index 
                ? "ring-2 ring-primary" 
                : "opacity-80 hover:opacity-100"
            )}
            onClick={() => setSelectedImage(index)}
          />
        ))}
        
        {/* Fill in empty spots with placeholders if less than 5 images */}
        {[...Array(Math.max(0, 5 - images.length))].map((_, index) => (
          <div 
            key={`placeholder-${index}`}
            className="w-full h-16 md:h-20 bg-neutral-200 rounded"
          />
        ))}
      </div>
    </div>
  );
}
