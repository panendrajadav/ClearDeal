import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserRole } from '@/types';
import { LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  role: UserRole;
  onLogin: (user: { address: string; role: UserRole; name: string }) => void;
}

// Demo credentials mapping
const DEMO_CREDENTIALS = {
  client: {
    email: 'client@demo.com',
    password: 'demo123',
    name: 'John Client'
  },
  freelancer: {
    email: 'freelancer@demo.com', 
    password: 'demo123',
    name: 'Alice Freelancer'
  }
};

const LoginForm = ({ role, onLogin }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate authentication
    setTimeout(() => {
      const credentials = DEMO_CREDENTIALS[role];
      
      if (email === credentials.email && password === credentials.password) {
        onLogin({
          address,
          role,
          name: credentials.name
        });
        toast({
          title: 'Login Successful',
          description: `Welcome ${credentials.name}!`,
        });
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid credentials. Use demo credentials.',
          variant: 'destructive',
        });
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const fillDemo = () => {
    const credentials = DEMO_CREDENTIALS[role];
    setEmail(credentials.email);
    setPassword(credentials.password);
  };

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <CardHeader>
        <CardTitle className="capitalize">{role} Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
            <strong>Demo Credentials:</strong><br />
            Email: {DEMO_CREDENTIALS[role].email}<br />
            Password: {DEMO_CREDENTIALS[role].password}
            <br />
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={fillDemo}
              className="h-auto p-0 text-xs mt-1"
            >
              Click to fill demo credentials
            </Button>
          </div>
          
          <Button 
            type="submit" 
            disabled={!isConnected || isLoading}
            variant="professional"
            size="lg"
            className="w-full"
          >
            <LogIn className="w-4 h-4 mr-2" />
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;