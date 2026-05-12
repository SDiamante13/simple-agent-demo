import { execSync } from "node:child_process";
import { loadLessons, currentTag, findIndex } from "../lessons.js";

export const diff = (): void => {
  const lessons = loadLessons();
  const idx = findIndex(lessons, currentTag());
  if (idx < 0) {
    console.log("Not on a lesson tag.");
    return;
  }
  if (idx === 0) {
    console.log("Lesson 1 has no previous lesson to diff against.");
    return;
  }
  const prev = lessons[idx - 1].tag;
  const out = execSync(`git diff ${prev}..HEAD --stat`).toString();
  console.log(out);
};
