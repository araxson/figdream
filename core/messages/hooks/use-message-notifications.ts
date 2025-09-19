"use client";

import { useEffect, useState } from "react";

/**
 * Hook for message notifications
 * TODO: Implement when messages feature is ready
 */
export function useMessageNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // TODO: Subscribe to message notifications
    setUnreadCount(0);
  }, []);

  return {
    unreadCount,
  };
}