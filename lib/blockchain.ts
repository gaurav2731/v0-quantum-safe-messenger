import { ethers } from 'ethers';

// Blockchain configuration for Polygon Mumbai testnet
const POLYGON_MUMBAI_RPC = 'https://rpc-mumbai.maticvigil.com';
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xYourContractAddress';
const PRIVATE_KEY = process.env.PRIVATE_KEY || 'your-private-key';

// Simple audit contract ABI (you would deploy this contract)
const AUDIT_CONTRACT_ABI = [
  "function logMessage(string memory messageHash, string memory sender, string memory receiver, uint256 timestamp) public",
  "function verifyMessage(string memory messageHash) public view returns (bool, string memory, string memory, uint256)",
  "function getMessageCount() public view returns (uint256)",
  "function getMessage(uint256 index) public view returns (string memory, string memory, string memory, uint256)"
];

export class BlockchainAuditor {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private contract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(POLYGON_MUMBAI_RPC);
    this.signer = new ethers.Wallet(PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, AUDIT_CONTRACT_ABI, this.signer);
  }

  // Log message metadata to blockchain
  async logMessage(messageHash: string, sender: string, receiver: string): Promise<string> {
    try {
      const tx = await this.contract.logMessage(messageHash, sender, receiver, Date.now());
      const receipt = await tx.wait();
      console.log('Message logged to blockchain:', receipt.hash);
      return receipt.hash;
    } catch (error) {
      console.error('Failed to log message to blockchain:', error);
      throw new Error('Blockchain logging failed');
    }
  }

  // Verify message existence and integrity on blockchain
  async verifyMessage(messageHash: string): Promise<{
    exists: boolean;
    sender: string;
    receiver: string;
    timestamp: number;
  }> {
    try {
      const result = await this.contract.verifyMessage(messageHash);
      return {
        exists: result[0],
        sender: result[1],
        receiver: result[2],
        timestamp: Number(result[3])
      };
    } catch (error) {
      console.error('Failed to verify message on blockchain:', error);
      return { exists: false, sender: '', receiver: '', timestamp: 0 };
    }
  }

  // Get total number of logged messages
  async getMessageCount(): Promise<number> {
    try {
      const count = await this.contract.getMessageCount();
      return Number(count);
    } catch (error) {
      console.error('Failed to get message count:', error);
      return 0;
    }
  }

  // Get message details by index
  async getMessageByIndex(index: number): Promise<{
    hash: string;
    sender: string;
    receiver: string;
    timestamp: number;
  }> {
    try {
      const result = await this.contract.getMessage(index);
      return {
        hash: result[0],
        sender: result[1],
        receiver: result[2],
        timestamp: Number(result[3])
      };
    } catch (error) {
      console.error('Failed to get message by index:', error);
      throw new Error('Message retrieval failed');
    }
  }

  // Get audit trail for a user
  async getUserAuditTrail(userAddress: string): Promise<Array<{
    hash: string;
    sender: string;
    receiver: string;
    timestamp: number;
  }>> {
    try {
      const count = await this.getMessageCount();
      const auditTrail = [];

      for (let i = 0; i < count; i++) {
        const message = await this.getMessageByIndex(i);
        if (message.sender === userAddress || message.receiver === userAddress) {
          auditTrail.push(message);
        }
      }

      return auditTrail.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Failed to get user audit trail:', error);
      return [];
    }
  }

  // Check blockchain connection
  async isConnected(): Promise<boolean> {
    try {
      await this.provider.getBlockNumber();
      return true;
    } catch {
      return false;
    }
  }

  // Get current gas price
  async getGasPrice(): Promise<string> {
    try {
      const gasPrice = await this.provider.getFeeData();
      return ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei');
    } catch (error) {
      console.error('Failed to get gas price:', error);
      return '0';
    }
  }
}

// Singleton instance
let blockchainAuditor: BlockchainAuditor;

export const getBlockchainAuditor = (): BlockchainAuditor => {
  if (!blockchainAuditor) {
    blockchainAuditor = new BlockchainAuditor();
  }
  return blockchainAuditor;
};

// Utility functions for message auditing
export const logMessageToBlockchain = async (
  messageHash: string,
  sender: string,
  receiver: string
): Promise<string> => {
  const auditor = getBlockchainAuditor();
  return await auditor.logMessage(messageHash, sender, receiver);
};

export const verifyMessageOnBlockchain = async (
  messageHash: string
): Promise<boolean> => {
  const auditor = getBlockchainAuditor();
  const result = await auditor.verifyMessage(messageHash);
  return result.exists;
};

export const getMessageAuditTrail = async (
  userAddress: string
): Promise<Array<{
  hash: string;
  sender: string;
  receiver: string;
  timestamp: number;
}>> => {
  const auditor = getBlockchainAuditor();
  return await auditor.getUserAuditTrail(userAddress);
};
