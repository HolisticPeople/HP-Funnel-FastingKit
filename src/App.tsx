import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { getStatus } from "@/api/bridge";
import Index from "./pages/Index";
import KitBuilder from "./pages/KitBuilder";
import NotFound from "./pages/NotFound";
import Checkout from "./pages/Checkout";

const queryClient = new QueryClient();

const App = () => {
  // On boot, check if this funnel is disabled for the current environment.
  useEffect(() => {
    (async () => {
      try {
        const status = await getStatus({ funnel_id: "fastingkit" });
        if (status?.mode === "off" && status?.redirect_url) {
          window.location.replace(status.redirect_url);
        }
      } catch {
        // ignore status errors; keep app running
      }
    })();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={(import.meta as any).env?.VITE_APP_BASEPATH || "/"}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/kit-builder" element={<KitBuilder />} />
            <Route path="/checkout" element={<Checkout />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
