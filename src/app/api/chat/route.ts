// ==========================================================================
// AVOS Chat API Route
// Connects: User Input → Nova 2 Lite → Tool Execution → Bridge → Cards
// ==========================================================================

import { NextRequest, NextResponse } from "next/server";
import { invokeNovaLite, type Message } from "@/lib/nova-lite";
import {
  TOOL_DEFINITIONS,
  executeTool,
  type Cart,
  createEmptyCart,
} from "@/lib/tools";
import { bridgeProcessToolResult, type CardMessage } from "@/lib/bridge";

// Session cart storage (in-memory for demo — production would use DynamoDB)
const sessionCarts = new Map<string, Cart>();

function getCart(sessionId: string): Cart {
  if (!sessionCarts.has(sessionId)) {
    sessionCarts.set(sessionId, createEmptyCart());
  }
  return sessionCarts.get(sessionId)!;
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], sessionId = "demo" } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const cart = getCart(sessionId);

    // Build conversation history
    const messages: Message[] = [
      ...history.map((h: { role: string; content: string }) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user" as const, content: message },
    ];

    // Check if demo mode — use local processing instead of Bedrock
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

    let response: string;
    let cards: CardMessage[] = [];
    let cartState = {
      itemCount: cart.items.reduce((sum, ci) => sum + ci.quantity, 0),
      total: 0,
    };

    if (isDemoMode) {
      // Demo mode: local tool execution without Bedrock API
      const result = handleDemoMode(message, cart);
      response = result.response;
      cards = result.cards;
      cartState = result.cartState;
    } else {
      // Production mode: Nova 2 Lite with tool-calling
      try {
        const novaResponse = await invokeNovaLite(messages, TOOL_DEFINITIONS);

        if (novaResponse.type === "tool_use") {
          // Execute the tool
          const toolResult = executeTool(
            novaResponse.toolName,
            novaResponse.toolInput,
            cart
          );

          // Bridge: generate visual card (Patent #28 core!)
          const card = bridgeProcessToolResult(
            novaResponse.toolName,
            toolResult.result
          );
          if (card) {
            cards.push(card);
          }

          // Feed tool result back to Nova for natural language response
          const followUp: Message[] = [
            ...messages,
            {
              role: "assistant",
              content: `[Tool called: ${novaResponse.toolName}] ${JSON.stringify(toolResult.result)}`,
            },
            {
              role: "user",
              content:
                "Based on the tool result above, give a natural conversational response to the customer. Keep it short and friendly.",
            },
          ];
          const finalResponse = await invokeNovaLite(followUp);
          response =
            finalResponse.type === "text"
              ? finalResponse.textResponse
              : novaResponse.textResponse || "Done!";
        } else {
          response = novaResponse.textResponse;
        }
      } catch (apiError: unknown) {
        console.error("Bedrock API error, falling back to demo mode:", apiError);
        const result = handleDemoMode(message, cart);
        response = result.response;
        cards = result.cards;
        cartState = result.cartState;
      }
    }

    // Calculate cart state
    const subtotal = cart.items.reduce(
      (sum, ci) => sum + ci.menuItem.price * ci.quantity,
      0
    );
    const tax = Math.round(subtotal * 0.08875 * 100) / 100;
    cartState = {
      itemCount: cart.items.reduce((sum, ci) => sum + ci.quantity, 0),
      total: Math.round((subtotal + tax) * 100) / 100,
    };

    return NextResponse.json({
      response,
      cards,
      cartState,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ==========================================================================
// Demo Mode Handler — works without Bedrock API
// ==========================================================================

function handleDemoMode(
  message: string,
  cart: Cart
): {
  response: string;
  cards: CardMessage[];
  cartState: { itemCount: number; total: number };
} {
  const msg = message.toLowerCase();
  const cards: CardMessage[] = [];

  // Search for menu items
  if (
    msg.includes("menu") ||
    msg.includes("what do you have") ||
    msg.includes("browse")
  ) {
    const result = executeTool("search_product", { query: "" }, cart);
    const card = bridgeProcessToolResult("search_product", result.result);
    if (card) cards.push(card);

    const subtotal = cart.items.reduce(
      (sum, ci) => sum + ci.menuItem.price * ci.quantity,
      0
    );
    return {
      response:
        "Welcome to our restaurant! 欢迎光临！Here are some of our popular dishes. We have appetizers, soups, main courses, and desserts. What catches your eye?",
      cards,
      cartState: {
        itemCount: cart.items.reduce((sum, ci) => sum + ci.quantity, 0),
        total: Math.round(subtotal * 1.08875 * 100) / 100,
      },
    };
  }

  // Search for specific items
  const searchTerms: Record<string, string> = {
    "general tso": "general-tsos",
    "kung pao": "kung-pao-chicken",
    "宫保鸡丁": "kung-pao-chicken",
    "左宗棠": "general-tsos",
    "orange chicken": "orange-chicken",
    "陈皮鸡": "orange-chicken",
    "fried rice": "fried-rice",
    "炒饭": "fried-rice",
    "lo mein": "shrimp-lo-mein",
    "捞面": "shrimp-lo-mein",
    "pad thai": "pad-thai",
    "spring roll": "spring-rolls",
    "春卷": "spring-rolls",
    "wonton": "wonton-soup",
    "馄饨": "wonton-soup",
    "hot and sour": "hot-sour-soup",
    "酸辣汤": "hot-sour-soup",
    "miso": "miso-soup",
    "味噌": "miso-soup",
    "beef": "beef-broccoli",
    "牛肉": "beef-broccoli",
    "tofu": "mapo-tofu",
    "麻婆豆腐": "mapo-tofu",
    "duck": "peking-duck",
    "烤鸭": "peking-duck",
    "mango": "mango-sticky-rice",
    "芒果": "mango-sticky-rice",
    "crab rangoon": "crab-rangoon",
    "蟹角": "crab-rangoon",
    "sweet and sour": "sweet-sour-pork",
    "咕噜肉": "sweet-sour-pork",
    "recommend": "popular",
    "suggest": "popular",
    "推荐": "popular",
  };

  // Check if user is adding to cart
  const addPatterns = [
    /i'?ll have/i,
    /i want/i,
    /i'?d like/i,
    /add/i,
    /order/i,
    /give me/i,
    /我要/,
    /来一个/,
    /来一份/,
  ];
  const isOrdering = addPatterns.some((p) => p.test(message));

  // Find matching product
  let matchedId: string | null = null;
  for (const [term, id] of Object.entries(searchTerms)) {
    if (msg.includes(term)) {
      matchedId = id;
      break;
    }
  }

  if (matchedId === "popular") {
    // Show recommendations
    const result = executeTool(
      "search_product",
      { query: "chicken" },
      cart
    );
    const card = bridgeProcessToolResult(
      "search_product",
      result.result,
      "ai_recommendation"
    );
    if (card) cards.push(card);

    const subtotal = cart.items.reduce(
      (sum, ci) => sum + ci.menuItem.price * ci.quantity,
      0
    );
    return {
      response:
        "Great question! Our most popular dishes are General Tso's Chicken (左宗棠鸡 $14.99), Kung Pao Chicken (宫保鸡丁 $15.99), and Orange Chicken (陈皮鸡 $14.49). The Kung Pao is my personal favorite — would you like to try it? 🌶️",
      cards,
      cartState: {
        itemCount: cart.items.reduce((sum, ci) => sum + ci.quantity, 0),
        total: Math.round(subtotal * 1.08875 * 100) / 100,
      },
    };
  }

  if (matchedId && isOrdering) {
    // Add to cart
    const result = executeTool(
      "add_to_cart",
      { product_id: matchedId, quantity: 1 },
      cart
    );

    // Show the product card
    const searchResult = executeTool(
      "search_product",
      { query: matchedId },
      cart
    );
    const productCard = bridgeProcessToolResult(
      "search_product",
      searchResult.result
    );
    if (productCard) cards.push(productCard);

    // Show recommendation
    const item = (result.result as Record<string, unknown>).item as Record<string, unknown>;
    const recs = (result.result as Record<string, unknown>).recommendations as Array<Record<string, unknown>>;

    let recText = "";
    if (recs && recs.length > 0) {
      recText = ` Would you also like ${recs[0].name} (${recs[0].nameZh}) for $${recs[0].price}? It pairs great with your order!`;
    }

    const subtotal = cart.items.reduce(
      (sum, ci) => sum + ci.menuItem.price * ci.quantity,
      0
    );
    return {
      response: `Added ${item?.name} (${item?.nameZh}) to your order! 👍${recText}`,
      cards,
      cartState: {
        itemCount: cart.items.reduce((sum, ci) => sum + ci.quantity, 0),
        total: Math.round(subtotal * 1.08875 * 100) / 100,
      },
    };
  }

  if (matchedId) {
    // Just searching, not ordering
    const result = executeTool(
      "search_product",
      { query: matchedId },
      cart
    );
    const card = bridgeProcessToolResult("search_product", result.result);
    if (card) cards.push(card);

    const subtotal = cart.items.reduce(
      (sum, ci) => sum + ci.menuItem.price * ci.quantity,
      0
    );
    return {
      response: `Here's what I found! Would you like to add it to your order?`,
      cards,
      cartState: {
        itemCount: cart.items.reduce((sum, ci) => sum + ci.quantity, 0),
        total: Math.round(subtotal * 1.08875 * 100) / 100,
      },
    };
  }

  // Check for total/checkout
  if (
    msg.includes("total") ||
    msg.includes("checkout") ||
    msg.includes("check out") ||
    msg.includes("结账") ||
    msg.includes("多少钱")
  ) {
    const result = executeTool("calculate_order_total", {}, cart);
    const card = bridgeProcessToolResult(
      "calculate_order_total",
      result.result
    );
    if (card) cards.push(card);

    const data = result.result as Record<string, unknown>;
    if ((data.itemCount as number) === 0) {
      return {
        response:
          "Your cart is empty! Would you like to see our menu? 您的购物车是空的，要看看菜单吗？",
        cards,
        cartState: { itemCount: 0, total: 0 },
      };
    }

    return {
      response: `Here's your order summary! Your total is $${data.total}. Would you like to place the order? 🧾`,
      cards,
      cartState: {
        itemCount: data.itemCount as number,
        total: data.total as number,
      },
    };
  }

  // Default response
  const subtotal = cart.items.reduce(
    (sum, ci) => sum + ci.menuItem.price * ci.quantity,
    0
  );
  return {
    response:
      "I'd be happy to help! You can ask about our menu, order dishes by name, or ask for recommendations. Try saying something like \"I'll have the General Tso's Chicken\" or \"What do you recommend?\" 有什么可以帮您的吗？",
    cards,
    cartState: {
      itemCount: cart.items.reduce((sum, ci) => sum + ci.quantity, 0),
      total: Math.round(subtotal * 1.08875 * 100) / 100,
    },
  };
}
