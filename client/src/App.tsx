import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

import HomePage from "@/pages/home";
import BrowseCarsPage from "@/pages/browse-cars";
import CarDetailPage from "@/pages/car-detail";
import CompareCarsPage from "@/pages/compare-cars";
import ARComparisonPage from "@/pages/ar-comparison";
import AboutPage from "@/pages/about";
import ContactPage from "@/pages/contact";
import AdminLoginPage from "@/pages/admin-login";
import AdminPage from "@/pages/admin";
import ImportCarsPage from "@/pages/import-cars";
import EncarImportPage from "@/pages/encar-import";
import WishlistsPage from "@/pages/wishlists";
import WishlistDetailPage from "@/pages/wishlist-detail";
import RegisterPage from "@/pages/register";
import BudgetCalculatorPage from "@/pages/budget-calculator";
import NotFound from "@/pages/not-found";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

function Router() {
  const [location, setLocation] = useLocation();
  const isAdminRoute = location.startsWith("/admin");

  // Redirect /sell-car to homepage
  if (location === "/sell-car") {
    setLocation("/");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Don't show navbar and footer on admin pages */}
      {!isAdminRoute && <Navbar />}
      
      <main className={`flex-grow ${isAdminRoute ? 'bg-neutral-50' : ''}`}>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/browse-cars" component={BrowseCarsPage} />
          <Route path="/car/:id" component={CarDetailPage} />
          <Route path="/compare-cars" component={CompareCarsPage} />
          <Route path="/ar-comparison" component={ARComparisonPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/wishlists" component={WishlistsPage} />
          <Route path="/wishlist/share/:id" component={WishlistDetailPage} />
          <Route path="/wishlist/:id" component={WishlistDetailPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/admin-login" component={AdminLoginPage} />
          <Route path="/admin" component={AdminPage} />
          <Route path="/admin/import-cars" component={ImportCarsPage} />
          <Route path="/encar-import" component={EncarImportPage} />
          <Route path="/budget-calculator" component={BudgetCalculatorPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
