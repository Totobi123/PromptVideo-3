import fs from "fs";
import path from "path";
import crypto from "crypto";

const CLOUDFLARE_WORKER_URL = process.env.CLOUDFLARE_WORKER_URL || "https://tivideo.titobisatexam.workers.dev";
const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY || "12345678";

export async function generateAIImage(prompt: string): Promise<{ url: string; thumbnail: string }> {
  try {
    const response = await fetch(CLOUDFLARE_WORKER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CLOUDFLARE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudflare AI error: ${response.status} - ${errorText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    
    const outputDir = path.join(process.cwd(), "output", "ai-images");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `${crypto.randomBytes(8).toString("hex")}.jpg`;
    const filePath = path.join(outputDir, filename);
    
    fs.writeFileSync(filePath, Buffer.from(imageBuffer));
    
    const imageUrl = `/output/ai-images/${filename}`;
    
    return {
      url: imageUrl,
      thumbnail: imageUrl,
    };
  } catch (error) {
    console.error("Error generating AI image:", error);
    return {
      url: "",
      thumbnail: "",
    };
  }
}
