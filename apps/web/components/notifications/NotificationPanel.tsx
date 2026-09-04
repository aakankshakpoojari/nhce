"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import type { NotificationDTO } from "@/lib/notificationsApi";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function typeBadge(type: string) {
  switch (type) {
    case "APPLICATION_ACCEPTED":
      return <div className="w-8 h-8 rounded-full bg-moss/20 flex items-center justify-center text-moss font-bold text-xs">✓</div>;
    case "APPLICATION_RECEIVED":
      return <div className="w-8 h-8 rounded-full bg-[#22C55E]/20 flex items-center justify-center text-[#22C55E] font-bold text-xs">P</div>;
    case "JOB_POSTED":
      return <div className="w-8 h-8 rounded-full bg-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6] font-bold text-xs">J</div>;
    default:
      return <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-foreground font-bold text-xs">!</div>;
  }
}

interface NotificationPanelProps {
  notifications: NotificationDTO[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

export default function NotificationPanel({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onClose,
}: NotificationPanelProps) {
  const router = useRouter();

  const open = (n: NotificationDTO) => {
    if (!n.read) onMarkRead(n.id);
    if (n.link) {
      router.push(n.link);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute top-12 right-0 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-surface border border-surface-border rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-3xl"
    >
      <div className="p-4 border-b border-surface-border flex items-center justify-between bg-background/80">
        <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
          Notifications
          {unreadCount > 0 && (
            <span className="bg-moss text-background text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </h3>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        <AnimatePresence initial={false}>
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted text-sm">No notifications yet.</div>
          ) : (
            notifications.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                onClick={() => open(n)}
                className={`p-4 border-b border-surface-border last:border-0 flex gap-3 cursor-pointer transition-colors ${
                  n.read ? "opacity-60 hover:opacity-100 hover:bg-background/50" : "bg-moss/[0.05] hover:bg-moss/10"
                }`}
              >
                <div className="shrink-0 mt-0.5">{typeBadge(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.read ? "text-muted" : "text-foreground font-semibold"}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.body}</p>
                  <p className="text-[10px] text-muted font-mono mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkRead(n.id);
                    }}
                    className="shrink-0 self-start text-muted hover:text-moss transition-colors p-1"
                    title="Mark as read"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                  </button>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
