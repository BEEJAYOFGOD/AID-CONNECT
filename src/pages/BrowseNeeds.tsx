import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Search, 
  Filter, 
  ArrowLeft,
  Clock,
  MapPin,
  DollarSign
} from "lucide-react";

const BrowseNeeds = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  const mockNeeds = [
    {
      id: 1,
      title: "Emergency Surgery for My Daughter",
      description: "My 8-year-old daughter needs urgent heart surgery. We've exhausted our savings and need community support.",
      recipient: "Maria Rodriguez",
      location: "Austin, TX",
      amount: 15000,
      raised: 8500,
      donors: 45,
      category: "Health",
      urgent: true,
      timeLeft: "12 days",
      image: "/placeholder.svg",
      verified: true
    },
    {
      id: 2,
      title: "School Fees for Three Children",
      description: "Single mother struggling to pay school fees for my three children after losing my job.",
      recipient: "Sarah Johnson",
      location: "Denver, CO",
      amount: 2400,
      raised: 1200,
      donors: 18,
      category: "Education",
      urgent: false,
      timeLeft: "25 days",
      image: "/placeholder.svg",
      verified: true
    },
    {
      id: 3,
      title: "Rent Payment to Avoid Eviction",
      description: "Family of four facing eviction due to job loss. Need immediate help with rent payment.",
      recipient: "Michael Chen",
      location: "Seattle, WA",
      amount: 3200,
      raised: 2100,
      donors: 28,
      category: "Housing",
      urgent: true,
      timeLeft: "5 days",
      image: "/placeholder.svg",
      verified: true
    },
    {
      id: 4,
      title: "Business Recovery After Fire",
      description: "Small bakery destroyed by fire. Need funds to rebuild and support my family's livelihood.",
      recipient: "Ahmed Hassan",
      location: "Phoenix, AZ",
      amount: 8000,
      raised: 3400,
      donors: 22,
      category: "Business",
      urgent: false,
      timeLeft: "30 days",
      image: "/placeholder.svg",
      verified: true
    }
  ];

  const filteredNeeds = mockNeeds.filter(need => {
    const matchesSearch = need.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         need.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || need.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesUrgency = urgencyFilter === "all" || 
                          (urgencyFilter === "urgent" && need.urgent) ||
                          (urgencyFilter === "normal" && !need.urgent);
    
    return matchesSearch && matchesCategory && matchesUrgency;
  });

  const getProgressPercentage = (raised, total) => {
    return Math.min((raised / total) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/dashboard")}
              className="mr-4 flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Browse Needs</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search for needs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="housing">Housing</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>

              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-muted-foreground">
            Showing {filteredNeeds.length} of {mockNeeds.length} verified needs
          </p>
        </div>

        {/* Needs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNeeds.map((need) => (
            <Card key={need.id} className="border-0 shadow-soft hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {need.recipient.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{need.recipient}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 mr-1" />
                        {need.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {need.verified && (
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    )}
                    {need.urgent && (
                      <Badge variant="destructive" className="text-xs">Urgent</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                    {need.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {need.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      ${need.raised.toLocaleString()} raised
                    </span>
                    <span className="font-medium">
                      ${need.amount.toLocaleString()} goal
                    </span>
                  </div>
                  <Progress 
                    value={getProgressPercentage(need.raised, need.amount)} 
                    className="h-2"
                  />
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{need.donors} donors</span>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {need.timeLeft} left
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Badge variant="outline">{need.category}</Badge>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
                    onClick={() => navigate(`/donate/${need.id}`)}
                  >
                    <DollarSign className="w-4 h-4 mr-1" />
                    Donate Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNeeds.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No needs found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseNeeds;