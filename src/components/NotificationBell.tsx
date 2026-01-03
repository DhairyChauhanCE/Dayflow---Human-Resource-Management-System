import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface NotificationBellProps {
  notifications: any[];
}

export function NotificationBell({ notifications }: NotificationBellProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const markAllRead = useMutation(api.notifications.markAllNotificationsRead);
  const markRead = useMutation(api.notifications.markNotificationRead);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  const handleMarkRead = async (notificationId: string) => {
    await markRead({ notificationId: notificationId as any });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-slate-300 hover:text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-50">
          <div className="p-4 border-b border-slate-700">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-blue-400 text-sm hover:text-blue-300"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-slate-700 hover:bg-slate-700/50 cursor-pointer ${
                    !notification.read ? "bg-blue-500/10" : ""
                  }`}
                  onClick={() => handleMarkRead(notification._id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm">
                        {notification.title}
                      </h4>
                      <p className="text-slate-300 text-xs mt-1">
                        {notification.message}
                      </p>
                      <p className="text-slate-500 text-xs mt-2">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-slate-400">
                No notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
