// ==========================================================================
// Nova 2 Lite — Reasoning + Tool-Calling via Bedrock Converse API
// ==========================================================================

import {
  ConverseCommand,
  type ContentBlock,
  type Message as BedrockMessage,
  type SystemContentBlock,
  type Tool,
  type ToolConfiguration,
} from "@aws-sdk/client-bedrock-runtime";

import { bedrockClient, NOVA_2_LITE } from "./bedrock";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface ToolUseResult {
  type: "tool_use";
  toolName: string;
  toolInput: Record<string, unknown>;
  textResponse: string;
}

export interface TextResult {
  type: "text";
  textResponse: string;
}

export type NovaLiteResponse = ToolUseResult | TextResult;

const DEFAULT_SYSTEM_PROMPT = `You are AVOS, a friendly and helpful AI voice ordering assistant for a Chinese restaurant.
You are bilingual in English and Chinese (Mandarin). Respond in whichever language the customer uses.
You help customers browse the menu, add items to their cart, customize orders, and check out.
Be warm, concise, and proactive — suggest popular dishes when asked for recommendations.
When you need to look up menu items, calculate totals, or modify the cart, use the tools provided.
Always mention both the English and Chinese name of dishes when discussing them.
Keep responses short and conversational — this is meant to feel like talking to a real person.`;

function toBedrockMessages(messages: Message[]): BedrockMessage[] {
  return messages.map((m) => ({
    role: m.role,
    content: [{ text: m.content }],
  }));
}

function toToolConfig(tools: ToolDefinition[]): ToolConfiguration {
  const bedrockTools = tools.map((t) => ({
    toolSpec: {
      name: t.name,
      description: t.description,
      inputSchema: { json: t.inputSchema },
    },
  }));
  return { tools: bedrockTools as Tool[] };
}

function extractText(blocks: ContentBlock[]): string {
  return blocks
    .filter(
      (b): b is ContentBlock & { text: string } =>
        "text" in b && typeof b.text === "string"
    )
    .map((b) => b.text)
    .join("");
}

export async function invokeNovaLite(
  messages: Message[],
  tools: ToolDefinition[] = [],
  systemPrompt: string = DEFAULT_SYSTEM_PROMPT
): Promise<NovaLiteResponse> {
  const system: SystemContentBlock[] = [{ text: systemPrompt }];

  const command = new ConverseCommand({
    modelId: NOVA_2_LITE,
    system,
    messages: toBedrockMessages(messages),
    ...(tools.length > 0 ? { toolConfig: toToolConfig(tools) } : {}),
  });

  const response = await bedrockClient.send(command);
  const contentBlocks: ContentBlock[] =
    response.output?.message?.content ?? [];

  // Check for tool use
  for (const block of contentBlocks) {
    if ("toolUse" in block && block.toolUse) {
      return {
        type: "tool_use",
        toolName: block.toolUse.name ?? "",
        toolInput: (block.toolUse.input as Record<string, unknown>) ?? {},
        textResponse: extractText(contentBlocks),
      };
    }
  }

  return {
    type: "text",
    textResponse: extractText(contentBlocks),
  };
}
