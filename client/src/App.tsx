import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import RatingPage from "@/pages/rating-page";
import AdminDashboard from "@/pages/admin/index";
import { Redirect } from "wouter";

function Router() {
  return (
    <Switch>
      <Route path="/rating/:qrCodeId" component={RatingPage} />
      <Route path="/admin" component={AdminDashboard} />
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
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
