import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Heart,
    Plus,
    TrendingUp,
    Users,
    DollarSign,
    Clock,
    HandHeart,
    Eye,
    LogOut,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
    const [userRole, setUserRole] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user, logout, root_url } = useAuth();

    const name = JSON.parse(localStorage.getItem("authData"));
    const userName = name.data.name;

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem("accessToken");
            const acct_type = localStorage.getItem("acct_type");

            // if (!token || !acct_type) {
            //     throw new Error("Authentication required");
            // }

            setUserRole(acct_type);

            let url;
            if (acct_type === "donor") {
                url = `${root_url}/request/dashboard/stats`;
            } else {
                url = `${root_url}/request/dashboard/donations`;
            }

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
                    logout();
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            console.log(data);
            setDashboardData(data);
        } catch (err) {
            console.error("Dashboard data loading error:", err);

            console.log(err);

            // Handle different types of errors
            if (err.name === "TypeError" && err.message.includes("fetch")) {
                setError(
                    "Network error. Please check your internet connection."
                );
            } else if (err.message.includes("CORS")) {
                setError("CORS error. Please contact support.");
            } else if (err.message === "Authentication required") {
                setError("Please log in again.");
                setTimeout(() => logout(), 2000);
            } else {
                setError(err.message || "Failed to load dashboard data.");
            }
        } finally {
            setLoading(false);
        }
    };

    const retryLoad = () => {
        loadDashboardData();
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    // Donor Dashboard Component
    const DonorDashboard = ({ data }) => (
        <>
            {/* Stats Cards for Donor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-0 shadow-soft">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Donated
                                </p>
                                <p className="text-2xl font-bold text-foreground">
                                    ₦{data?.totalDonated || 0}
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-soft">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Open Requests
                                </p>
                                <p className="text-2xl font-bold text-foreground">
                                    {data?.openCount || 0}
                                </p>
                            </div>
                            <Clock className="w-8 h-8 text-accent" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-soft">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Fulfilled Requests
                                </p>
                                <p className="text-2xl font-bold text-foreground">
                                    {data?.fulfilledCount || 0}
                                </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-primary-glow" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity for Donor */}
            <div className="lg:col-span-2">
                <Card className="border-0 shadow-soft">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Recent Donation History</CardTitle>
                        {data?.history && data.history.length > 3 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate("/history")}
                                className="text-primary hover:text-primary/80"
                            >
                                View All
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data?.history && data.history.length > 0 ? (
                                data.history.slice(0, 3).map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <Avatar>
                                                <AvatarFallback>
                                                    {item.requester
                                                        ? item.requester
                                                              .split(" ")
                                                              .map((n) => n[0])
                                                              .join("")
                                                        : "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h4 className="font-medium text-foreground">
                                                    {item.title || "Donation"}
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.requester ||
                                                        "Anonymous"}
                                                </p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <Badge variant="secondary">
                                                        {item.category ||
                                                            "General"}
                                                    </Badge>
                                                    {item.status ===
                                                        "completed" && (
                                                        <Badge variant="default">
                                                            Completed
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-foreground">
                                                ₦{item.amount || 0}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.date
                                                    ? new Date(
                                                          item.date
                                                      ).toLocaleDateString()
                                                    : ""}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <HandHeart className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                                    <p className="text-muted-foreground font-medium mb-2">
                                        No donation history yet
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Start making a difference by browsing
                                        needs in your community
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate("/browse")}
                                        className="mt-2"
                                    >
                                        Browse Needs
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );

    // Recipient Dashboard Component
    const RecipientDashboard = ({ data }) => (
        <>
            {/* Stats Cards for Recipient */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-0 shadow-soft">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Received
                                </p>
                                <p className="text-2xl font-bold text-foreground">
                                    ₦{data?.totalDonationsSum || 0}
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-soft">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Donations
                                </p>
                                <p className="text-2xl font-bold text-foreground">
                                    {data?.totalDonationsCount || 0}
                                </p>
                            </div>
                            <Users className="w-8 h-8 text-accent" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-soft">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Active Donations
                                </p>
                                <p className="text-2xl font-bold text-foreground">
                                    {data?.activeDonationsCount || 0}
                                </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-primary-glow" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity for Recipient */}
            <div className="lg:col-span-2">
                <Card className="border-0 shadow-soft">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Recent Donations Received</CardTitle>
                        {data?.recentDonations &&
                            data.recentDonations.length > 3 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate("/history")}
                                    className="text-primary hover:text-primary/80"
                                >
                                    View All
                                </Button>
                            )}
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data?.recentDonations &&
                            data.recentDonations.length > 0 ? (
                                data.recentDonations
                                    .slice(0, 3)
                                    .map((donation, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <Avatar>
                                                    <AvatarFallback>
                                                        {donation.donor
                                                            ? donation.donor
                                                                  .split(" ")
                                                                  .map(
                                                                      (n) =>
                                                                          n[0]
                                                                  )
                                                                  .join("")
                                                            : "A"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h4 className="font-medium text-foreground">
                                                        Donation from{" "}
                                                        {donation.donor ||
                                                            "Anonymous"}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {donation.message ||
                                                            "Thank you for your generosity"}
                                                    </p>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <Badge variant="default">
                                                            Received
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-foreground">
                                                    ₦{donation.amount || 0}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {donation.date
                                                        ? new Date(
                                                              donation.date
                                                          ).toLocaleDateString()
                                                        : ""}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className="text-center py-8">
                                    <Heart className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                                    <p className="text-muted-foreground font-medium mb-2">
                                        No donations received yet
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Share your story and create a request to
                                        start receiving support
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate("/create-need")}
                                        className="mt-2"
                                    >
                                        Create Request
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );

    // Summary Dashboard Component for when data exists but might be minimal
    const SummaryDashboard = ({ data, role }) => (
        <div className="">
            <Card className="border-0 shadow-soft">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <span>Dashboard Summary</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {role === "donor" ? (
                            <>
                                <div className="text-center p-4 border rounded-lg">
                                    <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-foreground">
                                        ₦{data?.totalDonated || 0}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Total Donated
                                    </p>
                                </div>
                                <div className="text-center p-4 border rounded-lg">
                                    <Users className="w-8 h-8 text-accent mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-foreground">
                                        {(data?.openCount || 0) +
                                            (data?.fulfilledCount || 0)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Total Requests Supported
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-center p-4 border rounded-lg">
                                    <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-foreground">
                                        ₦{data?.totalDonationsSum || 0}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Total Received
                                    </p>
                                </div>
                                <div className="text-center p-4 border rounded-lg">
                                    <Users className="w-8 h-8 text-accent mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-foreground">
                                        {data?.totalDonationsCount || 0}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Total Donations
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="text-center py-6 border-t">
                        <p className="text-muted-foreground mb-4">
                            {role === "donor"
                                ? "Ready to make a difference? Browse needs in your community."
                                : "Share your story and connect with generous donors."}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={() =>
                                    navigate(
                                        role === "donor"
                                            ? "/browse"
                                            : "/create-need"
                                    )
                                }
                                className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
                            >
                                {role === "donor"
                                    ? "Browse Needs"
                                    : "Create Request"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate("/history")}
                            >
                                View History
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
            {/* Header */}
            <header className="border-b bg-card/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
                                <Heart className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <h1 className="text-2xl font-bold text-foreground">
                                AidConnect
                            </h1>
                        </div>

                        <nav className="hidden md:flex items-center space-x-6">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    if (userRole === "donor") {
                                        navigate("/browse");
                                    } else {
                                        navigate("/donations");
                                    }
                                }}
                            >
                                {userRole == "donor"
                                    ? "Browse Needs"
                                    : "Browse Donations"}
                            </Button>
                            {userRole === "requester" && (
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate("/create-need")}
                                >
                                    Create Need
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/history")}
                            >
                                History
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/profile")}
                            >
                                Profile
                            </Button>
                        </nav>

                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="flex items-center space-x-2"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Error Alert */}
                {/* {error && (
                    <Alert className="mb-6 border-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                            <span>{error}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={retryLoad}
                                className="ml-4"
                            >
                                Retry
                            </Button>
                        </AlertDescription>
                    </Alert>
                )} */}

                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                        Welcome back, {`${userName}`}
                    </h2>
                    <p className="text-muted-foreground">
                        {userRole === "donor"
                            ? "Here's an overview of your giving journey"
                            : "Manage your requests and track your progress"}
                    </p>
                </div>

                {/* Dashboard Content */}
                <div className="grid grid-cols-1  gap-8">
                    {/* Quick Actions Panel */}
                    <div className="lg:col-span-1">
                        <Card className="border-0 shadow-soft">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <HandHeart className="w-5 h-5 text-primary" />
                                    <span>Quick Actions</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {userRole == "donor" && (
                                    <Button
                                        className="w-full justify-start bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
                                        onClick={() => navigate("/browse")}
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Browse All Need
                                    </Button>
                                )}
                                {userRole === "requester" && (
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => navigate("/create-need")}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create New Request
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => navigate("/history")}
                                >
                                    <Clock className="w-4 h-4 mr-2" />
                                    View Transaction History
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Dashboard Stats and Content */}
                    {dashboardData ? (
                        // Check if we have detailed data (history/recentDonations with content)
                        (userRole === "donor" &&
                            dashboardData.history &&
                            dashboardData.history.length > 0) ||
                        (userRole === "requester" &&
                            dashboardData.recentDonations &&
                            dashboardData.recentDonations.length > 0) ? (
                            // Show full dashboard with history
                            userRole === "donor" ? (
                                <DonorDashboard data={dashboardData} />
                            ) : (
                                <RecipientDashboard data={dashboardData} />
                            )
                        ) : (
                            // Show summary dashboard when we have data but no history
                            <SummaryDashboard
                                data={dashboardData}
                                role={userRole}
                            />
                        )
                    ) : (
                        // Fallback for truly no data (shouldn't happen if API is working)
                        <SummaryDashboard data={{}} role={userRole} />
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
