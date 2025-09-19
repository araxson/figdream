"use client";

import { format } from "date-fns";
import { Paperclip, Download, Reply, Forward, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Message, MessageThread } from "../dal/messages-types";

interface MessageDetailProps {
  thread: MessageThread;
  messages: Message[];
  onReply: () => void;
  onForward: () => void;
  onDelete: (messageId: string) => void;
  isLoading?: boolean;
}

export function MessageDetail({
  thread,
  messages,
  onReply,
  onForward,
  onDelete,
  isLoading,
}: MessageDetailProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{thread.subject}</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onReply}>
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
            <Button size="sm" variant="outline" onClick={onForward}>
              <Forward className="h-4 w-4 mr-2" />
              Forward
            </Button>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <ScrollArea className="flex-1">
        <CardContent className="pt-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={message.sender?.avatar_url || undefined}
                      />
                      <AvatarFallback>
                        {message.sender?.full_name?.charAt(0) ||
                          message.sender?.email?.charAt(0) ||
                          "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {message.sender?.full_name || message.sender?.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(message.created_at), "PPp")}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete(message.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-2">
                      Attachments ({message.attachments.length})
                    </p>
                    <div className="space-y-1">
                      {message.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={attachment.file_url}
                          download={attachment.file_name}
                          className="flex items-center gap-2 text-sm hover:underline"
                        >
                          <Paperclip className="h-3 w-3" />
                          <span>{attachment.file_name}</span>
                          <span className="text-muted-foreground">
                            ({(attachment.file_size / 1024).toFixed(1)} KB)
                          </span>
                          <Download className="h-3 w-3 ml-auto" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
