import type { Lesson } from "./lessons.js";

export const renderBanner = (lessons: Lesson[], currentTag: string | null): string => {
  const idx = currentTag ? lessons.findIndex((l) => l.tag === currentTag) : -1;
  const dots = lessons.map((_, i) => (i <= idx && idx >= 0 ? "●" : "○")).join("─");
  const numbers = lessons.map((_, i) => i + 1).join(" ");
  const pointer =
    idx >= 0 ? " ".repeat(idx * 2) + "▲" : "  (not on a lesson tag)";

  const lines = ["  " + dots, "  " + numbers, "  " + pointer];

  if (idx >= 0) {
    const l = lessons[idx];
    lines.push(`  Lesson ${idx + 1} · ${l.title} — ${l.blurb}`);
  } else {
    lines.push(`  Run ./setup.sh or :goto 1 to start at lesson 1`);
  }
  lines.push(
    `  Commands: :next  :prev  :where  :diff  :goto N  :help    (anything else → agent)`
  );
  return lines.join("\n");
};
