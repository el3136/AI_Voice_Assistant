import Groq from "groq-sdk";
import { headers } from "next/headers";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { after } from "next/server";

// In-memory call log (for demonstration)
const callLogs: {
  id: string;
  user: string;
  timestamp: string;
  duration: number;
  question: string;
}[] = [];

const groq = new Groq();

const schema = zfd.formData({
  input: z.union([zfd.text(), zfd.file()]),
  message: zfd.repeatableOfType(
    zfd.json(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
  ),
});

export async function POST(request: Request) {
  const { data, success } = schema.safeParse(await request.formData());
  if (!success) return new Response("Invalid request", { status: 400 });

  const transcript = await getTranscript(data.input);
  if (!transcript) return new Response("Invalid audio", { status: 400 });

  const startTime = Date.now();
  const completion = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [
      { role: "system", content: "You are an AI assistant." },
      ...data.message,
      { role: "user", content: transcript },
    ],
  });

  const response = completion.choices[0].message.content;
  const duration = (Date.now() - startTime) / 1000;

  if (!response) return new Response("Invalid response", { status: 500 });

  const voice = await fetch("https://api.cartesia.ai/tts/bytes", {
    method: "POST",
    headers: {
      "Cartesia-Version": "2024-06-30",
      "Content-Type": "application/json",
      "X-API-Key": process.env.CARTESIA_API_KEY!,
    },
    body: JSON.stringify({
      model_id: "sonic-english",
      transcript: response,
      voice: { mode: "id", id: "79a125e8-cd45-4c13-8a67-188112f4dd22" },
      output_format: { container: "raw", encoding: "pcm_f32le", sample_rate: 24000 },
    }),
  });

  if (!voice.ok) return new Response("Voice synthesis failed", { status: 500 });

  callLogs.push({
    id: crypto.randomUUID(),
    user: "Anonymous",
    timestamp: new Date().toISOString(),
    duration,
    question: transcript,
  });

  return new Response(voice.body, {
    headers: {
      "Content-Type": "audio/wav",
      "X-Transcript": encodeURIComponent(transcript),
      "X-Response": encodeURIComponent(response),
    },
  });
}

// Provide logged calls for the admin dashboard
export async function GET() {
  return new Response(JSON.stringify(callLogs), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function getTranscript(input: string | File) {
  if (typeof input === "string") return input;
  try {
    const { text } = await groq.audio.transcriptions.create({
      file: input,
      model: "whisper-large-v3",
    });
    return text.trim() || null;
  } catch {
    return null;
  }
}
