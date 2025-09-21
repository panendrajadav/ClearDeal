import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import WalletConnector from '@/components/WalletConnector';
import LoginForm from '@/components/LoginForm';
import { useContract } from '@/hooks/useContract';
import { useToast } from '@/hooks/use-toast';
import { User, Job, Application } from '@/types';

import { Plus, LogOut, Users, CheckCircle, XCircle, ExternalLink, FileText, Clock } from 'lucide-react';

const ClientDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [bounty, setBounty] = useState('');
  
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const { createJob, selectFreelancer, approveWork, rejectWork, isLoading } = useContract();
  const { toast } = useToast();

  // Load jobs and applications from localStorage
  useEffect(() => {
    const storedJobs = localStorage.getItem('clearDealJobs');
    const storedApplications = localStorage.getItem('clearDealApplications');
    
    if (storedJobs) {
      const allJobs = JSON.parse(storedJobs);
      const clientJobs = allJobs.filter((job: Job) => job.client === address);
      setJobs(clientJobs);
    }
    
    if (storedApplications) {
      const apps = JSON.parse(storedApplications);
      // Migrate old applications that don't have hasPaidFee property
      const migratedApps = apps.map((app: any) => ({
        ...app,
        hasPaidFee: app.hasPaidFee ?? true // Assume old applications had fees paid
      }));
      setApplications(migratedApps);
      
      // Update localStorage with migrated data
      if (JSON.stringify(apps) !== JSON.stringify(migratedApps)) {
        localStorage.setItem('clearDealApplications', JSON.stringify(migratedApps));
      }
    }
  }, [address]);

  // Listen for new applications
  useEffect(() => {
    const handleStorageChange = () => {
      const storedApplications = localStorage.getItem('clearDealApplications');
      if (storedApplications) {
        setApplications(JSON.parse(storedApplications));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    disconnect();
    navigate('/');
  };

  const handleCreateJob = async () => {
    if (!jobTitle || !jobDescription || !bounty) return;
    
    try {
      await createJob(jobTitle, jobDescription, bounty);
      
      const newJob: Job = {
        id: Date.now(),
        title: jobTitle,
        description: jobDescription,
        bounty,
        client: address!,
        isCompleted: false,
        isPosted: true,
      };
      
      const updatedJobs = [...jobs, newJob];
      setJobs(updatedJobs);
      
      // Store in localStorage for cross-dashboard sync
      const allJobs = JSON.parse(localStorage.getItem('clearDealJobs') || '[]');
      allJobs.push(newJob);
      localStorage.setItem('clearDealJobs', JSON.stringify(allJobs));
      
      setJobTitle('');
      setJobDescription('');
      setBounty('');
      setIsJobDialogOpen(false);
      
      toast({
        title: 'Job Posted Successfully!',
        description: 'Freelancers can now see and apply to your job.',
      });
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const handleSelectFreelancer = async (jobId: number, freelancer: string) => {
    try {
      // For demo mode, skip blockchain call and just update local state
      // await selectFreelancer(jobId, freelancer);
      
      // Update applications in localStorage
      const storedApplications = JSON.parse(localStorage.getItem('clearDealApplications') || '[]');
      const updatedApplications = storedApplications.map((app: Application) => 
        app.jobId === jobId 
          ? { 
              ...app, 
              status: app.freelancer === freelancer ? 'selected' : 'rejected',
              workStatus: app.freelancer === freelancer ? 'in_progress' : app.workStatus
            }
          : app
      );
      localStorage.setItem('clearDealApplications', JSON.stringify(updatedApplications));
      
      // Update local state
      setApplications(updatedApplications);
      
      toast({
        title: 'Freelancer Selected!',
        description: 'The selected freelancer can now submit their work.',
      });
    } catch (error) {
      console.error('Failed to select freelancer:', error);
      toast({
        title: 'Selection Failed',
        description: 'Failed to select freelancer. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleApproveWork = async (jobId: number) => {
    try {
      // For demo mode, skip blockchain call
      // await approveWork(jobId);
      
      // Update job status
      const updatedJobs = jobs.map(job => 
        job.id === jobId ? { ...job, isCompleted: true } : job
      );
      setJobs(updatedJobs);
      
      // Update jobs in localStorage
      const allJobs = JSON.parse(localStorage.getItem('clearDealJobs') || '[]');
      const updatedAllJobs = allJobs.map((job: Job) => 
        job.id === jobId ? { ...job, isCompleted: true } : job
      );
      localStorage.setItem('clearDealJobs', JSON.stringify(updatedAllJobs));
      
      // Update application work status
      const storedApplications = JSON.parse(localStorage.getItem('clearDealApplications') || '[]');
      const updatedApplications = storedApplications.map((app: Application) => 
        app.jobId === jobId && app.status === 'selected'
          ? { ...app, workStatus: 'approved' }
          : app
      );
      localStorage.setItem('clearDealApplications', JSON.stringify(updatedApplications));
      
      toast({
        title: 'Work Approved! 🎉',
        description: 'Payment has been released to the freelancer.',
      });
    } catch (error) {
      console.error('Failed to approve work:', error);
      toast({
        title: 'Approval Failed',
        description: 'Failed to approve work. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleRejectWork = async (jobId: number) => {
    try {
      // For demo mode, skip blockchain call
      // await rejectWork(jobId);
      
      // Update application work status
      const storedApplications = JSON.parse(localStorage.getItem('clearDealApplications') || '[]');
      const updatedApplications = storedApplications.map((app: Application) => 
        app.jobId === jobId && app.status === 'selected'
          ? { ...app, workStatus: 'rejected' }
          : app
      );
      localStorage.setItem('clearDealApplications', JSON.stringify(updatedApplications));
      
      toast({
        title: 'Work Rejected',
        description: 'Freelancer has been notified to revise their work.',
      });
    } catch (error) {
      console.error('Failed to reject work:', error);
      toast({
        title: 'Rejection Failed',
        description: 'Failed to reject work. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Client Portal</h1>
            <p className="text-muted-foreground">Connect your wallet to continue</p>
          </div>
          <WalletConnector />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Client Portal</h1>
          </div>
          <WalletConnector />
          <LoginForm role="client" onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user.name}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Plus className="h-8 w-8 text-primary" />
                <div className="ml-3">
                  <p className="text-sm text-muted-foreground">Jobs Posted</p>
                  <p className="text-2xl font-bold">{jobs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-accent" />
                <div className="ml-3">
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold">{applications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-accent" />
                <div className="ml-3">
                  <p className="text-sm text-muted-foreground">Completed Jobs</p>
                  <p className="text-2xl font-bold">{jobs.filter(j => j.isCompleted).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Posting Section */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Posted Jobs</h2>
              <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="professional">
                    <Plus className="w-4 h-4 mr-2" />
                    New Job
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Post New Job</DialogTitle>
                    <DialogDescription>
                      Create a new job posting with escrow protection
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="Enter job title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Describe the job requirements"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bounty">Bounty (ETH)</Label>
                      <Input
                        id="bounty"
                        type="number"
                        step="0.001"
                        value={bounty}
                        onChange={(e) => setBounty(e.target.value)}
                        placeholder="0.1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        This amount will be held in escrow until work completion
                      </p>
                    </div>
                    <Button 
                      onClick={handleCreateJob} 
                      disabled={isLoading || !jobTitle || !jobDescription || !bounty}
                      variant="success"
                      className="w-full"
                    >
                      {isLoading ? 'Creating Job...' : 'Post Job'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {jobs.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Plus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No jobs posted yet</p>
                  </CardContent>
                </Card>
              ) : (
                jobs.map((job) => (
                  <Card key={job.id} className="bg-gradient-card border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {job.title}
                        <span className="text-lg font-bold text-accent">
                          {job.bounty} ETH
                        </span>
                      </CardTitle>
                      <CardDescription>{job.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Applications: {applications.filter(a => a.jobId === job.id).length}
                        </span>
                        {job.isCompleted && (
                          <span className="flex items-center text-accent text-sm">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Completed
                          </span>
                        )}
                      </div>
                      {job.githubLink && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-muted-foreground mb-2">Submitted Work:</p>
                          {job.submissionType === 'file' ? (
                            <div className="text-sm flex items-center mb-1">
                              <FileText className="w-3 h-3 mr-1" />
                              File: {job.submissionContent?.split('/').pop() || 'Uploaded File'}
                            </div>
                          ) : (
                            <a 
                              href={job.githubLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm flex items-center"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View Work Link
                            </a>
                          )}
                          <p className="text-sm mt-1">{job.workDescription}</p>
                          {!job.isCompleted && (
                            <div className="flex gap-2 mt-3">
                              <Button 
                                size="sm" 
                                variant="success"
                                onClick={() => handleApproveWork(job.id)}
                                disabled={isLoading}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve & Pay
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleRejectWork(job.id)}
                                disabled={isLoading}
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Request Revision
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Applications Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Job Applications</h2>
            <div className="space-y-4">
              {applications.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No applications yet</p>
                  </CardContent>
                </Card>
              ) : (
                applications
                  .filter(app => jobs.some(job => job.id === app.jobId))
                  .map((application, index) => {
                    const job = jobs.find(j => j.id === application.jobId);
                    if (!job) return null;
                    
                    // Debug logging
                    console.log('Application:', application);
                    
                    return (
                      <Card key={index} className="bg-gradient-card border-border/50">
                        <CardHeader>
                          <CardTitle className="text-base">
                            Application for "{job.title}"
                          </CardTitle>
                          <CardDescription>
                            Freelancer: {application.freelancer.slice(0, 6)}...{application.freelancer.slice(-4)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Applied: {new Date(application.appliedAt).toLocaleDateString()}
                              </span>
                              <span className="text-sm font-medium">
                                Fee Paid: {(application.hasPaidFee ?? false) ? '✓' : '✗'}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                {application.status === 'pending' && (
                                  <span className="text-yellow-600 flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    Pending Review (Fee: {(application.hasPaidFee ?? false) ? 'Paid' : 'Not Paid'})
                                  </span>
                                )}
                                {application.status === 'selected' && (
                                  <span className="text-green-600 flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Selected - {application.workStatus === 'submitted' ? 'Work Submitted' : 'Working'}
                                  </span>
                                )}
                                {application.status === 'rejected' && (
                                  <span className="text-red-600 flex items-center">
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Not Selected
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex gap-2">
                                {application.status === 'pending' && (
                                  <Button 
                                    size="sm" 
                                    variant="success"
                                    onClick={() => handleSelectFreelancer(application.jobId, application.freelancer)}
                                    disabled={isLoading || !(application.hasPaidFee ?? false)}
                                  >
                                    {(application.hasPaidFee ?? false) ? 'Select Freelancer' : 'Fee Not Paid'}
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            {application.submissionData && (
                              <div className="mt-3 p-3 bg-muted/50 rounded border">
                                <p className="text-sm font-medium mb-2">Work Submitted:</p>
                                {application.submissionData.type === 'file' ? (
                                  <div className="text-sm flex items-center">
                                    <FileText className="w-3 h-3 mr-1" />
                                    File: {application.submissionData.content.split('/').pop()}
                                  </div>
                                ) : (
                                  <a 
                                    href={application.submissionData.content} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline text-sm flex items-center"
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    View Work Link
                                  </a>
                                )}
                                <p className="text-sm mt-1 text-muted-foreground">{application.submissionData.description}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Submitted: {new Date(application.submissionData.submittedAt).toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;