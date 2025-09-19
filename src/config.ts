// src/config.ts
import { config as loadEnv } from 'dotenv';
loadEnv();

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

export const CONFIG = {
  PORT: Number(process.env.PORT ?? 5173),
  NEWS_JSON_PATH: process.env.NEWS_JSON_PATH ?? './data/stock_news.json',
};
