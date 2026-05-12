import { next, prev, goto } from "./advance.js";
import { where } from "./where.js";
import { diff } from "./diff.js";
import { help } from "./help.js";

export const dispatchCommand = (name: string, args: string[]): void => {
  switch (name) {
    case "next": return next();
    case "prev": return prev();
    case "goto": return goto(args);
    case "where": return where();
    case "diff": return diff();
    case "help": return help();
    default:
      console.log(`Unknown command: :${name}. Try :help`);
  }
};
