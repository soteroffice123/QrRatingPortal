import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import RatingPage from "@/pages/rating-page";
import AdminDashboard from "@/pages/admin/index";
import AuthPage from "@/pages/auth-page";
import { Redirect } from "wouter";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/rating/:qrCodeId" component={RatingPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/">
        {() => <Redirect to="/admin" />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
