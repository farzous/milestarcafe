import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  HandPlatter, 
  Clock, 
  Heart 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export default function HomePage() {
  // Fetch featured menu items (first 3 items)
  const { data: featuredItems, isLoading } = useQuery<any[]>({
    queryKey: ["/api/menu"],
    select: (data) => data?.slice(0, 3) || [],
  });

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-cover bg-center h-96" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-white font-bold text-4xl md:text-5xl mb-4">Welcome to Milestar Café</h1>
            <p className="text-white text-lg md:text-xl mb-8">Delicious food, cozy atmosphere, unforgettable experience</p>
            <Link href="/menu">
              <Button className="bg-accent hover:bg-accent/90 text-white font-bold py-3 px-8 rounded-md text-lg transition-all duration-300">
                Order Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-primary font-bold text-3xl text-center mb-12">Why Choose Us?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="bg-secondary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <HandPlatter className="text-primary text-2xl" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Quality Ingredients</h3>
              <p className="text-gray-600">We use only the finest, freshest ingredients in all our dishes for authentic flavors.</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="bg-secondary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-primary text-2xl" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Fast Delivery</h3>
              <p className="text-gray-600">Enjoy our speedy service with hot, fresh food delivered to your table quickly.</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="bg-secondary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-primary text-2xl" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Made with Love</h3>
              <p className="text-gray-600">Every dish we prepare is made with care, passion, and attention to detail.</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Featured Menu Section */}
      <div className="bg-neutral py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-primary font-bold text-3xl text-center mb-4">Popular Items</h2>
          <p className="text-gray-600 text-center mb-12">Try our most loved dishes and beverages</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
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
              ))
            ) : (
              featuredItems?.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-full h-48 object-cover" 
                  />
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <span className="text-accent font-semibold">₹{item.price}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                    <Link href="/menu">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-md font-medium transition-colors">
                        Order Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
