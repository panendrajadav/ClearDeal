export const CONTRACT_ADDRESS = '0x5F70Cee60FAe50C267028B899f5c7a60D33c7397';

export const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "jobId",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "descriptionUrl",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "applicationDuration",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "selectionDuration",
        "type": "uint256"
      }
    ],
    "name": "createJob",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "jobId",
        "type": "bytes32"
      }
    ],
    "name": "applyJob",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "jobId",
        "type": "bytes32"
      },
      {
        "internalType": "address payable",
        "name": "freelancer",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "workDuration",
        "type": "uint256"
      }
    ],
    "name": "selectFreelancer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "jobId",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "submissionUrl",
        "type": "bytes32"
      }
    ],
    "name": "submitWork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "jobId",
        "type": "bytes32"
      }
    ],
    "name": "approveWork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "jobId",
        "type": "bytes32"
      }
    ],
    "name": "rejectWork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "jobId",
        "type": "bytes32"
      }
    ],
    "name": "getJob",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "descriptionUrl",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "client",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "selected",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "budget",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "applicationDeadlineTs",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "workDeadlineTs",
        "type": "uint256"
      },
      {
        "internalType": "enum ClearDealETH.JobStatus",
        "name": "status",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "client",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "nonce",
        "type": "uint256"
      }
    ],
    "name": "generateJobId",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "jobId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "who",
        "type": "address"
      }
    ],
    "name": "hasApplied",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;