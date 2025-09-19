"use server";

// TODO: Implement message actions when database tables are ready
// This file will contain server actions for messages functionality

import type {
  ThreadFilters,
  MessageFilters,
  CreateMessageInput,
  MessageInsert,
} from "../dal/messages-types";

// Placeholder exports to prevent errors
export async function getThreadsAction(_filters: ThreadFilters = {}) {
  throw new Error("Messages feature not yet implemented");
}

export async function getMessagesAction(
  _threadId: string,
  _filters: MessageFilters = {},
) {
  throw new Error("Messages feature not yet implemented");
}

export async function getMessageStatsAction(_userId: string) {
  throw new Error("Messages feature not yet implemented");
}

export async function getUnreadMessagesAction(_userId: string) {
  throw new Error("Messages feature not yet implemented");
}

export async function searchMessagesAction(
  _searchTerm: string,
  _filters: MessageFilters = {},
) {
  throw new Error("Messages feature not yet implemented");
}

export async function sendMessageAction(_input: CreateMessageInput) {
  throw new Error("Messages feature not yet implemented");
}

export async function markThreadAsReadAction(_threadId: string) {
  throw new Error("Messages feature not yet implemented");
}

export async function archiveThreadAction(_threadId: string) {
  throw new Error("Messages feature not yet implemented");
}

export async function unarchiveThreadAction(_threadId: string) {
  throw new Error("Messages feature not yet implemented");
}

export async function deleteMessageAction(_messageId: string) {
  throw new Error("Messages feature not yet implemented");
}