import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Heart, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { root_url, useAuth } from "@/contexts/AuthContext";
import { NavLink } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const { login } = useAuth();

    if (localStorage.getItem("isAuthenticated")) {
        return <Navigate to="/dashboard" replace={true} />;
    }
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Basic validation
            if (!email?.trim()) {
                toast({
                    title: "Email required",
                    description: "Please enter your email address.",
                    variant: "destructive",
                });
                return;
            }

            if (!password) {
                toast({
                    title: "Password required",
                    description: "Please enter your password.",
                    variant: "destructive",
                });
                return;
            }

            console.log("Login URL:", `${root_url}/auth/sign-in`);
            console.log(
                "Login payload:",
                JSON.stringify({
                    email: email.trim(),
                    password: password,
                })
            );

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000);

            let response;
            let data;

            try {
                response = await fetch(`${root_url}/auth/sign-in`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        password: password,
                    }),
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                console.log("Login response status:", response.status);
                console.log("Login response:", response);

                // Parse JSON response
                data = await response.json();
                console.log("Login data:", data);
            } catch (fetchError) {
                clearTimeout(timeoutId);

                if (fetchError.name === "AbortError") {
                    toast({
                        title: "Request Timeout",
                        description: "Request timed out. Please try again.",
                        variant: "destructive",
                    });
                    return;
                }

                if (fetchError.name === "SyntaxError") {
                    console.error("Failed to parse response:", fetchError);
                    toast({
                        title: "Server Error",
                        description:
                            "Received invalid response from server. Please try again.",
                        variant: "destructive",
                    });
                    return;
                }

                // Re-throw other errors to be caught by outer catch
                throw fetchError;
            }

            // Now check if response is ok and handle errors with proper data access
            if (!response.ok) {
                let errorMessage = "Login failed. Please try again.";

                if (response.status === 400) {
                    errorMessage =
                        data?.message ||
                        "Invalid input. Please check your credentials.";
                } else if (response.status === 401) {
                    errorMessage =
                        data?.message ||
                        "Invalid email or password. Please try again.";
                } else if (response.status === 403) {
                    errorMessage =
                        data?.message ||
                        "Account access denied. Please contact support.";
                } else if (response.status === 404) {
                    errorMessage =
                        data?.message ||
                        "Account not found. Please check your email or sign up.";

                    // Provide option to navigate to signup for 404
                    toast({
                        title: "Account Not Found",
                        description: errorMessage,
                        variant: "destructive",
                        action: (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate("/signup")}
                            >
                                Sign Up
                            </Button>
                        ),
                    });
                    return;
                } else if (response.status === 422) {
                    errorMessage =
                        data?.message ||
                        "Please check your input and try again.";
                } else if (response.status === 500) {
                    errorMessage = "Server error. Please try again later.";
                } else if (response.status >= 500) {
                    errorMessage =
                        "Server is currently unavailable. Please try again later.";
                } else {
                    errorMessage = data?.message || errorMessage;
                }

                toast({
                    title: "Login Failed",
                    description: errorMessage,
                    variant: "destructive",
                });
                return;
            }

            // Success case - response is ok
            const { acct_type } = data?.data;
            const accessToken = data?.jwt_secret;

            if (accessToken) {
                login(accessToken, acct_type);

                // Success toast
                toast({
                    title: "Login successful!",
                    description: "Welcome back to AidConnect!",
                });

                // Store user data for authentication
                localStorage.setItem("userEmail", email.trim());
                localStorage.setItem("authData", JSON.stringify(data));
                localStorage.setItem("isAuthenticated", "true");

                // Clear any previous session data
                sessionStorage.removeItem("isLogin");
                sessionStorage.removeItem("userEmail");
                sessionStorage.removeItem("authData");

                // Navigate to dashboard
                navigate("/dashboard", { replace: true });
            } else {
                toast({
                    title: "Authentication Error",
                    description: "No access token received. Please try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Login error:", error);

            // Handle different types of errors
            let errorMessage =
                "An unexpected error occurred. Please try again.";

            if (error.name === "TypeError" && error.message.includes("fetch")) {
                errorMessage =
                    "Network error. Please check your internet connection and try again.";
            } else if (error.name === "AbortError") {
                errorMessage = "Request timed out. Please try again.";
            } else if (error.message) {
                errorMessage = `Error: ${error.message}`;
            }

            toast({
                title: "Login Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">
                        AidConnect
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Transparent giving, verified impact
                    </p>
                </div>

                <Card className="border-0 shadow-elegant">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Welcome Back</CardTitle>
                        <CardDescription>
                            Sign in to your account to continue helping others
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        className="pl-10 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <Button
                                    variant="link"
                                    className="p-0 h-auto text-sm text-primary hover:text-primary-glow"
                                    onClick={() => navigate("/forgot-password")}
                                    type="button"
                                >
                                    Forgot password?
                                </Button>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-all duration-300"
                                disabled={isLoading}
                            >
                                {isLoading ? "Signing in..." : "Sign In"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Don't have an account?{" "}
                                <NavLink
                                    className="p-0 h-auto text-primary hover:text-primary-glow"
                                    to="/auth/signup"
                                >
                                    Sign up here
                                </NavLink>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Login;
