import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Heart,
    Shield,
    Users,
    TrendingUp,
    Zap,
    Globe,
    ArrowRight,
} from "lucide-react";

const Index = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: Shield,
            title: "Blockchain Security",
            description:
                "All transactions are secured and recorded on the blockchain for complete transparency",
        },
        {
            icon: Users,
            title: "Verified Users",
            description:
                "All donors and recipients are verified to prevent fraud and ensure trust",
        },
        {
            icon: Zap,
            title: "Instant Disbursement",
            description:
                "Smart contracts enable immediate fund release to verified recipients",
        },
        {
            icon: Globe,
            title: "Global Reach",
            description:
                "Connect with people worldwide to give and receive help across borders",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
            {/* Header */}
            <header className="border-b bg-card/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center shadow-glow">
                                <Heart className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <h1 className="text-2xl font-bold text-foreground">
                                AidConnect
                            </h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/auth/login")}
                            >
                                Sign In
                            </Button>
                            <Button
                                onClick={() => navigate("/auth/signup")}
                                className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
                            >
                                Get Started
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                            Transparent Giving Through
                            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                                {" "}
                                Blockchain
                            </span>
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                            Connect directly with people in need through our
                            secure, blockchain-powered platform. Every donation
                            is transparent, traceable, and goes directly to
                            verified recipients.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                onClick={() => navigate("/auth/signup")}
                                className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-lg px-8 py-6"
                            >
                                Start Helping Today
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => navigate("/browse")}
                                className="text-lg px-8 py-6"
                            >
                                Browse Needs
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Why Choose AidConnect?
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Built on trust, powered by blockchain technology,
                            and designed for maximum impact
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                className="border-0 shadow-soft hover:shadow-lg transition-all duration-300"
                            >
                                <CardHeader className="text-center">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary/10 to-primary-glow/10 flex items-center justify-center mx-auto mb-4">
                                        <feature.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-xl">
                                        {feature.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground text-center">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-primary mb-2">
                                $2.5M+
                            </div>
                            <p className="text-muted-foreground">
                                Total Donations
                            </p>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-accent mb-2">
                                10K+
                            </div>
                            <p className="text-muted-foreground">
                                People Helped
                            </p>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-primary-glow mb-2">
                                99.9%
                            </div>
                            <p className="text-muted-foreground">
                                Transparency Rate
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary/10 to-primary-glow/10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Ready to Make a Difference?
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        Join thousands of verified donors and recipients
                        creating positive change worldwide
                    </p>
                    <Button
                        size="lg"
                        onClick={() => navigate("/auth/signup")}
                        className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-lg px-8 py-6"
                    >
                        Join AidConnect Now
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t bg-card/50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
                            <Heart className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-lg font-bold text-foreground">
                            Aid Connectt
                        </span>
                    </div>
                    <p className="text-muted-foreground">
                        Connecting hearts through blockchain technology
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Index;
