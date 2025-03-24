import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Heart, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { apiRequest } from "@/lib/queryClient";

export default function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    // Check if the user is authenticated
    const checkSession = async () => {
      try {
        const response = await apiRequest('GET', '/api/auth/session');
        const sessionData = await response.json();
        console.log("Session check:", sessionData);
        
        setIsAuthenticated(sessionData.isAuthenticated);
        
        if (sessionData.isAuthenticated && sessionData.user) {
          setUser({ id: sessionData.user.id });
        } else {
          setUser({ id: 'guest-user' });
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsAuthenticated(false);
        setUser({ id: 'guest-user' });
      }
    };

    checkSession();
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navLinks = [
    { name: "Ballina", href: "/" },
    { name: "Kërko vetura", href: "/browse-cars" },
    { name: "Krahaso vetura", href: "/compare-cars" },
    { name: "Llogaritësi i buxhetit", href: "/budget-calculator" },
    { name: "Rreth nesh", href: "/about" },
    { name: "Kontakt", href: "/contact" },
  ];

  return (
    <header className="bg-white shadow">
      <Container>
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <img src="https://auto-korea.clientlly.com/file/logo?t=1742816556" width="70px" height="auto" className="big-logo"/>
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
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/wishlists" className="flex items-center text-primary hover:text-primary-dark">
              <Heart className="h-5 w-5 mr-1" />
              <span>Listat e dëshirave</span>
            </Link>
            
            {isAuthenticated ? (
              <Button 
                variant="ghost" 
                className="px-4 py-2 text-primary"
                onClick={async () => {
                  try {
                    await apiRequest('POST', '/api/auth/logout');
                    setIsAuthenticated(false);
                    setUser({ id: 'guest-user' });
                    window.location.href = '/';
                  } catch (error) {
                    console.error("Error logging out:", error);
                  }
                }}
              >
                Dilni
              </Button>
            ) : (
              <>
                <Link href="/admin-login">
                  <Button variant="ghost" className="px-4 py-2 text-primary">
                    Identifikohu
                  </Button>
                </Link>
                <Link href="/register">
                  <Button>Regjistrohu</Button>
                </Link>
              </>
            )}
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
            <Link 
              href="/wishlists"
              className="flex items-center mb-3 px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-neutral-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Heart className="h-5 w-5 mr-2" />
              Listat e dëshirave
            </Link>
            {isAuthenticated ? (
              <Button 
                variant="outline" 
                className="w-full px-4 py-2 text-center"
                onClick={async () => {
                  try {
                    await apiRequest('POST', '/api/auth/logout');
                    setIsAuthenticated(false);
                    setUser({ id: 'guest-user' });
                    setMobileMenuOpen(false);
                    window.location.href = '/';
                  } catch (error) {
                    console.error("Error logging out:", error);
                  }
                }}
              >
                Dilni
              </Button>
            ) : (
              <>
                <Link href="/admin-login" className="block w-full">
                  <Button variant="outline" className="w-full px-4 py-2 text-center">
                    Identifikohu
                  </Button>
                </Link>
                <Link href="/register" className="block w-full">
                  <Button className="w-full mt-2 px-4 py-2 text-center">
                    Regjistrohu
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
