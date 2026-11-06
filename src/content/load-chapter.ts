import type { Chapter } from "./types";

const loaders = import.meta.glob<Record<string, Chapter>>("./chapters/*.ts");

export async function loadChapter(id: string): Promise<Chapter> {
  const load = loaders[`./chapters/${id}.ts`];
  if (!load) throw new Error(`Missing chapter module: ${id}`);
  const module = await load();
  const chapter = Object.values(module).find((entry) => entry.id === id);
  if (!chapter) throw new Error(`Missing chapter export: ${id}`);
  return chapter;
}
