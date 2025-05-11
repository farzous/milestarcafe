import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import HomePage from "@/pages/home-page";
import MenuPage from "@/pages/menu-page";
import AuthPage from "@/pages/auth-page";
import OrderPage from "@/pages/order-page";
import OrdersPage from "@/pages/orders-page";
import AdminPage from "@/pages/admin-page";
import { ProtectedRoute } from "@/lib/protected-route";
import { AdminRoute } from "@/lib/admin-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/menu" component={MenuPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/order" component={OrderPage} />
      <ProtectedRoute path="/orders" component={OrdersPage} />
      <AdminRoute path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Router />
      </main>
      <Footer />
    </div>
  );
}

export default App;
