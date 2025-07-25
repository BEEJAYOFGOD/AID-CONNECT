import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Heart,
    Search,
    Filter,
    ArrowLeft,
    MapPin,
    Calendar,
    DollarSign,
    Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BrowseNeeds = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortBy, setSortBy] = useState("recent");
    const navigate = useNavigate();
    const { toast } = useToast();

    const categories = [
        { value: "all", label: "All Categories" },
        { value: "health", label: "Health & Medical" },
        { value: "education", label: "Education" },
        { value: "housing", label: "Housing & Rent" },
        { value: "food", label: "Food & Nutrition" },
        { value: "emergency", label: "Emergency" },
        { value: "other", label: "Other" },
    ];

    const mockNeeds = [
        {
            id: 1,
            title: "Urgent Medical Treatment for My Mother",
            description:
                "My mother needs immediate surgery for a heart condition. The medical bills are beyond our family's means.",
            recipient: "Sarah Johnson",
            location: "New York, NY",
            amount: 5000,
            raised: 3200,
            category: "health",
            urgent: true,
            createdAt: "2024-01-15",
            daysLeft: 12,
            donors: 24,
            verified: true,
        },
        {
            id: 2,
            title: "School Fees for Three Children",
            description:
                "Single mother struggling to pay school fees for three children. Education is their path to a better future.",
            recipient: "Michael Brown",
            location: "Atlanta, GA",
            amount: 2400,
            raised: 800,
            category: "education",
            urgent: false,
            createdAt: "2024-01-10",
            daysLeft: 25,
            donors: 12,
            verified: true,
        },
        {
            id: 3,
            title: "Emergency Rent Payment",
            description:
                "Facing eviction due to job loss. Need help with rent payment to keep my family housed.",
            recipient: "Emily Davis",
            location: "Phoenix, AZ",
            amount: 1800,
            raised: 1350,
            category: "housing",
            urgent: true,
            createdAt: "2024-01-12",
            daysLeft: 5,
            donors: 18,
            verified: true,
        },
        {
            id: 4,
            title: "Food Support for Community Kitchen",
            description:
                "Our community kitchen serves 200+ families daily. Need funds to continue operations this month.",
            recipient: "Community Care Center",
            location: "Chicago, IL",
            amount: 3500,
            raised: 2100,
            category: "food",
            urgent: false,
            createdAt: "2024-01-08",
            daysLeft: 18,
            donors: 45,
            verified: true,
        },
    ];

    const filteredNeeds = mockNeeds.filter((need) => {
        const matchesSearch =
            need.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            need.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            selectedCategory === "all" || need.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const sortedNeeds = [...filteredNeeds].sort((a, b) => {
        switch (sortBy) {
            case "recent":
                return new Date(b.createdAt) - new Date(a.createdAt);
            case "urgent":
                return b.urgent - a.urgent;
            case "amount":
                return b.amount - a.amount;
            case "progress":
                return b.raised / b.amount - a.raised / a.amount;
            default:
                return 0;
        }
    });

    const handleDonate = (need) => {
        toast({
            title: "Donation feature",
            description: `This would open donation flow for: ${need.title}`,
        });
    };

    const getProgress = (raised, amount) => Math.round((raised / amount) * 100);

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
            {/* Header */}
            <header className="border-b bg-card/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate("/dashboard")}
                                className="flex items-center space-x-2"
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
                                        Browse Needs
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        Find verified requests to support
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filters */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row gap-4 mb-6">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="flex  bg-white border">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search needs by title or description..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    // className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="w-full lg:w-48">
                            <Select
                                value={selectedCategory}
                                onValueChange={setSelectedCategory}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Category" />
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

                        {/* Sort */}
                        <div className="w-full lg:w-40">
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger>
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="recent">
                                        Most Recent
                                    </SelectItem>
                                    <SelectItem value="urgent">
                                        Most Urgent
                                    </SelectItem>
                                    <SelectItem value="amount">
                                        Highest Amount
                                    </SelectItem>
                                    <SelectItem value="progress">
                                        Most Progress
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {sortedNeeds.length} of {mockNeeds.length}{" "}
                            verified needs
                        </p>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                            <span className="text-sm text-muted-foreground">
                                All requests are verified
                            </span>
                        </div>
                    </div>
                </div>

                {/* Needs Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {sortedNeeds.map((need) => (
                        <Card
                            key={need.id}
                            className="border-0 shadow-soft hover:shadow-elegant transition-all duration-300"
                        >
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="w-12 h-12">
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {need.recipient
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold text-foreground leading-tight">
                                                {need.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                by {need.recipient}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end space-y-1">
                                        {need.urgent && (
                                            <Badge
                                                variant="destructive"
                                                className="text-xs"
                                            >
                                                Urgent
                                            </Badge>
                                        )}
                                        {need.verified && (
                                            <Badge
                                                variant="default"
                                                className="text-xs bg-primary/10 text-primary"
                                            >
                                                Verified
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {need.description}
                                </p>

                                {/* Location and Date */}
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center space-x-1">
                                        <MapPin className="w-3 h-3" />
                                        <span>{need.location}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>{need.daysLeft} days left</span>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-foreground">
                                            ${need.raised.toLocaleString()}{" "}
                                            raised
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {getProgress(
                                                need.raised,
                                                need.amount
                                            )}
                                            % of ${need.amount.toLocaleString()}
                                        </span>
                                    </div>
                                    <Progress
                                        value={getProgress(
                                            need.raised,
                                            need.amount
                                        )}
                                        className="h-2"
                                    />
                                </div>

                                {/* Stats */}
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <div className="flex items-center space-x-1">
                                        <Users className="w-4 h-4" />
                                        <span>{need.donors} donors</span>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        {need.category}
                                    </Badge>
                                </div>

                                {/* Donate Button */}
                                <Button
                                    className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
                                    onClick={() => handleDonate(need)}
                                >
                                    <DollarSign className="w-4 h-4 mr-2" />
                                    Donate Now
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {sortedNeeds.length === 0 && (
                    <div className="text-center py-12">
                        <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                            No needs found
                        </h3>
                        <p className="text-muted-foreground">
                            Try adjusting your search terms or filters to find
                            more requests.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BrowseNeeds;
