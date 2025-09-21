import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";


const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8 animate-fade-in">
          <div className="mb-6 inline-block">
            <h1 className="text-6xl md:text-7xl font-black mb-2">
              <span style={{color: '#253064'}}>Clear</span><span style={{color: '#78b645'}}>Deal</span>
            </h1>
            <p className="text-sm font-semibold leading-tight" style={{color: '#253064'}}>
              Where clients and freelancers never worry about trust
            </p>
          </div>
          <p className="text-lg text-slate-600 mb-8">
            Smart Deals. Secure Payments. Built on Arbitrum.
          </p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-slate-200">
          <p className="text-lg text-slate-600 mb-8">
            A decentralized freelance platform ensuring secure deals, low fees, and transparent payments on Arbitrum.
          </p>
          
          <Link to="/home">
            <Button 
              variant="hero" 
              size="xl"
              className="min-w-48"
            >
              Get Started
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 text-slate-500 text-sm">
          Powered by Arbitrum Sepolia • Secured by Smart Contracts
        </div>
      </div>
    </div>
  );
};

export default Index;
