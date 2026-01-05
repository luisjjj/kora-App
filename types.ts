
export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  peerName: string;
  peerId: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  category: 'Personal' | 'Shopping' | 'Food' | 'Utilities' | 'Transport';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  balance: number;
  qrCodeData: string;
  avatar: string;
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  SCAN = 'SCAN',
  RECEIVE = 'RECEIVE',
  INSIGHTS = 'INSIGHTS',
  AI_ASSISTANT = 'AI_ASSISTANT'
}
