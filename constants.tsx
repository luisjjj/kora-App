
import React from 'react';
import { Transaction, UserProfile } from './types';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  LayoutDashboard, 
  QrCode, 
  Scan, 
  TrendingUp, 
  MessageSquare 
} from 'lucide-react';

export const MOCK_USER: UserProfile = {
  id: 'KORA-8822-991',
  name: 'Alex Rivera',
  email: 'alex@kora.finance',
  balance: 4280.50,
  qrCodeData: 'KORA-8822-991',
  avatar: 'https://picsum.photos/seed/alex/200/200'
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'send',
    amount: 120.00,
    peerName: 'Emma Watson',
    peerId: 'KORA-001',
    timestamp: new Date(Date.now() - 3600000 * 2),
    status: 'completed',
    category: 'Food'
  },
  {
    id: 'tx-2',
    type: 'receive',
    amount: 850.00,
    peerName: 'Startup Corp',
    peerId: 'KORA-CORP-9',
    timestamp: new Date(Date.now() - 3600000 * 24),
    status: 'completed',
    category: 'Personal'
  },
  {
    id: 'tx-3',
    type: 'send',
    amount: 45.50,
    peerName: 'Uber Technologies',
    peerId: 'KORA-UBER-1',
    timestamp: new Date(Date.now() - 3600000 * 48),
    status: 'completed',
    category: 'Transport'
  },
  {
    id: 'tx-4',
    type: 'send',
    amount: 310.00,
    peerName: 'Apple Store',
    peerId: 'KORA-APPLE-X',
    timestamp: new Date(Date.now() - 3600000 * 72),
    status: 'completed',
    category: 'Shopping'
  }
];

export const NAV_ITEMS = [
  { id: 'DASHBOARD', icon: <LayoutDashboard size={24} />, label: 'Home' },
  { id: 'SCAN', icon: <Scan size={24} />, label: 'Pay' },
  { id: 'RECEIVE', icon: <QrCode size={24} />, label: 'Receive' },
  { id: 'INSIGHTS', icon: <TrendingUp size={24} />, label: 'Insights' },
  { id: 'AI_ASSISTANT', icon: <MessageSquare size={24} />, label: 'Kora AI' },
];
