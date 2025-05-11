import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertMenuItemSchema, insertOrderSchema, insertOrderItemSchema } from "@shared/schema";

// Auth middleware
const isAuthenticated = (req: Request, res: Response, next: () => void) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

const isAdmin = (req: Request, res: Response, next: () => void) => {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  res.status(403).json({ message: "Forbidden - Admin access required" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Menu routes
  app.get("/api/menu", async (req, res) => {
    try {
      const category = req.query.category as string || 'all';
      const menuItems = await storage.getMenuItemsByCategory(category);
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: "Error fetching menu items" });
    }
  });

  app.get("/api/menu/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const menuItem = await storage.getMenuItem(id);
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }

      res.json(menuItem);
    } catch (error) {
      res.status(500).json({ message: "Error fetching menu item" });
    }
  });

  // Admin - Menu management routes
  app.post("/api/menu", isAdmin, async (req, res) => {
    try {
      const validatedData = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem(validatedData);
      res.status(201).json(menuItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid menu item data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating menu item" });
    }
  });

  app.put("/api/menu/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      // Partial validation of fields
      const validatedData = insertMenuItemSchema.partial().parse(req.body);
      
      const updatedItem = await storage.updateMenuItem(id, validatedData);
      if (!updatedItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }

      res.json(updatedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid menu item data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating menu item" });
    }
  });

  app.delete("/api/menu/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const success = await storage.deleteMenuItem(id);
      if (!success) {
        return res.status(404).json({ message: "Menu item not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting menu item" });
    }
  });

  // Order routes
  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const { orderDetails, cartItems } = req.body;
      
      if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({ message: "Cart cannot be empty" });
      }

      // Validate order details
      const validatedOrderDetails = insertOrderSchema.parse({
        ...orderDetails,
        userId: req.user.id
      });

      // Prepare order items
      const orderItems = cartItems.map(item => {
        return insertOrderItemSchema.parse({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          orderId: 0 // Will be set after order creation
        });
      });

      // Create order with items
      const order = await storage.createOrder(validatedOrderDetails, orderItems);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating order" });
    }
  });

  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      let orders;
      
      if (req.user.isAdmin) {
        // Admin can see all orders
        orders = await storage.getAllOrders();
      } else {
        // Regular users can only see their own orders
        orders = await storage.getOrdersByUserId(req.user.id);
      }
      
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching orders" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const orderWithItems = await storage.getOrderWithItems(id);
      if (!orderWithItems) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if user has access to this order
      if (!req.user.isAdmin && orderWithItems.order.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(orderWithItems);
    } catch (error) {
      res.status(500).json({ message: "Error fetching order" });
    }
  });

  app.patch("/api/orders/:id/status", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Status is required" });
      }

      // Validate status
      if (!["new", "preparing", "ready", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updatedOrder = await storage.updateOrderStatus(id, status);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Error updating order status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
