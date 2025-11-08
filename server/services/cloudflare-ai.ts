import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getUserCloudflareConfig } from "../lib/userApiKeys";

export async function generateAIImage(prompt: string, userId?: string): Promise<{ url: string; thumbnail: string }> {
  try {
    const userConfig = await getUserCloudflareConfig(userId);
    const CLOUDFLARE_WORKER_URL = userConfig.workerUrl || process.env.CLOUDFLARE_WORKER_URL || "https://tivideo.titobisatexam.workers.dev";
    const CLOUDFLARE_API_KEY = userConfig.apiKey || process.env.CLOUDFLARE_API_KEY || "12345678";
    
    console.log("🎨 Cloudflare AI - Generating image for:", prompt);
    console.log("🔗 Worker URL:", CLOUDFLARE_WORKER_URL);
    console.log("🔑 API Key:", CLOUDFLARE_API_KEY ? "Configured" : "Missing");
    
    const response = await fetch(CLOUDFLARE_WORKER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CLOUDFLARE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    console.log("📡 Cloudflare response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Cloudflare AI error:", response.status, errorText);
      throw new Error(`Cloudflare AI error: ${response.status} - ${errorText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    console.log("📦 Image buffer received, size:", imageBuffer.byteLength, "bytes");
    
    const outputDir = path.join(process.cwd(), "output", "ai-images");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `${crypto.randomBytes(8).toString("hex")}.jpg`;
    const filePath = path.join(outputDir, filename);
    
    fs.writeFileSync(filePath, Buffer.from(imageBuffer));
    console.log("💾 Image saved to:", filePath);
    
    const imageUrl = `/output/ai-images/${filename}`;
    console.log("✅ AI image URL:", imageUrl);
    
    return {
      url: imageUrl,
      thumbnail: imageUrl,
    };
  } catch (error) {
    console.error("❌ Error generating AI image:", error);
    console.error("Full error details:", error instanceof Error ? error.message : String(error));
    return {
      url: "",
      thumbnail: "",
    };
  }
}
