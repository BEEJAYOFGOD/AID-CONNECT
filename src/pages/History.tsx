import React, { useState, useEffect } from "react";
import {
    TrendingUp,
    Package,
    CheckCircle,
    DollarSign,
    Clock,
    AlertCircle,
    RefreshCw,
    Calendar,
    User,
    Hash,
    MapPin,
    FileText,
    Heart,
    Users,
} from "lucide-react";
import { root_url, useAuth } from "@/contexts/AuthContext";

const History = () => {
    // 'donor' or 'recipient'
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { accessToken } = useAuth();
    const userType = localStorage.getItem("acct_type");

    const fetchDashboardStats = async () => {
        setLoading(true);
        setError(null);

        try {
            // Get access token from localStorage or your preferred storage method

            if (!accessToken) {
                throw new Error("No access token found. Please login again.");
            }

            // Choose endpoint based on user type
            const endpoint =
                userType === "donor"
                    ? `${root_url}/request/dashboard/donations`
                    : `${root_url}/request/dashboard/stats`;

            const response = await fetch(endpoint, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Unauthorized. Please login again.");
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err.message || "Failed to fetch dashboard statistics");
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
    }, [userType]);

    const handleRetry = () => {
        fetchDashboardStats();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const renderDonorStats = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Donations Sum */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">
                            Total Donated
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(data.totalDonationsSum)}
                        </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                </div>
            </div>

            {/* Total Donations Count */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">
                            Total Donations
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                            {data.totalDonationsCount}
                        </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Heart className="h-6 w-6 text-blue-600" />
                    </div>
                </div>
            </div>

            {/* Active Donations */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">
                            Active Donations
                        </p>
                        <p className="text-2xl font-bold text-orange-600">
                            {data.activeDonationsCount}
                        </p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-orange-600" />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderRecipientStats = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Received */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">
                            Total Received
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(data.totalDonated || 0)}
                        </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                </div>
            </div>

            {/* Open Requests */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">
                            Open Requests
                        </p>
                        <p className="text-2xl font-bold text-orange-600">
                            {data.openCount || 0}
                        </p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-orange-600" />
                    </div>
                </div>
            </div>

            {/* Fulfilled Requests */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">
                            Fulfilled Requests
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                            {data.fulfilledCount || 0}
                        </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDonorHistory = () => {
        const donations = data.recentDonations || [];

        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Heart className="h-5 w-5 text-gray-500 mr-2" />
                        Recent Donations
                    </h3>
                </div>

                {donations.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {donations.map((donation, index) => (
                            <div
                                key={donation.id || index}
                                className="p-6 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center mb-2">
                                            <Hash className="h-4 w-4 text-gray-400 mr-1" />
                                            <span className="text-sm text-gray-500">
                                                {donation.id ||
                                                    `Donation #${index + 1}`}
                                            </span>
                                        </div>

                                        <h4 className="text-lg font-medium text-gray-900 mb-1">
                                            {donation.title ||
                                                donation.cause ||
                                                "Donation"}
                                        </h4>

                                        {donation.description && (
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                {donation.description}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                            {donation.amount && (
                                                <div className="flex items-center">
                                                    <DollarSign className="h-4 w-4 mr-1" />
                                                    {formatCurrency(
                                                        donation.amount
                                                    )}
                                                </div>
                                            )}

                                            {donation.recipient && (
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 mr-1" />
                                                    {donation.recipient}
                                                </div>
                                            )}

                                            {donation.donatedAt && (
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    {formatDate(
                                                        donation.donatedAt
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="ml-4 flex-shrink-0">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Donated
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                            No Donations Yet
                        </h4>
                        <p className="text-gray-600">
                            Your donation history will appear here once you
                            start giving.
                        </p>
                    </div>
                )}
            </div>
        );
    };

    const renderRecipientHistory = () => {
        const history = data.history || [];

        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Clock className="h-5 w-5 text-gray-500 mr-2" />
                        Request History
                    </h3>
                </div>

                {history.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {history.map((item, index) => (
                            <div
                                key={item.id || index}
                                className="p-6 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center mb-2">
                                            <Hash className="h-4 w-4 text-gray-400 mr-1" />
                                            <span className="text-sm text-gray-500">
                                                {item.id ||
                                                    `Request #${index + 1}`}
                                            </span>
                                        </div>

                                        <h4 className="text-lg font-medium text-gray-900 mb-1">
                                            {item.title || "Donation Request"}
                                        </h4>

                                        {item.description && (
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                {item.description}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                                            {item.amount && (
                                                <div className="flex items-center">
                                                    <DollarSign className="h-4 w-4 mr-1" />
                                                    Target:{" "}
                                                    {formatCurrency(
                                                        item.amount
                                                    )}
                                                </div>
                                            )}

                                            {item.category && (
                                                <div className="flex items-center">
                                                    <Package className="h-4 w-4 mr-1" />
                                                    {item.category}
                                                </div>
                                            )}

                                            {item.location && (
                                                <div className="flex items-center">
                                                    <MapPin className="h-4 w-4 mr-1" />
                                                    {item.location}
                                                </div>
                                            )}

                                            {item.createdAt && (
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    {formatDate(item.createdAt)}
                                                </div>
                                            )}
                                        </div>

                                        {item.document_url && (
                                            <div className="mb-3">
                                                <a
                                                    href={item.document_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                                                >
                                                    <FileText className="h-4 w-4 mr-1" />
                                                    View Document
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div className="ml-4 flex-shrink-0">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                item.status === "fulfilled" ||
                                                item.status === "completed"
                                                    ? "bg-green-100 text-green-800"
                                                    : item.status === "pending"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : item.status ===
                                                          "active" ||
                                                      item.status === "open"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {item.status || "Active"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                            No Requests Yet
                        </h4>
                        <p className="text-gray-600">
                            Your request history will appear here once you
                            create donation requests.
                        </p>
                    </div>
                )}
            </div>
        );
    };

    // Error State
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Error Loading Dashboard
                        </h3>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={handleRetry}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
                                {userType === "donor"
                                    ? "Donor Dashboard"
                                    : "Recipient Dashboard"}
                            </h1>
                            <p className="text-gray-600 mt-2">
                                {userType === "donor"
                                    ? "Track your donations and giving impact"
                                    : "Overview of your donation requests and statistics"}
                            </p>
                        </div>
                        <button
                            onClick={handleRetry}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw
                                className={`h-4 w-4 mr-2 ${
                                    loading ? "animate-spin" : ""
                                }`}
                            />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <RefreshCw className="h-8 w-8 text-blue-500 mx-auto mb-4 animate-spin" />
                        <p className="text-gray-600">
                            Loading dashboard statistics...
                        </p>
                    </div>
                )}

                {/* Dashboard Content */}
                {!loading && data && (
                    <>
                        {/* Stats Cards */}
                        {userType === "donor"
                            ? renderDonorStats()
                            : renderRecipientStats()}

                        {/* Summary Card for Recipients */}
                        {userType === "recipient" && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Summary
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Success Rate
                                        </p>
                                        <div className="flex items-center">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full transition-all"
                                                    style={{
                                                        width: `${
                                                            (data.openCount ||
                                                                0) +
                                                                (data.fulfilledCount ||
                                                                    0) >
                                                            0
                                                                ? ((data.fulfilledCount ||
                                                                      0) /
                                                                      ((data.openCount ||
                                                                          0) +
                                                                          (data.fulfilledCount ||
                                                                              0))) *
                                                                  100
                                                                : 0
                                                        }%`,
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {(data.openCount || 0) +
                                                    (data.fulfilledCount || 0) >
                                                0
                                                    ? Math.round(
                                                          ((data.fulfilledCount ||
                                                              0) /
                                                              ((data.openCount ||
                                                                  0) +
                                                                  (data.fulfilledCount ||
                                                                      0))) *
                                                              100
                                                      )
                                                    : 0}
                                                %
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Total Requests
                                        </p>
                                        <p className="text-xl font-semibold text-gray-900">
                                            {(data.openCount || 0) +
                                                (data.fulfilledCount || 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* History Section */}
                        {userType === "donor"
                            ? renderDonorHistory()
                            : renderRecipientHistory()}
                    </>
                )}
            </div>
        </div>
    );
};

export default History;
