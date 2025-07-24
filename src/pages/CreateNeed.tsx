import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Heart, 
  ArrowLeft, 
  Upload, 
  AlertCircle,
  Camera,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CreateNeed = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    category: "",
    urgent: false,
    supportingDocument: null,
    supportingImage: null
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field, file) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description || !formData.amount || !formData.category) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Mock submission
    toast({
      title: "Need Request Submitted!",
      description: "Your request has been submitted for verification and will be live soon.",
    });
    
    navigate("/dashboard");
  };

  const categories = [
    { value: "health", label: "Health & Medical" },
    { value: "education", label: "Education" },
    { value: "housing", label: "Housing & Rent" },
    { value: "business", label: "Business & Livelihood" },
    { value: "emergency", label: "Emergency" },
    { value: "family", label: "Family Support" },
    { value: "other", label: "Other" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/dashboard")}
              className="mr-4 flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Create Need Request</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl">Tell Us About Your Need</CardTitle>
            <p className="text-muted-foreground">
              Provide detailed information to help donors understand your situation
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="lg:col-span-2 space-y-2">
                    <Label htmlFor="title">
                      Title of Your Need <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Medical treatment for my mother"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      Amount Needed ($) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => handleInputChange("amount", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleInputChange("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Detailed Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Explain your situation in detail. Be honest and specific about how the funds will be used."
                    rows={5}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Detailed descriptions help build trust with potential donors
                  </p>
                </div>

                {/* Urgency Toggle */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-accent" />
                    <div>
                      <Label htmlFor="urgent" className="font-medium">Mark as Urgent</Label>
                      <p className="text-sm text-muted-foreground">
                        Check this if you need immediate assistance
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="urgent"
                    checked={formData.urgent}
                    onCheckedChange={(checked) => handleInputChange("urgent", checked)}
                  />
                </div>
              </div>

              {/* Supporting Documents */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Supporting Documents</h3>
                <p className="text-sm text-muted-foreground">
                  Upload documents or images to support your request (recommended)
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Supporting Image */}
                  <div className="space-y-2">
                    <Label>Supporting Image</Label>
                    <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload("supportingImage", e.target.files[0])}
                        className="hidden"
                        id="supporting-image"
                      />
                      <label htmlFor="supporting-image" className="cursor-pointer">
                        <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {formData.supportingImage 
                            ? formData.supportingImage.name 
                            : "Upload an image"}
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Supporting Document */}
                  <div className="space-y-2">
                    <Label>Supporting Document</Label>
                    <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload("supportingDocument", e.target.files[0])}
                        className="hidden"
                        id="supporting-document"
                      />
                      <label htmlFor="supporting-document" className="cursor-pointer">
                        <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {formData.supportingDocument 
                            ? formData.supportingDocument.name 
                            : "Upload a document"}
                        </p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-muted/50 border border-muted rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-accent mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground mb-1">Important Notice</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• All requests are reviewed and verified before going live</li>
                      <li>• Funds are disbursed directly to your verified wallet address</li>
                      <li>• All transactions are recorded on the blockchain for transparency</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
                >
                  Submit for Review
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateNeed;