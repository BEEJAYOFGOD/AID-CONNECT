import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Mail,
    Shield,
    CheckCircle,
    RefreshCw,
    ArrowLeft,
    AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { root_url, useAuth } from "@/contexts/AuthContext";

// Constants
const OTP_LENGTH = 4;
const RESEND_TIMEOUT = 60;
const REQUEST_TIMEOUT = 15000;

// Custom hooks
const useCountdown = (initialValue = RESEND_TIMEOUT) => {
    const [seconds, setSeconds] = useState(initialValue);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (seconds === 0) {
            setIsActive(false);
            return;
        }

        if (!isActive) return;

        const timer = setInterval(() => {
            setSeconds((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [seconds, isActive]);

    const reset = () => {
        setSeconds(initialValue);
        setIsActive(true);
    };

    return { seconds, isActive: seconds > 0, reset };
};

const useSessionValidation = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const validateSession = useCallback(() => {
        const storedEmail = sessionStorage.getItem("userEmail");
        const authData = sessionStorage.getItem("authData");

        if (!storedEmail) {
            toast({
                title: "Session expired",
                description: "Please start the authentication process again.",
                variant: "destructive",
            });
            navigate("/auth/signup");
            return null;
        }

        if (!authData) {
            toast({
                title: "Invalid session",
                description:
                    "Authentication data is missing. Please sign up again.",
                variant: "destructive",
            });
            navigate("/auth/signup");
            return null;
        }

        return { email: storedEmail, authData };
    }, [navigate, toast]);

    return validateSession;
};

// Utility functions
const createAbortController = (timeout = REQUEST_TIMEOUT) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    return { controller, timeoutId };
};

const parseApiResponse = async (response) => {
    try {
        return await response.json();
    } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Received invalid response from server");
    }
};

const getErrorMessage = (response, data) => {
    const defaultMessages = {
        400: "Invalid OTP. Please check and try again.",
        401: "Invalid or expired OTP. Please try again.",
        404: "Email not found. Please check your email address.",
        429: "Too many attempts. Please wait before trying again.",
        500: "Server error. Please try again later.",
    };

    const serverMessage = data?.error || data?.message || data?.reason;
    const defaultMessage = defaultMessages[response.status];

    if (response.status >= 500) {
        return "Server is currently unavailable. Please try again later.";
    }

    return (
        serverMessage ||
        defaultMessage ||
        "An error occurred. Please try again."
    );
};

const handleNetworkError = (error) => {
    if (error.name === "AbortError") {
        return "Request timed out. Please try again.";
    }

    if (error.name === "TypeError" && error.message.includes("fetch")) {
        return "Network error. Please check your internet connection.";
    }

    if (error.message === "Received invalid response from server") {
        return error.message;
    }

    return "An unexpected error occurred. Please try again.";
};

// Main component
const OTPVerification = () => {
    // State management
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [errors, setErrors] = useState(Array(OTP_LENGTH).fill(false));
    const [success, setSuccess] = useState(false);

    // Hooks
    const navigate = useNavigate();
    const { toast } = useToast();
    const { login } = useAuth();
    const inputRefs = useRef([]);
    const {
        seconds,
        isActive: cannotResend,
        reset: resetCountdown,
    } = useCountdown();
    const validateSession = useSessionValidation();

    // Session validation on mount
    useEffect(() => {
        const sessionData = validateSession();
        if (sessionData?.email) {
            setEmail(sessionData.email);
        }
    }, [validateSession]);

    // Input handling
    const handleInputChange = useCallback((index, value) => {
        // Validate input
        if (value.length > 1 || !/^[0-9]*$/.test(value)) return;

        setOtp((prev) => {
            const newOtp = [...prev];
            newOtp[index] = value;
            return newOtp;
        });

        // Clear error for this input
        setErrors((prev) => {
            if (prev[index]) {
                const newErrors = [...prev];
                newErrors[index] = false;
                return newErrors;
            }
            return prev;
        });

        // Auto-focus next input
        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    }, []);

    const handleKeyDown = useCallback(
        (index, e) => {
            if (e.key === "Backspace" && !otp[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        },
        [otp]
    );

    // API calls
    const makeApiCall = async (endpoint, body, timeout = REQUEST_TIMEOUT) => {
        const { controller, timeoutId } = createAbortController(timeout);

        try {
            const response = await fetch(`${root_url}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const data = await parseApiResponse(response);

            if (!response.ok) {
                const errorMessage = getErrorMessage(response, data);
                throw new Error(errorMessage);
            }

            return { data, response };
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    };

    const handleOtpVerification = async () => {
        const otpString = otp.join("");

        // Input validation
        if (!otpString.trim()) {
            setErrors(Array(OTP_LENGTH).fill(true));
            toast({
                title: "OTP required",
                description: "Please enter the verification code.",
                variant: "destructive",
            });
            return;
        }

        if (otpString.length !== OTP_LENGTH) {
            const newErrors = otp.map((digit) => !digit);
            setErrors(newErrors);
            toast({
                title: "Invalid OTP",
                description: `Please enter a valid ${OTP_LENGTH}-digit verification code.`,
                variant: "destructive",
            });
            return;
        }

        if (!email) {
            toast({
                title: "Email missing",
                description: "Email address is required for verification.",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);

            await makeApiCall("/auth/validate-otp", {
                email,
                otp: otpString,
            });

            // Success handling
            setSuccess(true);
            toast({
                title: "Email verified successfully!",
                description: "Your account has been verified.",
            });

            // Handle post-verification flow
            setTimeout(() => {
                handlePostVerificationFlow();
            }, 2000);
        } catch (error) {
            console.error("OTP verification error:", error);

            toast({
                title: "Verification failed",
                description: handleNetworkError(error),
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePostVerificationFlow = () => {
        const isLoginFlow = sessionStorage.getItem("isLogin");

        if (isLoginFlow === "true") {
            // LOGIN flow
            toast({
                title: "Login verification complete",
                description: "Please sign in to continue.",
            });

            // Clean up session data
            sessionStorage.removeItem("isLogin");
            sessionStorage.removeItem("userEmail");
            sessionStorage.removeItem("authData");

            navigate("/auth/signin");
        } else {
            // SIGNUP flow - redirect to signup page since whatsappReg doesn't exist
            toast({
                title: "Account created successfully!",
                description: "Please complete your registration.",
            });

            // Clean up session data
            sessionStorage.removeItem("userEmail");
            sessionStorage.removeItem("authData");

            navigate("/auth/signup");
        }
    };

    const handleResendOtp = async () => {
        if (cannotResend) {
            toast({
                title: "Please wait",
                description: `You can request a new OTP in ${seconds} seconds.`,
                variant: "destructive",
            });
            return;
        }

        if (!email) {
            toast({
                title: "Email missing",
                description: "Email address is required to resend OTP.",
                variant: "destructive",
            });
            return;
        }

        try {
            setResendLoading(true);

            const { data } = await makeApiCall(
                "/auth/request-otp",
                { email },
                10000
            );

            const successMessage = data.message || "OTP resent successfully!";
            toast({
                title: "OTP sent",
                description: successMessage,
            });

            resetCountdown();
            setOtp(Array(OTP_LENGTH).fill("")); // Clear current OTP input
            setErrors(Array(OTP_LENGTH).fill(false)); // Clear errors
        } catch (error) {
            console.error("Resend OTP error:", error);

            toast({
                title: "Resend failed",
                description: handleNetworkError(error),
                variant: "destructive",
            });
        } finally {
            setResendLoading(false);
        }
    };

    // Computed values
    const isComplete = otp.every((digit) => digit !== "");
    const hasErrors = errors.some((error) => error);

    // Success screen
    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center border dark:border-gray-700">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Verification Successful!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Your email has been verified successfully.
                        Redirecting...
                    </p>
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            </div>
        );
    }

    // Main verification screen
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden max-w-md w-full border dark:border-gray-700">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                        Verify Your Email
                    </h2>
                    <p className="text-blue-100 text-sm">
                        We've sent a verification code to your email address
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Email Display */}
                    {email && (
                        <div className="flex items-center justify-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                Code sent to:{" "}
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {email}
                                </span>
                            </span>
                        </div>
                    )}

                    {/* OTP Form */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleOtpVerification();
                        }}
                    >
                        {/* OTP Input */}
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">
                                Enter {OTP_LENGTH}-digit verification code
                            </label>

                            <div className="flex justify-center space-x-3">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) =>
                                            (inputRefs.current[index] = el)
                                        }
                                        type="text"
                                        inputMode="numeric"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) =>
                                            handleInputChange(
                                                index,
                                                e.target.value
                                            )
                                        }
                                        onKeyDown={(e) =>
                                            handleKeyDown(index, e)
                                        }
                                        className={`w-12 h-12 text-center text-lg font-bold border-2 rounded-lg transition-all duration-200 focus:outline-none dark:bg-gray-700 dark:text-white ${
                                            errors[index]
                                                ? "border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-400"
                                                : digit
                                                ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:border-green-400 dark:text-green-400"
                                                : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:bg-blue-50 dark:focus:bg-blue-900/20 dark:focus:border-blue-400"
                                        }`}
                                        placeholder="0"
                                        aria-label={`Digit ${index + 1}`}
                                    />
                                ))}
                            </div>

                            {hasErrors && (
                                <div className="flex items-center justify-center text-red-500 text-xs">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Please fill all fields with valid digits
                                </div>
                            )}
                        </div>

                        {/* Verify Button */}
                        <button
                            type="submit"
                            disabled={!isComplete || loading}
                            className={`w-full mt-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                                isComplete && !loading
                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transform hover:-translate-y-0.5"
                                    : "bg-gray-400 cursor-not-allowed"
                            }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Verifying...
                                </span>
                            ) : (
                                "Verify Email"
                            )}
                        </button>
                    </form>

                    {/* Resend Section */}
                    <div className="text-center space-y-3">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Didn't receive the code?
                        </p>

                        {!cannotResend ? (
                            <button
                                onClick={handleResendOtp}
                                disabled={resendLoading}
                                className={`inline-flex items-center text-sm font-semibold transition-colors ${
                                    resendLoading
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                }`}
                            >
                                <RefreshCw
                                    className={`w-4 h-4 mr-1 ${
                                        resendLoading ? "animate-spin" : ""
                                    }`}
                                />
                                {resendLoading ? "Sending..." : "Resend Code"}
                            </button>
                        ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Resend available in{" "}
                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                    {Math.floor(seconds / 60)}:
                                    {(seconds % 60).toString().padStart(2, "0")}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Back Link */}
                    <div className="text-center pt-4 border-t dark:border-gray-700">
                        <button
                            onClick={() => navigate("/auth/signup")}
                            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OTPVerification;
