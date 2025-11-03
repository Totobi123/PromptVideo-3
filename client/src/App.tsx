import type { ReactNode } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { AnimatedRoute } from "@/components/AnimatedRoute";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Landing from "@/pages/Landing";
import SignUp from "@/pages/SignUp";
import SignIn from "@/pages/SignIn";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/signin" />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Redirect to="/dashboard" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/">
          <AnimatedRoute>
            <PublicRoute>
              <Landing />
            </PublicRoute>
          </AnimatedRoute>
        </Route>
        <Route path="/signup">
          <AnimatedRoute>
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          </AnimatedRoute>
        </Route>
        <Route path="/signin">
          <AnimatedRoute>
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          </AnimatedRoute>
        </Route>
        <Route path="/dashboard">
          <AnimatedRoute>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </AnimatedRoute>
        </Route>
        <Route>
          <AnimatedRoute>
            <NotFound />
          </AnimatedRoute>
        </Route>
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
