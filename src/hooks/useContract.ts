import * as React from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useEstimateGas, useGasPrice } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contract';
import { parseEther, formatEther } from 'viem';
import { arbitrumSepolia } from 'wagmi/chains';
import { useToast } from '@/hooks/use-toast';

export const useContract = () => {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  const { toast } = useToast();
  const { data: gasPrice } = useGasPrice();

  // Show transaction confirmation when successful
  React.useEffect(() => {
    if (isSuccess && hash) {
      toast({
        title: 'Transaction Confirmed',
        description: `Transaction ${hash.slice(0, 10)}... confirmed on blockchain`,
      });
    }
  }, [isSuccess, hash, toast]);

  const createJob = async (title: string, description: string, bounty: string) => {
    try {
      if (!bounty || parseFloat(bounty) <= 0) {
        toast({
          title: 'Invalid Bounty',
          description: 'You must specify a bounty amount in ETH.',
          variant: 'destructive',
        });
        throw new Error('Invalid bounty amount');
      }

      const nonce = Date.now();
      const descriptionHash = `0x${nonce.toString(16).padStart(64, '0')}`;
      
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'createJob',
        args: [descriptionHash as `0x${string}`, descriptionHash as `0x${string}`, BigInt(86400), BigInt(86400)],
        value: parseEther(bounty),
      });
      
      toast({
        title: 'Transaction Submitted',
        description: `Creating job with ${bounty} ETH bounty`,
      });
    } catch (error: any) {
      console.error('CreateJob Error:', error);
      toast({
        title: 'Job Creation Failed',
        description: error?.shortMessage || 'Transaction failed',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const applyJob = async (jobId: number, bountyAmount: string) => {
    try {
      const applicationFee = parseEther((parseFloat(bountyAmount) * 0.1).toString());
      const jobIdHash = `0x${jobId.toString(16).padStart(64, '0')}`;
      
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'applyJob',
        args: [jobIdHash as `0x${string}`],
        value: applicationFee,
      });
      
      toast({
        title: 'Application Submitted',
        description: `Application fee: ${(parseFloat(bountyAmount) * 0.1).toFixed(3)} ETH`,
      });
    } catch (error: any) {
      const errorMessage = error?.shortMessage?.includes('rejected') 
        ? 'Transaction rejected in MetaMask'
        : error?.shortMessage?.includes('insufficient')
        ? 'Insufficient ETH balance for application fee'
        : 'Application failed. Try again.';
        
      toast({
        title: 'Application Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const selectFreelancer = async (jobId: number, freelancer: string) => {
    try {
      const jobIdHash = `0x${jobId.toString(16).padStart(64, '0')}`;
      
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'selectFreelancer',
        args: [jobIdHash as `0x${string}`, freelancer as `0x${string}`, BigInt(604800)], // 7 days work duration
      });
      
      toast({
        title: 'Freelancer Selected',
        description: 'Escrow will be activated for selected freelancer',
      });
    } catch (error: any) {
      const errorMessage = error?.shortMessage?.includes('rejected') 
        ? 'Transaction rejected in MetaMask'
        : 'Selection failed. Try again.';
        
      toast({
        title: 'Selection Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const submitWork = async (jobId: number, workLink: string, workDescription: string) => {
    try {
      const jobIdHash = `0x${jobId.toString(16).padStart(64, '0')}`;
      const submissionHash = `0x${btoa(workLink).slice(0, 64).padEnd(64, '0')}`;
      
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'submitWork',
        args: [jobIdHash as `0x${string}`, submissionHash as `0x${string}`],
      });
      
      toast({
        title: 'Work Submitted',
        description: 'Submission sent to client for review',
      });
    } catch (error: any) {
      const errorMessage = error?.shortMessage?.includes('rejected') 
        ? 'Transaction rejected in MetaMask'
        : error?.shortMessage?.includes('not selected')
        ? 'You must be selected for this job first'
        : 'Submission failed. Try again.';
        
      toast({
        title: 'Submission Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const approveWork = async (jobId: number) => {
    try {
      const jobIdHash = `0x${jobId.toString(16).padStart(64, '0')}`;
      
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'approveWork',
        args: [jobIdHash as `0x${string}`],
      });
      
      toast({
        title: 'Work Approved',
        description: 'Escrow funds released to freelancer',
      });
    } catch (error: any) {
      const errorMessage = error?.shortMessage?.includes('rejected') 
        ? 'Transaction rejected in MetaMask'
        : 'Approval failed. Try again.';
        
      toast({
        title: 'Approval Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const rejectWork = async (jobId: number) => {
    try {
      const jobIdHash = `0x${jobId.toString(16).padStart(64, '0')}`;
      
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'rejectWork',
        args: [jobIdHash as `0x${string}`],
      });
      
      toast({
        title: 'Work Rejected',
        description: 'Funds returned to escrow for revision',
      });
    } catch (error: any) {
      const errorMessage = error?.shortMessage?.includes('rejected') 
        ? 'Transaction rejected in MetaMask'
        : 'Rejection failed. Try again.';
        
      toast({
        title: 'Rejection Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    createJob,
    applyJob,
    selectFreelancer,
    submitWork,
    approveWork,
    rejectWork,
    isLoading: isPending || isConfirming,
    isSuccess,
  };
};

export const useJobData = (jobId?: number) => {
  const { data: job, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getJob',
    args: jobId !== undefined ? [BigInt(jobId)] : undefined,
  });

  const formattedJob = job ? {
    id: Number(job.id),
    title: job.title,
    description: job.description,
    bounty: formatEther(job.bounty),
    client: job.client,
    selectedFreelancer: job.selectedFreelancer,
    isCompleted: job.isCompleted,
  } : null;

  return {
    job: formattedJob,
    isLoading,
    refetch,
  };
};

export const useHasApplied = (jobId?: number, freelancer?: string) => {
  const { data: hasApplied, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'hasApplied',
    args: jobId !== undefined && freelancer ? [BigInt(jobId), freelancer as `0x${string}`] : undefined,
  });

  return {
    hasApplied: Boolean(hasApplied),
    isLoading,
  };
};