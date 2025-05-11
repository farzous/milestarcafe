import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { MenuItem } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

const categories = [
  { id: "all", name: "All Items" },
  { id: "food", name: "Food" },
  { id: "juice", name: "Juices" },
  { id: "beverage", name: "Beverages" },
];

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { data: menuItems, isLoading, error } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu", activeCategory],
    queryFn: async ({ queryKey }) => {
      const category = queryKey[1];
      const url = category === "all" 
        ? "/api/menu" 
        : `/api/menu?category=${category}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch menu items");
      return res.json();
    },
  });

  const handleAddToCart = (item: MenuItem) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add items to your cart",
        variant: "destructive",
      });
      return;
    }
    
    addToCart(item);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-red-500 text-2xl">Error loading menu</h2>
        <p className="text-gray-600">Please try again later.</p>
      </div>
    );
  }

  return (
    <section className="py-8 bg-neutral min-h-[calc(100vh-153px)]">
      <div className="container mx-auto px-4">
        <h2 className="text-primary font-bold text-3xl text-center mb-8">Our Menu</h2>
        
        {/* Category Tabs */}
        <div className="flex overflow-x-auto pb-2 mb-8 sticky top-16 bg-neutral pt-2 z-10">
          {categories.map((category) => (
            <Button
              key={category.id}
              className={`whitespace-nowrap px-6 mr-2 ${
                activeCategory === category.id
                  ? "bg-primary text-white"
                  : "bg-white hover:bg-gray-100 text-gray-700"
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
        
        {/* Menu Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="w-full h-48 bg-gray-200 animate-pulse" />
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
                    <div className="h-6 w-16 bg-gray-200 animate-pulse rounded" />
                  </div>
                  <div className="h-4 w-full bg-gray-200 animate-pulse rounded mb-2" />
                  <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded mb-4" />
                  <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : menuItems?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No items found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems?.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-48 object-cover" 
                />
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <span className="text-accent font-semibold">${item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                  {user ? (
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to Order
                    </Button>
                  ) : (
                    <Link href="/auth">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                        Login to Order
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
