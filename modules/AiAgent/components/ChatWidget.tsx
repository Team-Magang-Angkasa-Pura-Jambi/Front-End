"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Bot,
  X,
  Send,
  User,
  Loader2,
  Sparkles,
  Zap,
  Activity,
  AlertTriangle,
  LayoutGrid,
  RefreshCw,
  Lightbulb
} from "lucide-react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Button } from "@/common/components/ui/button";
import { Card } from "@/common/components/ui/card";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { PAGE_GUIDES } from "@/common/constants/pageGuides";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import api from "@/lib/api";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Halo! Saya adalah Sentinel AI. Ada yang bisa saya bantu terkait data operasional hari ini?\n\n*Pilih menu aksi cepat di kiri bawah input atau tanyakan langsung di bawah.*",
};

const QUICK_ACTIONS = [
  {
    label: "Ringkasan Energi",
    query: "Ringkasan pemakaian terakhir",
    icon: Zap,
    description: "Analisis konsumsi daya hari ini"
  },
  {
    label: "Status Listrik",
    query: "Status sistem listrik",
    icon: Activity,
    description: "Kondisi beban & tegangan real-time"
  },
  {
    label: "Prediksi Anomali",
    query: "Prediksi Anomali",
    icon: AlertTriangle,
    description: "Deteksi ML terhadap lonjakan aneh"
  },
];

export const ChatWidget = ({ onClose }: { onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [sessionId, setSessionId] = useState(
    () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  );

  const pathname = usePathname();
  const currentPageGuide = [...PAGE_GUIDES]
    .sort((a, b) => b.route.length - a.route.length)
    .find((g) => pathname?.startsWith(g.route));

  // Gabungkan aksi statis dengan aksi dinamis (jika ada panduan halaman)
  const combinedActions = [
    ...(currentPageGuide
      ? [
        {
          label: `Bantuan Halaman Ini`,
          query: `Panduan Halaman ${currentPageGuide.title}`,
          icon: Lightbulb,
          description: `Panduan untuk ${currentPageGuide.title}`,
          isGuide: true,
        },
      ]
      : []),
    ...QUICK_ACTIONS,
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setHasError(false);
    setSessionId(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  };

  const sendMessage = useCallback(
    async (textToSend: string) => {
      const trimmedText = textToSend.trim();
      if (!trimmedText || isLoading) return;

      const userMessage: Message = { role: "user", content: trimmedText };

      // INTERCEPTOR UNTUK PANDUAN HALAMAN LOKAL (BYPASS API)
      if (currentPageGuide && trimmedText === `Panduan Halaman ${currentPageGuide.title}`) {
        const guideMarkdown = `**Panduan: ${currentPageGuide.title}**\n\n${currentPageGuide.overview}\n\n**Langkah-langkah:**\n${currentPageGuide.workflow.map(w => `${w.stepNumber}. **${w.title}**: ${w.instruction}`).join('\n')}\n\n*Fitur ini disajikan secara instan tanpa melalui server.*`;
        setMessages([...messages, userMessage, { role: "assistant", content: guideMarkdown }]);
        return;
      }

      const currentHistory = [...messages, userMessage];

      setMessages(currentHistory);
      setInput("");
      setIsLoading(true);
      setHasError(false);

      try {
        const response = await api.post("/ai-agent/chat", {
          messages: currentHistory,
          session_id: sessionId,
        });

        const aiReply = response.data?.data?.text ?? "Respons tidak valid dari server.";
        setMessages((prev) => [...prev, { role: "assistant", content: aiReply }]);
      } catch (error) {
        setHasError(true);
        setMessages((prev) => [
          ...prev,
          { role: "system", content: "Maaf, terjadi kesalahan saat menghubungi server AI." },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, sessionId]
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <Card className="flex flex-col w-[380px] h-[550px] shadow-2xl border-primary/20 bg-background/95 backdrop-blur-md rounded-2xl overflow-hidden pointer-events-auto">

      {/* Dynamic Header */}
      <div className="bg-primary text-primary-foreground p-3 flex justify-between items-center shadow-md shrink-0 h-14 select-none">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="bg-primary-foreground/20 p-2 rounded-full">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </div>
            {/* Dynamic Status Dot Indicator */}
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-primary ${hasError
                ? "bg-destructive"
                : isLoading
                  ? "bg-amber-400 animate-pulse"
                  : "bg-emerald-400"
                }`}
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm leading-tight">Sentinel AI</h3>
              <span className="text-[10px] bg-primary-foreground/20 px-1.5 py-0.5 rounded font-mono">v1.2</span>
            </div>
            {/* Dynamic Status Label */}
            <p className="text-[11px] text-primary-foreground/80 leading-tight">
              {isLoading ? "Sedang memproses..." : hasError ? "Terjadi kesalahan" : "Online • Siap membantu"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
            onClick={handleResetChat}
            title="Reset Percakapan"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
            onClick={onClose}
            title="Tutup Chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scroll Area Chat Messages (Height: calc(550px - header 56px - input 60px) = 434px) */}
      <ScrollArea className="h-[434px] w-full bg-muted/10">
        <div className="p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${msg.role === "user"
                  ? "items-end"
                  : msg.role === "system"
                    ? "items-center"
                    : "items-start"
                  }`}
              >
                {msg.role === "system" ? (
                  <span className="text-[11px] text-destructive bg-destructive/10 border border-destructive/20 px-3 py-1 rounded-full text-center max-w-[90%]">
                    {msg.content}
                  </span>
                ) : (
                  <div
                    className={`flex max-w-[85%] gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                  >
                    <div
                      className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center mt-1 ${msg.role === "user" ? "bg-muted" : "bg-primary/10 text-primary"
                        }`}
                    >
                      {msg.role === "user" ? (
                        <User className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <Bot className="h-3.5 w-3.5" />
                      )}
                    </div>

                    <div
                      className={`px-3 py-2 rounded-2xl text-[13px] leading-relaxed ${msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none shadow-sm"
                        : "bg-card text-card-foreground border border-border/60 rounded-tl-none shadow-sm"
                        }`}
                    >
                      {msg.role === "user" ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none break-words [&>p]:mb-1.5 [&>p:last-child]:mb-0">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="bg-card border border-border/60 px-3 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                <span className="animate-bounce delay-75 w-1.5 h-1.5 bg-primary rounded-full inline-block" />
                <span className="animate-bounce delay-150 w-1.5 h-1.5 bg-primary rounded-full inline-block" />
                <span className="animate-bounce delay-300 w-1.5 h-1.5 bg-primary rounded-full inline-block" />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area + Quick Actions Trigger */}
      <div className="p-3 bg-card border-t border-border/60 shrink-0 h-[60px] flex items-center">
        <form
          onSubmit={handleFormSubmit}
          className="flex items-center gap-1.5 w-full bg-muted/40 p-1 rounded-full border border-border/60 focus-within:border-primary/50 focus-within:ring-1 ring-primary/30 transition-all"
        >
          {/* Quick Actions Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isLoading}
                className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 shrink-0 transition-colors"
                title="Aksi Cepat"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" sideOffset={12} className="w-56 p-1.5 shadow-xl border-border/60">
              <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground px-2 py-1">
                Aksi Cepat
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {combinedActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <DropdownMenuItem
                    key={idx}
                    onClick={() => sendMessage(action.query)}
                    className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer ${(action as any).isGuide ? "bg-primary/5 focus:bg-primary/15" : "focus:bg-primary/10"
                      }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${(action as any).isGuide ? "text-amber-500" : "text-primary"}`} />
                    <div className="flex flex-col">
                      <span className={`text-xs font-medium ${(action as any).isGuide ? "text-primary" : "text-foreground"}`}>
                        {action.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{action.description}</span>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLoading ? "Sedang memproses respons..." : "Tanyakan sesuatu..."}
            className="flex-1 bg-transparent text-[13px] px-2 py-1 outline-none placeholder:text-muted-foreground/70"
            disabled={isLoading}
          />

          <Button
            type="submit"
            size="icon"
            className="h-7 w-7 rounded-full shrink-0 shadow-sm"
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </Button>
        </form>
      </div>
    </Card>
  );
};