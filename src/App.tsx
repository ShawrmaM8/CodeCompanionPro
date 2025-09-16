import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import CodeAnalysis from "@/pages/code-analysis";
import Achievements from "@/pages/achievements";
import MascotChat from "@/pages/mascot-chat";
import Subscription from "@/pages/subscription";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { apiRequest } from "./lib/queryClient";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/projects" component={Projects} />
      <Route path="/analysis" component={CodeAnalysis} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/mascot" component={MascotChat} />
      <Route path="/subscription" component={Subscription} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Initialize the app with default data
    apiRequest("POST", "/api/init")
      .catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
