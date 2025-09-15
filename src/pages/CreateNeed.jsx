import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Heart,
    ArrowLeft,
    Upload,
    DollarSign,
    FileText,
    AlertTriangle,
    CheckCircle,
    Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { root_url } from "@/contexts/AuthContext";

const CreateNeed = () => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        amount: "",
        category: "",
        urgent: false,
        location: "",
    });
    const [supportingFile, setSupportingFile] = useState(null); // Changed to single file
    const [uploadedFileUrl, setUploadedFileUrl] = useState(""); // Changed to single URL
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    // Your Cloudinary config - Replace with your actual values
    const CLOUDINARY_UPLOAD_PRESET = "AID_CONNECT_UPLOADS"; // Create this in Cloudinary
    const CLOUDINARY_CLOUD_NAME = "dvieev0ag";

    const categories = [
        { value: "health", label: "Health & Medical" },
        { value: "education", label: "Education" },
        { value: "housing", label: "Housing & Rent" },
        { value: "food", label: "Food & Nutrition" },
        { value: "emergency", label: "Emergency" },
        { value: "other", label: "Other" },
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Upload file to Cloudinary
    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        formData.append("resource_type", "auto"); // auto detects file type

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error("Upload failed");
            }

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error("Error uploading to Cloudinary:", error);
            throw error;
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0]; // Only get the first file
        if (!file) return;

        setIsUploading(true);

        try {
            // Show selected file immediately
            setSupportingFile(file);

            // Upload file to Cloudinary
            const uploadedUrl = await uploadToCloudinary(file);

            // Store the URL
            setUploadedFileUrl(uploadedUrl);

            toast({
                title: "File uploaded successfully!",
                description: "File uploaded to cloud storage.",
            });
        } catch (error) {
            toast({
                title: "Upload failed",
                description: "Failed to upload file. Please try again.",
                variant: "destructive",
            });
            // Remove failed file
            setSupportingFile(null);
        } finally {
            setIsUploading(false);
        }
    };

    const removeFile = () => {
        setSupportingFile(null);
        setUploadedFileUrl("");
        // Clear the file input
        const fileInput = document.getElementById("file-upload");
        if (fileInput) fileInput.value = "";
    };

    // Fill form with dummy data for testing
    const fillDummyData = () => {
        setFormData({
            title: "Emergency Surgery for My Mother",
            description:
                "My mother has been diagnosed with a critical heart condition that requires immediate surgery. The medical bills are overwhelming our family finances, and we urgently need community support. The surgery costs $15,000, and we have exhausted all our savings. Any contribution would help save her life and give our family hope during this difficult time.",
            amount: "15000",
            category: "health",
            urgent: true,
            location: "Lagos, Nigeria",
        });

        // Add dummy Cloudinary URL (replace with actual URL from your Cloudinary account)
        const dummyUrl =
            "https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/medical_report.pdf";

        setUploadedFileUrl(dummyUrl);

        // Create dummy file object for display
        const dummyFile = new File([""], "medical_report.pdf", {
            type: "application/pdf",
        });
        setSupportingFile(dummyFile);

        toast({
            title: "Dummy data filled!",
            description:
                "Form populated with test data including Cloudinary URL.",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Basic validation
        if (
            !formData.title ||
            !formData.description ||
            !formData.amount ||
            !formData.category
        ) {
            toast({
                title: "Missing required fields",
                description:
                    "Please fill in all required fields before submitting.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        if (parseFloat(formData.amount) <= 0) {
            toast({
                title: "Invalid amount",
                description: "Please enter a valid amount greater than $0.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        // Prepare submission data
        const submissionData = {
            ...formData,
            supportingDocument: uploadedFileUrl, // Single URL instead of array
            amount: parseFloat(formData.amount),
        };

        try {
            const response = await fetch(`${root_url}/request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Add authorization header if needed
                    // 'Authorization': `Bearer ${yourAuthToken}`,
                },
                body: JSON.stringify(submissionData),
            });

            if (!response.ok) {
                throw new Error("Submission failed");
            }

            const result = await response.json();

            toast({
                title: "Request submitted successfully!",
                description:
                    "Your need has been submitted for verification. You'll be notified once it's approved.",
            });

            navigate("/dashboard");
        } catch (error) {
            console.error("Submission error:", error);
            toast({
                title: "Submission failed",
                description: "Failed to submit your request. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
            {/* Header */}
            <header className="border-b bg-card/50 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/dashboard")}
                            className="flex items-center space-x-2 mr-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </Button>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
                                <Heart className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">
                                    Create Need Request
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Submit your request for community support
                                </p>
                            </div>
                        </div>

                        {/* Debug button for testing */}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={fillDummyData}
                            className="ml-auto"
                        >
                            Fill Test Data
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <Card className="border-0 shadow-soft">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <FileText className="w-5 h-5 text-primary" />
                                <span>Basic Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Request Title *</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="Brief, clear title for your request"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Make it specific and compelling (e.g.,
                                    "Emergency surgery for my mother")
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Detailed Description *
                                </Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Explain your situation in detail. Be honest and specific about why you need help."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={6}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Include background, current situation, and
                                    how the funds will be used
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">
                                        Amount Needed (USD) *
                                    </Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="amount"
                                            name="amount"
                                            type="number"
                                            placeholder="0.00"
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                            className="pl-10"
                                            min="1"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                category: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.value}
                                                    value={category.value}
                                                >
                                                    {category.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    name="location"
                                    placeholder="City, State (helps donors understand local context)"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="urgent"
                                    checked={formData.urgent}
                                    onCheckedChange={(checked) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            urgent: checked,
                                        }))
                                    }
                                />
                                <Label
                                    htmlFor="urgent"
                                    className="flex items-center space-x-2"
                                >
                                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                                    <span>This is an urgent request</span>
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Supporting Document */}
                    <Card className="border-0 shadow-soft">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Upload className="w-5 h-5 text-primary" />
                                <span>Supporting Document</span>
                                {isUploading && (
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-6 border-2 border-dashed border-border rounded-lg text-center">
                                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-foreground">
                                        Upload a supporting document
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Medical bill, school fee receipt, rent
                                        notice, or other relevant document
                                    </p>
                                    <Input
                                        type="file"
                                        accept="image/*,.pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="file-upload"
                                        disabled={isUploading}
                                    />
                                    <Label
                                        htmlFor="file-upload"
                                        className="cursor-pointer"
                                    >
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="mt-2"
                                            disabled={
                                                isUploading ||
                                                supportingFile !== null
                                            }
                                        >
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                    Uploading...
                                                </>
                                            ) : supportingFile ? (
                                                "File Selected"
                                            ) : (
                                                "Choose File"
                                            )}
                                        </Button>
                                    </Label>
                                </div>
                            </div>

                            {/* File Display */}
                            {supportingFile && (
                                <div className="space-y-2">
                                    <Label>Uploaded File:</Label>
                                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-foreground">
                                                {supportingFile.name}
                                            </span>
                                            {uploadedFileUrl && (
                                                <span className="text-xs text-muted-foreground">
                                                    ✓ Uploaded to cloud
                                                </span>
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={removeFile}
                                            className="text-destructive hover:text-destructive"
                                            disabled={isUploading}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                <div className="flex items-start space-x-2">
                                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-medium text-blue-900">
                                            Verification Process
                                        </p>
                                        <p className="text-blue-700 mt-1">
                                            All requests go through manual
                                            verification to ensure authenticity.
                                            Your file is securely stored in the
                                            cloud and providing a supporting
                                            document increases your approval
                                            chances.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/dashboard")}
                            disabled={isLoading || isUploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
                            disabled={isLoading || isUploading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Request"
                            )}
                        </Button>
                    </div>

                    {/* Debug Info */}
                    {uploadedFileUrl && (
                        <Card className="border-green-200 bg-green-50">
                            <CardContent className="p-4">
                                <p className="text-sm font-medium text-green-900 mb-2">
                                    Cloudinary URL ready for submission:
                                </p>
                                <p className="text-xs text-green-700 font-mono break-all">
                                    {uploadedFileUrl}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Disclaimer */}
                    <Card className="border-orange-200 bg-orange-50">
                        <CardContent className="p-4">
                            <div className="flex items-start space-x-2">
                                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium text-orange-900">
                                        Important Notice
                                    </p>
                                    <p className="text-orange-800 mt-1">
                                        By submitting this request, you confirm
                                        that all information provided is
                                        truthful and accurate. False or
                                        misleading information will result in
                                        account suspension and may have legal
                                        consequences.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </main>
        </div>
    );
};

export default CreateNeed;
