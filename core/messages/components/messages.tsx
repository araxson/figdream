"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThreadList } from "./thread-list";
import { MessageDetail } from "./message-detail";
import { ComposeMessage } from "./compose-message";
import { useMessages } from "../hooks/use-messages";
import type { MessageThread, CreateMessageInput, MessageStats, ParticipantUser } from "../dal/messages-types";

interface MessagesProps {
  userId?: string;
  salonId?: string;
  role?: string;
}

export function Messages({ userId, salonId, role }: MessagesProps) {
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(
    null,
  );
  const [isComposing, setIsComposing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"inbox" | "archived">("inbox");

  const {
    threads,
    messages,
    users,
    stats,
    isLoading,
    sendMessage,
    markAsRead,
    archiveThread: archive,
    deleteMessage,
  } = useMessages({ userId: userId || "", salonId });

  // Type assertions for better type safety
  const typedUsers = (users as ParticipantUser[]).map(user => ({
    id: user.id,
    email: user.email,
    full_name: user.full_name || undefined
  }));
  const typedStats = stats as MessageStats | undefined;

  const filteredThreads = threads.filter((thread: MessageThread) => {
    const matchesSearch =
      !searchTerm ||
      thread.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTab === "archived" ? thread.is_archived : !thread.is_archived;
    return matchesSearch && matchesTab;
  });

  const handleSelectThread = (thread: MessageThread) => {
    setSelectedThread(thread);
    if (thread.unread_count > 0) {
      markAsRead(thread.id);
    }
  };

  const handleSendMessage = async (input: CreateMessageInput) => {
    await sendMessage(input);
    setIsComposing(false);
  };

  const handleReply = () => {
    setIsComposing(true);
  };

  const handleForward = () => {
    // TODO: Implement forward functionality
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Thread List */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Messages</CardTitle>
              <Button size="sm" onClick={() => setIsComposing(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "inbox" | "archived")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="inbox">
                  Inbox{" "}
                  {typedStats?.unread_messages &&
                    typedStats.unread_messages > 0 &&
                    `(${typedStats.unread_messages})`}
                </TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
              <TabsContent value="inbox" className="mt-4">
                <ThreadList
                  threads={filteredThreads}
                  selectedThreadId={selectedThread?.id}
                  onSelectThread={handleSelectThread}
                  isLoading={isLoading}
                />
              </TabsContent>
              <TabsContent value="archived" className="mt-4">
                <ThreadList
                  threads={filteredThreads}
                  selectedThreadId={selectedThread?.id}
                  onSelectThread={handleSelectThread}
                  isLoading={isLoading}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Message Detail or Compose */}
      <div className="lg:col-span-2">
        {isComposing ? (
          <ComposeMessage
            users={typedUsers}
            threadId={selectedThread?.id}
            onSend={handleSendMessage}
            onCancel={() => setIsComposing(false)}
            isLoading={isLoading}
          />
        ) : selectedThread ? (
          <MessageDetail
            thread={selectedThread}
            messages={messages}
            onReply={handleReply}
            onForward={handleForward}
            onDelete={deleteMessage}
            isLoading={isLoading}
          />
        ) : (
          <Card className="h-[calc(100vh-12rem)] flex items-center justify-center">
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Select a conversation to view messages
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
