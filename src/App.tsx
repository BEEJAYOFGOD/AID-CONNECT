import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import BrowseNeeds from "./pages/BrowseNeeds";
import CreateNeed from "./pages/CreateNeed";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";
import PageTitle from "./components/PageTitle";
import ProtectedRoute from "@/components/ProtectedRoute";
import DonationsPage from "@/pages/Donations";
import History from "./pages/History";
// import OTPVerification from "./auth/OtpVerification";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/auth/login" element={<Login />} />
                        <Route path="/auth/signup" element={<Signup />} />

                        {/* <Route
                            path="auth/otp/verification"
                            element={
                                <>
                                    <PageTitle title="Email Verification | IntaSync" />
                                    <OTPVerification />
                                </>
                            }
                        /> */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/browse"
                            element={
                                <ProtectedRoute>
                                    <BrowseNeeds />
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
                            path="/Donations"
                            element={
                                <ProtectedRoute>
                                    <DonationsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/create-need"
                            element={
                                <ProtectedRoute>
                                    <CreateNeed />
                                </ProtectedRoute>
                            }
                        />

                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
