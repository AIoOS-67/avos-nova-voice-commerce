// ==========================================================================
// AVOS Tool Definitions & Execution Layer
// Maps to Patent #28 Section 6.1: Tool Execution Layer (140)
// ==========================================================================

import {
  type MenuItem,
  searchMenu,
  getMenuItem,
  getRecommendationsFor,
} from "./menu-data";

// ==========================================================================
// Cart Types
// ==========================================================================

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}

export function createEmptyCart(): Cart {
  return { items: [] };
}

// ==========================================================================
// Tool Definitions (Bedrock format)
// ==========================================================================

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: "search_product",
    description:
      "Search the restaurant menu for dishes matching a query. Supports English and Chinese names. Returns matching menu items with prices, descriptions, and details.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query — dish name in English or Chinese, or category name",
        },
        language: {
          type: "string",
          enum: ["en", "zh", "auto"],
          description: "Language hint for the query. Default: auto",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "add_to_cart",
    description:
      "Add a menu item to the customer's cart by product ID and quantity.",
    inputSchema: {
      type: "object",
      properties: {
        product_id: {
          type: "string",
          description: "The menu item ID to add",
        },
        quantity: {
          type: "number",
          description: "How many to add. Default: 1",
        },
      },
      required: ["product_id"],
    },
  },
  {
    name: "remove_from_cart",
    description: "Remove a menu item from the customer's cart by product ID.",
    inputSchema: {
      type: "object",
      properties: {
        product_id: {
          type: "string",
          description: "The menu item ID to remove",
        },
      },
      required: ["product_id"],
    },
  },
  {
    name: "get_cart",
    description:
      "Retrieve the current contents of the customer's shopping cart.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "calculate_order_total",
    description:
      "Calculate the order total including subtotal, tax (8.875%), and grand total.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

// ==========================================================================
// Tool Execution
// ==========================================================================

export interface ToolResult {
  result: Record<string, unknown>;
  cardType:
    | "product_card"
    | "receipt_card"
    | "cart_update"
    | "recommendation_card"
    | null;
}

const TAX_RATE = parseFloat(process.env.TAX_RATE || "0.08875");

export function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  sessionCart: Cart
): ToolResult {
  switch (toolName) {
    case "search_product": {
      const query = (toolInput.query as string) || "";
      const matches = searchMenu(query);
      const products = matches.map((m) => ({
        id: m.id,
        name: m.name,
        nameZh: m.nameZh,
        price: m.price,
        category: m.category,
        description: m.description,
        spiceLevel: m.spiceLevel,
        allergens: m.allergens,
        isPopular: m.isPopular,
      }));
      return {
        result: { products, resultCount: products.length, query },
        cardType: products.length > 0 ? "product_card" : null,
      };
    }

    case "add_to_cart": {
      const productId = toolInput.product_id as string;
      const quantity = (toolInput.quantity as number) || 1;
      const menuItem = getMenuItem(productId);

      if (!menuItem) {
        return {
          result: { success: false, message: `Item "${productId}" not found on menu` },
          cardType: null,
        };
      }

      const existing = sessionCart.items.find(
        (ci) => ci.menuItem.id === productId
      );
      if (existing) {
        existing.quantity += quantity;
      } else {
        sessionCart.items.push({ menuItem, quantity });
      }

      // Get recommendations for the item just added
      const recommendations = getRecommendationsFor(productId);

      return {
        result: {
          success: true,
          message: `Added ${quantity}x ${menuItem.name} (${menuItem.nameZh}) to cart`,
          item: {
            name: menuItem.name,
            nameZh: menuItem.nameZh,
            price: menuItem.price,
            quantity,
          },
          cartSize: sessionCart.items.reduce((sum, ci) => sum + ci.quantity, 0),
          recommendations: recommendations.slice(0, 2).map((r) => ({
            id: r.id,
            name: r.name,
            nameZh: r.nameZh,
            price: r.price,
          })),
        },
        cardType: "cart_update",
      };
    }

    case "remove_from_cart": {
      const productId = toolInput.product_id as string;
      const idx = sessionCart.items.findIndex(
        (ci) => ci.menuItem.id === productId
      );

      if (idx === -1) {
        return {
          result: { success: false, message: `Item "${productId}" is not in the cart` },
          cardType: null,
        };
      }

      const removed = sessionCart.items.splice(idx, 1)[0];
      return {
        result: {
          success: true,
          message: `Removed ${removed.menuItem.name} (${removed.menuItem.nameZh}) from cart`,
          item: {
            name: removed.menuItem.name,
            nameZh: removed.menuItem.nameZh,
            price: removed.menuItem.price,
          },
          cartSize: sessionCart.items.reduce((sum, ci) => sum + ci.quantity, 0),
        },
        cardType: "cart_update",
      };
    }

    case "get_cart": {
      const items = sessionCart.items.map((ci) => ({
        name: ci.menuItem.name,
        nameZh: ci.menuItem.nameZh,
        price: ci.menuItem.price,
        quantity: ci.quantity,
        lineTotal: ci.menuItem.price * ci.quantity,
      }));
      const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);

      return {
        result: {
          items,
          itemCount: sessionCart.items.reduce((sum, ci) => sum + ci.quantity, 0),
          subtotal: Math.round(subtotal * 100) / 100,
        },
        cardType: items.length > 0 ? "receipt_card" : null,
      };
    }

    case "calculate_order_total": {
      const items = sessionCart.items.map((ci) => ({
        name: ci.menuItem.name,
        nameZh: ci.menuItem.nameZh,
        price: ci.menuItem.price,
        quantity: ci.quantity,
        lineTotal: ci.menuItem.price * ci.quantity,
      }));
      const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
      const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
      const total = Math.round((subtotal + tax) * 100) / 100;

      return {
        result: {
          items,
          itemCount: sessionCart.items.reduce((sum, ci) => sum + ci.quantity, 0),
          subtotal: Math.round(subtotal * 100) / 100,
          tax,
          taxRate: `${(TAX_RATE * 100).toFixed(3)}%`,
          total,
          currency: "USD",
        },
        cardType: items.length > 0 ? "receipt_card" : null,
      };
    }

    default:
      return {
        result: { error: `Unknown tool: ${toolName}` },
        cardType: null,
      };
  }
}
