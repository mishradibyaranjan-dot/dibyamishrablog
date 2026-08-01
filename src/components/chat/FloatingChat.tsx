import { useEffect, useRef, useState } from "react";
import { X, Trash2 } from "lucide-react";
import mascot from "@/assets/assistant-mascot.png";
import { motion } from "framer-motion";
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
const AUTO_GREET_KEY = "drm-floating-chat-autogreet:v1";

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

  // Auto-greet: pop the assistant open shortly after the first visit of a session,
  // and allow any page to open it via the `drm:open-assistant` event.
  useEffect(() => {
    const openIt = () => setOpen(true);
    window.addEventListener("drm:open-assistant", openIt as EventListener);

    let timer: number | undefined;
    let alreadyGreeted = true;
    try {
      alreadyGreeted = window.sessionStorage.getItem(AUTO_GREET_KEY) === "1";
    } catch {
      alreadyGreeted = true;
    }
    if (!alreadyGreeted) {
      timer = window.setTimeout(() => {
        try {
          window.sessionStorage.setItem(AUTO_GREET_KEY, "1");
        } catch {
          // ignore
        }
        setOpen(true);
      }, 6000);
    }

    return () => {
      window.removeEventListener("drm:open-assistant", openIt as EventListener);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  // Focus textarea when opening + seed a friendly greeting on first open
  useEffect(() => {
    if (open) {
      if (messages.length === 0) {
        setMessages([
          {
            id: `greet-${Date.now()}`,
            role: "assistant",
            parts: [
              {
                type: "text",
                text: "👋 Hello and welcome! I'm your Learning Assistant — happy to help you explore AI, Cloud, SaaS, research, projects, and case studies. What would you like to learn today?",
              },
            ],
          } as UIMessage,
        ]);
      }
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }, [open, messages.length, status, setMessages]);

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
          "group fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full",
          "border border-border bg-card text-primary shadow-[0_12px_30px_-10px_rgba(59,130,246,0.55)] transition-all",
          "hover:scale-105 hover:border-border hover:text-primary active:scale-95",
        )}
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <motion.span
            aria-hidden
            animate={{ y: [0, -5, 0], rotate: [-6, 6, -6] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            className="relative inline-flex"
          >
            <img src={mascot} alt="" width={44} height={44} className="h-11 w-11 drop-shadow-[0_6px_10px_rgba(59,130,246,0.35)]" />
            <span className="absolute -bottom-1 left-1/2 h-1.5 w-6 -translate-x-1/2 rounded-full bg-primary/60 blur-md" />
          </motion.span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="AI assistant"
          className={cn(
            "floating-chat-panel fixed bottom-24 right-5 z-[60] flex w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden",
            "h-[min(560px,calc(100vh-8rem))] rounded-2xl border border-border bg-card shadow-2xl text-foreground",
          )}
        >
          <header className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/10 via-card to-secondary/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <motion.span
                aria-hidden
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex"
              >
                <img src={mascot} alt="" width={32} height={32} className="h-8 w-8" />
              </motion.span>
              <div className="flex flex-col leading-tight">
                <p className="text-sm font-semibold text-foreground">Learning Assistant</p>
                <span className="text-[10px] font-medium uppercase tracking-wider text-primary">Online</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Clear conversation"
                  onClick={handleClear}
                  className="text-muted-foreground hover:bg-muted/40 hover:text-foreground"
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
                  title="Hi! I'm your Learning Assistant"
                  description="Ask me about AI, Cloud, SaaS, research articles, projects, or case studies — I'll point you to the right section."
                />
              ) : (
                messages.map((m) => {
                  const text = m.parts
                    .map((p) => (p.type === "text" ? p.text : ""))
                    .join("");
                  return (
                    <Message key={m.id} from={m.role} className="text-foreground">
                      <MessageContent className="text-foreground">
                        {m.role === "assistant" ? (
                          <MessageResponse className="text-foreground">{text}</MessageResponse>
                        ) : (
                          <span className="whitespace-pre-wrap text-foreground">{text}</span>
                        )}
                      </MessageContent>
                    </Message>
                  );
                })
              )}
              {status === "submitted" && (
                <div className="px-3 py-2 text-sm text-foreground">
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
