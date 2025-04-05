import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import RatingPage from "@/pages/rating-page";
import AdminDashboard from "@/pages/admin/index";
import AuthPage from "@/pages/auth-page";
import ActivatePage from "@/pages/activate-page";
import { Redirect } from "wouter";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  const { user, isLoading } = useAuth();

  // If still loading authentication status, return nothing (to avoid flashing redirect)
  if (isLoading) return null;

  return (
    <Switch>
      <Route path="/rating/:qrCodeId" component={RatingPage} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/activate" component={ActivatePage} />
      <Route path="/">
        {() => <Redirect to={user ? "/admin" : "/auth"} />}
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
