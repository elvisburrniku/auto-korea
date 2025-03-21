import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
  size?: "small" | "medium" | "large";
  className?: string;
}

export function WhatsAppButton({ 
  phoneNumber, 
  message = "", 
  size = "medium",
  className 
}: WhatsAppButtonProps) {
  // Format the phone number by removing non-numeric characters except +
  const formattedPhone = phoneNumber.replace(/[^\d+]/g, "");
  
  // Build the WhatsApp URL - properly encode the message to avoid %20 issues
  const whatsappUrl = `https://wa.me/${formattedPhone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
  
  // Size-specific styles
  const sizeStyles = {
    small: "flex items-center justify-center px-3 py-2 text-xs rounded-md",
    medium: "flex items-center justify-center px-4 py-2 rounded-md",
    large: "flex items-center justify-center px-6 py-3 rounded-md text-lg"
  };
  
  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className={cn(
        "whatsapp-button bg-green-500 hover:bg-green-600 text-white transition-all",
        sizeStyles[size],
        "hover:scale-105",
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cn(
          "mr-2",
          size === "small" ? "h-3 w-3" : size === "large" ? "h-5 w-5" : "h-4 w-4"
        )}
      >
        <path d="M16.6 14c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.2-.5-.5-1-1.1-1.4-1.7-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.4.1-.1.2-.3.2-.4.1-.1.1-.3 0-.4-.1-.1-.6-1.3-.8-1.8-.1-.7-.3-.7-.5-.7h-.5c-.2 0-.5.2-.6.3-.6.6-.9 1.3-.9 2.1.1.9.4 1.8 1 2.6 1.1 1.6 2.5 2.9 4.2 3.7.5.2.9.4 1.4.5.5.2 1 .2 1.6.1.7-.1 1.3-.6 1.7-1.2.2-.4.2-.8.1-1.2l-.4-.2m2.5-9.1C15.2 1 8.9 1 5 4.9c-3.2 3.2-3.8 8.1-1.6 12L2 22l5.3-1.4c1.5.8 3.1 1.2 4.7 1.2 5.5 0 9.9-4.4 9.9-9.9.1-2.6-1-5.1-2.8-7m-2.7 14c-1.3.8-2.8 1.3-4.4 1.3-1.5 0-2.9-.4-4.2-1.1l-.3-.2-3.1.8.8-3-.2-.3c-2.4-4-1.2-9 2.7-11.5S16.6 3.7 19 7.5c2.4 3.9 1.3 9-2.6 11.4" />
      </svg>
      {size === "small" ? "Chat" : "Contact via WhatsApp"}
    </a>
  );
}
