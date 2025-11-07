import { setupVite as originalSetupVite, serveStatic, log } from "./vite";
import type { Express } from "express";
import type { Server } from "http";

export { serveStatic, log };

export async function setupVite(app: Express, server: Server) {
  // Intercept HTML responses to inject environment variables
  const originalSend = app.response.send;
  
  app.response.send = function(this: any, body: any) {
    if (typeof body === 'string' && body.includes('%VITE_SUPABASE_URL%')) {
      body = body
        .replace(/%VITE_SUPABASE_URL%/g, process.env.VITE_SUPABASE_URL || '')
        .replace(/%VITE_SUPABASE_ANON_KEY%/g, process.env.VITE_SUPABASE_ANON_KEY || '');
    }
    return originalSend.call(this, body);
  };

  return await originalSetupVite(app, server);
}
