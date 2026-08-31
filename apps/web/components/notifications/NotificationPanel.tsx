"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { initialNotifications, MockNotification } from "@/lib/mock-data";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function NotificationPanel({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState<MockNotification[]>(initialNotifications);
  const router = useRouter();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (notification: MockNotification) => {
    markAsRead(notification.id);
    if (notification.href) {
      router.push(notification.href);
      onClose();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return <div className="w-8 h-8 rounded-full bg-moss/20 flex items-center justify-center text-moss font-bold">M</div>;
      case 'proposal':
        return <div className="w-8 h-8 rounded-full bg-[#22C55E]/20 flex items-center justify-center text-[#22C55E] font-bold">P</div>;
      case 'message':
        return <div className="w-8 h-8 rounded-full bg-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6] font-bold">@</div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">!</div>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute top-16 right-8 w-96 bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-3xl"
    >
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-background/80">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          Notifications
          {unreadCount > 0 && (
            <span className="bg-moss text-background text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </h3>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
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
        <AnimatePresence>
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted text-sm">
              No notifications yet.
            </div>
          ) : (
            notifications.map(notification => (
              <motion.div 
                key={notification.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 border-b border-white/5 last:border-0 flex gap-3 cursor-pointer transition-colors interactive ${
                  notification.isRead ? 'opacity-60 hover:opacity-100 hover:bg-white/5' : 'bg-white/[0.03] hover:bg-white/10'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${notification.isRead ? 'text-muted' : 'text-foreground font-medium'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted mt-1.5">{notification.time}</p>
                </div>
                {!notification.isRead && (
                  <button 
                    onClick={(e) => markAsRead(notification.id, e)}
                    className="flex-shrink-0 self-start text-muted hover:text-moss transition-colors p-1"
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
      
      {notifications.length > 0 && (
        <div className="p-3 border-t border-white/5 bg-background/80 text-center">
          <button className="text-sm font-medium text-moss hover:text-[#BEF264] transition-colors">
            View all history
          </button>
        </div>
      )}
    </motion.div>
  );
}
