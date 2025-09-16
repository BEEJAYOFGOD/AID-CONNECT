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
import { Heart, Mail, Lock, User, Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { root_url } from "@/contexts/AuthContext";

const Signup = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
    });

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
            // Basic validation
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
                        "Please select whether you want to be a donor or recipient.",
                    variant: "destructive",
                });
                return;
            }

            // Additional validation
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

            console.log(root_url);
            console.log(
                JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    acct_type: formData.role.trim(),
                    password: formData.password,
                })
            );

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await fetch(`${root_url}/auth/sign-up`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    acct_type: formData.role.trim(),
                    password: formData.password,
                }),
            });

            clearTimeout(timeoutId);

            console.log(response);

            // Check if response is ok before trying to parse JSON
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error("Failed to parse response:", parseError);
                toast({
                    title: "Server Error",
                    description:
                        "Received invalid response from server. Please try again.",
                    variant: "destructive",
                });
                return;
            }

            console.log(data);

            if (!response.ok) {
                // Handle different HTTP status codes with specific messages
                let errorMessage = "Something went wrong during signup";

                if (response.status === 400) {
                    errorMessage =
                        data.message ||
                        "Invalid input. Please check your information.";
                } else if (response.status === 409) {
                    errorMessage =
                        data.message ||
                        "An account with this email already exists.";
                } else if (response.status === 422) {
                    errorMessage =
                        data.message ||
                        "Please check your input and try again.";
                } else if (response.status === 500) {
                    errorMessage = "Server error. Please try again later.";
                } else if (response.status >= 500) {
                    errorMessage =
                        "Server is currently unavailable. Please try again later.";
                } else {
                    errorMessage = data.message || errorMessage;
                }

                toast({
                    title: "Signup failed",
                    description: errorMessage,
                    variant: "destructive",
                });
                return;
            }

            // Success case
            toast({
                title: "Account created successfully!",
                description: "Please check your email for OTP verification",
            });

            sessionStorage.setItem("userEmail", formData.email);
            sessionStorage.setItem("authData", JSON.stringify(data));
            sessionStorage.removeItem("isLogin");

            navigate("/auth/otp/verification");
        } catch (error) {
            console.error("Signup error:", error);

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
                title: "Signup Error",
                description: errorMessage,
                variant: "destructive",
            });
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
                                    <p></p>
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
                                    <Label htmlFor="email">Emailyy</Label>
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
                                            type="password"
                                            placeholder="Create a password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="pl-10"
                                            required
                                        />
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
                                            type="password"
                                            placeholder="Confirm your password"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Verification Documents */}
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-base font-medium flex items-center space-x-2">
                                        <span>Verification Documents</span>
                                        <Badge variant="secondary">
                                            Required
                                        </Badge>
                                    </Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Upload documents to verify your identity
                                        and prevent fraud
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
                                    : "Create Account"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Button
                                    variant="link"
                                    className="p-0 h-auto text-primary hover:text-primary-glow"
                                    onClick={() => navigate("/login")}
                                >
                                    Sign in here
                                </Button>
                            </p>

                            {/* <button
                                onClick={async () => {
                                    setIsLoading(true);
                                    const response = await fetch(
                                        `${root_url}/auth/request-otp`,
                                        {
                                            method: "POST",
                                            headers: {
                                                "Content-Type":
                                                    "application/json",
                                            },
                                            body: JSON.stringify({
                                                email: "adexbolaji100@gmail.com",
                                            }),
                                        }
                                    );

                                    clearTimeout(timeoutId);

                                    console.log(response);

                                    // Check if response is ok before trying to parse JSON
                                    let data;
                                    try {
                                        data = await response.json();
                                    } catch (parseError) {
                                        console.error(
                                            "Failed to parse response:",
                                            parseError
                                        );
                                        toast({
                                            title: "Server Error",
                                            description:
                                                "Received invalid response from server. Please try again.",
                                            variant: "destructive",
                                        });
                                        return;
                                    }

                                    setIsLoading(false);
                                    console.log(data);

                                    // if (!response.ok) {
                                    //     // Handle different HTTP status codes with specific messages
                                    //     let errorMessage =
                                    //         "Something went wrong during signup";

                                    //     if (response.status === 400) {
                                    //         errorMessage =
                                    //             data.message ||
                                    //             "Invalid input. Please check your information.";
                                    //     } else if (response.status === 409) {
                                    //         errorMessage =
                                    //             data.message ||
                                    //             "An account with this email already exists.";
                                    //     } else if (response.status === 422) {
                                    //         errorMessage =
                                    //             data.message ||
                                    //             "Please check your input and try again.";
                                    //     } else if (response.status === 500) {
                                    //         errorMessage =
                                    //             "Server error. Please try again later.";
                                    //     } else if (response.status >= 500) {
                                    //         errorMessage =
                                    //             "Server is currently unavailable. Please try again later.";
                                    //     } else {
                                    //         errorMessage =
                                    //             data.message || errorMessage;
                                    //     }

                                    //     toast({
                                    //         title: "Signup failed",
                                    //         description: errorMessage,
                                    //         variant: "destructive",
                                    //     });
                                    //     return;
                                    // }

                                    // Success case
                                }}
                            >
                                {isLoading ? "getting" : "get OTP"}
                            </button> */}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Signup;
