import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

export type Lesson = { tag: string; title: string; blurb: string };

const manifestPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "lessons.json"
);

export const loadLessons = (): Lesson[] =>
  JSON.parse(readFileSync(manifestPath, "utf8"));

export const currentTag = (): string | null => {
  try {
    return execSync("git describe --tags --exact-match", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return null;
  }
};

export const findIndex = (lessons: Lesson[], tag: string | null): number =>
  tag ? lessons.findIndex((l) => l.tag === tag) : -1;

export const isCleanTree = (): boolean =>
  execSync("git status --porcelain").toString().trim() === "";

export const checkoutTag = (tag: string): void => {
  execSync(`git checkout ${tag}`, { stdio: "inherit" });
};

export const packageJsonChanged = (fromTag: string, toTag: string): boolean => {
  const out = execSync(`git diff --name-only ${fromTag} ${toTag}`).toString();
  return out.split("\n").some((f) => f === "package.json" || f === "package-lock.json");
};

export const runNpmInstall = (): void => {
  execSync("npm install", { stdio: "inherit" });
};
