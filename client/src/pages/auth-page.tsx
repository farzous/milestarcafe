import { useState, useEffect } from "react";
import { useAuth, LoginData, RegisterData } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [_, setLocation] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Login form schema and validation
  const loginSchema = z.object({
    username: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form schema and validation
  const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    username: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
      isAdmin: false,
    },
  });

  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="py-12 bg-neutral min-h-[calc(100vh-153px)]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 items-center max-w-6xl mx-auto">
          {/* Form section */}
          <div className="w-full lg:w-1/2">
            <Card className="w-full">
              <CardContent className="p-6">
                <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <h2 className="text-primary font-bold text-2xl mb-6 text-center">Login to Your Account</h2>
                    
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email Address</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@example.com"
                          {...loginForm.register("username")}
                        />
                        {loginForm.formState.errors.username && (
                          <p className="text-sm text-red-500">{loginForm.formState.errors.username.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="Your password"
                          {...loginForm.register("password")}
                        />
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                        )}
                      </div>
                      
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Login
                      </Button>
                    </form>
                    
                    <div className="mt-4 text-center">
                      <p className="text-gray-600">
                        Don't have an account?{" "}
                        <Button
                          variant="link"
                          onClick={() => setActiveTab("register")}
                          className="text-primary p-0 hover:underline"
                        >
                          Sign Up
                        </Button>
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <h2 className="text-primary font-bold text-2xl mb-6 text-center">Create an Account</h2>
                    
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="John Doe"
                          {...registerForm.register("name")}
                        />
                        {registerForm.formState.errors.name && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.name.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email Address</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          {...registerForm.register("username")}
                        />
                        {registerForm.formState.errors.username && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.username.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a password"
                          {...registerForm.register("password")}
                        />
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                        <Input
                          id="signup-confirm-password"
                          type="password"
                          placeholder="Confirm your password"
                          {...registerForm.register("confirmPassword")}
                        />
                        {registerForm.formState.errors.confirmPassword && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.confirmPassword.message}</p>
                        )}
                      </div>
                      
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Sign Up
                      </Button>
                    </form>
                    
                    <div className="mt-4 text-center">
                      <p className="text-gray-600">
                        Already have an account?{" "}
                        <Button
                          variant="link"
                          onClick={() => setActiveTab("login")}
                          className="text-primary p-0 hover:underline"
                        >
                          Login
                        </Button>
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Hero section */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Delicious Food at Your Fingertips
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Join Milestar Café today and enjoy our delicious menu of fresh, homemade food and beverages.
              Create an account to start ordering and keep track of your favorite items.
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Easy online ordering</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Track your order history</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Quality ingredients in every dish</span>
              </div>
            </div>
            <div className="mt-8 relative">
              <img 
                src="https://images.unsplash.com/photo-1482049016688-2d3e1b311543?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
                alt="Milestar Café food" 
                className="rounded-lg shadow-lg w-full object-cover" 
              />
              <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-full shadow-lg">
                <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center font-bold">
                  <div>
                    <div className="text-sm">from</div>
                    <div className="text-lg">$4.99</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
