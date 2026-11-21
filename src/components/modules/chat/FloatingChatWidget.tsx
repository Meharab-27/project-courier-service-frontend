"use client";

import {
  ArrowRight,
  Bot,
  Compass,
  ExternalLink,
  MapPin,
  Phone,
  RotateCcw,
  Send,
  Sparkles,
  Warehouse,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import type { IChatHub } from "@/api/chat.api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useClearChatHistory, useSendChatMessage } from "@/hooks/chat.hooks";

interface IMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  hubs?: IChatHub[];
  timestamp: Date;
}

const SESSION_STORAGE_KEY = "courier_chat_session_id";

const QUICK_STARTERS = [
  "Khulna hub contact number & address",
  "উত্তরা হাবের ঠিকানা ও মোবাইল নাম্বার কত?",
  "How is parcel delivery cost calculated?",
  "How can I track or cancel my parcel?",
];

/**
 * Parses markdown inline bold (**...**) and links ([label](url))
 * safely into React elements without dangerouslySetInnerHTML.
 */
function parseInlineMarkdown(text: string): React.ReactNode[] {
  const regex = /(\[.*?\]\(https?:\/\/[^\s)]+\)|\*\*.*?\*\*)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Check [label](url)
    const linkMatch = part.match(/^\[(.*?)\]\((https?:\/\/[^\s)]+)\)$/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
        >
          <span>{label}</span>
          <ExternalLink className="size-2.5 inline shrink-0 opacity-80" />
        </a>
      );
    }

    // Check **bold**
    const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
    if (boldMatch) {
      return (
        <strong key={index} className="font-bold text-foreground">
          {boldMatch[1]}
        </strong>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

/**
 * Formats multi-line text with bullets, bolding, and links cleanly.
 */
function renderFormattedMessage(text: string) {
  const lines = text.split("\n");

  return (
    <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lineIdx} className="h-1" />;
        }

        const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ");
        const content = isBullet ? trimmed.slice(2) : line;
        const elements = parseInlineMarkdown(content);

        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 pl-1">
              <span className="text-primary mt-1 text-[10px] leading-none select-none">
                •
              </span>
              <div className="flex-1">{elements}</div>
            </div>
          );
        }

        return <div key={lineIdx}>{elements}</div>;
      })}
    </div>
  );
}

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const sendMessageMutation = useSendChatMessage();
  const clearChatMutation = useClearChatHistory();

  // Load saved sessionId from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        setSessionId(savedSession);
      }
    }
  }, []);

  // Auto-scroll to newest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, sendMessageMutation.isPending, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || sendMessageMutation.isPending) return;

    const userMessage: IMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await sendMessageMutation.mutateAsync({
        message: trimmed,
        sessionId: sessionId || undefined,
      });

      if (response?.data) {
        const { sessionId: newSessionId, answer, hubs } = response.data;

        // Persist session ID
        if (newSessionId) {
          setSessionId(newSessionId);
          if (typeof window !== "undefined") {
            sessionStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
          }
        }

        const assistantMessage: IMessage = {
          id: `assistant-${Date.now()}`,
          sender: "assistant",
          text: answer || "I found information regarding your query.",
          hubs: Array.isArray(hubs) ? hubs : [],
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error && err.message
          ? err.message
          : "Unable to connect to the AI assistant. Please ensure the backend server is running.";

      const assistantError: IMessage = {
        id: `assistant-error-${Date.now()}`,
        sender: "assistant",
        text: `⚠️ **Error:** ${errorMessage}\n\nPlease try again or verify that the chatbot service is reachable.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantError]);
      toast.add({
        title: "Chat Request Failed",
        description: errorMessage,
        type: "error",
      });
    }
  };

  const handleNewChat = async () => {
    if (sessionId) {
      try {
        await clearChatMutation.mutateAsync(sessionId);
      } catch {
        // Silently continue clearing local state even if remote clear fails
      }
    }

    setSessionId(null);
    setMessages([]);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }

    toast.add({
      title: "Chat Reset",
      description: "Started a fresh conversation session.",
      type: "success",
    });

    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  return (
    <>
      {/* Floating Closed Pill / Circular Toggle Button */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 rounded-full bg-primary text-primary-foreground pl-3.5 pr-4 py-3 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-primary-foreground/10"
            aria-label="Open Courier AI Assistant"
          >
            {/* Bot Icon with glowing pulse dot */}
            <div className="relative flex size-8 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground">
              <Bot className="size-5 transition-transform group-hover:rotate-12" />
              <span className="absolute -top-0.5 -right-0.5 flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
              </span>
            </div>

            {/* Label */}
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold tracking-tight leading-tight">
                Ask Courier AI
              </span>
              <span className="text-[10px] text-primary-foreground/80 leading-none">
                Bilingual • 62 Hubs
              </span>
            </div>

            <Sparkles className="size-3.5 text-primary-foreground/90 shrink-0 ml-0.5 animate-pulse" />
          </button>
        </div>
      )}

      {/* Floating Chat Panel (Open State) */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Courier AI Assistant Chat"
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2.5rem)] sm:w-[400px] h-[550px] max-h-[84vh] flex flex-col rounded-2xl border border-border/80 bg-card/95 text-card-foreground shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/70 bg-primary/5 px-4 py-3 backdrop-blur-xs select-none">
            <div className="flex items-center gap-2.5">
              <div className="relative flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <Bot className="size-5" />
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-heading text-sm font-bold text-foreground leading-tight">
                    Courier AI Assistant
                  </h3>
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary font-mono">
                    RAG
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <span className="inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Bilingual • 62 Hubs & Tracking</span>
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleNewChat}
                disabled={messages.length === 0 && !sessionId}
                title="New Chat / Reset History"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="New Chat"
              >
                <RotateCcw className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Close Assistant"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
            {/* Empty State / Welcome Screen */}
            {messages.length === 0 && (
              <div className="py-2 space-y-4">
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-primary">
                    <Sparkles className="size-4" />
                    <span>Instant Regional Courier Intelligence</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Ask questions in <strong>English</strong> or{" "}
                    <strong>বাংলা (Bangla)</strong> about our 62 transit hubs,
                    hotlines, pricing models, or consignment lifecycle.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
                    Suggested Questions
                  </p>
                  <div className="space-y-1.5">
                    {QUICK_STARTERS.map((starter) => (
                      <button
                        key={starter}
                        type="button"
                        onClick={() => handleSendMessage(starter)}
                        disabled={sendMessageMutation.isPending}
                        className="w-full text-left rounded-xl border border-border/80 bg-background/60 hover:bg-primary/5 hover:border-primary/40 p-2.5 text-xs text-foreground/90 transition-all flex items-center justify-between group shadow-2xs cursor-pointer"
                      >
                        <span className="line-clamp-1">{starter}</span>
                        <ArrowRight className="size-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-transform shrink-0 ml-1.5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {messages.map((msg) => {
              const isUser = msg.sender === "user";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isUser ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 max-w-[88%] shadow-2xs ${
                      isUser
                        ? "bg-primary text-primary-foreground rounded-br-xs text-xs sm:text-[13px]"
                        : "bg-muted/70 text-foreground border border-border/70 rounded-bl-xs"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {msg.text}
                      </p>
                    ) : (
                      <>
                        {renderFormattedMessage(msg.text)}

                        {/* Matched Hubs Cards */}
                        {msg.hubs && msg.hubs.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-border/60 space-y-2">
                            <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                              <Warehouse className="size-3.5 text-primary" />
                              <span>
                                Matched Regional Station
                                {msg.hubs.length > 1 ? "s" : ""} (
                                {msg.hubs.length})
                              </span>
                            </div>

                            <div className="space-y-2">
                              {msg.hubs.map((hub) => {
                                const mapUrl =
                                  hub.latitude !== null &&
                                  hub.longitude !== null &&
                                  hub.latitude !== undefined &&
                                  hub.longitude !== undefined
                                    ? `https://www.google.com/maps?q=${hub.latitude},${hub.longitude}`
                                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                        `${hub.name}, ${hub.address}`,
                                      )}`;

                                return (
                                  <div
                                    key={hub.id || hub.code}
                                    className="rounded-xl border border-border/80 bg-background/90 p-2.5 text-xs shadow-2xs space-y-1.5"
                                  >
                                    <div className="flex items-start justify-between gap-1.5">
                                      <div>
                                        <p className="font-bold text-foreground leading-snug">
                                          {hub.name}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                          {hub.zone}
                                        </p>
                                      </div>
                                      {hub.code && (
                                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                                          {hub.code}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-start gap-1 text-[11px] text-muted-foreground">
                                      <MapPin className="size-3 text-primary shrink-0 mt-0.5" />
                                      <span className="line-clamp-2 leading-tight">
                                        {hub.address}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50 text-[11px]">
                                      {hub.contactNo ? (
                                        <a
                                          href={`tel:${hub.contactNo}`}
                                          className="inline-flex items-center gap-1 text-primary hover:underline font-mono font-medium"
                                        >
                                          <Phone className="size-3" />
                                          <span>{hub.contactNo}</span>
                                        </a>
                                      ) : (
                                        <span className="text-muted-foreground italic text-[10px]">
                                          24/7 Dispatch
                                        </span>
                                      )}

                                      <a
                                        href={mapUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-semibold transition-colors"
                                      >
                                        <Compass className="size-3" />
                                        <span>Map</span>
                                        <ExternalLink className="size-2.5 opacity-70" />
                                      </a>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {sendMessageMutation.isPending && (
              <div className="flex items-start gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                  <Bot className="size-4" />
                </div>
                <div className="rounded-2xl rounded-bl-xs bg-muted/70 border border-border/70 px-3.5 py-2.5 shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-primary/60 animate-bounce" />
                    <span className="size-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.2s]" />
                    <span className="size-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] text-muted-foreground ml-1.5">
                      Consulting 62 hubs database...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-border/70 bg-background/80 p-3 backdrop-blur-xs"
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask in English or বাংলা..."
                disabled={sendMessageMutation.isPending}
                className="flex-1 rounded-xl border border-input bg-card px-3 py-2 text-xs sm:text-sm placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!input.trim() || sendMessageMutation.isPending}
                className="rounded-xl px-3 h-9 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 gap-1.5 shadow-xs cursor-pointer"
              >
                {sendMessageMutation.isPending ? (
                  <Spinner className="size-3.5" />
                ) : (
                  <Send className="size-3.5" />
                )}
              </Button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-muted-foreground/70">
              Multi-turn Redis Memory • English & বাংলা Supported
            </p>
          </form>
        </div>
      )}
    </>
  );
}
