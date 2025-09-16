import React, { useState, useEffect } from "react";
import {
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    RefreshCw,
    Heart,
    Calendar,
    DollarSign,
    User,
} from "lucide-react";
import { root_url, useAuth } from "@/contexts/AuthContext";

const DonationsPage = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const { accessToken } = useAuth();

    const fetchDonations = async (page = currentPage, pageLimit = limit) => {
        setLoading(true);
        setError(null);

        const accessToken = localStorage.getItem("accessToken");
        const headers = {
            Authorization: `Bearer ${accessToken}`, // add your token here
            "Content-Type": "application/json",
        };

        console.log(accessToken);

        try {
            const response = await fetch(
                `${root_url}/request/donations?page=${page}&limit=${pageLimit}`,
                {
                    method: "GET",
                    headers: headers,
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Assuming the API returns data in a format like:
            // { donations: [...], totalItems: number, totalPages: number, currentPage: number }
            setDonations(data.donations || data.data || data);
            setTotalItems(data.totalItems || data.total || 0);
            setTotalPages(
                data.totalPages ||
                    Math.ceil((data.totalItems || data.total || 0) / pageLimit)
            );
            setCurrentPage(page);
        } catch (err) {
            console.log(err);
            setError(err.message || "Failed to fetch donations");
            setDonations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDonations();
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchDonations(newPage, limit);
        }
    };

    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
        fetchDonations(1, newLimit);
    };

    const handleRetry = () => {
        fetchDonations(currentPage, limit);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Error Loading Donations
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
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Heart className="h-8 w-8 text-red-500 mr-3" />
                        Donations
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage and view all donation requests
                    </p>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-700">
                                Items per page:
                                <select
                                    value={limit}
                                    onChange={(e) =>
                                        handleLimitChange(
                                            Number(e.target.value)
                                        )
                                    }
                                    className="ml-2 border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={loading}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </label>
                            <button
                                onClick={() =>
                                    fetchDonations(currentPage, limit)
                                }
                                disabled={loading}
                                className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 mr-1 ${
                                        loading ? "animate-spin" : ""
                                    }`}
                                />
                                Refresh
                            </button>
                        </div>

                        {totalItems > 0 && (
                            <div className="text-sm text-gray-600">
                                Showing {(currentPage - 1) * limit + 1} to{" "}
                                {Math.min(currentPage * limit, totalItems)} of{" "}
                                {totalItems} donations
                            </div>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <RefreshCw className="h-8 w-8 text-blue-500 mx-auto mb-4 animate-spin" />
                        <p className="text-gray-600">Loading donations...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && donations.length === 0 && !error && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No Donations Found
                        </h3>
                        <p className="text-gray-600">
                            There are no donation requests to display.
                        </p>
                    </div>
                )}

                {/* Donations Grid */}
                {!loading && donations.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                        {donations.map((donation) => (
                            <div
                                key={donation.id || donation._id}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            {donation.title ||
                                                donation.name ||
                                                "Donation Request"}
                                        </h3>
                                        {donation.description && (
                                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                                {donation.description}
                                            </p>
                                        )}
                                    </div>
                                    <span
                                        className={`px-2 py-1 text-xs rounded-full ${
                                            donation.status === "active"
                                                ? "bg-green-100 text-green-800"
                                                : donation.status === "pending"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-gray-100 text-gray-800"
                                        }`}
                                    >
                                        {donation.status || "active"}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm">
                                    {donation.amount && (
                                        <div className="flex items-center text-gray-600">
                                            <DollarSign className="h-4 w-4 mr-2" />
                                            <span>
                                                Target:{" "}
                                                {formatCurrency(
                                                    donation.amount
                                                )}
                                            </span>
                                        </div>
                                    )}

                                    {donation.raised && (
                                        <div className="flex items-center text-green-600">
                                            <DollarSign className="h-4 w-4 mr-2" />
                                            <span>
                                                Raised:{" "}
                                                {formatCurrency(
                                                    donation.raised
                                                )}
                                            </span>
                                        </div>
                                    )}

                                    {donation.createdBy && (
                                        <div className="flex items-center text-gray-600">
                                            <User className="h-4 w-4 mr-2" />
                                            <span>{donation.createdBy}</span>
                                        </div>
                                    )}

                                    {donation.createdAt && (
                                        <div className="flex items-center text-gray-600">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            <span>
                                                {formatDate(donation.createdAt)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {donation.amount && donation.raised && (
                                    <div className="mt-4">
                                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                                            <span>Progress</span>
                                            <span>
                                                {Math.round(
                                                    (donation.raised /
                                                        donation.amount) *
                                                        100
                                                )}
                                                %
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${Math.min(
                                                        (donation.raised /
                                                            donation.amount) *
                                                            100,
                                                        100
                                                    )}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && donations.length > 0 && totalPages > 1 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                                disabled={currentPage <= 1}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </button>

                            <div className="flex items-center space-x-2">
                                {Array.from(
                                    { length: Math.min(5, totalPages) },
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
                                            <button
                                                key={pageNum}
                                                onClick={() =>
                                                    handlePageChange(pageNum)
                                                }
                                                className={`px-3 py-1.5 text-sm font-medium rounded ${
                                                    currentPage === pageNum
                                                        ? "bg-blue-600 text-white"
                                                        : "text-gray-700 hover:bg-gray-100"
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    }
                                )}
                            </div>

                            <button
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
                                }
                                disabled={currentPage >= totalPages}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </button>
                        </div>

                        <div className="text-center text-sm text-gray-600 mt-2">
                            Page {currentPage} of {totalPages}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DonationsPage;
