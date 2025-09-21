import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Users, Shield, Coins } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Choose Your Role
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Get started as a client or freelancer on the most secure platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Client Card */}
          <Card className="bg-gradient-card border-border/50 shadow-card hover:shadow-elegant transition-all duration-300 group">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">I'm a Client</CardTitle>
              <CardDescription className="text-base">
                Post jobs and hire talented freelancers with guaranteed security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <Shield className="w-4 h-4 text-accent mr-2" />
                  Smart contract escrow protection
                </li>
                <li className="flex items-center">
                  <Coins className="w-4 h-4 text-accent mr-2" />
                  Pay only when work is approved
                </li>
                <li className="flex items-center">
                  <Users className="w-4 h-4 text-accent mr-2" />
                  Access to verified freelancers
                </li>
              </ul>
              <Link to="/client" className="block">
                <Button variant="professional" size="lg" className="w-full">
                  Continue as Client
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Freelancer Card */}
          <Card className="bg-gradient-card border-border/50 shadow-card hover:shadow-elegant transition-all duration-300 group">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl">I'm a Freelancer</CardTitle>
              <CardDescription className="text-base">
                Find secure work opportunities with guaranteed payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <Shield className="w-4 h-4 text-accent mr-2" />
                  Guaranteed payment protection
                </li>
                <li className="flex items-center">
                  <Coins className="w-4 h-4 text-accent mr-2" />
                  Fair application fee system
                </li>
                <li className="flex items-center">
                  <Users className="w-4 h-4 text-accent mr-2" />
                  Direct client relationships
                </li>
              </ul>
              <Link to="/freelancer" className="block">
                <Button variant="success" size="lg" className="w-full">
                  Continue as Freelancer
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8 text-foreground">
            Built on Blockchain Technology
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Secure Escrow</h3>
              <p className="text-sm text-muted-foreground">
                Funds held safely in smart contracts
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Coins className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Fair Payments</h3>
              <p className="text-sm text-muted-foreground">
                Automatic releases when work is approved
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Transparent</h3>
              <p className="text-sm text-muted-foreground">
                All transactions visible on blockchain
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;