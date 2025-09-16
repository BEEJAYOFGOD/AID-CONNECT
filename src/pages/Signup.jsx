import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import {
    Heart,
    Mail,
    Lock,
    User,
    Upload,
    FileText,
    EyeOff,
    Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { root_url, useAuth } from "@/contexts/AuthContext";

const Signup = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
    });

    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [idDocument, setIdDocument] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (type === "profile") {
            setProfileImage(file);
        } else {
            setIdDocument(file);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // ===== Basic Validation =====
            if (formData.password !== formData.confirmPassword) {
                toast({
                    title: "Password mismatch",
                    description: "Passwords do not match. Please try again.",
                    variant: "destructive",
                });
                return;
            }

            if (!formData.role) {
                toast({
                    title: "Role required",
                    description:
                        "Please select whether you want to be a donor or requester",
                    variant: "destructive",
                });
                return;
            }

            if (!formData.name?.trim()) {
                toast({
                    title: "Name required",
                    description: "Please enter your name.",
                    variant: "destructive",
                });
                return;
            }

            if (!formData.email?.trim()) {
                toast({
                    title: "Email required",
                    description: "Please enter your email address.",
                    variant: "destructive",
                });
                return;
            }

            if (!formData.password) {
                toast({
                    title: "Password required",
                    description: "Please enter a password.",
                    variant: "destructive",
                });
                return;
            }

            // ===== Request =====
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                acct_type: formData.role.trim(),
                password: formData.password,
            };

            console.log("Signup URL:", `${root_url}/auth/sign-up`);
            console.log("Payload:", payload);

            const controller = new AbortController();

            // Set timeout for the request
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch(`${root_url}/auth/sign-up`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            // Clear the timeout since request completed
            clearTimeout(timeoutId);

            console.log("Response status:", response.status);
            console.log("Response ok:", response.ok);

            // ===== Parse Response =====
            let data;
            const contentType = response.headers.get("content-type");

            try {
                // Only try to parse JSON if we actually got JSON content
                if (contentType && contentType.includes("application/json")) {
                    data = await response.json();
                    console.log("Parsed response data:", data);
                } else {
                    // If it's not JSON, get the text content for debugging
                    const responseText = await response.text();
                    console.log("Non-JSON response received:", responseText);

                    // Check if this looks like a CORS error (HTML response when expecting JSON)
                    if (
                        responseText.includes("<!DOCTYPE") ||
                        responseText.includes("<html")
                    ) {
                        throw new Error("CORS_ERROR");
                    }

                    // Try to create a minimal data object for error handling
                    data = { message: "Invalid response format received" };
                }
            } catch (parseError) {
                console.error("Failed to parse response:", parseError);

                // Handle specific CORS/HTML response case
                if (
                    parseError.message === "CORS_ERROR" ||
                    parseError.message.includes("Unexpected token '<'")
                ) {
                    toast({
                        title: "Connection Error",
                        description:
                            "Unable to connect to the server. This might be a CORS issue or server misconfiguration. Please contact support.",
                        variant: "destructive",
                    });

                    // DON'T redirect, just return and stay on signup page
                    return;
                }

                // For other JSON parsing errors
                toast({
                    title: "Server Error",
                    description:
                        "Received invalid response from server. Please try again.",
                    variant: "destructive",
                });

                // DON'T redirect, just return and stay on signup page
                return;
            }

            // ===== Error Handling =====
            if (!response.ok) {
                console.log("Signup failed with status:", response.status);

                let errorMessage = "Something went wrong during signup";

                // Handle specific error cases
                switch (response.status) {
                    case 400:
                        errorMessage =
                            data?.message ||
                            "Invalid input. Please check your information.";
                        break;
                    case 401:
                        errorMessage =
                            data?.message || "Authentication failed.";
                        break;
                    case 409:
                        errorMessage =
                            data?.message ||
                            "An account with this email already exists.";
                        break;
                    case 422:
                        errorMessage =
                            data?.message ||
                            "Please check your input and try again.";
                        break;
                    case 429:
                        errorMessage =
                            "Too many requests. Please wait and try again.";
                        break;
                    case 500:
                        errorMessage = "Server error. Please try again later.";
                        break;
                    case 502:
                    case 503:
                    case 504:
                        errorMessage =
                            "Server is temporarily unavailable. Please try again later.";
                        break;
                    default:
                        if (response.status >= 500) {
                            errorMessage =
                                "Server is currently unavailable. Please try again later.";
                        } else if (response.status >= 400) {
                            errorMessage =
                                data?.message ||
                                `Request failed with status ${response.status}`;
                        }
                }

                console.error("Signup error:", errorMessage);

                toast({
                    title: "Signup Failed",
                    description: errorMessage,
                    variant: "destructive",
                });
                return;
            }

            // ===== SUCCESS HANDLING =====
            console.log("Signup successful! Response data:", data);

            toast({
                title: "Account created successfully!",
                description: "Welcome to GiveTrust! You are now logged in.",
                variant: "default", // success variant
            });

            // Store authentication data
            try {
                localStorage.setItem("userEmail", formData.email.trim());
                localStorage.setItem("authData", JSON.stringify(data));
                localStorage.setItem("isAuthenticated", "true");

                // Store account type for dashboard logic
                localStorage.setItem("acct_type", formData.role.trim());

                // Store token - check various possible token field names
                const token =
                    data.token ||
                    data.access_token ||
                    data.jwt_secret ||
                    data.accessToken;
                if (token) {
                    localStorage.setItem("accessToken", token);
                    console.log("Access token stored");
                } else {
                    console.warn("No access token found in response");
                }

                // Store user data if available
                if (data.user) {
                    localStorage.setItem("userData", JSON.stringify(data.user));
                } else if (data.data?.user) {
                    localStorage.setItem(
                        "userData",
                        JSON.stringify(data.data.user)
                    );
                }

                // Clear any previous session data
                sessionStorage.removeItem("isLogin");
                sessionStorage.removeItem("userEmail");
                sessionStorage.removeItem("authData");

                console.log("Authentication data stored successfully");
            } catch (storageError) {
                console.error(
                    "Failed to store authentication data:",
                    storageError
                );
                toast({
                    title: "Warning",
                    description:
                        "Account created but there was an issue saving login data. Please try logging in manually.",
                    variant: "destructive",
                });
            }

            // Navigate to dashboard after a brief delay
            setTimeout(() => {
                console.log("Redirecting to dashboard...");
                navigate("/dashboard");
            }, 1000); // Increased delay to show success message
        } catch (error) {
            console.error("Signup error:", error);

            let errorMessage =
                "An unexpected error occurred. Please try again.";
            let shouldRedirect = false; // Flag to control redirection

            // Handle different types of errors
            if (error.name === "TypeError" && error.message.includes("fetch")) {
                errorMessage =
                    "Network error. Please check your internet connection and try again.";
            } else if (error.name === "AbortError") {
                errorMessage = "Request timed out. Please try again.";
            } else if (
                error.message.includes("CORS") ||
                error.message === "CORS_ERROR"
            ) {
                errorMessage =
                    "Connection blocked by security policy. Please contact support or try again later.";
            } else if (error.message.includes("Failed to fetch")) {
                errorMessage =
                    "Unable to connect to the server. Please check your connection and try again.";
            } else if (error.message) {
                errorMessage = `Error: ${error.message}`;
            }

            toast({
                title: "Signup Error",
                description: errorMessage,
                variant: "destructive",
            });

            // Only redirect for specific critical errors, not CORS/network issues
            if (shouldRedirect) {
                setTimeout(() => {
                    navigate("/");
                }, 3000);
            }
            // Otherwise, stay on the signup page so user can try again
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Join GiveTrust
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Create your account and start making a difference
                    </p>
                </div>

                <Card className="border-0 shadow-elegant">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">
                            Create Account
                        </CardTitle>
                        <CardDescription>
                            Fill in your details to get started with transparent
                            giving
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSignup} className="space-y-6">
                            {/* Role Selection */}
                            <div className="space-y-3">
                                <Label className="text-base font-medium">
                                    I want to:
                                </Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                role: "donor",
                                            })
                                        }
                                        className={`p-4 border rounded-lg text-left transition-all ${
                                            formData.role === "donor"
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50"
                                        }`}
                                    >
                                        <h3 className="font-medium text-foreground">
                                            Be a Donor
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Help others by donating to verified
                                            needs
                                        </p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                role: "requester",
                                            })
                                        }
                                        className={`p-4 border rounded-lg text-left transition-all ${
                                            formData.role === "requester"
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50"
                                        }`}
                                    >
                                        <h3 className="font-medium text-foreground">
                                            Request Help
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Submit verified requests for
                                            assistance
                                        </p>
                                    </button>
                                </div>
                            </div>

                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            placeholder="Enter your full name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Create a password"
                                            value={formData.password}
                                            onChange={handleInputChange}
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

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Confirm your password"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className="pl-10 pr-10"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                            className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Documents */}
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-base font-medium flex items-center space-x-2">
                                        <span>Verification Documents</span>
                                        <Badge variant="secondary">
                                            Optional
                                        </Badge>
                                    </Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Upload documents to verify your identity
                                        (can be done later)
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="profileImage"
                                            className="flex items-center space-x-2"
                                        >
                                            <Upload className="w-4 h-4" />
                                            <span>Profile Picture</span>
                                        </Label>
                                        <Input
                                            id="profileImage"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                                handleFileChange(e, "profile")
                                            }
                                            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                        />
                                        {profileImage && (
                                            <p className="text-xs text-muted-foreground">
                                                ✓ {profileImage.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="idDocument"
                                            className="flex items-center space-x-2"
                                        >
                                            <FileText className="w-4 h-4" />
                                            <span>Government ID</span>
                                        </Label>
                                        <Input
                                            id="idDocument"
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) =>
                                                handleFileChange(e, "id")
                                            }
                                            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                        />
                                        {idDocument && (
                                            <p className="text-xs text-muted-foreground">
                                                ✓ {idDocument.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-all duration-300"
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? "Creating Account..."
                                    : "Create Account & Sign In"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Button
                                    variant="link"
                                    className="p-0 h-auto text-primary hover:text-primary-glow"
                                    onClick={() => navigate("/auth/login")}
                                >
                                    Sign in here
                                </Button>
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                                Forgot your password?{" "}
                                <Button
                                    variant="link"
                                    className="p-0 h-auto text-xs text-primary hover:text-primary-glow"
                                    onClick={() => navigate("/forgot-password")}
                                >
                                    Reset it here
                                </Button>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Signup;
