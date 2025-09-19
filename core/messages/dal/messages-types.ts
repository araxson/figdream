export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  read_at?: string | null;
  attachment_urls?: string[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  attachments?: MessageAttachment[];
  sender?: MessageSender;
  thread?: MessageThread;
}

export interface MessageThread {
  id: string;
  subject: string;
  salon_id?: string | null;
  created_by: string;
  last_message_at: string;
  message_count: number;
  unread_count: number;
  participant_count: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  participants?: ThreadParticipant[];
  lastMessage?: Message | null;
  last_message?: Message;
}

export interface ThreadParticipant {
  id: string;
  thread_id: string;
  user_id: string;
  role: "sender" | "recipient" | "cc" | "bcc";
  is_active: boolean;
  last_read_at: string | null;
  joined_at: string;
  left_at: string | null;
  user?: ParticipantUser;
}

export interface ParticipantUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
}

export interface MessageSender {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  uploaded_at: string;
}

export interface MessageFilters {
  thread_id?: string;
  sender_id?: string;
  is_read?: boolean;
  search?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface ThreadFilters {
  salon_id?: string;
  participant_id?: string;
  is_archived?: boolean;
  has_unread?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateMessageInput {
  thread_id?: string;
  subject?: string;
  content: string;
  recipient_ids: string[];
  cc_ids?: string[];
  bcc_ids?: string[];
  attachments?: File[];
}

export interface UpdateMessageInput {
  content?: string;
  is_read?: boolean;
}

export interface MessageStats {
  total_messages: number;
  unread_messages: number;
  total_threads: number;
  active_threads: number;
  archived_threads: number;
}

// Insert/Update types for mock functions
export type MessageInsert = Omit<
  Message,
  | "id"
  | "created_at"
  | "updated_at"
  | "deleted_at"
  | "attachments"
  | "sender"
  | "thread"
>;
export type MessageUpdate = Partial<Pick<Message, "content" | "is_read">>;
export type ThreadInsert = Pick<MessageThread, "subject" | "salon_id"> & {
  participant_ids: string[];
};
export type ThreadUpdate = Partial<
  Pick<MessageThread, "subject" | "is_archived">
>;

// Extended types with relations
export interface MessageThreadWithDetails extends MessageThread {
  participants: ThreadParticipant[];
  lastMessage: Message | null;
}

export interface MessageWithSender extends Message {
  sender: MessageSender;
}

export interface ThreadWithMessages extends MessageThread {
  messages: Message[];
}

// Filter extensions
export interface ThreadFilters {
  salonId?: string;
  salon_id?: string;
  participant_id?: string;
  isArchived?: boolean;
  is_archived?: boolean;
  has_unread?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}
