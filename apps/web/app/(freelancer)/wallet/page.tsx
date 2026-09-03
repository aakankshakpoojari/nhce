"use client";

import { ArrowsRightLeftIcon, ArrowUpRightIcon, ArrowDownLeftIcon } from "@heroicons/react/24/outline";
import EmptyState from "@/components/ui/EmptyState";
import { motion, type Variants } from "framer-motion";

import { transactions } from "@/lib/mock-data";

export default function WalletPage() {
  const stats = [
    { label: "Total Balance", value: "$18,500.00" },
    { label: "Escrowed Funds", value: "$4,000.00" },
    { label: "Available to Withdraw", value: "$14,500.00" },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] as const } }
  };

  return (
    <main className="flex-1 w-full mx-auto px-6 py-8 space-y-8">
      <div className="flex flex-col items-start mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
          Wallet
        </h1>
        <p className="text-muted text-sm">
          Manage your earnings and withdraw to your linked accounts.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="flex-1 bg-surface border border-surface-border rounded-2xl p-8 flex flex-col justify-center transition-all duration-700 ease-[var(--ease-fluid)] hover:-translate-y-2 hover:shadow-2xl"
          >
            <span className="text-muted font-medium text-xs uppercase tracking-wider mb-2">{stat.label}</span>
            <span className={`text-4xl font-bold tracking-tighter ${i === 0 ? 'text-foreground' : 'text-moss'}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

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
        /* Transaction History */
        <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-surface-border flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground tracking-tight">Recent Transactions</h2>
            <button className="text-moss text-sm font-mono font-semibold hover:underline">View All</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background border-b border-surface-border">
                  <th className="px-6 py-4 text-[10px] font-mono font-semibold text-muted uppercase tracking-wider">Transaction</th>
                  <th className="px-6 py-4 text-[10px] font-mono font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="px-6 py-4 text-[10px] font-mono font-semibold text-muted uppercase tracking-wider text-right">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-mono font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-surface-border hover:bg-background transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground text-sm">{tx.type}</div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-xs font-mono text-muted">
                      {tx.date}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-mono font-bold text-sm ${tx.incoming ? "text-moss" : "text-foreground"}`}>
                        {tx.incoming ? "+" : "-"}{tx.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider border ${
                        tx.status === "Completed" ? "bg-moss/10 text-moss border-moss/30" :
                        tx.status === "Pending" ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30" :
                        "bg-background text-muted border-surface-border"
                      }`}>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
