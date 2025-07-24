import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Mail, Lock, User, Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!formData.role) {
      toast({
        title: "Role required",
        description: "Please select whether you want to be a donor or recipient.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Simulate signup process
    setTimeout(() => {
      localStorage.setItem("userRole", formData.role);
      toast({
        title: "Account created successfully!",
        description: "Welcome to GiveTrust. Your account is pending verification.",
      });
      navigate("/dashboard");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Join GiveTrust</h1>
          <p className="text-muted-foreground mt-2">Create your account and start making a difference</p>
        </div>

        <Card className="border-0 shadow-elegant">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>
              Fill in your details to get started with transparent giving
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">I want to:</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: "donor"})}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      formData.role === "donor" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <h3 className="font-medium text-foreground">Be a Donor</h3>
                    <p className="text-sm text-muted-foreground">Help others by donating to verified needs</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: "recipient"})}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      formData.role === "recipient" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <h3 className="font-medium text-foreground">Request Help</h3>
                    <p className="text-sm text-muted-foreground">Submit verified requests for assistance</p>
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
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
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
                    <Badge variant="secondary">Required</Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload documents to verify your identity and prevent fraud
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profileImage" className="flex items-center space-x-2">
                      <Upload className="w-4 h-4" />
                      <span>Profile Picture</span>
                    </Label>
                    <Input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "profile")}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    {profileImage && (
                      <p className="text-xs text-muted-foreground">✓ {profileImage.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idDocument" className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Government ID</span>
                    </Label>
                    <Input
                      id="idDocument"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, "id")}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    {idDocument && (
                      <p className="text-xs text-muted-foreground">✓ {idDocument.name}</p>
                    )}
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;