"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PaperAirplaneIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { useApiFetch } from "@/hooks/useApiFetch";
import {
  fetchConversations,
  fetchMessages,
  sendMessage as sendMessageApi,
  markConversationRead,
  type ConversationDTO,
  type MessageDTO,
} from "@/lib/messagesApi";
import { getSocket } from "@/lib/messagesSocket";

/* ------------------------------ helpers ------------------------------ */

function displayName(name: string | null, email: string | null): string {
  return name || email?.split("@")[0] || "Unknown";
}

function initials(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatBubbleTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return time;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${time}`;
}

function formatListTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays < 2) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/* ------------------------------ page ------------------------------ */

export default function MessagesPage() {
  const { user, token, isLoading: authLoading } = useAuth();

  const {
    data: convData,
    isLoading: convLoading,
    error: convError,
    reload: reloadConversations,
    setData: setConvData,
  } = useApiFetch<ConversationDTO[]>(async () => {
    if (!token) return [];
    const res = await fetchConversations(token);
    return res.conversations;
  }, [authLoading, token]);

  const conversations = useMemo(() => convData ?? [], [convData]);

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const otherParticipant = useCallback(
    (c: ConversationDTO) =>
      c.participants.find((p) => p.userId !== user?.id) ?? c.participants[0] ?? null,
    [user?.id]
  );

  const conversationLabel = useCallback(
    (c: ConversationDTO) => {
      const other = otherParticipant(c);
      return other ? displayName(other.name, other.email) : "Conversation";
    },
    [otherParticipant]
  );

  const projectLabel = (c: ConversationDTO) => c.job?.title || "Direct message";

  // Pick the first conversation once the list is available.
  useEffect(() => {
    if (!activeConvId && conversations.length > 0) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;

  const filteredConvs = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      conversationLabel(c).toLowerCase().includes(q) ||
      projectLabel(c).toLowerCase().includes(q)
    );
  });

  const patchConversation = useCallback(
    (id: string, patch: (c: ConversationDTO) => ConversationDTO) => {
      setConvData((prev) => {
        if (!prev) return prev;
        const next = prev.map((c) => (c.id === id ? patch(c) : c));
        next.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        return next;
      });
    },
    [setConvData]
  );

  // Load messages + mark read whenever the active conversation changes.
  useEffect(() => {
    if (!activeConvId || !token) return;
    let cancelled = false;
    setPeerTyping(false);
    setMessagesLoading(true);
    fetchMessages(token, activeConvId, { limit: 100 })
      .then((res) => {
        if (!cancelled) setMessages(res.messages);
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setMessagesLoading(false);
      });

    markConversationRead(token, activeConvId)
      .then(() => patchConversation(activeConvId, (c) => ({ ...c, unreadCount: 0 })))
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [activeConvId, token, patchConversation]);

  // Auto-scroll to the newest message.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, peerTyping]);

  // Realtime subscription.
  useEffect(() => {
    if (!token) return;
    const socket = getSocket(token);

    const onNewMessage = (payload: { conversationId: string; message: MessageDTO }) => {
      const { conversationId, message } = payload;
      const isActive = conversationId === activeConvId;
      const mine = message.senderId === user?.id;

      if (isActive) {
        setMessages((prev) =>
          prev.some((m) => m.id === message.id) ? prev : [...prev, message]
        );
        setPeerTyping(false);
        if (!mine) markConversationRead(token, conversationId).catch(() => {});
      }

      setConvData((prev) => {
        if (!prev) return prev;
        if (!prev.some((c) => c.id === conversationId)) {
          reloadConversations();
          return prev;
        }
        const next = prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                lastMessage: message,
                updatedAt: message.createdAt,
                unreadCount: isActive || mine ? c.unreadCount : c.unreadCount + 1,
              }
            : c
        );
        next.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        return next;
      });
    };

    const onRead = (payload: { conversationId: string; userId: string; lastReadAt: string }) => {
      setConvData((prev) =>
        prev
          ? prev.map((c) =>
              c.id === payload.conversationId
                ? {
                    ...c,
                    participants: c.participants.map((p) =>
                      p.userId === payload.userId ? { ...p, lastReadAt: payload.lastReadAt } : p
                    ),
                  }
                : c
            )
          : prev
      );
    };

    const onMessageMutated = (payload: { conversationId: string; message: MessageDTO }) => {
      if (payload.conversationId !== activeConvId) return;
      setMessages((prev) => prev.map((m) => (m.id === payload.message.id ? payload.message : m)));
    };

    const onTyping = (payload: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (payload.conversationId !== activeConvId || payload.userId === user?.id) return;
      setPeerTyping(payload.isTyping);
    };

    socket.on("message:new", onNewMessage);
    socket.on("conversation:read", onRead);
    socket.on("message:updated", onMessageMutated);
    socket.on("message:deleted", onMessageMutated);
    socket.on("typing", onTyping);

    return () => {
      socket.off("message:new", onNewMessage);
      socket.off("conversation:read", onRead);
      socket.off("message:updated", onMessageMutated);
      socket.off("message:deleted", onMessageMutated);
      socket.off("typing", onTyping);
    };
  }, [token, activeConvId, user?.id, setConvData, reloadConversations]);

  // Join / leave the active conversation room.
  useEffect(() => {
    if (!token || !activeConvId) return;
    const socket = getSocket(token);
    socket.emit("conversation:join", activeConvId);
    return () => {
      socket.emit("conversation:leave", activeConvId);
    };
  }, [token, activeConvId]);

  const handleInputChange = (value: string) => {
    setInputText(value);
    if (!token || !activeConvId) return;
    const socket = getSocket(token);
    socket.emit("typing", { conversationId: activeConvId, isTyping: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { conversationId: activeConvId, isTyping: false });
    }, 1500);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = inputText.trim();
    if (!content || !activeConvId || !token || sending) return;
    setSending(true);
    try {
      const { message } = await sendMessageApi(token, activeConvId, content);
      setInputText("");
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      patchConversation(activeConvId, (c) => ({
        ...c,
        lastMessage: message,
        updatedAt: message.createdAt,
        unreadCount: 0,
      }));
      getSocket(token).emit("typing", { conversationId: activeConvId, isTyping: false });
    } catch {
      /* keep the text in the box so the user can retry */
    } finally {
      setSending(false);
    }
  };

  const loading = authLoading || convLoading;

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
            {loading ? (
              <p className="p-4 text-xs text-muted font-mono">Loading conversations…</p>
            ) : !user ? (
              <p className="p-4 text-xs text-muted">Sign in to view your messages.</p>
            ) : convError ? (
              <div className="p-4 space-y-2">
                <p className="text-xs text-[#EF4444]">{convError}</p>
                <button
                  onClick={reloadConversations}
                  className="text-xs font-semibold text-moss hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : filteredConvs.length === 0 ? (
              <p className="p-4 text-xs text-muted">No conversations yet.</p>
            ) : (
              filteredConvs.map((conv) => {
                const label = conversationLabel(conv);
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`p-4 border-b border-surface-border cursor-pointer transition-colors ${
                      activeConvId === conv.id
                        ? "bg-background border-l-2 border-l-[#84CC16]"
                        : "hover:bg-background/50 border-l-2 border-l-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-background border border-surface-border flex items-center justify-center text-foreground font-bold text-xs shrink-0">
                          {initials(label)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground leading-tight">{label}</h4>
                          <p className="text-[10px] font-mono text-moss leading-tight mt-0.5 truncate max-w-[150px]">{projectLabel(conv)}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-muted shrink-0 whitespace-nowrap ml-2">
                        {formatListTime(conv.lastMessage?.createdAt ?? conv.updatedAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-muted truncate pr-2">
                        {conv.lastMessage
                          ? conv.lastMessage.isDeleted
                            ? "Message deleted"
                            : conv.lastMessage.content
                          : "No messages yet"}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="h-4 min-w-4 px-1 rounded-full bg-moss text-background font-bold text-[10px] flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col min-h-0 bg-background">
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center p-6 text-sm text-muted">
              {loading
                ? "Loading…"
                : !user
                ? "Sign in to start messaging."
                : "Select a conversation to start messaging."}
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-surface-border flex justify-between items-center bg-surface">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-background border border-surface-border flex items-center justify-center text-foreground font-bold text-sm">
                    {initials(conversationLabel(activeConv))}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{conversationLabel(activeConv)}</h3>
                    <p className="text-xs text-muted">
                      Project: <span className="text-moss font-mono">{projectLabel(activeConv)}</span>
                    </p>
                  </div>
                </div>
                <a
                  href={`/client/${conversationLabel(activeConv).toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                  className="px-3 py-1.5 rounded-lg border border-surface-border text-xs font-semibold text-muted hover:text-foreground hover:bg-surface-border/50 transition-colors"
                >
                  View Profile
                </a>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messagesLoading ? (
                  <p className="text-xs text-muted font-mono">Loading messages…</p>
                ) : messages.length === 0 ? (
                  <p className="text-xs text-muted">No messages yet. Say hello 👋</p>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <div className="flex items-end gap-2 max-w-[80%]">
                          {!isMe && (
                            <div className="h-6 w-6 rounded-full bg-surface border border-surface-border flex items-center justify-center text-foreground font-bold text-[10px] mb-1 shrink-0">
                              {initials(conversationLabel(activeConv))}
                            </div>
                          )}
                          <div className={`px-4 py-2.5 rounded-2xl ${
                            isMe
                              ? "bg-moss text-background rounded-br-sm"
                              : "bg-surface border border-surface-border text-foreground rounded-bl-sm"
                          }`}>
                            <p className={`text-sm ${msg.isDeleted ? "italic opacity-70" : ""}`}>
                              {msg.isDeleted ? "This message was deleted" : msg.content}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono text-muted mt-1 ${isMe ? "mr-1" : "ml-9"}`}>
                          {formatBubbleTime(msg.createdAt)}
                          {msg.editedAt && !msg.isDeleted ? " · edited" : ""}
                        </span>
                      </div>
                    );
                  })
                )}
                {peerTyping && (
                  <p className="text-[10px] font-mono text-muted ml-9">typing…</p>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-surface-border bg-surface">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Write a message..."
                    value={inputText}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="flex-1 bg-background border border-surface-border rounded-xl py-3 px-4 text-sm text-foreground placeholder-[#A3A3A3] focus:outline-none focus:border-moss"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="h-11 w-11 rounded-xl bg-moss text-background flex items-center justify-center hover:bg-[#65A30D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

      </div>
    </main>
  );
}
