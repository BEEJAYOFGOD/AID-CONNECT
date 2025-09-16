import React, { useState, useEffect } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Wallet,
    Check,
    Loader,
    AlertCircle,
} from "lucide-react";
import Modal from "@/components/modal";

const DonationModal: React.FC<DonationModalProps> = ({
    need,
    onClose,
    rootUrl,
    accessToken,
    isOpen,
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedNetwork, setSelectedNetwork] = useState("");
    const [availableNetworks, setAvailableNetworks] = useState([]);
    const [donationAmount, setDonationAmount] = useState("");
    const [cryptoEquivalent, setCryptoEquivalent] = useState(null);
    const [selectedWallet, setSelectedWallet] = useState("");
    const [transactionHash, setTransactionHash] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [paymentVerified, setPaymentVerified] = useState(false);

    // Mock wallet options - you can customize these based on your needs
    const walletOptions = [
        { id: "metamask", name: "MetaMask", icon: "🦊" },
        { id: "trustwallet", name: "Trust Wallet", icon: "🔷" },
        { id: "binance", name: "Binance Wallet", icon: "🟡" },
        { id: "coinbase", name: "Coinbase Wallet", icon: "🔵" },
    ];

    // Network display names
    const networkNames = {
        bsc: "bsc",
        eth: "eth",
        matic: "matic",
        atc: "atc",
        xbn: "xbn",
        trx: "trx",
    };

    // Fetch available networks on component mount
    useEffect(() => {
        fetchAvailableNetworks();
    }, []);

    const fetchAvailableNetworks = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `${rootUrl}/payment/available-networks`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                const networks = await response.json();
                setAvailableNetworks(networks);
            } else {
                setError("Failed to fetch available networks");
            }
        } catch (err) {
            setError("Network error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const convertNairaToCrypto = async () => {
        if (!donationAmount || !selectedNetwork) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${rootUrl}/payment/naira-to-crypto`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: parseFloat(donationAmount),
                    network: selectedNetwork,
                }),
            });

            console.log(
                JSON.stringify({
                    amount: parseFloat(donationAmount),
                    network: selectedNetwork,
                })
            );

            if (response.ok) {
                const result = await response.json();
                console.log(result);
                setCryptoEquivalent(result);
            } else {
                setError("Failed to convert amount");
            }
        } catch (err) {
            setError("Conversion error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const verifyTransaction = async () => {
        if (!transactionHash) return;

        setIsLoading(true);
        try {
            const response = await fetch(
                `${rootUrl}/request/verify-transaction/${need._id}/${transactionHash}/${selectedNetwork}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                setPaymentVerified(true);
                setCurrentStep(4);
            } else {
                setError("Transaction verification failed");
            }
        } catch (err) {
            setError("Verification error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleWalletConnect = (walletId) => {
        setSelectedWallet(walletId);
        // Mock transaction hash - in real implementation, this would come from wallet
        const mockTxHash = "0x" + Math.random().toString(16).substr(2, 64);
        setTransactionHash(mockTxHash);
        verifyTransaction();
    };

    const nextStep = () => {
        if (currentStep < 4) {
            if (currentStep === 1 && selectedNetwork) {
                setCurrentStep(2);
            } else if (currentStep === 2 && donationAmount) {
                setCurrentStep(3);
            }
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setError("");
        }
    };

    const renderStep1 = () => (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Select Network</h2>
            <p className="text-gray-600 mb-6">
                Choose a blockchain network for your donation
            </p>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader className="animate-spin w-6 h-6" />
                    <span className="ml-2">Loading networks...</span>
                </div>
            ) : (
                <div className="space-y-3">
                    {availableNetworks.map((network) => (
                        <button
                            key={network}
                            onClick={() => setSelectedNetwork(network)}
                            className={`w-full p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors ${
                                selectedNetwork === network
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200"
                            }`}
                        >
                            <div className="font-medium">
                                {networkNames[network] || network.toUpperCase()}
                            </div>
                            <div className="text-sm text-gray-500">
                                {network.toUpperCase()}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            <div className="flex justify-between mt-6">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                    Cancel
                </button>
                <button
                    onClick={nextStep}
                    disabled={!selectedNetwork}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center"
                >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Enter Donation Amount</h2>
            <p className="text-gray-600 mb-6">
                Donating to: <span className="font-medium">{need.title}</span>
            </p>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount in Naira (₦)
                </label>
                <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                <button
                    className="bg-green-500 rounded-md  px-2 py-1 mt-2 m-auto"
                    onClick={() => {
                        convertNairaToCrypto();
                    }}
                >
                    check amount
                </button>
            </div>

            {cryptoEquivalent && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="text-green-800 text-lg">
                        Equivalent of 1 {networkNames[selectedNetwork]} is $
                        {cryptoEquivalent.priceInUsdt}
                    </div>

                    <div className="text-lg font-bold">
                        using ${cryptoEquivalent.usdtToNaira} to &#x20A6;1
                        {cryptoEquivalent.symbol}
                    </div>

                    <p>
                        your total amount in Naira is &#x20A6;
                        {cryptoEquivalent.ngnValue}
                    </p>
                </div>
            )}

            <div className="flex justify-between mt-6">
                <button
                    onClick={prevStep}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </button>
                <button
                    onClick={nextStep}
                    disabled={!donationAmount || isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center"
                >
                    {isLoading ? (
                        <Loader className="animate-spin w-4 h-4 mr-2" />
                    ) : null}
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Select Wallet</h2>
            <p className="text-gray-600 mb-6">
                Choose your preferred wallet to complete the payment
            </p>

            <div className="space-y-3 mb-6">
                {walletOptions.map((wallet) => (
                    <button
                        key={wallet.id}
                        onClick={() => handleWalletConnect(wallet.id)}
                        disabled={isLoading}
                        className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-3 transition-colors disabled:opacity-50"
                    >
                        <span className="text-2xl">{wallet.icon}</span>
                        <div className="flex-1 text-left">
                            <div className="font-medium">{wallet.name}</div>
                            <div className="text-sm text-gray-500">
                                Connect with {wallet.name}
                            </div>
                        </div>
                        <Wallet className="w-5 h-5 text-gray-400" />
                    </button>
                ))}
            </div>

            {isLoading && (
                <div className="text-center py-4">
                    <Loader className="animate-spin w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                        Verifying transaction...
                    </p>
                </div>
            )}

            <div className="flex justify-between mt-6">
                <button
                    onClick={prevStep}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </button>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="p-6 text-center">
            {paymentVerified ? (
                <>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-green-800 mb-2">
                        Payment Verified!
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Your donation of ₦{donationAmount} has been successfully
                        processed.
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg mb-6">
                        <div className="text-xs text-gray-500">
                            Transaction Hash
                        </div>
                        <div className="text-sm font-mono break-all">
                            {transactionHash}
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-red-800 mb-2">
                        Payment Failed
                    </h2>
                    <p className="text-gray-600 mb-4">
                        We couldn't verify your payment. Please try again.
                    </p>
                </>
            )}

            <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                Close
            </button>
        </div>
    );

    return (
        <Modal onClose={onClose} isOpen={isOpen}>
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                    <div className="flex">
                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3" />
                        <p className="text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {/* Progress indicator */}
            <div className="px-6 pt-4">
                <div className="flex items-center justify-between mb-6">
                    {[1, 2, 3, 4].map((step) => (
                        <div
                            key={step}
                            className={`flex items-center ${
                                step !== 4 ? "flex-1" : ""
                            }`}
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    step <= currentStep
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-200 text-gray-600"
                                }`}
                            >
                                {step}
                            </div>
                            {step !== 4 && (
                                <div
                                    className={`h-0.5 flex-1 mx-2 ${
                                        step < currentStep
                                            ? "bg-blue-600"
                                            : "bg-gray-200"
                                    }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="step-content">
                {(() => {
                    switch (currentStep) {
                        case 1:
                            return renderStep1();
                        case 2:
                            return renderStep2();
                        case 3:
                            return renderStep3();
                        case 4:
                            return renderStep4();
                        default:
                            return null;
                    }
                })()}
            </div>
        </Modal>
    );
};

// // Example usage component
// const ExampleUsage = () => {
//     const [showModal, setShowModal] = useState(false);

//     // Mock data - replace with your actual data
//     const mockNeed = {
//         _id: "12345",
//         title: "Help Build Clean Water Well",
//     };

//     const mockRootUrl = "https://api.yourapp.com";
//     const mockAccessToken = "your-access-token";

//     return (
//         <div className="p-8">
//             <button
//                 onClick={() => setShowModal(true)}
//                 className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//                 Open Donation Modal
//             </button>

//             {showModal && (
//                 <DonationModal
//                     need={mockNeed}
//                     onClose={() => setShowModal(false)}
//                     rootUrl={mockRootUrl}
//                     accessToken={mockAccessToken}
//                 />
//             )}
//         </div>
//     );
// };

// export default ExampleUsage;

export default DonationModal;
