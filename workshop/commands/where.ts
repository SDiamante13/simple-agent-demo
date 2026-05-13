import { loadLessons, currentTag } from "../lessons.js";
import { renderBanner } from "../banner.js";

export const where = (): void => {
  console.log(renderBanner(loadLessons(), currentTag()));
};
