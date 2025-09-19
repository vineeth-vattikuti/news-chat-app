import { readFileSync } from 'node:fs';

export type Article = {
  title: string;
  link: string;
  ticker: string;
  full_text: string;
};

export type Dataset = Record<string, Article[]>;

export function loadDataset(path: string): Article[] {
  const raw = readFileSync(path, 'utf8');
  let json: Dataset;
  try {
    json = JSON.parse(raw);
  } catch (err: any) {
    throw new Error(`Invalid JSON in ${path}: ${err.message}`);
  }

  const items: Article[] = [];
  for (const articles of Object.values(json)) {
    items.push(...articles);
  }
  return items;
}
