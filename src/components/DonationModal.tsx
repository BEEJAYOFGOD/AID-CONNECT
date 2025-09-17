import { useState, useEffect, useRef } from "react";
// Adjust import path as needed
import { root_url } from "@/contexts/AuthContext";

import Modal from "./Modal";

const DonationModal = ({ need, onClose, isOpen }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [networks, setNetworks] = useState([]);
    const [selectedNetwork, setSelectedNetwork] = useState("");
    const [amount, setAmount] = useState("");
    const [conversionData, setConversionData] = useState(null);
    const [transactionHash, setTransactionHash] = useState("");
    const [verificationResult, setVerificationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const accessToken = localStorage.getItem("accessToken");

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
            setSelectedNetwork("");
            setAmount("");
            setConversionData(null);
            setTransactionHash("");
            setVerificationResult(null);
            setError("");
            fetchNetworks();
        }
    }, [isOpen]);

    // Fetch available networks
    const fetchNetworks = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${root_url}/payment/available-networks`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                const networkData = await response.json();
                setNetworks(networkData);
            } else {
                setError("Failed to load networks");
            }
        } catch (err) {
            setError("Error fetching networks");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Convert amount to naira
    const convertToNaira = async () => {
        if (!amount || !selectedNetwork) return;

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${root_url}/payment/naira-to-crypto`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        network: selectedNetwork,
                        amount: parseFloat(amount),
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                setConversionData(data);
                setCurrentStep(3);
            } else {
                setError("Failed to convert amount");
            }
        } catch (err) {
            setError("Error converting amount");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Verify transaction
    const verifyTransaction = async () => {
        if (!transactionHash || !need?.id) return;

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${root_url}/request/verify-transaction/${need.id}/${transactionHash}/${selectedNetwork}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setVerificationResult(data);
                setCurrentStep(5); // Move to success step
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Failed to verify transaction");
            }
        } catch (err) {
            setError("Error verifying transaction");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (currentStep === 1 && selectedNetwork) {
            setCurrentStep(2);
        } else if (currentStep === 2 && amount) {
            convertToNaira();
        } else if (currentStep === 3) {
            setCurrentStep(4); // Move to transaction hash input
        } else if (currentStep === 4 && transactionHash) {
            verifyTransaction();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setError("");
        }
    };

    const handleNetworkSelect = (network) => {
        setSelectedNetwork(network);
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;
        if (value === "" || /^\d*\.?\d*$/.test(value)) {
            setAmount(value);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
        }).format(value);
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat().format(value);
    };

    const renderStep1 = () => (
        <div className="py-6">
            <h2 className="text-xl font-semibold mb-4">Select Network</h2>
            <p className="text-gray-600 mb-6">
                Choose a cryptocurrency network for your donation
            </p>

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {networks.map((network) => (
                        <button
                            key={network}
                            onClick={() => handleNetworkSelect(network)}
                            className={`p-4 border-2 rounded-lg text-center font-medium transition-colors ${
                                selectedNetwork === network
                                    ? "border-blue-600 bg-blue-50 text-blue-700"
                                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                            }`}
                        >
                            {network.toUpperCase()}
                        </button>
                    ))}
                </div>
            )}

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                    {error}
                </div>
            )}
        </div>
    );

    const renderStep2 = () => (
        <div className="py-6">
            <h2 className="text-xl font-semibold mb-4">
                Enter Donation Amount
            </h2>
            <p className="text-gray-600 mb-6">
                How much would you like to donate to{" "}
                <strong>{need?.title}</strong>?
            </p>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount in Naira (₦)
                </label>
                <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="Enter amount..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Selected Network:</span>
                    <span className="font-medium text-gray-900">
                        {selectedNetwork?.toUpperCase()}
                    </span>
                </div>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                    {error}
                </div>
            )}
        </div>
    );

    const renderStep3 = () => (
        <div className="py-6">
            <h2 className="text-xl font-semibold mb-4">
                Confirm Your Donation
            </h2>
            <p className="text-gray-600 mb-6">
                Please review your donation details
            </p>

            {conversionData && (
                <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-3">
                            Donation Summary
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Amount in Naira:
                                </span>
                                <span className="font-medium">
                                    {formatCurrency(
                                        conversionData.ngnValue / 1000000
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Network:</span>
                                <span className="font-medium">
                                    {conversionData.coin.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    USDT Equivalent:
                                </span>
                                <span className="font-medium">
                                    $
                                    {formatNumber(
                                        conversionData.usdtValue / 1000000
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Crypto Quantity:
                                </span>
                                <span className="font-medium">
                                    {formatNumber(conversionData.quantity)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Exchange Rate:
                                </span>
                                <span className="font-medium">
                                    ₦{formatNumber(conversionData.usdtToNaira)}{" "}
                                    per USDT
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">
                            Need Details
                        </h4>
                        <p className="text-blue-800 text-sm">{need?.title}</p>
                        {need?.description && (
                            <p className="text-blue-700 text-xs mt-1">
                                {need.description}
                            </p>
                        )}
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-medium text-yellow-900 mb-2">
                            Next Steps
                        </h4>
                        <ol className="text-yellow-800 text-sm space-y-1">
                            <li>
                                1. Send exactly{" "}
                                <strong>
                                    {formatNumber(conversionData.quantity)}{" "}
                                    {conversionData.coin.toUpperCase()}
                                </strong>{" "}
                                to the provided wallet address
                            </li>
                            <li>2. Copy and save your transaction hash</li>
                            <li>3. Return here to verify your transaction</li>
                        </ol>
                    </div>
                </div>
            )}

            {loading && (
                <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
            )}
        </div>
    );

    const renderStep4 = () => (
        <div className="py-6">
            <h2 className="text-xl font-semibold mb-4">Verify Transaction</h2>
            <p className="text-gray-600 mb-6">
                Enter your transaction hash to verify the donation
            </p>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Hash
                </label>
                <input
                    type="text"
                    value={transactionHash}
                    onChange={(e) => setTransactionHash(e.target.value)}
                    placeholder="Enter transaction hash..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                    This is the hash/ID you received after sending the
                    cryptocurrency
                </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600">Network:</span>
                    <span className="font-medium">
                        {selectedNetwork?.toUpperCase()}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Expected Amount:</span>
                    <span className="font-medium">
                        {conversionData
                            ? formatNumber(conversionData.quantity)
                            : ""}{" "}
                        {selectedNetwork?.toUpperCase()}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Need ID:</span>
                    <span className="font-medium">#{need?.id}</span>
                </div>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                    {error}
                </div>
            )}
        </div>
    );

    const renderStep5 = () => (
        <div className="py-6">
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <svg
                        className="h-6 w-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                        ></path>
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Transaction Verified!
                </h2>
                <p className="text-gray-600 mb-6">
                    Your donation has been successfully verified and processed.
                </p>
            </div>

            {verificationResult && (
                <div className="bg-green-50 p-4 rounded-lg mb-6">
                    <h3 className="font-medium text-green-900 mb-3">
                        Verification Details
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-green-700">Status:</span>
                            <span className="font-medium text-green-900">
                                Verified ✓
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-green-700">
                                Transaction Hash:
                            </span>
                            <span className="font-mono text-xs text-green-900 break-all">
                                {transactionHash}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-green-700">Network:</span>
                            <span className="font-medium text-green-900">
                                {selectedNetwork?.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Thank You!</h4>
                <p className="text-blue-800 text-sm">
                    Your donation to <strong>{need?.title}</strong> has been
                    received and will make a real difference. You should receive
                    a confirmation email shortly.
                </p>
            </div>

            {loading && (
                <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
            )}
        </div>
    );

    const canProceed = () => {
        if (currentStep === 1) return selectedNetwork;
        if (currentStep === 2) return amount && parseFloat(amount) > 0;
        if (currentStep === 3) return true; // Always can proceed from confirmation
        if (currentStep === 4)
            return transactionHash && transactionHash.trim().length > 0;
        return false;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-full max-w-md mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between py-4 border-b">
                    <h1 className="text-lg font-semibold">Make a Donation</h1>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Progress indicator */}
                <div className="flex items-center justify-center py-4">
                    {[1, 2, 3, 4, 5].map((step) => (
                        <div key={step} className="flex items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    currentStep >= step
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-200 text-gray-600"
                                }`}
                            >
                                {step === 5 && currentStep === 5 ? "✓" : step}
                            </div>
                            {step < 5 && (
                                <div
                                    className={`w-8 h-1 mx-1 ${
                                        currentStep > step
                                            ? "bg-blue-600"
                                            : "bg-gray-200"
                                    }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="min-h-[300px]">
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                    {currentStep === 4 && renderStep4()}
                    {currentStep === 5 && renderStep5()}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between py-4 border-t">
                    <button
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            currentStep === 1
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                        Previous
                    </button>

                    <div className="flex space-x-3">
                        {currentStep < 5 && currentStep !== 3 && (
                            <button
                                onClick={handleNext}
                                disabled={!canProceed() || loading}
                                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                    canProceed() && !loading
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                            >
                                {loading
                                    ? "Loading..."
                                    : currentStep === 4
                                    ? "Verify Transaction"
                                    : "Next"}
                            </button>
                        )}

                        {currentStep === 3 && (
                            <button
                                onClick={handleNext}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                            >
                                Proceed to Verification
                            </button>
                        )}

                        {currentStep === 5 && (
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Close
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default DonationModal;
