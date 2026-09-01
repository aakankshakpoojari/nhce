"use client";

import { useState } from "react";
import { conversations, MockConversation } from "@/lib/mock-data";
import { PaperAirplaneIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function MessagesPage() {
  const [activeConvId, setActiveConvId] = useState<string>(conversations[0].id);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];
  
  const filteredConvs = conversations.filter(c => 
    c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex-1 w-full mx-auto px-6 py-8 flex flex-col h-[calc(100vh-80px)]">
      <div className="flex flex-col mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
          Messages
        </h1>
        <p className="text-muted text-sm">
          Communicate with clients, negotiate milestones, and coordinate project delivery.
        </p>
      </div>

      <div className="flex-1 bg-surface border border-surface-border rounded-2xl overflow-hidden flex min-h-0">
        
        {/* Sidebar */}
        <div className="w-1/3 border-r border-surface-border flex flex-col min-h-0">
          <div className="p-4 border-b border-surface-border">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-surface-border rounded-xl py-2 pl-9 pr-4 text-sm text-foreground placeholder-[#A3A3A3] focus:outline-none focus:border-moss"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.map(conv => (
              <div 
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`p-4 border-b border-surface-border cursor-pointer transition-colors ${
                  activeConvId === conv.id ? "bg-background border-l-2 border-l-[#84CC16]" : "hover:bg-background/50 border-l-2 border-l-transparent"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-background border border-surface-border flex items-center justify-center text-foreground font-bold text-xs shrink-0">
                      {conv.clientAvatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground leading-tight">{conv.clientName}</h4>
                      <p className="text-[10px] font-mono text-moss leading-tight mt-0.5 truncate max-w-[150px]">{conv.projectTitle}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-muted shrink-0 whitespace-nowrap ml-2">
                    {conv.lastMessageTime}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-muted truncate pr-2">
                    {conv.lastMessage}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="h-4 min-w-4 px-1 rounded-full bg-moss text-background font-bold text-[10px] flex items-center justify-center shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col min-h-0 bg-background">
          {/* Chat Header */}
          <div className="p-4 border-b border-surface-border flex justify-between items-center bg-surface">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-background border border-surface-border flex items-center justify-center text-foreground font-bold text-sm">
                {activeConv.clientAvatar}
              </div>
              <div>
                <h3 className="font-bold text-foreground">{activeConv.clientName}</h3>
                <p className="text-xs text-muted">
                  Project: <span className="text-moss font-mono">{activeConv.projectTitle}</span>
                </p>
              </div>
            </div>
            <a 
              href={`/client/${activeConv.clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
              className="px-3 py-1.5 rounded-lg border border-surface-border text-xs font-semibold text-muted hover:text-foreground hover:bg-surface-border/50 transition-colors"
            >
              View Profile
            </a>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeConv.messages.map((msg) => {
              const isMe = msg.senderId === "me";
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className="flex items-end gap-2 max-w-[80%]">
                    {!isMe && (
                      <div className="h-6 w-6 rounded-full bg-surface border border-surface-border flex items-center justify-center text-foreground font-bold text-[10px] mb-1 shrink-0">
                        {activeConv.clientAvatar}
                      </div>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl ${
                      isMe 
                        ? "bg-moss text-background rounded-br-sm" 
                        : "bg-surface border border-surface-border text-foreground rounded-bl-sm"
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono text-muted mt-1 ${isMe ? "mr-1" : "ml-9"}`}>
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-surface-border bg-surface">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if(inputText.trim()) {
                  console.log("Send:", inputText);
                  setInputText("");
                }
              }}
              className="flex items-center gap-2"
            >
              <input 
                type="text"
                placeholder="Write a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-background border border-surface-border rounded-xl py-3 px-4 text-sm text-foreground placeholder-[#A3A3A3] focus:outline-none focus:border-moss"
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="h-11 w-11 rounded-xl bg-moss text-background flex items-center justify-center hover:bg-[#65A30D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </main>
  );
}
