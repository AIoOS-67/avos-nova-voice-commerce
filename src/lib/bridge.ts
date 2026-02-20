// ==========================================================================
// Tool-Call-to-UI Bridge (Patent #28 — Core Innovation)
//
// Intercepts tool execution results and generates structured visual card
// messages for the frontend renderer. This implements the DRI (Dual-Readable
// Interface) concept: the same data is rendered for human visual consumption
// AND available for AI agent machine parsing.
//
// Patent: USPTO App — "System and Method for Real-Time Dynamic Visual
// Product Cards in Voice-Activated Commerce Interfaces"
// ==========================================================================

export type CardType =
  | "product_card"
  | "receipt_card"
  | "cart_update"
  | "recommendation_card";

export type InvocationSource = "user_query" | "ai_recommendation";

export interface CardMessage {
  type: CardType;
  data: Record<string, unknown>;
  timestamp: number;
  animationDelay: number;
  bridgeLatencyMs: number;
  recommendationBadge?: string;
}

// ==========================================================================
// Bridge Rules (Patent #28 Section 6.2)
//
//  R1: search_product + matches         → product_card
//  R2: calculate_order_total | get_cart  → receipt_card
//  R3: add_to_cart | remove_from_cart    → cart_update
//  R4: no match                         → null
//  R5: search_product (AI-initiated)    → recommendation_card + badge
// ==========================================================================

export function bridgeProcessToolResult(
  toolName: string,
  toolResult: unknown,
  invocationSource: InvocationSource = "user_query"
): CardMessage | null {
  const startTime = performance.now();

  const result =
    typeof toolResult === "object" && toolResult !== null
      ? (toolResult as Record<string, unknown>)
      : {};

  let card: CardMessage | null = null;

  switch (toolName) {
    // R1 / R5 — Product Search
    case "search_product":
    case "search_menu": {
      const products = result.products ?? result.results ?? result.matches;
      if (!Array.isArray(products) || products.length === 0) break;

      if (invocationSource === "ai_recommendation") {
        // R5: Recommendation card with badge
        card = {
          type: "recommendation_card",
          data: products[0], // Show first recommendation
          timestamp: Date.now(),
          animationDelay: 150,
          bridgeLatencyMs: 0,
          recommendationBadge: "Chef's Suggestion",
        };
      } else {
        // R1: Standard product card
        card = {
          type: "product_card",
          data: products[0], // Show first match
          timestamp: Date.now(),
          animationDelay: 0,
          bridgeLatencyMs: 0,
        };
      }
      break;
    }

    // R2 — Receipt / Order Summary
    case "calculate_order_total":
    case "get_cart":
    case "get_order_summary": {
      const items = result.items ?? result.cart;
      if (!Array.isArray(items) || items.length === 0) break;

      card = {
        type: "receipt_card",
        data: {
          items,
          subtotal: result.subtotal,
          tax: result.tax,
          total: result.total,
          itemCount: result.itemCount,
        },
        timestamp: Date.now(),
        animationDelay: 100,
        bridgeLatencyMs: 0,
      };
      break;
    }

    // R3 — Cart Update
    case "add_to_cart":
    case "remove_from_cart": {
      if (!result.success) break;

      card = {
        type: "cart_update",
        data: {
          action: toolName === "add_to_cart" ? "added" : "removed",
          item: result.item,
          cartSize: result.cartSize,
          message: result.message,
        },
        timestamp: Date.now(),
        animationDelay: 50,
        bridgeLatencyMs: 0,
      };
      break;
    }

    // R4 — No matching rule
    default:
      break;
  }

  // Record bridge processing latency (Patent requires <200ms)
  if (card) {
    card.bridgeLatencyMs = Math.round((performance.now() - startTime) * 100) / 100;
  }

  return card;
}
