"use client";

import { ArrowsRightLeftIcon, ArrowUpRightIcon, ArrowDownLeftIcon } from "@heroicons/react/24/outline";
import EmptyState from "@/components/ui/EmptyState";
import { motion } from "framer-motion";

import { transactions } from "@/lib/mock-data";

export default function WalletPage() {
  const stats = [
    { label: "Total Balance", value: "$18,500.00" },
    { label: "Escrowed Funds", value: "$4,000.00" },
    { label: "Available to Withdraw", value: "$14,500.00" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } }
  };

  return (
    <div className="w-full space-y-16 pb-20">
      <div className="mb-12">
        <h1 className="text-6xl font-bold text-[#F5F5F4] mb-6 tracking-tighter">
          Multi-Currency Wallet
        </h1>
        <p className="text-[#A3A3A3] text-xl font-light">
          Manage your earnings, escrows, and cross-chain withdrawals.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="flex-1 bg-[#181D1A] border border-white/5 hover:border-white/10 rounded-3xl p-10 flex flex-col justify-center transition-all duration-700 ease-[var(--ease-fluid)] hover:-translate-y-2 hover:shadow-2xl interactive"
          >
            <span className="text-[#A3A3A3] font-medium text-sm uppercase tracking-wider mb-4">{stat.label}</span>
            <span className={`text-6xl font-bold tracking-tighter ${i === 0 ? 'text-[#F5F5F4]' : 'text-[#84CC16]'}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-8">
        <h2 className="text-4xl font-bold text-[#F5F5F4] mb-10 tracking-tight">Transaction History</h2>
        
        {transactions.length === 0 ? (
          <EmptyState 
            icon={ArrowsRightLeftIcon}
            title="No transactions yet"
            description="Your wallet activity will appear here once you fund your escrow or complete a contract."
            action={{
              label: "Fund Wallet",
              onClick: () => console.log("Fund wallet modal")
            }}
          />
        ) : (
          <motion.div 
            className="bg-[#181D1A] border border-white/5 rounded-3xl overflow-hidden shadow-xl"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-white/5 bg-[#101312]/50 text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider">
              <div className="col-span-4">Transaction</div>
              <div className="col-span-3">Counterparty</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-3 text-right">Amount</div>
            </div>
            
            <div className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <motion.div 
                  key={tx.id} 
                  variants={itemVariants}
                  className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-white/[0.02] transition-colors interactive cursor-pointer"
                >
                  <div className="col-span-4 flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                      tx.incoming ? 'bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]' : 'bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]'
                    }`}>
                      {tx.incoming ? <ArrowDownLeftIcon className="w-5 h-5" /> : <ArrowUpRightIcon className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="text-[#F5F5F4] font-medium">{tx.type}</div>
                      <div className={`text-xs mt-1 ${tx.status === 'Failed' ? 'text-[#EF4444]' : tx.status === 'Locked' ? 'text-[#F59E0B]' : 'text-[#84CC16]'}`}>
                        {tx.status}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-3 text-[#A3A3A3] font-medium">
                    {tx.counterparty}
                  </div>
                  
                  <div className="col-span-2 text-[#A3A3A3] text-sm">
                    {tx.date}
                  </div>
                  
                  <div className={`col-span-3 text-right text-xl font-bold tracking-tight ${tx.incoming ? 'text-[#22C55E]' : 'text-[#F5F5F4]'}`}>
                    {tx.amount}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
