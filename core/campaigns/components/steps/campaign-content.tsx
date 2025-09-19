"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Code,
  Eye,
  Image,
  Link,
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Smartphone,
  Monitor,
  Variable,
} from "lucide-react";
import type { CampaignData } from "../../dal/campaigns-types";

interface CampaignContentProps {
  data: Partial<CampaignData>;
  errors: Record<string, string>;
  onChange: (updates: Partial<CampaignData>) => void;
}

const PERSONALIZATION_TOKENS = [
  { key: "{{customer_name}}", label: "Customer Name" },
  { key: "{{first_name}}", label: "First Name" },
  { key: "{{last_name}}", label: "Last Name" },
  { key: "{{salon_name}}", label: "Salon Name" },
  { key: "{{appointment_date}}", label: "Appointment Date" },
  { key: "{{appointment_time}}", label: "Appointment Time" },
  { key: "{{service_name}}", label: "Service Name" },
  { key: "{{staff_name}}", label: "Staff Name" },
  { key: "{{discount_code}}", label: "Discount Code" },
  { key: "{{reward_points}}", label: "Reward Points" },
];

export function CampaignContent({ data, errors, onChange }: CampaignContentProps) {
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("desktop");
  const [activeTab, setActiveTab] = useState(data.type === "email" ? "editor" : "text");
  const [selectedText, setSelectedText] = useState("");

  const handleContentChange = (content: string) => {
    onChange({ content });
    // Auto-generate HTML for email campaigns
    if (data.type === "email" && activeTab === "editor") {
      const htmlContent = convertToHtml(content);
      onChange({ html_content: htmlContent });
    }
  };

  const convertToHtml = (text: string): string => {
    // Simple conversion - in production would use a proper markdown/rich text editor
    let html = text
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br />")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Replace personalization tokens with styled spans
    PERSONALIZATION_TOKENS.forEach(token => {
      html = html.replace(
        new RegExp(token.key.replace(/[{}]/g, "\\$&"), "g"),
        `<span class="token">${token.key}</span>`
      );
    });

    return `<p>${html}</p>`;
  };

  const insertToken = (token: string) => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newContent = before + token + after;
      onChange({ content: newContent });

      // Reset cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + token.length, start + token.length);
      }, 0);
    }
  };

  const characterCount = data.content?.length || 0;
  const smsCharacterLimit = 160;
  const smsSegments = Math.ceil(characterCount / smsCharacterLimit);

  return (
    <div className="space-y-6">
      {data.type === "email" ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="editor">
              <FileText className="mr-2 h-4 w-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="html">
              <Code className="mr-2 h-4 w-4" />
              HTML
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4">
            {/* Email Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Email Content *</Label>
                  <div className="border rounded-lg">
                    {/* Toolbar */}
                    <div className="border-b p-2 flex flex-wrap gap-1">
                      <Button size="sm" variant="ghost">
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Italic className="h-4 w-4" />
                      </Button>
                      <div className="w-px bg-border mx-1" />
                      <Button size="sm" variant="ghost">
                        <List className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <ListOrdered className="h-4 w-4" />
                      </Button>
                      <div className="w-px bg-border mx-1" />
                      <Button size="sm" variant="ghost">
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <AlignRight className="h-4 w-4" />
                      </Button>
                      <div className="w-px bg-border mx-1" />
                      <Button size="sm" variant="ghost">
                        <Link className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Image className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      id="content"
                      placeholder="Write your email content here..."
                      value={data.content || ""}
                      onChange={(e) => handleContentChange(e.target.value)}
                      rows={15}
                      className={`border-0 focus:ring-0 ${errors.content ? "text-destructive" : ""}`}
                    />
                  </div>
                  {errors.content && (
                    <p className="text-sm text-destructive">{errors.content}</p>
                  )}
                </div>
              </div>

              {/* Personalization Sidebar */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center">
                      <Variable className="mr-2 h-4 w-4" />
                      Personalization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {PERSONALIZATION_TOKENS.map((token) => (
                          <Button
                            key={token.key}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => insertToken(token.key)}
                          >
                            <code className="mr-2">{token.key}</code>
                            <span className="text-muted-foreground">{token.label}</span>
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="html" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="html_content">HTML Content</Label>
              <Textarea
                id="html_content"
                placeholder="<html>...</html>"
                value={data.html_content || ""}
                onChange={(e) => onChange({ html_content: e.target.value })}
                rows={15}
                className="font-mono text-sm"
              />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {/* Preview Controls */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant={previewDevice === "desktop" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewDevice("desktop")}
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  Desktop
                </Button>
                <Button
                  variant={previewDevice === "mobile" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewDevice("mobile")}
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  Mobile
                </Button>
              </div>
            </div>

            {/* Preview Frame */}
            <div className="border rounded-lg bg-muted/50 p-4">
              <div
                className={`mx-auto bg-background border rounded-lg shadow-lg ${
                  previewDevice === "mobile" ? "max-w-sm" : "max-w-3xl"
                }`}
              >
                <div className="p-4 border-b">
                  <p className="text-sm text-muted-foreground">Subject:</p>
                  <p className="font-medium">{data.subject || "No subject"}</p>
                </div>
                <div
                  className="p-4"
                  dangerouslySetInnerHTML={{
                    __html: data.html_content || convertToHtml(data.content || ""),
                  }}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        /* SMS Content */
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="sms_content">SMS Message *</Label>
              <div className="flex gap-2">
                <Badge variant={characterCount <= smsCharacterLimit ? "outline" : "destructive"}>
                  {characterCount} / {smsCharacterLimit}
                </Badge>
                {smsSegments > 1 && (
                  <Badge variant="secondary">{smsSegments} segments</Badge>
                )}
              </div>
            </div>
            <Textarea
              id="sms_content"
              placeholder="Type your SMS message here..."
              value={data.content || ""}
              onChange={(e) => onChange({ content: e.target.value })}
              rows={6}
              maxLength={smsCharacterLimit * 3} // Max 3 segments
              className={errors.content ? "border-destructive" : ""}
            />
            {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
            <p className="text-sm text-muted-foreground">
              SMS messages are limited to 160 characters. Longer messages will be sent as multiple segments.
            </p>
          </div>

          {/* SMS Personalization Tokens */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Insert Personalization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {PERSONALIZATION_TOKENS.slice(0, 6).map((token) => (
                  <Button
                    key={token.key}
                    variant="outline"
                    size="sm"
                    onClick={() => insertToken(token.key)}
                  >
                    {token.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SMS Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-sm mx-auto">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm whitespace-pre-wrap">
                    {data.content || "Your message will appear here..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}