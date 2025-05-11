import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormOverlay } from "@/components/ui/form-overlay";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Order, MenuItem, insertMenuItemSchema } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Eye, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// For the menu item form
const menuItemFormSchema = insertMenuItemSchema.extend({
  id: z.number().optional(),
});

type MenuItemFormData = z.infer<typeof menuItemFormSchema>;

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

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("menu-management");
  const [menuFormVisible, setMenuFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [orderDetailsVisible, setOrderDetailsVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Menu items query
  const { data: menuItems, isLoading: isLoadingMenu } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });

  // Orders query
  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Form for menu items
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      imageUrl: "",
    },
  });

  // Create menu item mutation
  const createMenuItemMutation = useMutation({
    mutationFn: async (data: MenuItemFormData) => {
      const res = await apiRequest("POST", "/api/menu", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
      toast({
        title: "Success",
        description: "Menu item created successfully",
      });
      setMenuFormVisible(false);
      reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create menu item: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update menu item mutation
  const updateMenuItemMutation = useMutation({
    mutationFn: async (data: MenuItemFormData) => {
      const { id, ...itemData } = data;
      const res = await apiRequest("PUT", `/api/menu/${id}`, itemData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
      toast({
        title: "Success",
        description: "Menu item updated successfully",
      });
      setMenuFormVisible(false);
      reset();
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update menu item: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete menu item mutation
  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/menu/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete menu item: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update order status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Fetch order details
  const getOrderDetails = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) throw new Error("Failed to fetch order details");
      const data = await response.json();
      setSelectedOrder(data);
      setOrderDetailsVisible(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
    }
  };

  // Add or edit menu item
  const onMenuItemSubmit = (data: MenuItemFormData) => {
    if (isEditing && data.id) {
      updateMenuItemMutation.mutate(data);
    } else {
      createMenuItemMutation.mutate(data);
    }
  };

  // Handle edit button click
  const handleEditMenuItem = (item: MenuItem) => {
    setIsEditing(true);
    setValue("id", item.id);
    setValue("name", item.name);
    setValue("description", item.description);
    setValue("price", item.price);
    setValue("category", item.category);
    setValue("imageUrl", item.imageUrl);
    setMenuFormVisible(true);
  };

  // Handle delete button click
  const handleDeleteMenuItem = (id: number) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      deleteMenuItemMutation.mutate(id);
    }
  };

  // Handle update order status
  const handleUpdateOrderStatus = (orderId: number, status: string) => {
    updateOrderStatusMutation.mutate({ id: orderId, status });
  };

  // Show new menu form
  const showNewMenuItemForm = () => {
    setIsEditing(false);
    reset();
    setMenuFormVisible(true);
  };

  // Filter orders based on status and search query
  const filteredOrders = orders?.filter(order => {
    const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter;
    const matchesSearch = orderSearchQuery === "" || 
      order.id.toString().includes(orderSearchQuery) || 
      order.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <section className="py-8 bg-neutral min-h-[calc(100vh-153px)]">
      <div className="container mx-auto px-4">
        <h2 className="text-primary font-bold text-3xl text-center mb-6">Admin Panel</h2>
        
        {/* Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="w-full mb-8">
            <TabsTrigger value="menu-management" className="flex-1">Menu Management</TabsTrigger>
            <TabsTrigger value="orders-management" className="flex-1">Orders</TabsTrigger>
          </TabsList>
          
          {/* Menu Management Tab */}
          <TabsContent value="menu-management">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-xl">Menu Items</h3>
              <Button 
                onClick={showNewMenuItemForm} 
                className="bg-accent hover:bg-accent/90 text-white"
              >
                Add New Item
              </Button>
            </div>
            
            <Card className="overflow-hidden mb-8">
              {isLoadingMenu ? (
                <CardContent className="p-6 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  <p className="text-gray-500 mt-2">Loading menu items...</p>
                </CardContent>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Item</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 hidden md:table-cell">Category</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 hidden md:table-cell">Price</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuItems?.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <img 
                                src={item.imageUrl} 
                                alt={item.name} 
                                className="w-10 h-10 rounded object-cover mr-3" 
                              />
                              <span className="font-medium">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 hidden md:table-cell capitalize">
                            {item.category}
                          </td>
                          <td className="py-3 px-4 hidden md:table-cell">
                            ₹{item.price}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEditMenuItem(item)}
                              className="text-blue-600 hover:text-blue-800 mr-1"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteMenuItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>
          
          {/* Orders Management Tab */}
          <TabsContent value="orders-management">
            <h3 className="font-semibold text-xl mb-6">Order Management</h3>
            
            <Card className="overflow-hidden">
              {/* Filter and search options */}
              <CardContent className="p-4 bg-gray-50 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="flex-grow">
                    <Input 
                      placeholder="Search orders..." 
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                    />
                  </div>
                  <div>
                    <Select 
                      value={orderStatusFilter} 
                      onValueChange={setOrderStatusFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Orders</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="preparing">Preparing</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              
              {/* Orders List */}
              {isLoadingOrders ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  <p className="text-gray-500 mt-2">Loading orders...</p>
                </div>
              ) : filteredOrders && filteredOrders.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No orders found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 hidden md:table-cell">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 hidden md:table-cell">Total</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders?.map((order) => (
                        <tr key={order.id} className="border-t">
                          <td className="py-3 px-4 font-medium">#{order.id}</td>
                          <td className="py-3 px-4">{order.customerName}</td>
                          <td className="py-3 px-4 hidden md:table-cell">
                            {format(new Date(order.createdAt), "MMM d, yyyy")}
                          </td>
                          <td className="py-3 px-4 hidden md:table-cell">${order.total.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 ${getStatusColor(order.status)} rounded-full text-xs font-medium`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => getOrderDetails(order.id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Add/Edit Menu Item Form Modal */}
        <FormOverlay
          visible={menuFormVisible}
          onClose={() => setMenuFormVisible(false)}
          title={isEditing ? "Edit Menu Item" : "Add New Menu Item"}
        >
          <form onSubmit={handleSubmit(onMenuItemSubmit)} className="space-y-4">
            <input type="hidden" {...register("id")} />
            
            <div className="space-y-2">
              <Label htmlFor="item-name">Item Name</Label>
              <Input
                id="item-name"
                placeholder="Item Name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="item-category">Category</Label>
              <Select defaultValue="" {...register("category")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select Category</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="juice">Juice</SelectItem>
                  <SelectItem value="beverage">Beverage</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="item-price">Price ($)</Label>
              <Input
                id="item-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="item-description">Description</Label>
              <Textarea
                id="item-description"
                rows={3}
                placeholder="Item description..."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="item-image">Image URL</Label>
              <Input
                id="item-image"
                placeholder="https://example.com/image.jpg"
                {...register("imageUrl")}
              />
              {errors.imageUrl && (
                <p className="text-sm text-red-500">{errors.imageUrl.message}</p>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white"
                disabled={createMenuItemMutation.isPending || updateMenuItemMutation.isPending}
              >
                {(createMenuItemMutation.isPending || updateMenuItemMutation.isPending) ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Item
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setMenuFormVisible(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </FormOverlay>
        
        {/* Order Details Modal */}
        {selectedOrder && (
          <FormOverlay
            visible={orderDetailsVisible}
            onClose={() => setOrderDetailsVisible(false)}
            title={`Order #${selectedOrder.order.id}`}
          >
            <div>
              <div className="mb-4 pb-4 border-b">
                <p className="text-gray-600 mb-2">
                  {format(new Date(selectedOrder.order.createdAt), "PPpp")}
                </p>
                <div className="flex items-center">
                  <span className="mr-3">Status:</span>
                  <Select 
                    value={selectedOrder.order.status}
                    onValueChange={(status) => handleUpdateOrderStatus(selectedOrder.order.id, status)}
                    disabled={updateOrderStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  {updateOrderStatusMutation.isPending && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                </div>
              </div>
              
              <div className="mb-4 pb-4 border-b">
                <h4 className="font-medium text-gray-800 mb-2">Customer Information</h4>
                <p><span className="font-medium">Name:</span> <span>{selectedOrder.order.customerName}</span></p>
                <p><span className="font-medium">Phone:</span> <span>{selectedOrder.order.customerPhone}</span></p>
                <p><span className="font-medium">Order Type:</span> <span className="capitalize">{selectedOrder.order.orderType}</span></p>
                {selectedOrder.order.specialInstructions && (
                  <div className="mt-2">
                    <p className="font-medium">Special Instructions:</p>
                    <p className="text-gray-600">{selectedOrder.order.specialInstructions}</p>
                  </div>
                )}
              </div>
              
              <div className="mb-4 pb-4 border-b">
                <h4 className="font-medium text-gray-800 mb-2">Order Items</h4>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3">Item</th>
                      <th className="text-center py-2 px-3">Qty</th>
                      <th className="text-right py-2 px-3">Price</th>
                      <th className="text-right py-2 px-3">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item: any) => (
                      <tr key={item.id} className="border-t">
                        <td className="py-2 px-3">{item.name}</td>
                        <td className="py-2 px-3 text-center">{item.quantity}</td>
                        <td className="py-2 px-3 text-right">${item.price.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal:</span>
                  <span>${selectedOrder.order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Tax (7%):</span>
                  <span>${selectedOrder.order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-gray-800 mt-1">
                  <span>Total:</span>
                  <span>${selectedOrder.order.total.toFixed(2)}</span>
                </div>
              </div>
              
              <Button
                className="w-full mt-6"
                onClick={() => setOrderDetailsVisible(false)}
              >
                Close
              </Button>
            </div>
          </FormOverlay>
        )}
      </div>
    </section>
  );
}
