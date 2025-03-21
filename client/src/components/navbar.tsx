import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Browse Cars", href: "/browse-cars" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Admin", href: "/admin-login" },
  ];

  return (
    <header className="bg-white shadow">
      <Container>
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Car className="text-primary h-7 w-7 mr-2" />
                <span className="font-bold text-xl text-neutral-800">AutoMarket</span>
              </Link>
            </div>
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    location === link.href
                      ? "text-primary font-medium"
                      : "text-neutral-500 hover:text-primary font-medium"
                  }
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="hidden md:flex items-center">
            <Button variant="ghost" className="px-4 py-2 text-primary">
              Sign In
            </Button>
            <Button className="ml-4">Get Started</Button>
          </div>
          <div className="md:hidden">
            <button
              type="button"
              className="p-2 rounded-md text-neutral-500 hover:text-primary focus:outline-none"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </Container>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                location === link.href
                  ? "block px-3 py-2 rounded-md text-base font-medium text-primary bg-primary bg-opacity-10"
                  : "block px-3 py-2 rounded-md text-base font-medium text-neutral-500 hover:text-primary hover:bg-neutral-100"
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 pb-3 border-t border-neutral-200">
            <Button variant="outline" className="block w-full px-4 py-2 text-center">
              Sign In
            </Button>
            <Button className="block w-full mt-2 px-4 py-2 text-center">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
