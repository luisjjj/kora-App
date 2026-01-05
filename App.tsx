
import React, { useState, useEffect, useRef } from 'react';
import { View, Transaction, UserProfile } from './types';
import { MOCK_USER, MOCK_TRANSACTIONS } from './constants';
import Layout from './components/Layout';
import TransactionList from './components/TransactionList';
import { getFinancialAdvice, analyzeSpending } from './services/geminiService';
import { 
  Plus, 
  Search, 
  Send, 
  MoreHorizontal, 
  BrainCircuit, 
  ArrowRight,
  Sparkles,
  RefreshCcw,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

const STORAGE_KEYS = {
  TRANSACTIONS: 'kora_transactions',
  USER: 'kora_user'
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.DASHBOARD);
  
  // Initialize state from localStorage or fallback to mock data
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Revive dates
        return parsed.map((tx: any) => ({
          ...tx,
          timestamp: new Date(tx.timestamp)
        }));
      } catch (e) {
        console.error("Failed to parse transactions from storage", e);
        return MOCK_TRANSACTIONS;
      }
    }
    return MOCK_TRANSACTIONS;
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse user from storage", e);
        return MOCK_USER;
      }
    }
    return MOCK_USER;
  });

  const [aiResponse, setAiResponse] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [spendingTips, setSpendingTips] = useState<string[]>([]);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  // Video ref for simulated scanner
  const videoRef = useRef<HTMLVideoElement>(null);

  // Persist transactions whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  // Persist user whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (activeView === View.INSIGHTS) {
      const fetchTips = async () => {
        const tips = await analyzeSpending(transactions);
        setSpendingTips(tips);
      };
      fetchTips();
    }
  }, [activeView, transactions]);

  const handleSendMoney = () => {
    if (!payAmount || parseFloat(payAmount) <= 0) return;

    setPaymentStatus('processing');
    setTimeout(() => {
      const amount = parseFloat(payAmount);
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'send',
        amount: amount,
        peerName: scanResult || 'Recipient',
        peerId: 'KORA-REC-1',
        timestamp: new Date(),
        status: 'completed',
        category: 'Personal'
      };
      setTransactions(prev => [newTx, ...prev]);
      setUser(prev => ({ ...prev, balance: prev.balance - amount }));
      setPaymentStatus('success');
      setTimeout(() => {
        setPaymentStatus('idle');
        setScanResult(null);
        setPayAmount('');
        setActiveView(View.DASHBOARD);
      }, 2000);
    }, 1500);
  };

  const handleAiAsk = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = (e.currentTarget.elements.namedItem('query') as HTMLInputElement).value;
    if (!query) return;

    setIsAiLoading(true);
    setAiResponse('');
    const advice = await getFinancialAdvice(transactions, query);
    setAiResponse(advice || 'No advice found.');
    setIsAiLoading(false);
  };

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const simulateScan = (peerId: string) => {
    setScanResult(peerId);
  };

  useEffect(() => {
    if (activeView === View.SCAN) {
      startScanner();
    } else {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [activeView]);

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-card p-6 rounded-3xl emerald-glow border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest mb-1">Total Balance</p>
            <h2 className="text-4xl font-bold">${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
          </div>
          <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-500">
            <ShieldCheck size={20} />
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveView(View.SCAN)}
            className="flex-1 bg-white text-black font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Send size={18} /> Pay
          </button>
          <button 
            onClick={() => setActiveView(View.RECEIVE)}
            className="flex-1 bg-emerald-500 text-black font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Plus size={18} /> Add
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <button className="flex-1 glass-card p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/5 transition-colors">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
            <Search size={20} />
          </div>
          <span className="text-xs font-medium text-zinc-400">Search</span>
        </button>
        <button 
          onClick={() => setActiveView(View.AI_ASSISTANT)}
          className="flex-1 glass-card p-4 rounded-2xl flex flex-col items-center gap-2 border border-emerald-500/30 hover:bg-emerald-500/5 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <BrainCircuit size={20} />
          </div>
          <span className="text-xs font-medium text-emerald-400">Kora AI</span>
        </button>
        <button className="flex-1 glass-card p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/5 transition-colors">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
            <MoreHorizontal size={20} />
          </div>
          <span className="text-xs font-medium text-zinc-400">More</span>
        </button>
      </div>

      <TransactionList transactions={transactions.slice(0, 5)} />
    </div>
  );

  const renderScan = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="relative aspect-[3/4] w-full bg-zinc-900 rounded-3xl overflow-hidden border-2 border-white/10">
        {!scanResult ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale opacity-50" />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-emerald-500 rounded-3xl relative">
                <div className="absolute inset-0 bg-emerald-500/5 animate-pulse rounded-3xl"></div>
                {/* Scanner corners */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl"></div>
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl"></div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl"></div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl"></div>
              </div>
              <p className="mt-8 text-emerald-400 font-medium tracking-widest text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
                Align QR Code within the frame
              </p>
            </div>
            {/* Demo buttons to simulate scanning */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 px-6">
              <button 
                onClick={() => simulateScan('Emma Watson')}
                className="bg-white/10 backdrop-blur-md text-white text-[10px] px-3 py-2 rounded-lg border border-white/20"
              >
                Scan Emma
              </button>
              <button 
                onClick={() => simulateScan('Startup Corp')}
                className="bg-white/10 backdrop-blur-md text-white text-[10px] px-3 py-2 rounded-lg border border-white/20"
              >
                Scan Startup
              </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-zinc-950 p-8 flex flex-col items-center justify-center">
            {paymentStatus === 'idle' ? (
              <>
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 border border-emerald-500/20">
                  <Send size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-1">Paying {scanResult}</h3>
                <p className="text-zinc-500 text-sm mb-8">Enter amount to transfer</p>
                
                <div className="relative mb-8 w-full max-w-[200px]">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-4xl font-light text-zinc-600">$</span>
                  <input 
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="0.00"
                    autoFocus
                    className="w-full bg-transparent border-b-2 border-zinc-800 text-5xl font-bold text-center py-4 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                  <button 
                    onClick={() => setScanResult(null)}
                    className="py-4 rounded-2xl bg-zinc-900 text-zinc-400 font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSendMoney}
                    disabled={!payAmount}
                    className="py-4 rounded-2xl bg-emerald-500 text-black font-bold disabled:opacity-50"
                  >
                    Confirm
                  </button>
                </div>
              </>
            ) : paymentStatus === 'processing' ? (
              <div className="flex flex-col items-center">
                <RefreshCcw size={64} className="text-emerald-500 animate-spin mb-6" />
                <h3 className="text-xl font-bold mb-2">Processing Payment</h3>
                <p className="text-zinc-500 text-sm">Securing your transaction via Kora Mesh...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <CheckCircle2 size={64} className="text-emerald-400 mb-6 animate-bounce" />
                <h3 className="text-2xl font-bold mb-2">Success!</h3>
                <p className="text-zinc-500 text-sm mb-2">Sent ${payAmount} to {scanResult}</p>
                <p className="text-emerald-400 text-xs font-bold tracking-widest uppercase">TX-ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="glass-card p-6 rounded-2xl">
        <h4 className="font-bold mb-2 flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-500" /> Secure Payments
        </h4>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Kora uses unique permanent QR IDs. Payments are instant and finalized on the ledger within seconds.
        </p>
      </div>
    </div>
  );

  const renderReceive = () => (
    <div className="space-y-6 animate-in slide-in-from-top duration-500">
      <div className="glass-card p-10 rounded-[3rem] flex flex-col items-center emerald-glow">
        <h3 className="text-2xl font-bold mb-1">Your QR ID</h3>
        <p className="text-zinc-500 text-sm mb-10">{user.id}</p>
        
        {/* Modern styled QR Code placeholder */}
        <div className="relative p-6 bg-white rounded-3xl overflow-hidden mb-10">
          <div className="w-56 h-56 bg-zinc-100 flex items-center justify-center">
             {/* Simulating a real QR code with simple divs for aesthetic */}
             <div className="w-full h-full p-2 grid grid-cols-5 grid-rows-5 gap-1">
               {[...Array(25)].map((_, i) => (
                 <div key={i} className={`rounded-sm ${Math.random() > 0.4 ? 'bg-zinc-900' : 'bg-transparent'}`}></div>
               ))}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-xl shadow-xl">
                 <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center font-bold text-black text-xs">K</div>
               </div>
             </div>
          </div>
        </div>

        <div className="flex gap-4 w-full">
          <button className="flex-1 glass-card bg-zinc-900 py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2">
            Share Link
          </button>
          <button className="flex-1 bg-white text-black py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2">
            Download
          </button>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-blue-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <RefreshCcw size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm">Real-time settlement</h4>
            <p className="text-zinc-500 text-xs">Payments appear instantly in your wallet.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInsights = () => {
    const data = transactions.slice().reverse().map((tx, i) => ({
      name: `T${i+1}`,
      val: tx.amount,
      type: tx.type
    }));

    return (
      <div className="space-y-6 animate-in zoom-in duration-500">
        <div className="glass-card p-6 rounded-3xl">
          <h3 className="text-lg font-bold mb-6">Spending Trend</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#34d399' }}
                />
                <Bar dataKey="val" radius={[6, 6, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.type === 'receive' ? '#34d399' : '#3b82f6'} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Inflow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Outflow</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-400" /> AI Insights
          </h3>
          {spendingTips.length > 0 ? (
            spendingTips.map((tip, idx) => (
              <div key={idx} className="glass-card p-4 rounded-2xl flex gap-3 border-l-2 border-emerald-500/50">
                <div className="mt-1"><ArrowRight size={14} className="text-emerald-400" /></div>
                <p className="text-sm text-zinc-300 leading-relaxed">{tip}</p>
              </div>
            ))
          ) : (
            <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center">
               <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center animate-pulse mb-4">
                 <RefreshCcw size={20} className="text-zinc-600" />
               </div>
               <p className="text-xs text-zinc-500">Analyzing your financial flow...</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAiAssistant = () => (
    <div className="flex flex-col h-[calc(100vh-180px)] space-y-4">
      <div className="flex-1 overflow-y-auto space-y-6 px-2">
        <div className="glass-card p-6 rounded-3xl bg-emerald-500/5 border-emerald-500/20">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <BrainCircuit size={24} />
          </div>
          <h2 className="text-2xl font-bold mb-2">I'm Kora.</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            I've analyzed your {transactions.length} recent transactions. 
            I can help you budget, explain fees, or suggest ways to save.
          </p>
        </div>

        {aiResponse && (
          <div className="glass-card p-6 rounded-3xl border border-zinc-800 bg-white/5 animate-in slide-in-from-bottom duration-500">
            <div className="prose prose-invert prose-sm text-zinc-300 whitespace-pre-wrap">
              {aiResponse}
            </div>
          </div>
        )}

        {isAiLoading && (
          <div className="flex items-center gap-3 p-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-xs text-zinc-500 font-medium tracking-widest uppercase">Thinking...</span>
          </div>
        )}
      </div>

      <form onSubmit={handleAiAsk} className="relative mt-auto">
        <input 
          name="query"
          type="text" 
          placeholder="Ask about your spending..."
          className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-5 px-6 pr-16 focus:outline-none focus:border-emerald-500 transition-all text-sm"
        />
        <button 
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-500 text-black p-3 rounded-xl hover:scale-105 active:scale-95 transition-all"
        >
          <ArrowRight size={20} />
        </button>
      </form>
    </div>
  );

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      {activeView === View.DASHBOARD && renderDashboard()}
      {activeView === View.SCAN && renderScan()}
      {activeView === View.RECEIVE && renderReceive()}
      {activeView === View.INSIGHTS && renderInsights()}
      {activeView === View.AI_ASSISTANT && renderAiAssistant()}
    </Layout>
  );
};

export default App;
