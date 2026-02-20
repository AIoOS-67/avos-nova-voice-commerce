"use client";

import { useEffect, useState } from "react";

export interface ProductCardData {
  id: string;
  name: string;
  nameZh: string;
  price: number;
  category: string;
  description: string;
  spiceLevel: number;
  allergens: string[];
  isPopular: boolean;
  image?: string;
}

interface ProductCardProps {
  data: ProductCardData;
  isRecommendation?: boolean;
  recommendationBadge?: string;
  onDismiss?: () => void;
  bridgeLatencyMs?: number;
}

export default function ProductCard({
  data,
  isRecommendation = false,
  recommendationBadge,
  onDismiss,
  bridgeLatencyMs,
}: ProductCardProps) {
  const [isExiting, setIsExiting] = useState(false);
  const displayDuration = isRecommendation ? 25000 : 15000;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss?.(), 400);
    }, displayDuration);
    return () => clearTimeout(timer);
  }, [displayDuration, onDismiss]);

  const spiceIndicator = data.spiceLevel > 0
    ? Array(data.spiceLevel).fill("🌶️").join("")
    : "";

  return (
    <div
      className={`
        relative w-full max-w-sm rounded-xl overflow-hidden
        ${isExiting ? "card-exit" : "card-enter"}
        ${isRecommendation ? "recommendation-glow border-2 border-yellow-500" : "border border-orange-500/50"}
        bg-gradient-to-b from-zinc-900 to-zinc-950
      `}
    >
      {/* Recommendation Badge */}
      {isRecommendation && recommendationBadge && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-600 to-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
          {recommendationBadge}
        </div>
      )}

      {/* Popular Badge */}
      {data.isPopular && !isRecommendation && (
        <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          Popular
        </div>
      )}

      {/* Card Content */}
      <div className="p-5">
        {/* Product Image Placeholder */}
        <div className="w-full h-32 bg-zinc-800 rounded-lg mb-4 flex items-center justify-center text-4xl">
          {getCategoryEmoji(data.category)}
        </div>

        {/* Bilingual Name */}
        <h3 className="text-xl font-bold text-white">{data.name}</h3>
        <p className="text-lg text-orange-300 font-medium">{data.nameZh}</p>

        {/* Price */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-2xl font-bold text-green-400">
            ${data.price.toFixed(2)}
          </span>
          {spiceIndicator && (
            <span className="text-sm" title={`Spice Level: ${data.spiceLevel}/3`}>
              {spiceIndicator}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="mt-2 text-sm text-zinc-400">{data.description}</p>

        {/* Category & Allergens */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">
            {data.category}
          </span>
          {data.allergens.map((a) => (
            <span
              key={a}
              className="text-xs bg-red-900/30 text-red-300 px-2 py-0.5 rounded-full"
            >
              {a}
            </span>
          ))}
        </div>
      </div>

      {/* Bridge Latency Indicator (Patent #28 Section 6.7.4) */}
      {bridgeLatencyMs !== undefined && (
        <div className="px-5 pb-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                bridgeLatencyMs < 200 ? "bg-green-500" : "bg-red-500"
              }`}
            />
            Bridge: {bridgeLatencyMs}ms
            {bridgeLatencyMs < 200 && " (within budget)"}
          </div>
        </div>
      )}
    </div>
  );
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    Appetizers: "🥟",
    Soups: "🍜",
    "Noodles & Rice": "🍚",
    Poultry: "🍗",
    "Beef & Pork": "🥩",
    Seafood: "🦐",
    Vegetables: "🥬",
    Desserts: "🍡",
  };
  return map[category] || "🍽️";
}
