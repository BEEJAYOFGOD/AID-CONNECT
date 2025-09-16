import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
    Loader2,
    AlertCircle,
    // Refresh,
    ChevronLeft,
    ChevronRight,
    Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth, root_url } from "@/contexts/AuthContext";
import Modal from "@/components/modal";
import DonationModal from "@/components/DonationModal";

const BrowseNeeds = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortBy, setSortBy] = useState("recent");
    const [needs, setNeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize] = useState(10);
    const [showModal, setShowModal] = useState(false);

    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const accessToken = localStorage.getItem("accessToken");

    // Get root URL from environment or config

    const categories = [
        { value: "all", label: "All Categories" },
        { value: "health", label: "Health & Medical" },
        { value: "education", label: "Education" },
        { value: "housing", label: "Housing & Rent" },
        { value: "food", label: "Food & Nutrition" },
        { value: "emergency", label: "Emergency" },
        { value: "other", label: "Other" },
    ];

    const sortOptions = [
        {
            value: "recent",
            label: "Most Recent",
            field: "createdAt",
            order: "desc",
        },
        {
            value: "urgent",
            label: "Most Urgent",
            field: "urgent",
            order: "desc",
        },
        {
            value: "amount",
            label: "Highest Amount",
            field: "targetAmount",
            order: "desc",
        },
        {
            value: "progress",
            label: "Most Progress",
            field: "progress",
            order: "desc",
        },
        {
            value: "deadline",
            label: "Ending Soon",
            field: "deadline",
            order: "asc",
        },
    ];

    const fetchNeeds = async (page = 1, resetError = true) => {
        try {
            if (resetError) {
                setError(null);
            }
            setLoading(true);

            const token = localStorage.getItem("accessToken");
            if (!token) {
                throw new Error("Authentication required");
            }

            // Build query parameters
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pageSize.toString(),
            });

            // Add search term if provided
            if (searchTerm.trim()) {
                params.append("search", searchTerm.trim());
            }

            // Add category filter if not "all"
            if (selectedCategory !== "all") {
                params.append("category", selectedCategory);
            }

            // Add sorting
            const sortOption = sortOptions.find(
                (option) => option.value === sortBy
            );
            if (sortOption) {
                params.append("sortBy", sortOption.field);
                params.append("order", sortOption.order);
            }

            // Add status filter to show only active requests
            params.append("status", "active");

            const url = `${root_url}/request?${params.toString()}`;

            const headers = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            };

            const response = await fetch(url, {
                method: "GET",
                headers,
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Handle unauthorized - redirect to login
                    navigate("/login");
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Handle different possible response structures
            if (data.data) {
                setNeeds(data.data);
                setTotalPages(data.pagination?.totalPages || 1);
                setTotalCount(data.pagination?.total || data.data.length);
            } else if (Array.isArray(data)) {
                // If response is directly an array
                setNeeds(data);
                setTotalPages(1);
                setTotalCount(data.length);
            } else {
                setNeeds([]);
                setTotalPages(1);
                setTotalCount(0);
            }

            setCurrentPage(page);
        } catch (err) {
            console.error("Error fetching needs:", err);

            // Handle different types of errors
            if (err.name === "TypeError" && err.message.includes("fetch")) {
                setError(
                    "Network error. Please check your internet connection."
                );
            } else if (err.message.includes("CORS")) {
                setError("CORS error. Please contact support.");
            } else if (err.message === "Authentication required") {
                setError("Please log in to view needs.");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setError(err.message || "Failed to load needs.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Debounce search to avoid too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== undefined) {
                setCurrentPage(1);
                fetchNeeds(1);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch when filters change
    useEffect(() => {
        setCurrentPage(1);
        fetchNeeds(1);
    }, [selectedCategory, sortBy]);

    // Initial load
    useEffect(() => {
        fetchNeeds(1);
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            fetchNeeds(newPage, false);
            // Scroll to top of results
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const retryFetch = () => {
        fetchNeeds(currentPage);
    };

    const handleDonate = (need) => {
        // Navigate to donation page or open donation modal
        setShowModal(true);
    };

    const getProgress = (currentAmount, targetAmount) => {
        if (!targetAmount || targetAmount === 0) return 0;
        return Math.min(Math.round((currentAmount / targetAmount) * 100), 100);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const createdDate = new Date(dateString);
        const diffInMs = now - createdDate;
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const diffInWeeks = Math.floor(diffInDays / 7);
        const diffInMonths = Math.floor(diffInDays / 30);

        if (diffInMinutes < 1) return "Just now";
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays < 7) return `${diffInDays}d ago`;
        if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
        if (diffInMonths < 12) return `${diffInMonths}mo ago`;
        return createdDate.toLocaleDateString();
    };

    const getCategoryLabel = (category) => {
        const categoryObj = categories.find((cat) => cat.value === category);
        return categoryObj ? categoryObj.label : category;
    };

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
                {/* Error Alert */}
                {error && (
                    <Alert className="mb-6 border-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                            <span>{error}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={retryFetch}
                                className="ml-4"
                            >
                                {/* <Refresh className="w-4 h-4 mr-2" /> */}
                                Retry
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Search and Filters */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row gap-4 mb-6">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search needs by title or description..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10"
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
                                    {sortOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Results count and status */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {loading ? (
                                "Loading needs..."
                            ) : (
                                <>
                                    Showing {needs.length} of {totalCount}{" "}
                                    verified needs
                                    {currentPage > 1 &&
                                        ` (Page ${currentPage} of ${totalPages})`}
                                </>
                            )}
                        </p>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                            <span className="text-sm text-muted-foreground">
                                All requests are verified
                            </span>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin mr-4" />
                        <span className="text-muted-foreground">
                            Loading needs...
                        </span>
                    </div>
                )}

                {/* Needs Grid */}
                {!loading && needs.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {needs.map((need) => (
                                // Add this helper function at the top of your component or in a utils file

                                // Updated Card Component
                                <Card
                                    key={need._id || need.id} // Use _id from your object structure
                                    className="border-0 shadow-soft hover:shadow-elegant transition-all duration-300"
                                >
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="w-12 h-12">
                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                        {need.requester?.name
                                                            ? need.requester.name
                                                                  .split(" ")
                                                                  .map(
                                                                      (n) =>
                                                                          n[0]
                                                                  )
                                                                  .join("")
                                                            : need.requesterName
                                                                  ?.split(" ")
                                                                  .map(
                                                                      (n) =>
                                                                          n[0]
                                                                  )
                                                                  .join("") ||
                                                              "?"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-semibold text-foreground leading-tight">
                                                        {need.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        by{" "}
                                                        {need.requester?.name ||
                                                            need.requesterName ||
                                                            "Anonymous"}
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
                                                {(need.verified ||
                                                    need.status === "open") && (
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

                                        {/* Location and Creation Time */}
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center space-x-1">
                                                <MapPin className="w-3 h-3" />
                                                <span>
                                                    {need.location ||
                                                        "Location not specified"}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Clock className="w-3 h-3" />
                                                <span>
                                                    {formatTimeAgo(
                                                        need.createdAt
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-foreground">
                                                    {formatCurrency(
                                                        need.currentAmount || 0
                                                    )}{" "}
                                                    raised
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {getProgress(
                                                        need.currentAmount,
                                                        need.amount
                                                    )}{" "}
                                                    % of{" "}
                                                    {formatCurrency(
                                                        need.amount
                                                    )}{" "}
                                                    {/* Using 'amount' from your object */}
                                                </span>
                                            </div>
                                            <Progress
                                                value={getProgress(
                                                    need.currentAmount,
                                                    need.amount
                                                )}
                                                className="h-2"
                                            />
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <div className="flex items-center space-x-1">
                                                <Users className="w-4 h-4" />
                                                <span>
                                                    {need.donations?.length ||
                                                        0}{" "}
                                                    donors{" "}
                                                    {/* Using donations array length */}
                                                </span>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                {need.category}{" "}
                                                {/* Direct category from your object */}
                                            </Badge>
                                        </div>

                                        {/* Donate Button */}
                                        <Button
                                            className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
                                            onClick={() => handleDonate(need)}
                                            disabled={need.status !== "open"}
                                        >
                                            <DollarSign className="w-4 h-4 mr-2" />
                                            {need.status === "open"
                                                ? "Donate Now"
                                                : "Not Available"}
                                        </Button>

                                        {showModal && (
                                            <DonationModal
                                                need={need}
                                                onClose={() =>
                                                    setShowModal(false)
                                                }
                                                rootUrl={root_url}
                                                accessToken={accessToken}
                                                isOpen={showModal}
                                            />
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center space-x-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handlePageChange(currentPage - 1)
                                    }
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    Previous
                                </Button>

                                <div className="flex items-center space-x-2">
                                    {Array.from(
                                        { length: Math.min(totalPages, 5) },
                                        (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (
                                                currentPage >=
                                                totalPages - 2
                                            ) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }

                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={
                                                        currentPage === pageNum
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                        handlePageChange(
                                                            pageNum
                                                        )
                                                    }
                                                    className="w-8 h-8 p-0"
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        }
                                    )}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handlePageChange(currentPage + 1)
                                    }
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        )}
                    </>
                )}

                {/* Empty State */}
                {!loading && needs.length === 0 && !error && (
                    <div className="text-center py-12">
                        <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                            No needs found
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            Try adjusting your search terms or filters to find
                            more requests.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedCategory("all");
                                setSortBy("recent");
                            }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BrowseNeeds;
