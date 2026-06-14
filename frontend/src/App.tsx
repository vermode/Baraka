import { Switch, Route, Router as WouterRouter } from "wouter";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getErrorMessage, getCurrentLang } from "@/lib/errors";
import { useSessionGuard } from "@/hooks/useSessionGuard";

import Home from "@/pages/Home";
import Signup from "@/pages/Signup";
import Login from "@/pages/Login";
import MapPage from "@/pages/MapPage";
import Dashboard from "@/pages/Dashboard";
import Admin from "@/pages/Admin";
import Track from "@/pages/Track";
import NotFound from "@/pages/not-found";

// Surface otherwise-silent data-loading failures as a single, de-duplicated
// toast. Mutations keep their own call-site messages, so they're not handled here.
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(getErrorMessage(error, getCurrentLang()), {
        id: "query-error",
      });
    },
  }),
});

function Router() {
  useSessionGuard();
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/signup" component={Signup} />
      <Route path="/login" component={Login} />
      <Route path="/map" component={MapPage} />
      <Route path="/app" component={Dashboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/track" component={Track} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <LanguageProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <Toaster position="top-center" />
            </TooltipProvider>
          </QueryClientProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
