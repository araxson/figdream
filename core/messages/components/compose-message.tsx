"use client";

import { useState, useRef } from "react";
import { Send, Paperclip, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { CreateMessageInput } from "../dal/messages-types";

interface ComposeMessageProps {
  users?: Array<{ id: string; email: string; full_name?: string }>;
  threadId?: string;
  replyTo?: string;
  onSend: (input: CreateMessageInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ComposeMessage({
  users = [],
  threadId,
  replyTo,
  onSend,
  onCancel,
  isLoading,
}: ComposeMessageProps) {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [ccRecipients, setCcRecipients] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;
    if (!threadId && recipients.length === 0) return;

    onSend({
      thread_id: threadId,
      subject: !threadId ? subject : undefined,
      content,
      recipient_ids: recipients,
      cc_ids: ccRecipients.length > 0 ? ccRecipients : undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const addRecipient = (userId: string, type: "to" | "cc") => {
    if (type === "to" && !recipients.includes(userId)) {
      setRecipients((prev) => [...prev, userId]);
    } else if (type === "cc" && !ccRecipients.includes(userId)) {
      setCcRecipients((prev) => [...prev, userId]);
    }
  };

  const removeRecipient = (userId: string, type: "to" | "cc") => {
    if (type === "to") {
      setRecipients((prev) => prev.filter((id) => id !== userId));
    } else {
      setCcRecipients((prev) => prev.filter((id) => id !== userId));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{threadId ? "Reply to Message" : "New Message"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!threadId && (
            <>
              <div>
                <Label htmlFor="recipients">To</Label>
                <Select onValueChange={(value) => addRecipient(value, "to")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1 mt-2">
                  {recipients.map((id) => {
                    const user = users.find((u) => u.id === id);
                    return (
                      <Badge key={id} variant="secondary">
                        {user?.full_name || user?.email}
                        <button
                          type="button"
                          onClick={() => removeRecipient(id, "to")}
                          className="ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label htmlFor="cc">CC (Optional)</Label>
                <Select onValueChange={(value) => addRecipient(value, "cc")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select CC recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1 mt-2">
                  {ccRecipients.map((id) => {
                    const user = users.find((u) => u.id === id);
                    return (
                      <Badge key={id} variant="secondary">
                        {user?.full_name || user?.email}
                        <button
                          type="button"
                          onClick={() => removeRecipient(id, "cc")}
                          className="ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter message subject"
                  required={!threadId}
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="content">Message</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message here..."
              rows={8}
              required
            />
          </div>

          <div>
            <Label>Attachments</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Attach Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="outline">
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </Badge>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !content.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
