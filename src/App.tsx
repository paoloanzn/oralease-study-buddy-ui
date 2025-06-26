
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import MyNotes from "./pages/MyNotes";
import ExamSetup from "./pages/ExamSetup";
import OralExam from "./pages/OralExam";
import ExamResults from "./pages/ExamResults";
import UploadNotes from "./pages/UploadNotes";
import PerformanceDashboard from "./pages/PerformanceDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-notes" 
              element={
                <ProtectedRoute>
                  <MyNotes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/exam-setup" 
              element={
                <ProtectedRoute>
                  <ExamSetup />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/oral-exam" 
              element={
                <ProtectedRoute>
                  <OralExam />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/results" 
              element={
                <ProtectedRoute>
                  <ExamResults />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute>
                  <UploadNotes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/performance-dashboard" 
              element={
                <ProtectedRoute>
                  <PerformanceDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
