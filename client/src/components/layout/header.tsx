import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useState } from "react";
import { 
  Menu, 
  ShoppingCart, 
  User,
  LogOut, 
  ChevronDown 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const { itemCount } = useCart();
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-20">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="bg-primary h-10 w-10 rounded-full flex items-center justify-center mr-2 text-white">
              <span className="font-bold">MC</span>
            </div>
            <span className="text-primary font-bold text-xl">Milestar Café</span>
          </Link>
        </div>
        
        <div className="md:hidden flex items-center space-x-3">
          {user && (
            <Link href="/order">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs bg-accent text-white">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/">
            <Button 
              variant={isActive('/') ? "secondary" : "ghost"} 
              className="text-gray-600 hover:text-primary font-medium"
            >
              Home
            </Button>
          </Link>
          
          <Link href="/menu">
            <Button 
              variant={isActive('/menu') ? "secondary" : "ghost"} 
              className="text-gray-600 hover:text-primary font-medium"
            >
              Menu
            </Button>
          </Link>
          
          {user && (
            <>
              <Link href="/orders">
                <Button 
                  variant={isActive('/orders') ? "secondary" : "ghost"} 
                  className="text-gray-600 hover:text-primary font-medium"
                >
                  My Orders
                </Button>
              </Link>
              
              {user.isAdmin && (
                <Link href="/admin">
                  <Button 
                    variant={isActive('/admin') ? "secondary" : "ghost"} 
                    className="text-gray-600 hover:text-primary font-medium"
                  >
                    Admin
                  </Button>
                </Link>
              )}

              <Link href="/order">
                <Button variant="outline" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs bg-accent text-white">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="h-4 w-4" />
                    {user.name}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          
          {!user && (
            <>
              <Link href="/auth">
                <Button 
                  variant="default" 
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Login
                </Button>
              </Link>
              
              <Link href="/auth">
                <Button 
                  variant="outline" 
                  className="text-primary border-primary hover:bg-primary/10"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
      
      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 py-3 bg-white border-t">
          <div className="flex flex-col space-y-3">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              <Button 
                variant={isActive('/') ? "secondary" : "ghost"} 
                className="w-full justify-start text-gray-600 hover:text-primary font-medium"
              >
                Home
              </Button>
            </Link>
            
            <Link href="/menu" onClick={() => setIsMobileMenuOpen(false)}>
              <Button 
                variant={isActive('/menu') ? "secondary" : "ghost"} 
                className="w-full justify-start text-gray-600 hover:text-primary font-medium"
              >
                Menu
              </Button>
            </Link>
            
            {user && (
              <>
                <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button 
                    variant={isActive('/orders') ? "secondary" : "ghost"} 
                    className="w-full justify-start text-gray-600 hover:text-primary font-medium"
                  >
                    My Orders
                  </Button>
                </Link>
                
                {user.isAdmin && (
                  <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      variant={isActive('/admin') ? "secondary" : "ghost"} 
                      className="w-full justify-start text-gray-600 hover:text-primary font-medium"
                    >
                      Admin
                    </Button>
                  </Link>
                )}
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-600 hover:text-primary font-medium"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            )}
            
            {!user && (
              <>
                <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button 
                    variant="default" 
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    Login
                  </Button>
                </Link>
                
                <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button 
                    variant="outline" 
                    className="w-full text-primary border-primary hover:bg-primary/10"
                  >
                    Sign Up
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
