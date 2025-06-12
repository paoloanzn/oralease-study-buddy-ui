
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import UploadNotes from "./pages/UploadNotes";
import ExamSetup from "./pages/ExamSetup";
import OralExam from "./pages/OralExam";
import ExamResults from "./pages/ExamResults";
import MyNotes from "./pages/MyNotes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<UploadNotes />} />
          <Route path="/exam-setup" element={<ExamSetup />} />
          <Route path="/oral-exam" element={<OralExam />} />
          <Route path="/results" element={<ExamResults />} />
          <Route path="/my-notes" element={<MyNotes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
