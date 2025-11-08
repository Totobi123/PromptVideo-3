import { supabase } from "./supabase";
import { decrypt } from "./encryption";

export interface UserApiKeys {
  openrouter: string | null;
  murf: string | null;
  pexels: string | null;
  freesound: string | null;
  cloudflare: string | null;
  cloudflareWorkerUrl: string | null;
}

export async function getAllUserApiKeys(userId: string | undefined): Promise<UserApiKeys | null> {
  if (!userId || !supabase) {
    return null;
  }

  try {
    const { data, error } = await (supabase as any)
      .from('users')
      .select('openrouter_api_key, murf_api_key, pexels_api_key, freesound_api_key, cloudflare_api_key, cloudflare_worker_url')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      openrouter: data.openrouter_api_key ? decrypt(data.openrouter_api_key) : null,
      murf: data.murf_api_key ? decrypt(data.murf_api_key) : null,
      pexels: data.pexels_api_key ? decrypt(data.pexels_api_key) : null,
      freesound: data.freesound_api_key ? decrypt(data.freesound_api_key) : null,
      cloudflare: data.cloudflare_api_key ? decrypt(data.cloudflare_api_key) : null,
      cloudflareWorkerUrl: data.cloudflare_worker_url ? decrypt(data.cloudflare_worker_url) : null,
    };
  } catch (error) {
    console.error('Error fetching all user API keys:', error);
    return null;
  }
}

export async function getUserApiKey(userId: string | undefined, keyName: 'openrouter' | 'murf' | 'pexels' | 'freesound' | 'cloudflare'): Promise<string | null> {
  const allKeys = await getAllUserApiKeys(userId);
  return allKeys ? allKeys[keyName] : null;
}

export async function getUserCloudflareConfig(userId: string | undefined): Promise<{ apiKey: string | null; workerUrl: string | null }> {
  if (!userId || !supabase) {
    return { apiKey: null, workerUrl: null };
  }

  try {
    const { data, error } = await (supabase as any)
      .from('users')
      .select('cloudflare_api_key, cloudflare_worker_url')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return { apiKey: null, workerUrl: null };
    }

    return {
      apiKey: data.cloudflare_api_key ? decrypt(data.cloudflare_api_key) : null,
      workerUrl: data.cloudflare_worker_url ? decrypt(data.cloudflare_worker_url) : null,
    };
  } catch (error) {
    console.error('Error fetching user Cloudflare config:', error);
    return { apiKey: null, workerUrl: null };
  }
}
