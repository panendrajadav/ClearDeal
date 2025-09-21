export interface Job {
  id: number;
  title: string;
  description: string;
  bounty: string;
  client: string;
  selectedFreelancer?: string;
  isCompleted: boolean;
  githubLink?: string;
  workDescription?: string;
  submissionType?: 'file' | 'link';
  submissionContent?: string;
  isPosted?: boolean;
}

export interface User {
  address: string;
  role: 'client' | 'freelancer';
  name?: string;
  email?: string;
  walletAddress?: string;
}

export interface Application {
  jobId: number;
  freelancer: string;
  status: 'pending' | 'selected' | 'rejected';
  appliedAt: number;
  hasPaidFee: boolean;
  workStatus?: 'not_started' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  submissionData?: {
    type: 'file' | 'link';
    content: string;
    description: string;
    submittedAt: number;
  };
}

export interface WorkSubmission {
  type: 'file' | 'link';
  content: string;
  description: string;
}

export type UserRole = 'client' | 'freelancer';