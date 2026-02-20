"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ProductCard, { ProductCardData } from "./ProductCard";
import ReceiptCard, { ReceiptCardData } from "./ReceiptCard";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface CardDisplay {
  id: string;
  type: "product_card" | "receipt_card" | "cart_update" | "recommendation_card";
  data: ProductCardData | ReceiptCardData;
  bridgeLatencyMs: number;
  recommendationBadge?: string;
}

export default function KioskInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeCards, setActiveCards] = useState<CardDisplay[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const removeCard = useCallback((cardId: string) => {
    setActiveCards((prev) => prev.filter((c) => c.id !== cardId));
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: Message = { role: "user", content: text, timestamp: Date.now() };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, history: messages.slice(-10) }),
        });

        const data = await res.json();

        // Add assistant message
        if (data.response) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.response, timestamp: Date.now() },
          ]);
        }

        // Process bridge cards (Patent #28 core)
        if (data.cards && data.cards.length > 0) {
          for (const card of data.cards) {
            const cardDisplay: CardDisplay = {
              id: `card-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              type: card.type,
              data: card.data,
              bridgeLatencyMs: card.bridgeLatencyMs || 0,
              recommendationBadge: card.recommendationBadge,
            };
            setActiveCards((prev) => [...prev, cardDisplay]);
          }
        }

        // Update cart state
        if (data.cartState) {
          setCartCount(data.cartState.itemCount || 0);
          setCartTotal(data.cartState.total || 0);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I had trouble processing that. Could you try again?",
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages]
  );

  const handleVoiceInput = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice input is not supported in this browser. Please use Chrome.");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      sendMessage(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  }, [sendMessage]);

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xl">
            🍜
          </div>
          <div>
            <h1 className="text-lg font-bold">
              AVOS <span className="text-orange-400 text-sm font-normal">AI Voice Ordering</span>
            </h1>
            <p className="text-xs text-zinc-500">Powered by Amazon Nova #AmazonNova</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Cart */}
          <button
            onClick={() => sendMessage("What is my total?")}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <span>🛒</span>
            <span className="text-sm">{cartCount}</span>
            {cartTotal > 0 && (
              <span className="text-xs text-green-400">${cartTotal.toFixed(2)}</span>
            )}
          </button>
          {/* Language Toggle */}
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <span className="bg-zinc-800 px-2 py-1 rounded">EN</span>
            <span>/</span>
            <span className="bg-zinc-800 px-2 py-1 rounded">中文</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
                <div className="text-6xl">🍜</div>
                <h2 className="text-xl font-bold">Welcome to AVOS</h2>
                <p className="text-sm text-zinc-400 max-w-md">
                  Order by voice or text. Try saying{" "}
                  <span className="text-orange-400">&quot;I&apos;d like some Kung Pao Chicken&quot;</span> or{" "}
                  <span className="text-orange-400">&quot;我要宫保鸡丁&quot;</span>
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {[
                    "What's on the menu?",
                    "I'll have General Tso's Chicken",
                    "我要炒饭",
                    "What do you recommend?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendMessage(suggestion)}
                      className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-full transition-colors border border-zinc-700"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.role === "user"
                      ? "bg-orange-600 text-white"
                      : "bg-zinc-800 text-zinc-100"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 rounded-2xl px-4 py-2.5">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-950">
            <div className="flex items-center gap-2">
              {/* Voice Button */}
              <button
                onClick={handleVoiceInput}
                disabled={isLoading}
                className={`
                  flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all
                  ${isListening
                    ? "bg-red-500 voice-pulse"
                    : "bg-zinc-800 hover:bg-zinc-700"
                  }
                  disabled:opacity-50
                `}
              >
                <span className="text-xl">{isListening ? "🔴" : "🎙️"}</span>
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Type your order or tap the mic..."
                disabled={isLoading}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-50"
              />

              {/* Send Button */}
              <button
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-600 hover:bg-orange-500 flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <span className="text-xl">➤</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card Panel (Patent #28: Frontend Card Renderer) */}
        <div className="w-96 border-l border-zinc-800 bg-zinc-950/50 p-4 overflow-y-auto hidden lg:block">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500 risk-pulse" />
            <h3 className="text-sm font-medium text-zinc-400">Live Product Cards</h3>
            <span className="text-xs text-zinc-600 ml-auto">Tool-Call-to-UI Bridge</span>
          </div>

          {activeCards.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center opacity-40">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-xs text-zinc-500">
                Product cards will appear here as you order.
                <br />
                Powered by Patent #28 Bridge technology.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {activeCards.map((card) => {
              if (card.type === "product_card" || card.type === "recommendation_card") {
                return (
                  <ProductCard
                    key={card.id}
                    data={card.data as ProductCardData}
                    isRecommendation={card.type === "recommendation_card"}
                    recommendationBadge={card.recommendationBadge}
                    bridgeLatencyMs={card.bridgeLatencyMs}
                    onDismiss={() => removeCard(card.id)}
                  />
                );
              }
              if (card.type === "receipt_card") {
                return (
                  <ReceiptCard
                    key={card.id}
                    data={card.data as ReceiptCardData}
                    bridgeLatencyMs={card.bridgeLatencyMs}
                    onDismiss={() => removeCard(card.id)}
                  />
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
