import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import WalletConnector from '@/components/WalletConnector';
import LoginForm from '@/components/LoginForm';
import FileUpload from '@/components/FileUpload';
import { useContract } from '@/hooks/useContract';
import { useToast } from '@/hooks/use-toast';
import { User, Job, WorkSubmission } from '@/types';

import { LogOut, Briefcase, Clock, CheckCircle, FileText, ExternalLink, AlertCircle, Lock, XCircle } from 'lucide-react';

const FreelancerDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [selectedJobForSubmission, setSelectedJobForSubmission] = useState<Job | null>(null);
  
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const { applyJob, submitWork, isLoading } = useContract();
  const { toast } = useToast();

  // Load jobs and applications from localStorage
  useEffect(() => {
    if (user && address) {
      const storedJobs = localStorage.getItem('clearDealJobs');
      if (storedJobs) {
        setAvailableJobs(JSON.parse(storedJobs));
      }
      
      const storedApplications = localStorage.getItem('clearDealApplications');
      if (storedApplications) {
        const allApplications = JSON.parse(storedApplications);
        const myApps = allApplications.filter((app: Application) => app.freelancer === address);
        setMyApplications(myApps);
      }
    }
  }, [user, address]);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const storedJobs = localStorage.getItem('clearDealJobs');
      if (storedJobs) {
        setAvailableJobs(JSON.parse(storedJobs));
      }
      
      if (address) {
        const storedApplications = localStorage.getItem('clearDealApplications');
        if (storedApplications) {
          const allApplications = JSON.parse(storedApplications);
          const myApps = allApplications.filter((app: Application) => app.freelancer === address);
          setMyApplications(myApps);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [address]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    setMyApplications([]);
    disconnect();
    navigate('/');
  };

  const handleApplyJob = async (job: Job) => {
    try {
      await applyJob(job.id, job.bounty);
      
      // Create new application with paid fee status
      const newApplication: Application = {
        jobId: job.id,
        freelancer: address!,
        status: 'pending',
        appliedAt: Date.now(),
        hasPaidFee: true,
        workStatus: 'not_started'
      };
      
      // Store application in localStorage
      const applications = JSON.parse(localStorage.getItem('clearDealApplications') || '[]');
      applications.push(newApplication);
      localStorage.setItem('clearDealApplications', JSON.stringify(applications));
      
      // Update local state
      setMyApplications(prev => [...prev, newApplication]);
      
      toast({
        title: 'Application Fee Paid!',
        description: `Applied for "${job.title}" - waiting for client selection`,
      });
    } catch (error) {
      console.error('Failed to apply for job:', error);
      toast({
        title: 'Application Failed',
        description: 'Failed to apply for job. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitWork = async (submission: WorkSubmission) => {
    if (!selectedJobForSubmission) return;
    
    try {
      // For demo mode, skip blockchain call
      // await submitWork(selectedJobForSubmission.id, submission.content, submission.description);
      
      // Update application status
      const applications = JSON.parse(localStorage.getItem('clearDealApplications') || '[]');
      const updatedApplications = applications.map((app: Application) => 
        app.jobId === selectedJobForSubmission.id && app.freelancer === address
          ? {
              ...app,
              workStatus: 'submitted',
              submissionData: {
                type: submission.type,
                content: submission.content,
                description: submission.description,
                submittedAt: Date.now()
              }
            }
          : app
      );
      localStorage.setItem('clearDealApplications', JSON.stringify(updatedApplications));
      
      // Update job data for client view
      const jobs = JSON.parse(localStorage.getItem('clearDealJobs') || '[]');
      const updatedJobs = jobs.map((job: Job) => 
        job.id === selectedJobForSubmission.id
          ? {
              ...job,
              githubLink: submission.content,
              workDescription: submission.description,
              submissionType: submission.type,
              submissionContent: submission.content
            }
          : job
      );
      localStorage.setItem('clearDealJobs', JSON.stringify(updatedJobs));
      
      // Update local state
      setMyApplications(prev => prev.map(app => 
        app.jobId === selectedJobForSubmission.id
          ? {
              ...app,
              workStatus: 'submitted',
              submissionData: {
                type: submission.type,
                content: submission.content,
                description: submission.description,
                submittedAt: Date.now()
              }
            }
          : app
      ));
      
      setIsSubmitDialogOpen(false);
      setSelectedJobForSubmission(null);
      
      toast({
        title: 'Work Submitted!',
        description: 'Your work has been submitted to the client for review.',
      });
    } catch (error) {
      console.error('Failed to submit work:', error);
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit work. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Helper functions
  const getApplicationForJob = (jobId: number) => {
    return myApplications.find(app => app.jobId === jobId);
  };
  
  const getJobStatus = (job: Job) => {
    const application = getApplicationForJob(job.id);
    if (!application) return 'not_applied';
    if (!application.hasPaidFee) return 'fee_pending';
    if (application.status === 'pending') return 'pending_selection';
    if (application.status === 'rejected') return 'rejected';
    if (application.status === 'selected') {
      if (application.workStatus === 'not_started' || application.workStatus === 'in_progress') return 'can_submit';
      if (application.workStatus === 'submitted') return 'work_submitted';
      if (application.workStatus === 'approved') return 'work_approved';
      if (application.workStatus === 'rejected') return 'work_rejected';
    }
    return 'unknown';
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Freelancer Portal</h1>
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
            <h1 className="text-2xl font-bold">Freelancer Portal</h1>
          </div>
          <WalletConnector />
          <LoginForm role="freelancer" onLogin={handleLogin} />
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
                <Briefcase className="h-8 w-8 text-primary" />
                <div className="ml-3">
                  <p className="text-sm text-muted-foreground">Available Jobs</p>
                  <p className="text-2xl font-bold">{availableJobs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-accent" />
                <div className="ml-3">
                  <p className="text-sm text-muted-foreground">Applications</p>
                  <p className="text-2xl font-bold">{myApplications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-accent" />
                <div className="ml-3">
                  <p className="text-sm text-muted-foreground">Selected Jobs</p>
                  <p className="text-2xl font-bold">{myApplications.filter(app => app.status === 'selected').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Available Jobs */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Available Jobs</h2>
            <div className="space-y-4">
              {availableJobs.map((job) => {
                const jobStatus = getJobStatus(job);
                const application = getApplicationForJob(job.id);
                
                return (
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
                          Client: {job.client}
                        </span>
                        {jobStatus === 'not_applied' ? (
                          <Button 
                            variant="professional" 
                            size="sm"
                            onClick={() => handleApplyJob(job)}
                            disabled={isLoading}
                          >
                            Apply (10% fee)
                          </Button>
                        ) : jobStatus === 'pending_selection' ? (
                          <span className="text-accent text-sm flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Pending Selection
                          </span>
                        ) : jobStatus === 'rejected' ? (
                          <span className="text-red-500 text-sm flex items-center">
                            <XCircle className="w-4 h-4 mr-1" />
                            Not Selected
                          </span>
                        ) : (
                          <span className="text-green-500 text-sm flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">
                          Application fee: {(parseFloat(job.bounty) * 0.1).toFixed(3)} ETH (10% of bounty)
                        </p>
                      </div>
                      {application && (
                        <div className="mt-2 p-2 bg-muted/50 border rounded text-xs">
                          <p className="text-muted-foreground">
                            Applied: {new Date(application.appliedAt).toLocaleDateString()}
                          </p>
                          {application.status === 'selected' && (
                            <p className="text-green-600 mt-1">
                              ✓ You can now submit work for this job
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Active Work & Submissions */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Active Work</h2>
            <div className="space-y-4">
              {myApplications.filter(app => app.status === 'selected').length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    {myApplications.length > 0 ? (
                      <>
                        <Clock className="w-12 h-12 text-accent mx-auto mb-4" />
                        <p className="text-muted-foreground mb-2">Waiting for selection...</p>
                        <p className="text-xs text-muted-foreground">
                          You'll be notified when clients review your applications
                        </p>
                      </>
                    ) : (
                      <>
                        <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Apply to jobs to get started</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : (
                myApplications
                  .filter(app => app.status === 'selected')
                  .map((application) => {
                    const job = availableJobs.find(j => j.id === application.jobId);
                    if (!job) return null;
                    
                    return (
                      <Card key={job.id} className="bg-gradient-success/10 border-accent/20">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            {job.title}
                            <span className="text-accent text-sm flex items-center">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Selected!
                            </span>
                          </CardTitle>
                          <CardDescription>{job.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Bounty: {job.bounty} ETH</span>
                              <span className="text-sm text-muted-foreground">
                                Client: {job.client}
                              </span>
                            </div>
                            
                            {application.workStatus === 'submitted' && application.submissionData ? (
                              <div className="bg-accent/10 p-3 rounded border border-accent/20">
                                <p className="text-sm font-medium text-accent mb-2">Work Submitted</p>
                                {application.submissionData.type === 'file' ? (
                                  <div className="text-sm flex items-center">
                                    <FileText className="w-3 h-3 mr-1" />
                                    File: {application.submissionData.content.split('/').pop() || 'Uploaded File'}
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
                                <p className="text-sm mt-2 text-muted-foreground">{application.submissionData.description}</p>
                                <div className="flex items-center mt-2 text-xs text-accent">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Waiting for client approval
                                </div>
                              </div>
                            ) : application.workStatus === 'approved' ? (
                              <div className="bg-green-50 p-3 rounded border border-green-200">
                                <p className="text-sm font-medium text-green-700 mb-2">Work Approved! 🎉</p>
                                <p className="text-sm text-green-600">Payment has been released to your wallet</p>
                              </div>
                            ) : application.workStatus === 'rejected' ? (
                              <div className="bg-red-50 p-3 rounded border border-red-200">
                                <p className="text-sm font-medium text-red-700 mb-2">Work Needs Revision</p>
                                <p className="text-sm text-red-600">Please revise and resubmit your work</p>
                                <Dialog 
                                  open={isSubmitDialogOpen && selectedJobForSubmission?.id === job.id} 
                                  onOpenChange={(open) => {
                                    setIsSubmitDialogOpen(open);
                                    if (!open) setSelectedJobForSubmission(null);
                                  }}
                                >
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="mt-2"
                                      onClick={() => setSelectedJobForSubmission(job)}
                                    >
                                      <FileText className="w-4 h-4 mr-2" />
                                      Resubmit Work
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                      <DialogTitle>Resubmit Your Work</DialogTitle>
                                      <DialogDescription>
                                        Upload a revised file or provide an updated link
                                      </DialogDescription>
                                    </DialogHeader>
                                    <FileUpload
                                      onSubmit={handleSubmitWork}
                                      isLoading={isLoading}
                                    />
                                  </DialogContent>
                                </Dialog>
                              </div>
                            ) : (
                              <Dialog 
                                open={isSubmitDialogOpen && selectedJobForSubmission?.id === job.id} 
                                onOpenChange={(open) => {
                                  setIsSubmitDialogOpen(open);
                                  if (!open) setSelectedJobForSubmission(null);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="success" 
                                    className="w-full"
                                    onClick={() => setSelectedJobForSubmission(job)}
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Submit Work
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                  <DialogHeader>
                                    <DialogTitle>Submit Your Work</DialogTitle>
                                    <DialogDescription>
                                      Upload a file or provide a link to your completed work
                                    </DialogDescription>
                                  </DialogHeader>
                                  <FileUpload
                                    onSubmit={handleSubmitWork}
                                    isLoading={isLoading}
                                  />
                                </DialogContent>
                              </Dialog>
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

export default FreelancerDashboard;