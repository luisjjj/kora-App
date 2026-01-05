
import React from 'react';
import { Transaction } from '../types';
import { ArrowUpRight, ArrowDownLeft, Coffee, ShoppingBag, Car, Wallet, User } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
}

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'Food': return <Coffee size={18} />;
    case 'Shopping': return <ShoppingBag size={18} />;
    case 'Transport': return <Car size={18} />;
    case 'Personal': return <User size={18} />;
    default: return <Wallet size={18} />;
  }
};

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Recent Activity</h3>
        <button className="text-xs text-emerald-400 hover:underline">View All</button>
      </div>
      {transactions.map((tx) => (
        <div key={tx.id} className="glass-card p-4 rounded-2xl flex items-center gap-4 transition-transform active:scale-95 cursor-pointer">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            tx.type === 'receive' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
          }`}>
            <CategoryIcon category={tx.category} />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-zinc-100">{tx.peerName}</h4>
            <p className="text-xs text-zinc-500">{tx.category} • {new Date(tx.timestamp).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className={`font-bold ${tx.type === 'receive' ? 'text-emerald-400' : 'text-zinc-100'}`}>
              {tx.type === 'receive' ? '+' : '-'}${tx.amount.toFixed(2)}
            </p>
            <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-tighter">{tx.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
