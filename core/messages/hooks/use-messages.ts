import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getThreadsAction,
  getMessagesAction,
  getMessageStatsAction,
  getUnreadMessagesAction,
  sendMessageAction,
  markThreadAsReadAction,
  archiveThreadAction,
  deleteMessageAction,
  unarchiveThreadAction,
} from "../actions/messages-actions";
import type {
  MessageThread,
  Message,
  ThreadFilters,
  CreateMessageInput,
  ParticipantUser,
  MessageStats,
  ThreadParticipant,
} from "../dal/messages-types";

interface UseMessagesOptions {
  userId: string;
  salonId?: string;
  filters?: ThreadFilters;
}

export function useMessages({
  userId,
  salonId,
  filters = {},
}: UseMessagesOptions) {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch threads
  const { data: threads = [], isLoading: threadsLoading } = useQuery({
    queryKey: ["message-threads", { ...filters, salon_id: salonId }],
    queryFn: () => getThreadsAction({ ...filters, salon_id: salonId }),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch messages for selected thread
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", selectedThreadId],
    queryFn: () => getMessagesAction(selectedThreadId!),
    enabled: !!selectedThreadId,
  });

  // Fetch message stats
  const { data: stats } = useQuery({
    queryKey: ["message-stats", userId],
    queryFn: () => getMessageStatsAction(userId),
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch unread messages
  const { data: unreadMessages = [] } = useQuery({
    queryKey: ["unread-messages", userId],
    queryFn: () => getUnreadMessagesAction(userId),
    refetchInterval: 30000,
  });

  // Get users from threads for compose
  const users = threads.reduce((acc: ParticipantUser[], thread: MessageThread) => {
    if (thread.participants) {
      thread.participants.forEach((participant: ThreadParticipant) => {
        if (participant.user && !acc.find((u) => u.id === participant.user!.id)) {
          acc.push(participant.user);
        }
      });
    }
    return acc;
  }, []);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (input: CreateMessageInput) => sendMessageAction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-threads"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["message-stats"] });
      toast.success("Message sent successfully");
    },
    onError: (error) => {
      toast.error("Failed to send message");
      console.error(error);
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (threadId: string) => markThreadAsReadAction(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-threads"] });
      queryClient.invalidateQueries({ queryKey: ["unread-messages"] });
      queryClient.invalidateQueries({ queryKey: ["message-stats"] });
    },
    onError: (error) => {
      console.error("Failed to mark as read:", error);
    },
  });

  // Archive thread mutation
  const archiveThreadMutation = useMutation({
    mutationFn: (threadId: string) => archiveThreadAction(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-threads"] });
      toast.success("Thread archived");
    },
    onError: (error) => {
      toast.error("Failed to archive thread");
      console.error(error);
    },
  });

  // Unarchive thread mutation
  const unarchiveThreadMutation = useMutation({
    mutationFn: (threadId: string) => unarchiveThreadAction(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-threads"] });
      toast.success("Thread restored");
    },
    onError: (error) => {
      toast.error("Failed to restore thread");
      console.error(error);
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: string) => deleteMessageAction(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast.success("Message deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete message");
      console.error(error);
    },
  });

  return {
    threads,
    messages,
    users,
    stats,
    unreadMessages,
    selectedThreadId,
    setSelectedThreadId,
    isLoading: threadsLoading || messagesLoading,
    sendMessage: sendMessageMutation.mutate,
    markAsRead: markAsReadMutation.mutate,
    archiveThread: archiveThreadMutation.mutate,
    unarchiveThread: unarchiveThreadMutation.mutate,
    deleteMessage: deleteMessageMutation.mutate,
  };
}
