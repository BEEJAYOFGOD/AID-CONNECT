import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Heart, 
  Plus, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock,
  HandHeart,
  Eye,
  LogOut
} from "lucide-react";

const Dashboard = () => {
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (!role) {
      navigate("/login");
    } else {
      setUserRole(role);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/");
  };

  const mockDonorStats = {
    totalDonated: "$2,450",
    peopleHelped: 12,
    activeDonations: 5
  };

  const mockRecipientStats = {
    totalReceived: "$850",
    activeRequests: 2,
    completedRequests: 3
  };

  const mockRecentNeeds = [
    {
      id: 1,
      title: "Medical Treatment for Mother",
      recipient: "Sarah Johnson",
      amount: "$500",
      raised: "$320",
      category: "Health",
      urgent: true
    },
    {
      id: 2,
      title: "School Fees for Children",
      recipient: "Michael Brown",
      amount: "$800",
      raised: "$240",
      category: "Education",
      urgent: false
    },
    {
      id: 3,
      title: "Emergency Rent Payment",
      recipient: "Emily Davis",
      amount: "$600",
      raised: "$450",
      category: "Housing",
      urgent: true
    }
  ];

  if (!userRole) return null;

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
              <h1 className="text-2xl font-bold text-foreground">GiveTrust</h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" onClick={() => navigate("/browse")}>
                Browse Needs
              </Button>
              {userRole === "recipient" && (
                <Button variant="ghost" onClick={() => navigate("/create-need")}>
                  Create Need
                </Button>
              )}
              <Button variant="ghost" onClick={() => navigate("/history")}>
                History
              </Button>
              <Button variant="ghost" onClick={() => navigate("/profile")}>
                Profile
              </Button>
            </nav>

            <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {userRole === "donor" ? "Donor" : "Recipient"}!
          </h2>
          <p className="text-muted-foreground">
            {userRole === "donor" 
              ? "Here's an overview of your giving journey" 
              : "Manage your requests and track your progress"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {userRole === "donor" ? (
            <>
              <Card className="border-0 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Donated</p>
                      <p className="text-2xl font-bold text-foreground">{mockDonorStats.totalDonated}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">People Helped</p>
                      <p className="text-2xl font-bold text-foreground">{mockDonorStats.peopleHelped}</p>
                    </div>
                    <Users className="w-8 h-8 text-accent" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Donations</p>
                      <p className="text-2xl font-bold text-foreground">{mockDonorStats.activeDonations}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-primary-glow" />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="border-0 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Received</p>
                      <p className="text-2xl font-bold text-foreground">{mockRecipientStats.totalReceived}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Requests</p>
                      <p className="text-2xl font-bold text-foreground">{mockRecipientStats.activeRequests}</p>
                    </div>
                    <Clock className="w-8 h-8 text-accent" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold text-foreground">{mockRecipientStats.completedRequests}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-primary-glow" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                <Button 
                  className="w-full justify-start bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
                  onClick={() => navigate("/browse")}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Browse All Needs
                </Button>
                {userRole === "recipient" && (
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

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle>
                  {userRole === "donor" ? "Recent Needs to Help" : "Your Recent Requests"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentNeeds.map((need) => (
                    <div key={need.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>{need.recipient.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-foreground">{need.title}</h4>
                          <p className="text-sm text-muted-foreground">by {need.recipient}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary">{need.category}</Badge>
                            {need.urgent && <Badge variant="destructive">Urgent</Badge>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{need.amount}</p>
                        <p className="text-sm text-muted-foreground">Raised: {need.raised}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;