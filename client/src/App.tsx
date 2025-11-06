import type { ReactNode } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AnimatePresence } from "framer-motion";
import { AnimatedRoute } from "@/components/AnimatedRoute";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Landing from "@/pages/Landing";
import SignUp from "@/pages/SignUp";
import SignIn from "@/pages/SignIn";
import Dashboard from "@/pages/Dashboard";
import TextToVideo from "@/pages/TextToVideo";
import ScriptGeneration from "@/pages/ScriptGeneration";
import TextToSpeech from "@/pages/TextToSpeech";
import Analytics from "@/pages/Analytics";
import ThumbnailGeneration from "@/pages/ThumbnailGeneration";
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

function DashboardLayout({ children }: { children: ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
          </header>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
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
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          </AnimatedRoute>
        </Route>
        <Route path="/dashboard/text-to-video">
          <AnimatedRoute>
            <ProtectedRoute>
              <DashboardLayout>
                <TextToVideo />
              </DashboardLayout>
            </ProtectedRoute>
          </AnimatedRoute>
        </Route>
        <Route path="/dashboard/script">
          <AnimatedRoute>
            <ProtectedRoute>
              <DashboardLayout>
                <ScriptGeneration />
              </DashboardLayout>
            </ProtectedRoute>
          </AnimatedRoute>
        </Route>
        <Route path="/dashboard/text-to-speech">
          <AnimatedRoute>
            <ProtectedRoute>
              <DashboardLayout>
                <TextToSpeech />
              </DashboardLayout>
            </ProtectedRoute>
          </AnimatedRoute>
        </Route>
        <Route path="/dashboard/analytics">
          <AnimatedRoute>
            <ProtectedRoute>
              <DashboardLayout>
                <Analytics />
              </DashboardLayout>
            </ProtectedRoute>
          </AnimatedRoute>
        </Route>
        <Route path="/dashboard/thumbnail">
          <AnimatedRoute>
            <ProtectedRoute>
              <DashboardLayout>
                <ThumbnailGeneration />
              </DashboardLayout>
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
