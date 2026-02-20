"use client";

import { useEffect, useState } from "react";

export interface CartItem {
  name: string;
  nameZh: string;
  quantity: number;
  price: number;
}

export interface ReceiptCardData {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}

interface ReceiptCardProps {
  data: ReceiptCardData;
  onDismiss?: () => void;
  bridgeLatencyMs?: number;
}

export default function ReceiptCard({ data, onDismiss, bridgeLatencyMs }: ReceiptCardProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss?.(), 400);
    }, 20000); // 20s display duration for receipt cards
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`
        relative w-full max-w-sm rounded-xl overflow-hidden
        ${isExiting ? "card-exit" : "card-enter"}
        border border-emerald-500/50
        bg-gradient-to-b from-zinc-900 to-zinc-950
      `}
    >
      {/* Header */}
      <div className="bg-emerald-900/30 px-5 py-3 border-b border-emerald-800/30">
        <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
          <span>🧾</span> Order Summary
        </h3>
        <p className="text-xs text-zinc-400">{data.itemCount} item{data.itemCount !== 1 ? "s" : ""}</p>
      </div>

      {/* Items */}
      <div className="px-5 py-3 max-h-48 overflow-y-auto">
        {data.items.map((item, i) => (
          <div key={i} className="flex justify-between items-center py-1.5 border-b border-zinc-800/50 last:border-0">
            <div className="flex-1">
              <span className="text-sm text-white">{item.name}</span>
              <span className="text-xs text-orange-300 ml-1">({item.nameZh})</span>
              {item.quantity > 1 && (
                <span className="text-xs text-zinc-400 ml-1">x{item.quantity}</span>
              )}
            </div>
            <span className="text-sm text-zinc-300 ml-3">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="px-5 py-3 bg-zinc-900/50 border-t border-zinc-800">
        <div className="flex justify-between text-sm text-zinc-400">
          <span>Subtotal</span>
          <span>${data.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-zinc-400 mt-1">
          <span>Tax (8.875%)</span>
          <span>${data.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-white mt-2 pt-2 border-t border-zinc-700">
          <span>Total</span>
          <span className="text-green-400">${data.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Bridge Latency */}
      {bridgeLatencyMs !== undefined && (
        <div className="px-5 pb-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <div className={`w-1.5 h-1.5 rounded-full ${bridgeLatencyMs < 200 ? "bg-green-500" : "bg-red-500"}`} />
            Bridge: {bridgeLatencyMs}ms
          </div>
        </div>
      )}
    </div>
  );
}
