import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const WorkflowDemo = () => {
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  const steps = [
    { id: 1, title: 'Freelancer Applies', description: 'Pay 10% application fee via MetaMask', status: 'completed' },
    { id: 2, title: 'Application in Progress', description: 'Waiting for client selection', status: step >= 2 ? 'completed' : 'pending' },
    { id: 3, title: 'Client Approves', description: 'Client selects freelancer', status: step >= 3 ? 'completed' : 'pending' },
    { id: 4, title: 'Submit Work', description: 'Freelancer can now submit work', status: step >= 4 ? 'completed' : 'pending' },
    { id: 5, title: 'Client Reviews', description: 'Client sees submitted work', status: step >= 5 ? 'completed' : 'pending' },
    { id: 6, title: 'Payment Released', description: 'Client approves and pays freelancer', status: step >= 6 ? 'completed' : 'pending' },
  ];

  const nextStep = () => {
    if (step < 6) {
      setStep(step + 1);
      toast({
        title: `Step ${step + 1} Complete!`,
        description: steps[step].description,
      });
    }
  };

  const resetDemo = () => {
    setStep(1);
    toast({
      title: 'Demo Reset',
      description: 'Starting from the beginning',
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>ClearDeal Workflow Demo</CardTitle>
        <CardDescription>
          This demonstrates the fixed workflow that prevents duplicate payments and ensures proper state management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((stepItem) => (
            <div key={stepItem.id} className="flex items-center space-x-3 p-3 rounded border">
              <div className="flex-shrink-0">
                {stepItem.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : stepItem.id === step ? (
                  <Clock className="w-5 h-5 text-blue-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h4 className={`font-medium ${stepItem.status === 'completed' ? 'text-green-700' : stepItem.id === step ? 'text-blue-700' : 'text-gray-500'}`}>
                  {stepItem.title}
                </h4>
                <p className="text-sm text-gray-600">{stepItem.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2 mt-6">
          <Button 
            onClick={nextStep} 
            disabled={step >= 6}
            variant="professional"
          >
            {step >= 6 ? 'Workflow Complete!' : 'Next Step'}
          </Button>
          <Button 
            onClick={resetDemo} 
            variant="outline"
          >
            Reset Demo
          </Button>
        </div>
        
        <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
          <h4 className="font-medium text-green-800 mb-2">Key Improvements:</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• No duplicate fee payments - tracks application status properly</li>
            <li>• Clear workflow states - freelancer knows exactly what to do next</li>
            <li>• MetaMask confirmation for fee payment</li>
            <li>• Client can approve/reject with proper state updates</li>
            <li>• Automatic payment release on approval</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowDemo;