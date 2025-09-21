import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, LogOut } from 'lucide-react';

interface WalletConnectorProps {
  onConnected?: () => void;
}

const WalletConnector = ({ onConnected }: WalletConnectorProps) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    const metaMaskConnector = connectors.find(c => c.name === 'MetaMask');
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector });
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (isConnected && address) {
    if (onConnected) {
      onConnected();
    }
    return (
      <Card className="bg-gradient-card border-border/50 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="w-5 h-5 mr-2 text-accent" />
            Wallet Connected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          <Button 
            variant="outline" 
            onClick={handleDisconnect}
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <CardHeader>
        <CardTitle>Connect Your Wallet</CardTitle>
        <CardDescription>
          Connect MetaMask to access ClearDeal platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleConnect} 
          disabled={isPending}
          variant="professional"
          size="lg"
          className="w-full"
        >
          <Wallet className="w-5 h-5 mr-2" />
          {isPending ? 'Connecting...' : 'Connect MetaMask'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default WalletConnector;