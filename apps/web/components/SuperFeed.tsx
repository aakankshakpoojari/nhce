"use client";

import { useState } from "react";

export default function SuperFeed() {
  const [isHovered, setIsHovered] = useState(false);

  // Freelancer Data
  const recentEarners = [
    { name: "Alex K.", amount: "$4,200", role: "Smart Contract Dev" },
    { name: "Sarah M.", amount: "$1,850", role: "UI/UX Designer" },
    { name: "David J.", amount: "$3,100", role: "Fullstack Eng" },
  ];

  const hotProjects = [
    { name: "DeFi Yield Aggregator", bids: 24, time: "2h left" },
    { name: "NFT Marketplace UI", bids: 18, time: "5h left" },
  ];

  return (
    <div className="space-y-8">
      {/* Recent Earners */}
      <div className="bg-[#181D1A] rounded-3xl p-6 border border-white/5 shadow-lg">
        <h3 className="text-lg font-bold text-[#F5F5F4] mb-6 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#84CC16] shadow-[0_0_8px_#84CC16]"></span>
          <span>Recent Earners</span>
        </h3>
        
        <div 
          className="relative h-[216px] overflow-hidden -mx-2 px-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Fade masks for smooth entry/exit */}
          <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-[#181D1A] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[#181D1A] to-transparent z-10 pointer-events-none" />

          <div className={`animate-ticker ${isHovered ? '[animation-play-state:paused]' : ''}`}>
            {/* First Set */}
            <div className="space-y-5 mb-5">
              {recentEarners.map((earner, i) => (
                <div key={`set1-${i}`} className="flex justify-between items-center group cursor-pointer interactive border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <div>
                    <div className="text-[#F5F5F4] font-medium group-hover:text-[#BEF264] transition-colors">
                      {earner.name}
                    </div>
                    <div className="text-xs text-[#A3A3A3]">{earner.role}</div>
                  </div>
                  <div className="text-[#22C55E] font-bold">
                    {earner.amount}
                  </div>
                </div>
              ))}
            </div>
            {/* Duplicated Set for Loop */}
            <div className="space-y-5 mb-5">
              {recentEarners.map((earner, i) => (
                <div key={`set2-${i}`} className="flex justify-between items-center group cursor-pointer interactive border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <div>
                    <div className="text-[#F5F5F4] font-medium group-hover:text-[#BEF264] transition-colors">
                      {earner.name}
                    </div>
                    <div className="text-xs text-[#A3A3A3]">{earner.role}</div>
                  </div>
                  <div className="text-[#22C55E] font-bold">
                    {earner.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hot Projects */}
      <div className="bg-[#181D1A] rounded-3xl p-6 border border-white/5 shadow-lg">
        <h3 className="text-lg font-bold text-[#F5F5F4] mb-6 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B] shadow-[0_0_8px_#F59E0B] animate-pulse"></span>
          <span>Hot Projects</span>
        </h3>
        <div className="space-y-5">
          {hotProjects.map((project, i) => (
            <div key={i} className="group cursor-pointer interactive border-b border-white/5 pb-4 last:border-0 last:pb-0">
              <div className="text-[#F5F5F4] font-medium group-hover:text-[#F59E0B] transition-colors mb-1">
                {project.name}
              </div>
              <div className="flex justify-between text-xs text-[#A3A3A3]">
                <span>{project.bids} Active Bids</span>
                <span>{project.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
