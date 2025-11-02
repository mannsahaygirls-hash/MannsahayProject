import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Chatbot from "./pages/Chatbot";
import MannMitra from "./pages/MannMitra";
import ActivityZone from "./pages/ActivityZone";
import DailyQuotes from "./pages/DailyQuotes";
import History from "./pages/History";
import Journaling from "./pages/Journaling";
import UserProfile from "./pages/UserProfile";
import SessionTherapy from "./pages/SessionTherapy";
import ChatWithAnyone from "./pages/ChatWithAnyone";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import Offline from "./pages/Offline";
import IncognitoPage from "./pages/IncognitoPage";


const queryClient = new QueryClient();

// ✅ Helper component to handle Navbar visibility
const AppContent = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === "/"; // 👈 hide on login/signup page

  return (
    <div className="min-h-screen bg-background">
      {!hideNavbar && <Navigation />} {/* 👈 Navbar hidden on '/' */}
      <Routes>
        {/* 🟢 Auth (Login/Signup) */}
        <Route path="/" element={<Auth />} />

        {/* 🏠 Protected Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mannmitra"
          element={
            <ProtectedRoute>
              <MannMitra />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activities"
          element={
            <ProtectedRoute>
              <ActivityZone />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotes"
          element={
            <ProtectedRoute>
              <DailyQuotes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journaling"
          element={
            <ProtectedRoute>
              <Journaling />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/session-therapy"
          element={
            <ProtectedRoute>
              <SessionTherapy />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat-anyone"
          element={
            <ProtectedRoute>
              <ChatWithAnyone />
            </ProtectedRoute>
          }
        />

         <Route
          path="/offline"
          element={
            <ProtectedRoute>
              <Offline />
            </ProtectedRoute>
          }
        />

          <Route
          path="/incognito"
          element={
            <ProtectedRoute>
              <IncognitoPage />
            </ProtectedRoute>
          }
        />



        {/* 🚫 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
