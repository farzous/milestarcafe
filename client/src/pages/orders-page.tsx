import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Link } from "wouter";
import { Loader2, FileText } from "lucide-react";
import { format } from "date-fns";

const getStatusColor = (status: string) => {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-800";
    case "preparing":
      return "bg-yellow-100 text-yellow-800";
    case "ready":
      return "bg-purple-100 text-purple-800";
    case "completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function OrdersPage() {
  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-153px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Loading your orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-red-500 text-2xl">Error loading orders</h2>
        <p className="text-gray-600">Please try again later.</p>
      </div>
    );
  }

  return (
    <section className="py-8 bg-neutral min-h-[calc(100vh-153px)]">
      <div className="container mx-auto px-4">
        <h2 className="text-primary font-bold text-3xl text-center mb-8">My Orders</h2>
        
        {orders && orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">You don't have any orders yet</p>
            <Link href="/menu">
              <Button className="mt-4 bg-primary hover:bg-primary/90 text-white">
                Place an Order
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders?.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <div className="bg-primary text-white p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                    <Badge className={`${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-white/80 text-sm">
                    Placed on {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                
                <CardContent className="p-4">
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>Subtotal:</span>
                      <span>₹{order.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>Tax:</span>
                      <span>₹{order.tax}</span>
                    </div>
                    <div className="flex justify-between font-medium text-gray-800 mt-1">
                      <span>Total:</span>
                      <span>₹{order.total}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <p>
                      <span className="font-medium">Order Type:</span>{" "}
                      <span className="text-gray-600">
                        {order.orderType.charAt(0).toUpperCase() + order.orderType.slice(1)}
                      </span>
                    </p>
                    {order.specialInstructions && (
                      <p className="mt-2">
                        <span className="font-medium">Special Instructions:</span>{" "}
                        <span className="text-gray-600">{order.specialInstructions}</span>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
