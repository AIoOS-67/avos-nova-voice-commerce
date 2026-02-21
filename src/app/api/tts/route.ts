import { NextRequest, NextResponse } from "next/server";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

const polly = new PollyClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Detect if text is mostly Chinese
function isChinese(text: string): boolean {
  const zhChars = text.match(/[\u4e00-\u9fff]/g);
  return !!zhChars && zhChars.length > text.length * 0.15;
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    // Choose voice based on language
    const chinese = isChinese(text);
    const voiceId = chinese ? "Zhiyu" : "Joanna";
    const languageCode = chinese ? "cmn-CN" : "en-US";

    const command = new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: "mp3",
      VoiceId: voiceId,
      Engine: "neural",
      LanguageCode: languageCode,
    });

    const response = await polly.send(command);

    if (!response.AudioStream) {
      return NextResponse.json({ error: "No audio" }, { status: 500 });
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    const reader = response.AudioStream as AsyncIterable<Uint8Array>;
    for await (const chunk of reader) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Polly TTS error:", msg);
    return NextResponse.json({ error: "TTS failed", detail: msg }, { status: 500 });
  }
}
