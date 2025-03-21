import { Link } from "wouter";
import { Container } from "@/components/ui/container";
import { Car, MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-6">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <Car className="text-white h-8 w-8 mr-2" />
              <span className="font-bold text-xl">AutoMarket</span>
            </div>
            <p className="text-neutral-300 mb-4">
              Your trusted platform for buying and selling quality vehicles with hassle-free communication.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-neutral-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/browse-cars" className="text-neutral-300 hover:text-white transition-colors">
                  Browse Cars
                </Link>
              </li>

              <li>
                <Link href="/about" className="text-neutral-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Car Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/browse-cars?type=sedan" className="text-neutral-300 hover:text-white transition-colors">
                  Sedans
                </Link>
              </li>
              <li>
                <Link href="/browse-cars?type=suv" className="text-neutral-300 hover:text-white transition-colors">
                  SUVs
                </Link>
              </li>
              <li>
                <Link href="/browse-cars?type=truck" className="text-neutral-300 hover:text-white transition-colors">
                  Trucks
                </Link>
              </li>
              <li>
                <Link href="/browse-cars?type=luxury" className="text-neutral-300 hover:text-white transition-colors">
                  Luxury Cars
                </Link>
              </li>
              <li>
                <Link href="/browse-cars?fuelType=Electric" className="text-neutral-300 hover:text-white transition-colors">
                  Electric Vehicles
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="mt-1 mr-2 h-4 w-4" />
                <span>1234 Auto Drive, Car City, ST 56789</span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-2 h-4 w-4" />
                <span>(123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                <span>info@automarket.com</span>
              </li>
              <li className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>Mon-Fri: 9AM-6PM</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 pt-6 mt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} AutoMarket. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-neutral-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-neutral-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-neutral-400 hover:text-white text-sm transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
