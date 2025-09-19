"use client";

import { formatDistanceToNow } from "date-fns";
import { Mail, Archive, Users, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { MessageThread } from "../dal/messages-types";

interface ThreadListProps {
  threads: MessageThread[];
  selectedThreadId?: string;
  onSelectThread: (thread: MessageThread) => void;
  isLoading?: boolean;
}

export function ThreadList({
  threads,
  selectedThreadId,
  onSelectThread,
  isLoading,
}: ThreadListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Mail className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No messages yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-2 pr-4">
        {threads.map((thread) => (
          <Card
            key={thread.id}
            className={cn(
              "cursor-pointer",
              selectedThreadId === thread.id && "border-primary",
            )}
            onClick={() => onSelectThread(thread)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium line-clamp-1">{thread.subject}</h4>
                {thread.unread_count > 0 && (
                  <Badge variant="default" className="ml-2">
                    {thread.unread_count}
                  </Badge>
                )}
              </div>

              {thread.last_message && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {thread.last_message.content}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  <span>{thread.participant_count} participants</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(thread.last_message_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>

              {thread.is_archived && (
                <div className="flex items-center gap-1 mt-2">
                  <Archive className="h-3 w-3" />
                  <span className="text-xs">Archived</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
