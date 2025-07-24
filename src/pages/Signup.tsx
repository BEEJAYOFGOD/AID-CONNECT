import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Heart, HandHeart, Users2, Upload } from "lucide-react";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    profilePicture: null
  });
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profilePicture: file }));
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    // Mock signup - in real app, send to backend
    localStorage.setItem("userRole", formData.role);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary-glow mb-4 shadow-glow">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Join GiveTrust</h1>
          <p className="text-muted-foreground">Start your journey of transparent giving</p>
        </div>

        {/* Signup Card */}
        <Card className="border-0 shadow-soft">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">Create Account</CardTitle>
            <p className="text-muted-foreground">Fill in your details to get started</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <Label>Choose Your Role</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-primary/5 transition-colors cursor-pointer">
                    <RadioGroupItem value="donor" id="donor" />
                    <div className="flex items-center space-x-3">
                      <HandHeart className="w-5 h-5 text-primary" />
                      <div>
                        <Label htmlFor="donor" className="cursor-pointer font-medium">Donor</Label>
                        <p className="text-xs text-muted-foreground">Help others in need</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-primary/5 transition-colors cursor-pointer">
                    <RadioGroupItem value="recipient" id="recipient" />
                    <div className="flex items-center space-x-3">
                      <Users2 className="w-5 h-5 text-accent" />
                      <div>
                        <Label htmlFor="recipient" className="cursor-pointer font-medium">Recipient</Label>
                        <p className="text-xs text-muted-foreground">Request assistance</p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="profilePicture">Profile Picture or ID Document</Label>
                <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                  <input
                    id="profilePicture"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    required
                  />
                  <label htmlFor="profilePicture" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {formData.profilePicture 
                        ? formData.profilePicture.name 
                        : "Upload profile picture or National ID"}
                    </p>
                  </label>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-all duration-300"
                disabled={!formData.role}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:text-primary-glow font-medium transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;