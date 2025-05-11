import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, ShoppingBag, CheckCircle2, Trash2, MinusCircle, PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FormOverlay } from "@/components/ui/form-overlay";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

// Form schema for order details
const orderDetailsSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(10, "Valid phone number is required"),
  specialInstructions: z.string().optional(),
  orderType: z.enum(["pickup", "dine-in"]),
});

type OrderDetailsFormData = z.infer<typeof orderDetailsSchema>;

export default function OrderPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartSubtotal, cartTax, cartTotal } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<OrderDetailsFormData>({
    resolver: zodResolver(orderDetailsSchema),
    defaultValues: {
      customerName: user?.name || "",
      customerPhone: "",
      specialInstructions: "",
      orderType: "pickup",
    },
  });

  const orderMutation = useMutation({
    mutationFn: async (data: OrderDetailsFormData) => {
      if (cartItems.length === 0) {
        throw new Error("Your cart is empty");
      }

      const orderData = {
        orderDetails: {
          ...data,
          subtotal: cartSubtotal,
          tax: cartTax,
          total: cartTotal,
        },
        cartItems,
      };

      const res = await apiRequest("POST", "/api/orders", orderData);
      return await res.json();
    },
    onSuccess: (data) => {
      setOrderId(data.id);
      setIsConfirmationVisible(true);
      clearCart();
    },
    onError: (error: Error) => {
      toast({
        title: "Order Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OrderDetailsFormData) => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before placing an order",
        variant: "destructive",
      });
      return;
    }
    
    orderMutation.mutate(data);
  };

  const handleCloseConfirmation = () => {
    setIsConfirmationVisible(false);
  };

  return (
    <section className="py-8 bg-neutral min-h-[calc(100vh-153px)]">
      <div className="container mx-auto px-4">
        <h2 className="text-primary font-bold text-3xl text-center mb-8">Your Order</h2>
        
        <div className="lg:flex lg:space-x-8">
          {/* Cart/Order Summary */}
          <div className="lg:w-2/3 mb-8 lg:mb-0">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-xl mb-4">Order Items</h3>
                
                <div className="mb-4">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Your cart is empty</p>
                      <Link href="/menu">
                        <Button variant="link" className="mt-4 text-primary hover:underline">
                          Browse our menu
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center py-4 border-b">
                          <div className="flex-grow">
                            <h4 className="font-medium text-gray-800">{item.name}</h4>
                            <span className="text-accent">₹{item.price}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="text-gray-500"
                            >
                              <MinusCircle className="h-5 w-5" />
                            </Button>
                            <span className="mx-4 text-gray-800 font-medium">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="text-gray-500"
                            >
                              <PlusCircle className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.id)}
                              className="ml-4 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      <div className="pt-4">
                        <div className="flex justify-between py-2 text-gray-600">
                          <span>Subtotal:</span>
                          <span>₹{cartSubtotal}</span>
                        </div>
                        <div className="flex justify-between py-2 text-gray-600 border-b border-gray-200">
                          <span>Tax (7%):</span>
                          <span>₹{cartTax}</span>
                        </div>
                        <div className="flex justify-between py-3 font-semibold text-lg">
                          <span>Total:</span>
                          <span>₹{cartTotal}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Order Details Form */}
          <div className="lg:w-1/3">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-xl mb-4">Order Details</h3>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-name">Your Name</Label>
                    <Input
                      id="customer-name"
                      placeholder="Full Name"
                      {...register("customerName")}
                    />
                    {errors.customerName && (
                      <p className="text-sm text-red-500">{errors.customerName.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customer-phone">Phone Number</Label>
                    <Input
                      id="customer-phone"
                      placeholder="Your Phone Number"
                      {...register("customerPhone")}
                    />
                    {errors.customerPhone && (
                      <p className="text-sm text-red-500">{errors.customerPhone.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="special-instructions">Special Instructions</Label>
                    <Textarea
                      id="special-instructions"
                      placeholder="Any special requests for your order..."
                      rows={3}
                      {...register("specialInstructions")}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Order Type</Label>
                    <RadioGroup defaultValue="pickup" {...register("orderType")}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pickup" id="pickup" />
                        <Label htmlFor="pickup" className="cursor-pointer">Pickup</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dine-in" id="dine-in" />
                        <Label htmlFor="dine-in" className="cursor-pointer">Dine In</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-white mt-4 font-bold py-4 text-xl shadow-lg transition-all hover:scale-105"
                    disabled={orderMutation.isPending || cartItems.length === 0}
                  >
                    {orderMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        PROCESSING...
                      </>
                    ) : (
                      "PLACE ORDER"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Order Confirmation Modal */}
        <FormOverlay
          visible={isConfirmationVisible}
          onClose={handleCloseConfirmation}
          title="Order Placed Successfully!"
        >
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="text-green-500 h-8 w-8" />
            </div>
            <p className="text-gray-600 mb-6">Your order has been received and is being prepared.</p>
            <p className="font-medium text-gray-800 mb-6">Order #: {orderId}</p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Link href="/orders" className="w-full block">
                <Button className="bg-accent hover:bg-accent/90 text-white w-full font-semibold py-3 shadow-md transition-all hover:scale-105">
                  VIEW MY ORDERS
                </Button>
              </Link>
              <Button 
                variant="secondary" 
                onClick={handleCloseConfirmation}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </FormOverlay>
      </div>
    </section>
  );
}
