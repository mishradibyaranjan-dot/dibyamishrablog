import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Trash2 } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

const STORAGE_KEY = "drm-floating-chat:v1";

function loadInitialMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as UIMessage[]) : [];
  } catch {
    return [];
  }
}

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [initialMessages] = useState<UIMessage[]>(() => loadInitialMessages());
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { user } = useAuth();
  const conversationIdRef = useRef<string>(
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `c-${Date.now()}-${Math.random().toString(36).slice(2)}`),
  );
  const loggedIdsRef = useRef<Set<string>>(new Set());

  const { messages, sendMessage, status, setMessages, stop } = useChat({
    id: "floating-chat",
    messages: initialMessages,
    transport: new DefaultChatTransport({ api: "/api/public/chat" }),
  });

  // Log completed messages to the database (auth users only)
  useEffect(() => {
    if (!user) return;
    if (status === "streaming" || status === "submitted") return;
    for (const m of messages) {
      if (loggedIdsRef.current.has(m.id)) continue;
      const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("").trim();
      if (!text) continue;
      loggedIdsRef.current.add(m.id);
      void supabase.from("chatbot_messages").insert({
        user_id: user.id,
        conversation_id: conversationIdRef.current,
        role: m.role === "assistant" ? "assistant" : "user",
        content: text.slice(0, 4000),
      });
    }
  }, [messages, status, user]);

  // Persist to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore quota errors
    }
  }, [messages]);

  // Focus textarea when opening
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }, [open, messages.length, status]);

  const isBusy = status === "submitted" || status === "streaming";

  const handleSubmit = async (message: { text?: string }) => {
    const text = message.text?.trim();
    if (!text || isBusy) return;
    await sendMessage({ text });
  };

  const handleClear = () => {
    setMessages([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        className={cn(
          "fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full",
          "bg-brand-gradient text-white shadow-glow transition-transform hover:scale-105 active:scale-95",
        )}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="AI assistant"
          className={cn(
            "fixed bottom-24 right-5 z-[60] flex w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden",
            "h-[min(560px,calc(100vh-8rem))] rounded-2xl border border-border bg-background shadow-2xl",
          )}
        >
          <header className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-sm font-semibold">Ask Dibya's AI</p>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Clear conversation"
                  onClick={handleClear}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </header>

          <Conversation className="flex-1">
            <ConversationContent className="px-3">
              {messages.length === 0 ? (
                <ConversationEmptyState
                  title="How can I help?"
                  description="Ask about research, projects, case studies, or how to get in touch."
                />
              ) : (
                messages.map((m) => {
                  const text = m.parts
                    .map((p) => (p.type === "text" ? p.text : ""))
                    .join("");
                  return (
                    <Message key={m.id} from={m.role}>
                      <MessageContent>
                        {m.role === "assistant" ? (
                          <MessageResponse>{text}</MessageResponse>
                        ) : (
                          <span className="whitespace-pre-wrap">{text}</span>
                        )}
                      </MessageContent>
                    </Message>
                  );
                })
              )}
              {status === "submitted" && (
                <div className="px-3 py-2 text-sm">
                  <Shimmer>Thinking...</Shimmer>
                </div>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="border-t border-border p-2">
            <PromptInput onSubmit={handleSubmit}>
              <PromptInputTextarea
                ref={textareaRef}
                placeholder="Ask anything..."
              />
              <PromptInputFooter className="justify-end">
                <PromptInputSubmit
                  status={status}
                  disabled={isBusy}
                  onClick={(e) => {
                    if (isBusy) {
                      e.preventDefault();
                      stop();
                    }
                  }}
                />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      )}
    </>
  );
}
