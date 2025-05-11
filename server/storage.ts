import { 
  users, type User, type InsertUser,
  menuItems, type MenuItem, type InsertMenuItem,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Modify the interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Menu item methods
  getAllMenuItems(): Promise<MenuItem[]>;
  getMenuItemsByCategory(category: string): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, menuItem: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: number): Promise<boolean>;
  
  // Order methods
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getOrderWithItems(orderId: number): Promise<{ order: Order; items: OrderItem[] } | undefined>;
  updateOrderStatus(orderId: number, status: string): Promise<Order | undefined>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private menuItems: Map<number, MenuItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  sessionStore: session.SessionStore;

  // Counters for IDs
  userIdCounter: number;
  menuItemIdCounter: number;
  orderIdCounter: number;
  orderItemIdCounter: number;

  constructor() {
    this.users = new Map();
    this.menuItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    
    this.userIdCounter = 1;
    this.menuItemIdCounter = 1;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24h
    });

    // Add default admin user
    this.createUser({
      username: "admin@milestar.com",
      password: "admin123", // Will be hashed in the auth.ts file
      name: "Admin",
      isAdmin: true
    });

    // Seed menu items
    this.seedMenuItems();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Menu item methods
  async getAllMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values());
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    if (category === 'all') {
      return this.getAllMenuItems();
    }
    return Array.from(this.menuItems.values())
      .filter(item => item.category === category);
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }

  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    const id = this.menuItemIdCounter++;
    const newMenuItem: MenuItem = { ...menuItem, id };
    this.menuItems.set(id, newMenuItem);
    return newMenuItem;
  }

  async updateMenuItem(id: number, menuItem: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const existingMenuItem = this.menuItems.get(id);
    if (!existingMenuItem) {
      return undefined;
    }
    
    const updatedMenuItem: MenuItem = { ...existingMenuItem, ...menuItem };
    this.menuItems.set(id, updatedMenuItem);
    return updatedMenuItem;
  }

  async deleteMenuItem(id: number): Promise<boolean> {
    return this.menuItems.delete(id);
  }

  // Order methods
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const id = this.orderIdCounter++;
    const createdAt = new Date();
    const newOrder: Order = { ...order, id, createdAt };
    this.orders.set(id, newOrder);

    // Add order items
    for (const item of items) {
      const orderItemId = this.orderItemIdCounter++;
      const orderItem: OrderItem = { ...item, id: orderItemId, orderId: id };
      this.orderItems.set(orderItemId, orderItem);
    }

    return newOrder;
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by newest first
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by newest first
  }

  async getOrderWithItems(orderId: number): Promise<{ order: Order; items: OrderItem[] } | undefined> {
    const order = this.orders.get(orderId);
    if (!order) {
      return undefined;
    }

    const items = Array.from(this.orderItems.values())
      .filter(item => item.orderId === orderId);

    return { order, items };
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(orderId);
    if (!order) {
      return undefined;
    }

    const updatedOrder: Order = { ...order, status };
    this.orders.set(orderId, updatedOrder);
    return updatedOrder;
  }

  // Seed initial menu items
  private seedMenuItems() {
    const menuItems: InsertMenuItem[] = [
      {
        name: "Classic Cheeseburger",
        description: "Juicy beef patty with melted cheese, fresh vegetables, and our special sauce.",
        price: 399,
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
        category: "food"
      },
      {
        name: "Veggie Pasta Salad",
        description: "Fresh pasta with mixed vegetables, herbs, and light vinaigrette dressing.",
        price: 349,
        imageUrl: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
        category: "food"
      },
      {
        name: "Crispy Chicken Sandwich",
        description: "Crispy fried chicken breast with lettuce, tomato, and mayo on a toasted bun.",
        price: 369,
        imageUrl: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
        category: "food"
      },
      {
        name: "Berry Smoothie",
        description: "Refreshing blend of mixed berries, yogurt, and honey.",
        price: 249,
        imageUrl: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
        category: "juice"
      },
      {
        name: "Fresh Orange Juice",
        description: "Freshly squeezed orange juice, no added sugar or preservatives.",
        price: 199,
        imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
        category: "juice"
      },
      {
        name: "Cafe Latte",
        description: "Espresso with steamed milk and a light layer of foam.",
        price: 179,
        imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
        category: "beverage"
      },
      {
        name: "Hot Chocolate",
        description: "Rich and creamy hot chocolate topped with whipped cream.",
        price: 159,
        imageUrl: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
        category: "beverage"
      }
    ];

    menuItems.forEach(item => this.createMenuItem(item));
  }
}

export const storage = new MemStorage();
