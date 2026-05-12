import {
  loadLessons,
  currentTag,
  findIndex,
  isCleanTree,
  checkoutTag,
  packageJsonChanged,
  runNpmInstall,
  type Lesson,
} from "../lessons.js";

export const advance = (target: Lesson): void => {
  if (!isCleanTree()) {
    console.log(
      "Working tree is dirty. Commit, stash, or discard changes first:\n  git stash    # or: git checkout ."
    );
    return;
  }
  const from = currentTag();
  checkoutTag(target.tag);
  if (from && packageJsonChanged(from, target.tag)) {
    console.log("package.json changed — running npm install...");
    runNpmInstall();
  }
  console.log(`\nNow on ${target.tag}. Restart with: npm start\n`);
  process.exit(0);
};

export const next = (): void => {
  const lessons = loadLessons();
  const idx = findIndex(lessons, currentTag());
  if (idx < 0) {
    console.log("Not on a lesson tag. Try :goto 1.");
    return;
  }
  if (idx >= lessons.length - 1) {
    console.log("You're at the final lesson.");
    return;
  }
  advance(lessons[idx + 1]);
};

export const prev = (): void => {
  const lessons = loadLessons();
  const idx = findIndex(lessons, currentTag());
  if (idx < 0) {
    console.log("Not on a lesson tag. Try :goto 1.");
    return;
  }
  if (idx === 0) {
    console.log("You're at the first lesson.");
    return;
  }
  advance(lessons[idx - 1]);
};

export const goto = (args: string[]): void => {
  const lessons = loadLessons();
  const n = parseInt(args[0] ?? "", 10);
  if (!n || n < 1 || n > lessons.length) {
    console.log(`Usage: :goto N   (1..${lessons.length})`);
    return;
  }
  advance(lessons[n - 1]);
};
