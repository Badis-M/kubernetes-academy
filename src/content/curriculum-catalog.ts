import { chapters } from "./curriculum-catalog.gen";
import type { Chapter, Level } from "./types";

export type ChapterSummary = Pick<Chapter, "id" | "level" | "title" | "summary" | "minutes"> & {
  available: boolean;
};

export { chapters };
export { levels } from "./curriculum-levels";

export const isAvailable = (chapter: ChapterSummary) => chapter.available;
export const getChapter = (id: string) => chapters.find((chapter) => chapter.id === id);
export const chaptersOf = (level: Level) => chapters.filter((chapter) => chapter.level === level);

export function neighbours(id: string) {
  const available = chapters.filter(isAvailable);
  const index = available.findIndex((chapter) => chapter.id === id);
  return { prev: available[index - 1], next: index >= 0 ? available[index + 1] : undefined };
}
